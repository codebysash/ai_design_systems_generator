import { AIError, RateLimitError, NetworkError } from './errors'

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: string[]
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryableErrors: ['RATE_LIMIT', 'NETWORK_ERROR'],
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        break
      }

      // Check if error is retryable
      if (!isRetryableError(lastError, config.retryableErrors)) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      )

      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms:`,
        lastError.message
      )
      await sleep(delay)
    }
  }

  throw lastError
}

function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  if (error instanceof AIError) {
    return retryableErrors.includes(error.code)
  }

  // Check for specific error types
  if (error instanceof RateLimitError || error instanceof NetworkError) {
    return true
  }

  // Check error message for retryable conditions
  const message = error.message.toLowerCase()
  return (
    message.includes('rate limit') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection')
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private maxFailures = 5,
    private resetTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'closed'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.maxFailures) {
      this.state = 'open'
    }
  }

  getState(): string {
    return this.state
  }
}
