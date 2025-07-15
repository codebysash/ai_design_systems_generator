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
  getGenerationResult 
} from '@/lib/ai/request-handler'

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
  className 
}: GenerationStatusProps) {
  const [progress, setProgress] = useState<ProgressType>({
    stage: 'validating',
    progress: 0,
    message: 'Initializing...'
  })
  const [request, setRequest] = useState<GenerationRequest | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (!requestId) return

    // Get initial request state
    const initialRequest = getGenerationResult(requestId)
    if (initialRequest) {
      setRequest(initialRequest)
    }

    // Subscribe to progress updates
    const unsubscribe = subscribeToProgress(requestId, (newProgress) => {
      setProgress(newProgress)
      
      // Check for completion
      const updatedRequest = getGenerationResult(requestId)
      if (updatedRequest) {
        setRequest(updatedRequest)
        
        if (updatedRequest.status === 'completed' && updatedRequest.result) {
          onComplete?.(updatedRequest.result)
        } else if (updatedRequest.status === 'failed' && updatedRequest.error) {
          onError?.(updatedRequest.error)
        }
      }
    })

    return unsubscribe
  }, [requestId, onComplete, onError])

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
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
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-destructive bg-destructive/5 p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="text-destructive">⚠️</div>
              <div className="flex-1">
                <h4 className="font-medium text-destructive">Generation Failed</h4>
                <p className="mt-1 text-sm text-destructive/80">
                  {request?.error || 'An unexpected error occurred'}
                </p>
                {onRetry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
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
              <div className="text-green-600">🎉</div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">Design System Generated!</h4>
                <p className="mt-1 text-sm text-green-700">
                  Your design system has been successfully created and is ready to use.
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
                {request?.createdAt ? 
                  `Started ${request.createdAt.toLocaleTimeString()}` : 
                  'Starting...'
                }
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