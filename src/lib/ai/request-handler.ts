import { generateCompletion, DEFAULT_MODEL } from './openai'
import { buildOptimizedPrompt, validatePromptInputs } from './prompt-builder'
import { DesignSystemFormData } from '@/lib/validations'
import { GenerationErrorHandler, retryHandler } from '@/lib/errors/generation-errors'
import { getCachedDesignSystem, cacheDesignSystem } from '@/lib/cache/design-system-cache'

export interface GenerationRequest {
  id: string
  formData: DesignSystemFormData
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  result?: any
  error?: string
  progress?: number
}

export interface GenerationProgress {
  stage:
    | 'validating'
    | 'building_prompt'
    | 'generating'
    | 'parsing'
    | 'completed'
  progress: number
  message: string
  details?: string
}

class AIRequestQueue {
  private requests = new Map<string, GenerationRequest>()
  private processing = new Set<string>()
  private subscribers = new Map<
    string,
    Set<(progress: GenerationProgress) => void>
  >()
  private maxConcurrentRequests = 3

  async submitRequest(requestFormData: DesignSystemFormData): Promise<string> {
    // Validate inputs
    const validationIssues = validatePromptInputs(requestFormData)
    if (validationIssues.length > 0) {
      throw new Error(`Validation failed: ${validationIssues.join(', ')}`)
    }

    const requestId = this.generateRequestId()
    const request: GenerationRequest = {
      id: requestId,
      formData: requestFormData,
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
    }

    this.requests.set(requestId, request)

    // Start processing if slot available
    if (this.processing.size < this.maxConcurrentRequests) {
      this.processRequest(requestId)
    }

    return requestId
  }

