// Enhanced error types for design system generation
export enum GenerationErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AI_API_ERROR = 'AI_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export interface GenerationError {
  type: GenerationErrorType
  message: string
  details?: string
  code?: string
  recoverable: boolean
  retryable: boolean
  suggestedAction?: string
  timestamp: Date
}

export class GenerationErrorHandler {
  static createError(
    type: GenerationErrorType,
    message: string,
    details?: string,
    code?: string
  ): GenerationError {
    const error: GenerationError = {
      type,
      message,
      details,
      code,
      recoverable: this.isRecoverable(type),
      retryable: this.isRetryable(type),
      suggestedAction: this.getSuggestedAction(type),
      timestamp: new Date(),
    }

    return error
  }

  static fromError(error: Error): GenerationError {
    // Parse different error types
    if (error.message.includes('rate limit')) {
      return this.createError(
        GenerationErrorType.RATE_LIMIT_ERROR,
        'Rate limit exceeded. Please try again later.',
        error.message,
        'RATE_LIMIT'
      )
    }

    if (error.message.includes('quota')) {
      return this.createError(
        GenerationErrorType.QUOTA_EXCEEDED,
        'API quota exceeded. Please check your plan.',
        error.message,
        'QUOTA_EXCEEDED'
      )
    }

    if (error.message.includes('timeout')) {
      return this.createError(
        GenerationErrorType.TIMEOUT_ERROR,
        'Request timed out. Please try again.',
        error.message,
        'TIMEOUT'
      )
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.createError(
        GenerationErrorType.NETWORK_ERROR,
        'Network error occurred. Please check your connection.',
        error.message,
        'NETWORK'
      )
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return this.createError(
        GenerationErrorType.VALIDATION_ERROR,
        'Invalid input provided. Please check your form data.',
        error.message,
        'VALIDATION'
      )
    }

    if (error.message.includes('parse') || error.message.includes('JSON')) {
      return this.createError(
        GenerationErrorType.PARSING_ERROR,
        'Failed to process AI response. Please try again.',
        error.message,
        'PARSING'
      )
    }

    // Default to system error
    return this.createError(
      GenerationErrorType.SYSTEM_ERROR,
      'An unexpected error occurred. Please try again.',
      error.message,
      'SYSTEM'
    )
  }

  private static isRecoverable(type: GenerationErrorType): boolean {
    return ![
      GenerationErrorType.QUOTA_EXCEEDED,
      GenerationErrorType.VALIDATION_ERROR,
    ].includes(type)
  }

  private static isRetryable(type: GenerationErrorType): boolean {
    return [
      GenerationErrorType.NETWORK_ERROR,
      GenerationErrorType.TIMEOUT_ERROR,
      GenerationErrorType.RATE_LIMIT_ERROR,
      GenerationErrorType.AI_API_ERROR,
      GenerationErrorType.PARSING_ERROR,
      GenerationErrorType.SYSTEM_ERROR,
    ].includes(type)
  }

  private static getSuggestedAction(type: GenerationErrorType): string {
    switch (type) {
      case GenerationErrorType.VALIDATION_ERROR:
        return 'Please review and correct your input data.'
      case GenerationErrorType.AI_API_ERROR:
        return 'Please try again in a moment.'
      case GenerationErrorType.NETWORK_ERROR:
        return 'Please check your internet connection and try again.'
      case GenerationErrorType.PARSING_ERROR:
        return 'Please try again with different parameters.'
      case GenerationErrorType.RATE_LIMIT_ERROR:
        return 'Please wait a moment before trying again.'
      case GenerationErrorType.TIMEOUT_ERROR:
        return 'Please try again with a simpler request.'
      case GenerationErrorType.QUOTA_EXCEEDED:
        return 'Please check your API quota or upgrade your plan.'
      case GenerationErrorType.INVALID_RESPONSE:
        return 'Please try again with different parameters.'
      case GenerationErrorType.SYSTEM_ERROR:
        return 'Please try again later or contact support if the issue persists.'
      default:
        return 'Please try again.'
    }
  }

  static getRetryDelay(type: GenerationErrorType, attempt: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 60000 // 1 minute

    switch (type) {
      case GenerationErrorType.RATE_LIMIT_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt) * 2, maxDelay)
      case GenerationErrorType.NETWORK_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      case GenerationErrorType.TIMEOUT_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      case GenerationErrorType.AI_API_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      case GenerationErrorType.PARSING_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      case GenerationErrorType.SYSTEM_ERROR:
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      default:
        return baseDelay
    }
  }

  static shouldRetry(error: GenerationError, attempt: number): boolean {
    const maxRetries = 3
    return error.retryable && attempt < maxRetries
  }

  static formatUserMessage(error: GenerationError): string {
    let message = error.message

    if (error.suggestedAction) {
      message += ` ${error.suggestedAction}`
    }

    return message
  }
}

export class RetryHandler {
  private maxRetries: number = 3
  private retryAttempts: Map<string, number> = new Map()
  private retryTimers: Map<string, NodeJS.Timeout> = new Map()

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    onRetry?: (attempt: number, error: GenerationError) => void
  ): Promise<T> {
    let attempt = this.retryAttempts.get(operationId) || 0

    try {
      const result = await operation()
      // Clear retry tracking on success
      this.retryAttempts.delete(operationId)
      this.clearRetryTimer(operationId)
      return result
    } catch (error) {
      const generationError = GenerationErrorHandler.fromError(error as Error)
      
      if (GenerationErrorHandler.shouldRetry(generationError, attempt)) {
        attempt++
        this.retryAttempts.set(operationId, attempt)
        
        const delay = GenerationErrorHandler.getRetryDelay(generationError.type, attempt)
        
        if (onRetry) {
          onRetry(attempt, generationError)
        }

        // Wait before retry
        await this.delay(delay)
        
        // Recursive retry
        return this.executeWithRetry(operation, operationId, onRetry)
      } else {
        // Max retries exceeded or non-retryable error
        this.retryAttempts.delete(operationId)
        this.clearRetryTimer(operationId)
        throw generationError
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private clearRetryTimer(operationId: string): void {
    const timer = this.retryTimers.get(operationId)
    if (timer) {
      clearTimeout(timer)
      this.retryTimers.delete(operationId)
    }
  }

  cancelRetry(operationId: string): void {
    this.retryAttempts.delete(operationId)
    this.clearRetryTimer(operationId)
  }

  getRetryAttempt(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0
  }
}

export const retryHandler = new RetryHandler()