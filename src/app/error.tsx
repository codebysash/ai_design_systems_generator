'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Main className="flex flex-col items-center justify-center py-24">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="h-16 w-16 text-destructive mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error while loading the page. Please try
          again or contact our support team if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')}>Go Home</Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="text-sm font-medium cursor-pointer mb-2">
              Error Details (Development Only)
            </summary>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
              </pre>
            </div>
          </details>
        )}
      </div>
    </Main>
  )
}