  subscribe(
    requestId: string,
    callback: (progressUpdate: GenerationProgress) => void
  ): () => void {
    if (!this.subscribers.has(requestId)) {
      this.subscribers.set(requestId, new Set())
    }
    this.subscribers.get(requestId)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(requestId)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(requestId)
        }
      }
    }
  }

  getRequest(requestId: string): GenerationRequest | undefined {
    return this.requests.get(requestId)
  }

  private async processRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId)
    if (!request) return

    this.processing.add(requestId)
    request.status = 'processing'

    try {
      // Stage 1: Check cache first
      this.updateProgress(requestId, {
        stage: 'validating',
        progress: 5,
        message: 'Checking cache...',
      })

      const cachedResult = getCachedDesignSystem(request.formData)
      if (cachedResult) {
        this.updateProgress(requestId, {
          stage: 'completed',
          progress: 100,
          message: 'Retrieved from cache!',
          details: 'Found matching design system in cache'
        })

        request.result = cachedResult
        request.status = 'completed'
        request.completedAt = new Date()
        return
      }

      // Stage 2: Validation (cache miss, proceed with generation)
      this.updateProgress(requestId, {
        stage: 'validating',
        progress: 10,
        message: 'Validating design requirements...',
      })

      await this.delay(300) // Reduced validation time

      // Stage 3: Building optimized prompt
      this.updateProgress(requestId, {
        stage: 'building_prompt',
        progress: 25,
        message: 'Optimizing AI prompt...',
        details: `Analyzing ${request.formData.style} style preferences`,
      })

      const optimizedPrompt = buildOptimizedPrompt({
        formData: request.formData,
        targetLength: 'detailed',
        focus: 'balanced',
      })

      await this.delay(200)

      // Stage 4: AI Generation with retry logic
      this.updateProgress(requestId, {
        stage: 'generating',
        progress: 40,
        message: 'Generating design system...',
        details: `Estimated complexity: ${optimizedPrompt.complexity}`,
      })

      const aiResponse = await retryHandler.executeWithRetry(
        () => generateCompletion(optimizedPrompt.prompt, {
          model: DEFAULT_MODEL,
          temperature: 0.7,
          maxTokens: 3000,
        }),
        `generation_${requestId}`,
        (attempt, error) => {
          this.updateProgress(requestId, {
            stage: 'generating',
            progress: 40 + (attempt * 10),
            message: `Retrying generation (attempt ${attempt})...`,
            details: error.message,
          })
        }
      )

      // Stage 5: Parsing and validation
      this.updateProgress(requestId, {
        stage: 'parsing',
        progress: 80,
        message: 'Processing AI response...',
        details: 'Validating generated design system',
      })

      await this.delay(150)

      const parsedResult = await retryHandler.executeWithRetry(
        () => this.parseAIResponse(aiResponse.content),
        `parsing_${requestId}`,
        (attempt, error) => {
          this.updateProgress(requestId, {
            stage: 'parsing',
            progress: 80 + (attempt * 5),
            message: `Retrying parsing (attempt ${attempt})...`,
            details: error.message,
          })
        }
      )

      // Stage 6: Cache the result for future use
      this.updateProgress(requestId, {
        stage: 'completed',
        progress: 95,
        message: 'Caching result...',
        details: 'Storing design system for faster future access'
      })

      // Cache the generated design system
      cacheDesignSystem(request.formData, parsedResult, 30 * 60 * 1000) // Cache for 30 minutes

      // Stage 7: Completion
      this.updateProgress(requestId, {
        stage: 'completed',
        progress: 100,
        message: 'Design system generated successfully!',
        details: `Generated ${parsedResult.components?.length || 0} components`,
      })

      request.result = parsedResult
      request.status = 'completed'
      request.completedAt = new Date()
    } catch (error) {
      request.status = 'failed'
      
      // Use enhanced error handling
      const generationError = GenerationErrorHandler.fromError(error as Error)
      request.error = GenerationErrorHandler.formatUserMessage(generationError)
      request.completedAt = new Date()

      this.updateProgress(requestId, {
        stage: 'completed',
        progress: 0,
        message: 'Generation failed',
        details: request.error,
      })
    } finally {
      this.processing.delete(requestId)

      // Process next request in queue
      const nextPending = Array.from(this.requests.values()).find(
        r => r.status === 'pending'
      )

      if (nextPending && this.processing.size < this.maxConcurrentRequests) {
        this.processRequest(nextPending.id)
      }
    }
  }

  private updateProgress(
    requestId: string,
    progress: GenerationProgress
  ): void {
    const request = this.requests.get(requestId)
    if (request) {
      request.progress = progress.progress
    }

    const subscribers = this.subscribers.get(requestId)
    if (subscribers) {
      subscribers.forEach(callback => callback(progress))
    }
  }

  private async parseAIResponse(content: string): Promise<any> {
    const { parseAIResponse, validateDesignSystemResponse, sanitizeResponse } =
      await import('./response-validator')

    // Parse the AI response
    const parseResult = parseAIResponse(content)
    if (!parseResult.success) {
      throw new Error(
        `Failed to parse AI response: ${parseResult.errors.join(', ')}`
      )
    }

    // Validate the parsed data
    const validationResult = validateDesignSystemResponse(parseResult.data)
    if (!validationResult.isValid) {
      throw new Error(
        `Invalid design system: ${validationResult.errors.join(', ')}`
      )
    }

    // Sanitize the response
    const sanitized = sanitizeResponse(validationResult.data)

    return sanitized
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Queue management methods
  getQueueStatus() {
    const pending = Array.from(this.requests.values()).filter(
      r => r.status === 'pending'
    ).length
    const processing = this.processing.size
    const completed = Array.from(this.requests.values()).filter(
      r => r.status === 'completed'
    ).length
    const failed = Array.from(this.requests.values()).filter(
      r => r.status === 'failed'
    ).length

    return {
      pending,
      processing,
      completed,
      failed,
      total: this.requests.size,
    }
  }

  clearCompletedRequests(): void {
    for (const [id, request] of this.requests.entries()) {
      if (request.status === 'completed' || request.status === 'failed') {
        this.requests.delete(id)
        this.subscribers.delete(id)
      }
    }
  }
}

// Singleton instance
export const aiRequestQueue = new AIRequestQueue()

// Convenience functions
export async function generateDesignSystem(
  formData: DesignSystemFormData,
  onProgress?: (progressUpdate: GenerationProgress) => void
): Promise<string> {
  const requestId = await aiRequestQueue.submitRequest(formData)

  if (onProgress) {
    aiRequestQueue.subscribe(requestId, onProgress)
  }

  return requestId
}

export function getGenerationResult(
  requestId: string
): GenerationRequest | undefined {
  return aiRequestQueue.getRequest(requestId)
}

export function subscribeToProgress(
  requestId: string,
  callback: (progressUpdate: GenerationProgress) => void
): () => void {
  return aiRequestQueue.subscribe(requestId, callback)
}
