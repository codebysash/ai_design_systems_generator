'use client'

import { useState } from 'react'
import { DesignSystemForm } from '@/components/forms/design-system-form'
import { ComponentPlayground } from '@/lib/preview'
import { GenerationStatus } from '@/components/ui/generation-status'
import { useGeneration } from '@/hooks/use-generation'
import { DesignSystemFormData } from '@/lib/validations'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, DownloadIcon, Share2Icon } from '@radix-ui/react-icons'
import Link from 'next/link'

export default function GeneratePage() {
  const [showForm, setShowForm] = useState(true)
  const [formData, setFormData] = useState<DesignSystemFormData | null>(null)
  const {
    startGeneration,
    result,
    isGenerating,
    error,
    reset,
    requestId,
    retry,
  } = useGeneration()

  const handleFormSubmit = async (data: DesignSystemFormData) => {
    setFormData(data)
    setShowForm(false)
    await startGeneration(data)
  }

  const handleStartOver = () => {
    setShowForm(true)
    setFormData(null)
    reset()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality not yet implemented')
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share functionality not yet implemented')
  }

  if (showForm) {
    return (
      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              Generate Your Design System
            </h1>
            <p className="text-muted-foreground">
              Follow the steps below to create a custom design system tailored
              to your project needs.
            </p>
          </div>

          <DesignSystemForm onSubmit={handleFormSubmit} />
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartOver}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Start Over
            </Button>
            {formData && (
              <div>
                <h1 className="text-2xl font-bold">{formData.name}</h1>
                <p className="text-muted-foreground">{formData.description}</p>
              </div>
            )}
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2Icon className="h-4 w-4" />
                Share
              </Button>
            </div>
          )}
        </div>

        {(isGenerating || error) && requestId && (
          <div className="mb-8">
            <GenerationStatus requestId={requestId} onRetry={retry} />
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-8">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Generated Design System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {result.components ? result.components.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {result.tokens && result.tokens.colors
                    ? Object.keys(result.tokens.colors).length
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Color Tokens
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {result.tokens && result.tokens.typography
                    ? Object.keys(result.tokens.typography).length
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Typography Tokens
                </div>
              </div>
            </div>
          </div>

          <ComponentPlayground
            components={result.components || []}
            designSystem={result.designSystem || result}
          />
        </div>
      )}
    </Container>
  )
}
