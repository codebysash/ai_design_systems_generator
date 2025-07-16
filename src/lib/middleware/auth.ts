import { NextRequest } from 'next/server'

export interface AuthConfig {
  requireApiKey?: boolean
  allowedOrigins?: string[]
  rateLimitBypass?: string[]
}

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const authHeader = request.headers.get('authorization')

  // For now, we'll use a simple API key validation
  // In production, this should be replaced with proper authentication
  const validApiKey = process.env.API_SECRET_KEY

  if (!validApiKey) {
    // If no API key is configured, allow requests (backward compatibility)
    return true
  }

  // Check X-API-Key header
  if (apiKey === validApiKey) {
    return true
  }

  // Check Authorization header (Bearer token)
  if (
    authHeader?.startsWith('Bearer ') &&
    authHeader.slice(7) === validApiKey
  ) {
    return true
  }

  return false
}

export function validateOrigin(
  request: NextRequest,
  allowedOrigins: string[]
): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow requests without origin (direct API calls, mobile apps, etc.)
  if (!origin) {
    return true
  }

  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    return true
  }

  // For development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    const isDevelopmentOrigin =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('0.0.0.0')
    if (isDevelopmentOrigin) {
      return true
    }
  }

  return false
}

export function createUnauthorizedResponse(reason: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: reason,
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
      },
    }
  )
}

export function createForbiddenResponse(reason: string = 'Forbidden') {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: reason,
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
