'use client'

import { useState, useCallback } from 'react'
import {
  generateDesignSystem,
  GenerationProgress,
  getGenerationResult,
} from '@/lib/ai/request-handler'
import { DesignSystemFormData } from '@/lib/validations'

interface UseGenerationReturn {
  // State
  isGenerating: boolean
  requestId: string | null
  progress: GenerationProgress | null
  result: any | null
  error: string | null

  // Actions
  startGeneration: (formData: DesignSystemFormData) => Promise<void>
  retry: () => Promise<void>
  reset: () => void

  // Computed values
  isCompleted: boolean
  isFailed: boolean
  canRetry: boolean
}

export function useGeneration(): UseGenerationReturn {
  const [requestId, setRequestId] = useState<string | null>(null)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastFormData, setLastFormData] = useState<DesignSystemFormData | null>(
    null
  )

  const startGeneration = useCallback(
    async (requestFormData: DesignSystemFormData) => {
      try {
        // Reset previous state
        setError(null)
        setResult(null)
        setProgress(null)

        // Store form data for potential retry
        setLastFormData(requestFormData)

        // Start generation
        const newRequestId = await generateDesignSystem(
          requestFormData,
          newProgress => {
            setProgress(newProgress)

            // Check for completion
            const request = getGenerationResult(newRequestId)
            if (request) {
              if (request.status === 'completed' && request.result) {
                setResult(request.result)
              } else if (request.status === 'failed' && request.error) {
                setError(request.error)
              }
            }
          }
        )

        setRequestId(newRequestId)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to start generation'
        )
      }
    },
    []
  )

  const retry = useCallback(async () => {
    if (!lastFormData) {
      throw new Error('No previous form data to retry with')
    }
    await startGeneration(lastFormData)
  }, [lastFormData, startGeneration])

  const reset = useCallback(() => {
    setRequestId(null)
    setProgress(null)
    setResult(null)
    setError(null)
    setLastFormData(null)
  }, [])

  // Computed values
  const isGenerating = !!requestId && !result && !error
  const isCompleted = !!result
  const isFailed = !!error
  const canRetry = isFailed && !!lastFormData

  return {
    // State
    isGenerating,
    requestId,
    progress,
    result,
    error,

    // Actions
    startGeneration,
    retry,
    reset,

    // Computed values
    isCompleted,
    isFailed,
    canRetry,
  }
}
