'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BasicInfo } from './steps/basic-info'
import { StylePreferences } from './steps/style-preferences'
import { ColorSelection } from './steps/color-selection'
import { IndustrySelection } from './steps/industry-selection'
import { designSystemSchema, type DesignSystemFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'basic-info', title: 'Basic Information', component: BasicInfo },
  { id: 'style', title: 'Style Preferences', component: StylePreferences },
  { id: 'colors', title: 'Brand Colors', component: ColorSelection },
  { id: 'industry', title: 'Industry & Domain', component: IndustrySelection },
]

interface DesignSystemFormProps {
  onSubmit: (data: DesignSystemFormData) => void
  isLoading?: boolean
}

export function DesignSystemForm({ onSubmit, isLoading }: DesignSystemFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const form = useForm<DesignSystemFormData>({
    resolver: zodResolver(designSystemSchema),
    defaultValues: {
      name: '',
      description: '',
      style: 'modern',
      primaryColor: '#3b82f6',
      industry: '',
      components: [],
    },
  })

  const { handleSubmit, trigger, formState: { errors } } = form

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof DesignSystemFormData)[] => {
    switch (step) {
      case 0:
        return ['name', 'description']
      case 1:
        return ['style']
      case 2:
        return ['primaryColor']
      case 3:
        return ['industry']
      default:
        return []
    }
  }

  const onFormSubmit = (data: DesignSystemFormData) => {
    onSubmit(data)
  }

  const CurrentStepComponent = steps[currentStep].component

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Progress indicator */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <CurrentStepComponent form={form} errors={errors} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Design System'}
            </Button>
          ) : (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}