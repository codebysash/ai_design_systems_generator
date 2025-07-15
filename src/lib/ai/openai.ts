import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generateCompletion(
  prompt: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<AIResponse> {
  const response = await openai.chat.completions.create({
    model: options?.model || DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 2000,
  })

  const choice = response.choices[0]
  if (!choice?.message?.content) {
    throw new Error('No content received from OpenAI')
  }

  return {
    content: choice.message.content,
    usage: response.usage
      ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        }
      : undefined,
  }
}
