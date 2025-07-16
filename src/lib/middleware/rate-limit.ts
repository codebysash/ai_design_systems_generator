import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(identifier: string): { success: boolean; resetTime?: number } {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Clean up expired entries
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < windowStart) {
        delete this.store[key]
      }
    })

    if (!this.store[identifier]) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return { success: true }
    }

    const entry = this.store[identifier]

    if (entry.resetTime < now) {
      // Reset the window
      entry.count = 1
      entry.resetTime = now + this.windowMs
      return { success: true }
    }

    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        resetTime: entry.resetTime,
      }
    }

    entry.count++
    return { success: true }
  }
}

// Rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(60000, 20) // 20 requests per minute
export const aiGenerationLimiter = new RateLimiter(300000, 5) // 5 requests per 5 minutes

export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'

  // Fallback to user agent if no IP (for development)
  if (ip === 'unknown') {
    return `ua-${request.headers.get('user-agent')?.slice(0, 50) || 'anonymous'}`
  }

  return ip.trim()
}

export function createRateLimitResponse(resetTime: number) {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: resetInSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString(),
        'X-Rate-Limit-Remaining': '0',
        'X-Rate-Limit-Reset': resetTime.toString(),
      },
    }
  )
}
