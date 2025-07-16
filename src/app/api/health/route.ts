import { NextRequest, NextResponse } from 'next/server'
import {
  apiRateLimiter,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/middleware/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for health checks
    const clientId = getClientIdentifier(request)
    const rateLimitResult = apiRateLimiter.check(clientId)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetTime!)
    }

    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        openai: !!process.env.OPENAI_API_KEY,
        database: true, // Add database check when implemented
        memory: process.memoryUsage(),
      },
    }

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
