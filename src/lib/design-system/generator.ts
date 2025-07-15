import { openai } from '@/lib/ai/openai'
import { createDesignSystemPrompt } from '@/lib/ai/prompts'
import { validateDesignSystemResponse } from '@/lib/ai/response-validator'
import { GeneratedDesignSystem, DesignSystemGeneration } from '@/types'
import { generateId } from '@/lib/utils'

export interface DesignSystemRequirements {
  description: string
  style: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold'
  primaryColor?: string
  industry?: string
  components?: string[]
  accessibility?: boolean
  darkMode?: boolean
}

export interface GenerationOptions {
  model?: 'gpt-4' | 'gpt-3.5-turbo'
  temperature?: number
  maxTokens?: number
  includeExamples?: boolean
  validateOutput?: boolean
}

export class DesignSystemGenerator {
  private static instance: DesignSystemGenerator
  private activeGenerations = new Map<string, DesignSystemGeneration>()

  private constructor() {}

  static getInstance(): DesignSystemGenerator {
    if (!DesignSystemGenerator.instance) {
      DesignSystemGenerator.instance = new DesignSystemGenerator()
    }
    return DesignSystemGenerator.instance
  }

  async generateDesignSystem(
    requirements: DesignSystemRequirements,
    options: GenerationOptions = {}
  ): Promise<string> {
    const generationId = generateId()
    const generation: DesignSystemGeneration = {
      id: generationId,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.activeGenerations.set(generationId, generation)

    try {
      // Start generation process
      this.updateGeneration(generationId, { status: 'processing', progress: 10 })

      // Build prompt
      const prompt = createDesignSystemPrompt(requirements)
      this.updateGeneration(generationId, { progress: 20 })

      // Generate design system
      const response = await this.callOpenAI(prompt, options)
      this.updateGeneration(generationId, { progress: 60 })

      // Validate response
      let designSystem: GeneratedDesignSystem
      if (options.validateOutput !== false) {
        designSystem = await validateDesignSystemResponse(response)
        this.updateGeneration(generationId, { progress: 80 })
      } else {
        designSystem = JSON.parse(response)
      }

      // Add metadata
      designSystem.metadata = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalComponents: designSystem.components.length,
        categories: [...new Set(designSystem.components.map(c => c.category))]
      }

      // Complete generation
      this.updateGeneration(generationId, {
        status: 'completed',
        progress: 100,
        designSystem
      })

      return generationId
    } catch (error) {
      this.updateGeneration(generationId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      throw error
    }
  }

  private async callOpenAI(prompt: string, options: GenerationOptions): Promise<string> {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert design system architect. Generate comprehensive, production-ready design systems with perfect JSON output.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return content
  }

  private updateGeneration(id: string, updates: Partial<DesignSystemGeneration>) {
    const generation = this.activeGenerations.get(id)
    if (generation) {
      Object.assign(generation, updates, { updatedAt: new Date().toISOString() })
      this.activeGenerations.set(id, generation)
    }
  }

  getGeneration(id: string): DesignSystemGeneration | undefined {
    return this.activeGenerations.get(id)
  }

  getGenerationStatus(id: string): { status: string; progress: number } | undefined {
    const generation = this.activeGenerations.get(id)
    return generation ? { status: generation.status, progress: generation.progress } : undefined
  }

  listActiveGenerations(): DesignSystemGeneration[] {
    return Array.from(this.activeGenerations.values())
  }

  cancelGeneration(id: string): boolean {
    const generation = this.activeGenerations.get(id)
    if (generation && generation.status === 'processing') {
      this.updateGeneration(id, { status: 'error', error: 'Generation cancelled by user' })
      return true
    }
    return false
  }

  clearCompleted(): void {
    for (const [id, generation] of this.activeGenerations) {
      if (generation.status === 'completed' || generation.status === 'error') {
        this.activeGenerations.delete(id)
      }
    }
  }
}

export const designSystemGenerator = DesignSystemGenerator.getInstance()