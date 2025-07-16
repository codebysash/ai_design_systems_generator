import {
  GenerationErrorType,
  GenerationErrorHandler,
  RetryHandler,
  retryHandler
} from './generation-errors'

describe('Generation Error Handling', () => {
  describe('GenerationErrorHandler', () => {
    describe('createError', () => {
      it('should create error with correct properties', () => {
        const error = GenerationErrorHandler.createError(
          GenerationErrorType.NETWORK_ERROR,
          'Network connection failed',
          'Connection timeout after 30s',
          'NET_001'
        )

        expect(error.type).toBe(GenerationErrorType.NETWORK_ERROR)
        expect(error.message).toBe('Network connection failed')
        expect(error.details).toBe('Connection timeout after 30s')
        expect(error.code).toBe('NET_001')
        expect(error.recoverable).toBe(true)
        expect(error.retryable).toBe(true)
        expect(error.suggestedAction).toBe('Please check your internet connection and try again.')
        expect(error.timestamp).toBeInstanceOf(Date)
      })

      it('should set correct flags for different error types', () => {
        const validationError = GenerationErrorHandler.createError(
          GenerationErrorType.VALIDATION_ERROR,
          'Invalid input'
        )
        expect(validationError.recoverable).toBe(false)
        expect(validationError.retryable).toBe(false)

        const networkError = GenerationErrorHandler.createError(
          GenerationErrorType.NETWORK_ERROR,
          'Network failed'
        )
        expect(networkError.recoverable).toBe(true)
        expect(networkError.retryable).toBe(true)

        const quotaError = GenerationErrorHandler.createError(
          GenerationErrorType.QUOTA_EXCEEDED,
          'Quota exceeded'
        )
        expect(quotaError.recoverable).toBe(false)
        expect(quotaError.retryable).toBe(false)
      })
    })

    describe('fromError', () => {
      it('should detect rate limit errors', () => {
        const error = new Error('rate limit exceeded')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.RATE_LIMIT_ERROR)
        expect(generationError.message).toBe('Rate limit exceeded. Please try again later.')
        expect(generationError.code).toBe('RATE_LIMIT')
        expect(generationError.retryable).toBe(true)
      })

      it('should detect quota exceeded errors', () => {
        const error = new Error('API quota exceeded for your plan')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.QUOTA_EXCEEDED)
        expect(generationError.message).toBe('API quota exceeded. Please check your plan.')
        expect(generationError.code).toBe('QUOTA_EXCEEDED')
        expect(generationError.retryable).toBe(false)
      })

      it('should detect timeout errors', () => {
        const error = new Error('Request timeout after 30 seconds')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.TIMEOUT_ERROR)
        expect(generationError.message).toBe('Request timed out. Please try again.')
        expect(generationError.code).toBe('TIMEOUT')
        expect(generationError.retryable).toBe(true)
      })

      it('should detect network errors', () => {
        const error = new Error('network connection failed')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.NETWORK_ERROR)
        expect(generationError.message).toBe('Network error occurred. Please check your connection.')
        expect(generationError.code).toBe('NETWORK')
        expect(generationError.retryable).toBe(true)
      })

      it('should detect validation errors', () => {
        const error = new Error('Validation failed: invalid email format')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.VALIDATION_ERROR)
        expect(generationError.message).toBe('Invalid input provided. Please check your form data.')
        expect(generationError.code).toBe('VALIDATION')
        expect(generationError.retryable).toBe(false)
      })

      it('should detect parsing errors', () => {
        const error = new Error('Failed to parse JSON response')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.PARSING_ERROR)
        expect(generationError.message).toBe('Failed to process AI response. Please try again.')
        expect(generationError.code).toBe('PARSING')
        expect(generationError.retryable).toBe(true)
      })

      it('should default to system error for unknown errors', () => {
        const error = new Error('Unknown weird error')
        const generationError = GenerationErrorHandler.fromError(error)

        expect(generationError.type).toBe(GenerationErrorType.SYSTEM_ERROR)
        expect(generationError.message).toBe('An unexpected error occurred. Please try again.')
        expect(generationError.code).toBe('SYSTEM')
        expect(generationError.retryable).toBe(true)
      })
    })

    describe('getRetryDelay', () => {
      it('should calculate exponential backoff for rate limits', () => {
        const delay1 = GenerationErrorHandler.getRetryDelay(GenerationErrorType.RATE_LIMIT_ERROR, 1)
        const delay2 = GenerationErrorHandler.getRetryDelay(GenerationErrorType.RATE_LIMIT_ERROR, 2)
        const delay3 = GenerationErrorHandler.getRetryDelay(GenerationErrorType.RATE_LIMIT_ERROR, 3)

        expect(delay2).toBeGreaterThan(delay1)
        expect(delay3).toBeGreaterThan(delay2)
        expect(delay1).toBeGreaterThanOrEqual(2000) // Rate limit has 2x multiplier
      })

      it('should respect maximum delay', () => {
        const veryHighAttempt = 20
        const delay = GenerationErrorHandler.getRetryDelay(GenerationErrorType.NETWORK_ERROR, veryHighAttempt)

        expect(delay).toBeLessThanOrEqual(60000) // Max 1 minute
      })

      it('should return base delay for unknown error types', () => {
        const delay = GenerationErrorHandler.getRetryDelay('UNKNOWN_ERROR' as any, 1)
        expect(delay).toBe(1000) // Base delay
      })
    })

    describe('shouldRetry', () => {
      it('should allow retry for retryable errors within limit', () => {
        const error = GenerationErrorHandler.createError(
          GenerationErrorType.NETWORK_ERROR,
          'Network failed'
        )

        expect(GenerationErrorHandler.shouldRetry(error, 1)).toBe(true)
        expect(GenerationErrorHandler.shouldRetry(error, 2)).toBe(true)
        expect(GenerationErrorHandler.shouldRetry(error, 3)).toBe(false) // Exceeds max
      })

      it('should not allow retry for non-retryable errors', () => {
        const error = GenerationErrorHandler.createError(
          GenerationErrorType.VALIDATION_ERROR,
          'Validation failed'
        )

        expect(GenerationErrorHandler.shouldRetry(error, 1)).toBe(false)
        expect(GenerationErrorHandler.shouldRetry(error, 0)).toBe(false)
      })
    })

    describe('formatUserMessage', () => {
      it('should format message with suggested action', () => {
        const error = GenerationErrorHandler.createError(
          GenerationErrorType.NETWORK_ERROR,
          'Network connection failed'
        )

        const formatted = GenerationErrorHandler.formatUserMessage(error)
        expect(formatted).toBe('Network connection failed Please check your internet connection and try again.')
      })

      it('should handle missing suggested action', () => {
        const error = {
          ...GenerationErrorHandler.createError(GenerationErrorType.SYSTEM_ERROR, 'System error'),
          suggestedAction: undefined
        }

        const formatted = GenerationErrorHandler.formatUserMessage(error)
        expect(formatted).toBe('System error')
      })
    })
  })

  describe('RetryHandler', () => {
    let retryHandlerInstance: RetryHandler

    beforeEach(() => {
      retryHandlerInstance = new RetryHandler()
    })

    describe('executeWithRetry', () => {
      it('should succeed on first attempt', async () => {
        const operation = jest.fn().mockResolvedValue('success')
        const onRetry = jest.fn()

        const result = await retryHandlerInstance.executeWithRetry(
          operation,
          'test-operation',
          onRetry
        )

        expect(result).toBe('success')
        expect(operation).toHaveBeenCalledTimes(1)
        expect(onRetry).not.toHaveBeenCalled()
      })

      it('should retry on retryable errors', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('network failed'))
          .mockRejectedValueOnce(new Error('timeout occurred'))
          .mockResolvedValue('success')

        const onRetry = jest.fn()

        const result = await retryHandlerInstance.executeWithRetry(
          operation,
          'test-operation',
          onRetry
        )

        expect(result).toBe('success')
        expect(operation).toHaveBeenCalledTimes(3)
        expect(onRetry).toHaveBeenCalledTimes(2)
      }, 10000)

      it('should not retry on non-retryable errors', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('validation failed'))
        const onRetry = jest.fn()

        await expect(
          retryHandlerInstance.executeWithRetry(operation, 'test-operation', onRetry)
        ).rejects.toMatchObject({
          type: 'VALIDATION_ERROR'
        })

        expect(operation).toHaveBeenCalledTimes(1)
        expect(onRetry).not.toHaveBeenCalled()
      })

      it('should respect maximum retry attempts', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('network failed'))
        const onRetry = jest.fn()

        await expect(
          retryHandlerInstance.executeWithRetry(operation, 'test-operation', onRetry)
        ).rejects.toMatchObject({
          type: 'NETWORK_ERROR'
        })

        expect(operation).toHaveBeenCalledTimes(4) // Initial + 3 retries
        expect(onRetry).toHaveBeenCalledTimes(3)
      }, 15000)

      it('should call onRetry callback with correct parameters', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('network failed'))
          .mockResolvedValue('success')

        const onRetry = jest.fn()

        await retryHandlerInstance.executeWithRetry(
          operation,
          'test-operation',
          onRetry
        )

        expect(onRetry).toHaveBeenCalledWith(
          1, // attempt number
          expect.objectContaining({
            type: GenerationErrorType.NETWORK_ERROR,
            message: expect.any(String)
          })
        )
      })

      it('should handle delay between retries', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('rate limit'))
          .mockResolvedValue('success')

        const startTime = Date.now()
        
        await retryHandlerInstance.executeWithRetry(
          operation,
          'test-operation'
        )

        const endTime = Date.now()
        const elapsed = endTime - startTime

        // Should have some delay for rate limit error
        expect(elapsed).toBeGreaterThan(1000) // At least 1 second delay
      }, 10000) // 10 second timeout for this test

      it('should clean up retry tracking on success', async () => {
        const operation = jest.fn()
          .mockRejectedValueOnce(new Error('network failed'))
          .mockResolvedValue('success')

        await retryHandlerInstance.executeWithRetry(
          operation,
          'test-operation'
        )

        // Should be able to start fresh with same operation ID
        const retryAttempt = retryHandlerInstance.getRetryAttempt('test-operation')
        expect(retryAttempt).toBe(0)
      })
    })

    describe('cancelRetry', () => {
      it('should cancel ongoing retry tracking', () => {
        retryHandlerInstance.cancelRetry('test-operation')
        
        const retryAttempt = retryHandlerInstance.getRetryAttempt('test-operation')
        expect(retryAttempt).toBe(0)
      })
    })

    describe('getRetryAttempt', () => {
      it('should return 0 for non-existent operations', () => {
        const attempt = retryHandlerInstance.getRetryAttempt('non-existent')
        expect(attempt).toBe(0)
      })
    })
  })

  describe('Exported retryHandler instance', () => {
    it('should be a singleton instance', () => {
      expect(retryHandler).toBeInstanceOf(RetryHandler)
    })

    it('should maintain state across imports', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('network failed'))
        .mockResolvedValue('success')

      await retryHandler.executeWithRetry(operation, 'singleton-test')

      expect(operation).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Type Coverage', () => {
    it('should handle all defined error types', () => {
      const errorTypes = Object.values(GenerationErrorType)
      
      errorTypes.forEach(type => {
        const error = GenerationErrorHandler.createError(type, 'Test message')
        
        expect(error.type).toBe(type)
        expect(typeof error.retryable).toBe('boolean')
        expect(typeof error.recoverable).toBe('boolean')
        expect(typeof error.suggestedAction).toBe('string')
        
        const delay = GenerationErrorHandler.getRetryDelay(type, 1)
        expect(typeof delay).toBe('number')
        expect(delay).toBeGreaterThan(0)
      })
    })
  })
})