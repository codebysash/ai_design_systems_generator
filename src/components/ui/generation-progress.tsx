'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import type { GenerationProgress } from '@/lib/ai/request-handler'

interface GenerationProgressProps {
  progress: GenerationProgress
  className?: string
}

const stageIcons = {
  validating: '🔍',
  building_prompt: '🔧',
  generating: '🎨',
  parsing: '📝',
  completed: '✅'
}

const stageDescriptions = {
  validating: 'Checking your design requirements',
  building_prompt: 'Crafting the perfect AI prompt',
  generating: 'AI is creating your design system',
  parsing: 'Processing and validating results',
  completed: 'Your design system is ready!'
}

export function GenerationProgress({ progress, className }: GenerationProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress.progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress.progress])

  const isCompleted = progress.stage === 'completed' && progress.progress === 100
  const isFailed = progress.stage === 'completed' && progress.progress === 0

  return (
    <div className={cn('space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl"
        >
          {stageIcons[progress.stage]}
        </motion.div>
        <div className="flex-1">
          <h3 className="font-semibold">{progress.message}</h3>
          <p className="text-sm text-muted-foreground">
            {stageDescriptions[progress.stage]}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{Math.round(animatedProgress)}%</div>
          <div className="text-xs text-muted-foreground">
            {progress.stage === 'completed' ? 'Done' : 'Processing...'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={animatedProgress} 
          className={cn(
            'h-3 transition-all duration-500',
            isCompleted && 'bg-green-100',
            isFailed && 'bg-red-100'
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>{isCompleted ? 'Completed' : isFailed ? 'Failed' : 'In Progress'}</span>
        </div>
      </div>

      {/* Stage Details */}
      <AnimatePresence mode="wait">
        {progress.details && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-md bg-muted p-3"
          >
            <p className="text-sm text-muted-foreground">{progress.details}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Indicators */}
      <div className="flex justify-between">
        {Object.entries(stageIcons).map(([stage, icon], index) => {
          const isCurrentStage = progress.stage === stage
          const isPastStage = Object.keys(stageIcons).indexOf(progress.stage) > index
          const isActive = isCurrentStage || isPastStage

          return (
            <motion.div
              key={stage}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: isCurrentStage ? 1.1 : 1,
                opacity: isActive ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex flex-col items-center space-y-1 text-xs',
                isCurrentStage && 'text-primary font-medium',
                isPastStage && 'text-green-600'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                isActive ? 'border-primary bg-primary/10' : 'border-muted bg-muted',
                isPastStage && 'border-green-600 bg-green-50 text-green-600'
              )}>
                {isPastStage ? '✓' : icon}
              </div>
              <span className="capitalize">{stage.replace('_', ' ')}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}