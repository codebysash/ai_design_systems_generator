'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { GenerationProgress } from './generation-progress'
import { cn } from '@/lib/utils'
import {
  GenerationProgress as ProgressType,
  GenerationRequest,
  subscribeToProgress,
  getGenerationResult,
} from '@/lib/ai/request-handler'
import {
  GenerationError,
  GenerationErrorHandler,
  GenerationErrorType,
  retryHandler,
} from '@/lib/errors/generation-errors'
import {
  ExclamationTriangleIcon,
  UpdateIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'

interface GenerationStatusProps {
  requestId: string
  onComplete?: (result: any) => void
  onError?: (error: string) => void
  onRetry?: () => void
  className?: string
}

export function GenerationStatus({
  requestId,
  onComplete,
  onError,
  onRetry,
  className,
}: GenerationStatusProps) {
  const [progress, setProgress] = useState<ProgressType>({
    stage: 'validating',
    progress: 0,
    message: 'Initializing...',
  })
  const [request, setRequest] = useState<GenerationRequest | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [generationError, setGenerationError] =
    useState<GenerationError | null>(null)

  useEffect(() => {
    if (!requestId) return

    // Get initial request state
    const initialRequest = getGenerationResult(requestId)
    if (initialRequest) {
      setRequest(initialRequest)
    }

    // Subscribe to progress updates
    const unsubscribe = subscribeToProgress(requestId, newProgress => {
      setProgress(newProgress)

      // Check for completion
      const updatedRequest = getGenerationResult(requestId)
      if (updatedRequest) {
        setRequest(updatedRequest)

        if (updatedRequest.status === 'completed' && updatedRequest.result) {
          setGenerationError(null)
          onComplete?.(updatedRequest.result)
        } else if (updatedRequest.status === 'failed' && updatedRequest.error) {
          // Convert error string to GenerationError for better handling
          const error = GenerationErrorHandler.fromError(
            new Error(updatedRequest.error)
          )
          setGenerationError(error)
          onError?.(updatedRequest.error)
        }
      }
    })

    return unsubscribe
  }, [requestId, onComplete, onError])

  const handleRetry = async () => {
    if (!onRetry) return

    setIsRetrying(true)
    setGenerationError(null)
    try {
      await onRetry()
    } catch (error) {
      const generationError = GenerationErrorHandler.fromError(error as Error)
      setGenerationError(generationError)
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorIcon = (errorType: GenerationErrorType) => {
    switch (errorType) {
      case GenerationErrorType.NETWORK_ERROR:
        return <CrossCircledIcon className="h-5 w-5" />
      case GenerationErrorType.RATE_LIMIT_ERROR:
        return <ExclamationTriangleIcon className="h-5 w-5" />
      case GenerationErrorType.VALIDATION_ERROR:
        return <InfoCircledIcon className="h-5 w-5" />
      case GenerationErrorType.TIMEOUT_ERROR:
        return <ExclamationTriangleIcon className="h-5 w-5" />
      default:
        return <CrossCircledIcon className="h-5 w-5" />
    }
  }

  const isCompleted = request?.status === 'completed'
  const isFailed = request?.status === 'failed'
  const isProcessing = request?.status === 'processing'

  return (
    <div className={cn('space-y-6', className)}>
      <GenerationProgress progress={progress} />

      {/* Error State */}
      <AnimatePresence>
        {(isFailed || generationError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="text-destructive">
                {generationError ? (
                  getErrorIcon(generationError.type)
                ) : (
                  <CrossCircledIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-destructive">
                  {generationError?.type === GenerationErrorType.NETWORK_ERROR
                    ? 'Network Error'
                    : generationError?.type ===
                        GenerationErrorType.RATE_LIMIT_ERROR
                      ? 'Rate Limit Exceeded'
                      : generationError?.type ===
                          GenerationErrorType.VALIDATION_ERROR
                        ? 'Validation Error'
                        : generationError?.type ===
                            GenerationErrorType.TIMEOUT_ERROR
                          ? 'Request Timeout'
                          : 'Generation Failed'}
                </h4>
                <p className="mt-1 text-sm text-destructive/80">
                  {generationError
                    ? GenerationErrorHandler.formatUserMessage(generationError)
                    : request?.error || 'An unexpected error occurred'}
                </p>
                {generationError?.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-destructive/60 cursor-pointer hover:text-destructive/80">
                      Technical Details
                    </summary>
                    <pre className="mt-1 text-xs text-destructive/60 overflow-auto">
                      {generationError.details}
                    </pre>
                  </details>
                )}
                {onRetry && generationError?.retryable !== false && (
                  <div className="mt-3 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="flex items-center space-x-1"
                    >
                      <UpdateIcon className="h-4 w-4" />
                      <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
                    </Button>
                    {generationError?.suggestedAction && (
                      <span className="text-xs text-muted-foreground">
                        {generationError.suggestedAction}
                      </span>
                    )}
                  </div>
                )}
                {generationError?.retryable === false && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      <InfoCircledIcon className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-800">
                        This error cannot be resolved by retrying.{' '}
                        {generationError.suggestedAction}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-green-200 bg-green-50 p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="text-green-600">
                <CheckCircledIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">
                  Design System Generated!
                </h4>
                <p className="mt-1 text-sm text-green-700">
                  Your design system has been successfully created and is ready
                  to use.
                </p>
                {request?.completedAt && (
                  <p className="mt-2 text-xs text-green-600">
                    Completed at {request.completedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Info */}
      {isProcessing && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Processing Request</h4>
              <p className="text-sm text-muted-foreground">
                Request ID: {requestId.slice(0, 12)}...
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {request?.createdAt
                  ? `Started ${request.createdAt.toLocaleTimeString()}`
                  : 'Starting...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && request && (
        <details className="rounded border p-3 text-xs">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 overflow-auto">
            {JSON.stringify(request, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
