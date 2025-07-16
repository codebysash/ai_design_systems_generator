'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { ExclamationTriangleIcon, UpdateIcon } from '@radix-ui/react-icons'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private maxRetries = 2

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Container className="py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We encountered an unexpected error. This might be a temporary
                issue.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left text-sm">
                <details>
                  <summary className="font-semibold text-red-800 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-red-700 overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <UpdateIcon className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                className="flex items-center space-x-2"
              >
                <UpdateIcon className="h-4 w-4" />
                <span>Reload Page</span>
              </Button>
            </div>

            {this.state.retryCount >= this.maxRetries && (
              <p className="text-sm text-muted-foreground">
                If the problem persists, please try reloading the page or
                contact support.
              </p>
            )}
          </div>
        </Container>
      )
    }

    return this.props.children
  }
}

// Simplified wrapper component for functional components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error reporting
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportToErrorService(error, context)
    }
  }

  return { reportError }
}
