import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  aiGenerationLimiter,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/middleware/rate-limit'
import { validateOrigin, createForbiddenResponse } from '@/lib/middleware/auth'
import { generateCompletion } from '@/lib/ai/openai'
import { createDesignSystemPrompt } from '@/lib/ai/prompts'

// Input validation schema
const GenerateRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  style: z.enum(['modern', 'classic', 'minimalist', 'bold', 'elegant']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  industry: z.string().min(1).max(50),
  components: z.array(z.string()).min(1).max(20),
})

const ALLOWED_ORIGINS = [
  'https://ai-design-system-generator.vercel.app',
  'https://localhost:3000',
  'http://localhost:3000',
]

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = aiGenerationLimiter.check(clientId)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!)
    }

    // Origin validation
    if (!validateOrigin(request, ALLOWED_ORIGINS)) {
      return createForbiddenResponse('Origin not allowed')
    }

    // Input validation
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const validationResult = GenerateRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const formData = validationResult.data

    // Sanitize input to prevent prompt injection
    const sanitizedData = {
      ...formData,
      name: formData.name.replace(/[<>\"']/g, ''),
      description: formData.description.replace(/[<>\"']/g, ''),
      industry: formData.industry.replace(/[<>\"']/g, ''),
    }

    // Generate design system
    const prompt = createDesignSystemPrompt({
      description: sanitizedData.description,
      style: sanitizedData.style,
      primaryColor: sanitizedData.primaryColor,
      industry: sanitizedData.industry,
      components: sanitizedData.components,
    })

    const aiResponse = await generateCompletion(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Add security headers to response
    const response = NextResponse.json({
      success: true,
      data: {
        content: aiResponse.content,
        usage: aiResponse.usage,
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    })

    // Add CORS headers
    response.headers.set(
      'Access-Control-Allow-Origin',
      request.headers.get('origin') || '*'
    )
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key'
    )

    return response
  } catch (error) {
    console.error('Generation error:', error)

    return NextResponse.json(
      {
        error: 'Generation failed',
        message: 'An error occurred while generating the design system',
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!validateOrigin(request, ALLOWED_ORIGINS)) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  })
}
