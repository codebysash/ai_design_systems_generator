export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export class RateLimitError extends AIError {
  constructor(message: string = 'Rate limit exceeded', originalError?: Error) {
    super(message, 'RATE_LIMIT', 429, originalError)
    this.name = 'RateLimitError'
  }
}

export class AuthenticationError extends AIError {
  constructor(
    message: string = 'Authentication failed',
    originalError?: Error
  ) {
    super(message, 'AUTH_ERROR', 401, originalError)
    this.name = 'AuthenticationError'
  }
}

export class ParseError extends AIError {
  constructor(
    message: string = 'Failed to parse AI response',
    originalError?: Error
  ) {
    super(message, 'PARSE_ERROR', undefined, originalError)
    this.name = 'ParseError'
  }
}

export class NetworkError extends AIError {
  constructor(
    message: string = 'Network request failed',
    originalError?: Error
  ) {
    super(message, 'NETWORK_ERROR', undefined, originalError)
    this.name = 'NetworkError'
  }
}

export function handleAIError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error
  }

  if (error instanceof Error) {
    // Check for OpenAI specific errors
    if (error.message.includes('rate limit')) {
      return new RateLimitError(error.message, error)
    }

    if (
      error.message.includes('authentication') ||
      error.message.includes('API key')
    ) {
      return new AuthenticationError(error.message, error)
    }

    if (error.message.includes('parse') || error.message.includes('JSON')) {
      return new ParseError(error.message, error)
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(error.message, error)
    }

    return new AIError(error.message, 'UNKNOWN_ERROR', undefined, error)
  }

  return new AIError('An unknown error occurred', 'UNKNOWN_ERROR')
}
