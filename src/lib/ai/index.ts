import { generateCompletion } from './openai'
import { createDesignSystemPrompt, createComponentPrompt } from './prompts'
import { parseDesignSystemResponse, parseComponentResponse } from './parser'
import { handleAIError } from './errors'
import { withRetry, CircuitBreaker } from './retry'
import { DesignSystemConfig, GeneratedComponent } from '@/types'

// Circuit breaker for AI requests
const aiCircuitBreaker = new CircuitBreaker(5, 60000)

export interface GenerateDesignSystemRequest {
  description: string
  style: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold'
  primaryColor?: string
  industry?: string
  components?: string[]
}

export interface GenerateComponentRequest {
  componentName: string
  designSystem: DesignSystemConfig
  requirements?: string
}

export async function generateDesignSystem(
  request: GenerateDesignSystemRequest
): Promise<DesignSystemConfig> {
  try {
    const prompt = createDesignSystemPrompt(request)

    const response = await aiCircuitBreaker.execute(() =>
      withRetry(
        () =>
          generateCompletion(prompt, {
            temperature: 0.7,
            maxTokens: 3000,
          }),
        {
          maxAttempts: 3,
          baseDelay: 2000,
        }
      )
    )

    const designSystem = parseDesignSystemResponse(response.content)

    // Override style with the requested style
    designSystem.style = request.style

    return designSystem
  } catch (error) {
    const aiError = handleAIError(error)
    console.error('Failed to generate design system:', aiError)
    throw aiError
  }
}

export async function generateComponent(
  request: GenerateComponentRequest
): Promise<GeneratedComponent> {
  try {
    const prompt = createComponentPrompt(
      request.componentName,
      request.designSystem,
      request.requirements
    )

    const response = await aiCircuitBreaker.execute(() =>
      withRetry(
        () =>
          generateCompletion(prompt, {
            temperature: 0.5,
            maxTokens: 2500,
          }),
        {
          maxAttempts: 3,
          baseDelay: 1500,
        }
      )
    )

    return parseComponentResponse(response.content)
  } catch (error) {
    const aiError = handleAIError(error)
    console.error('Failed to generate component:', aiError)
    throw aiError
  }
}

export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await generateCompletion(
      'Respond with exactly: "AI connection successful"',
      {
        temperature: 0,
        maxTokens: 10,
      }
    )

    return response.content.toLowerCase().includes('ai connection successful')
  } catch (error) {
    console.error('AI connection test failed:', error)
    return false
  }
}

// Re-export types and utilities
export * from './errors'
export * from './parser'
export { CircuitBreaker } from './retry'
