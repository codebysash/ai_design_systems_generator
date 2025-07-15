'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeneratedComponent, DesignSystemConfig } from '@/types'
import { componentCodeGenerator } from '@/lib/design-system/code-generator'
import { variantSystemGenerator } from '@/lib/design-system/variants'
import { themeGenerator } from '@/lib/design-system/themes'
import { cn } from '@/lib/utils'

export interface ComponentPreviewProps {
  component: GeneratedComponent
  designSystem: DesignSystemConfig
  theme?: 'light' | 'dark'
  variant?: string
  size?: string
  state?: {
    loading?: boolean
    disabled?: boolean
    error?: boolean
  }
  props?: Record<string, any>
  className?: string
  onPropsChange?: (props: Record<string, any>) => void
  onVariantChange?: (variant: string) => void
  onSizeChange?: (size: string) => void
  onStateChange?: (state: Record<string, any>) => void
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component,
  designSystem,
  theme = 'light',
  variant = component.variants[0]?.name || 'default',
  size = component.sizes[0] || 'md',
  state = {},
  props = {},
  className,
  onPropsChange,
  onVariantChange,
  onSizeChange,
  onStateChange
}) => {
  const [isRendering, setIsRendering] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [componentCode, setComponentCode] = useState<string>('')

  // Generate variant system for the component
  const variantSystem = useMemo(() => {
    return variantSystemGenerator.generateVariantSystem(component, designSystem)
  }, [component, designSystem])

  // Generate theme for the component
  const componentTheme = useMemo(() => {
    return themeGenerator.generateTheme(designSystem, theme)
  }, [designSystem, theme])

  // Generate component code
  useEffect(() => {
    const generateCode = async () => {
      setIsRendering(true)
      setRenderError(null)

      try {
        const generatedCode = componentCodeGenerator.generateComponent(
          component,
          designSystem,
          {
            framework: 'react',
            language: 'typescript',
            cssFramework: 'tailwind',
            includeTests: false,
            includeStories: false,
            includeDocumentation: false,
            accessibility: true,
            variant: 'compound'
          }
        )

        setComponentCode(generatedCode.component)
      } catch (error) {
        setRenderError(error instanceof Error ? error.message : 'Failed to generate component')
      } finally {
        setIsRendering(false)
      }
    }

    generateCode()
  }, [component, designSystem, variant, size, state])

  // Dynamic component renderer
  const renderComponent = () => {
    if (renderError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Error rendering component: {renderError}
          </p>
        </div>
      )
    }

    if (isRendering) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )
    }

    // Render component based on type
    return <DynamicComponentRenderer
      component={component}
      variant={variant}
      size={size}
      state={state}
      props={props}
      theme={componentTheme}
      className={className}
    />
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${component.name}-${variant}-${size}-${JSON.stringify(state)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[100px] flex items-center justify-center p-4"
        >
          {renderComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Theme variables */}
      <style jsx global>{`
        :root {
          ${Object.entries(componentTheme.cssVariables)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n          ')}
        }
      `}</style>
    </div>
  )
}

interface DynamicComponentRendererProps {
  component: GeneratedComponent
  variant: string
  size: string
  state: Record<string, any>
  props: Record<string, any>
  theme: any
  className?: string
}

const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({
  component,
  variant,
  size,
  state,
  props,
  theme,
  className
}) => {
  const baseProps = {
    variant,
    size,
    ...state,
    ...props,
    className: cn(className)
  }

  switch (component.name) {
    case 'Button':
      return <ButtonPreview {...baseProps} />
    case 'Input':
      return <InputPreview {...baseProps} />
    case 'Card':
      return <CardPreview {...baseProps} />
    case 'Select':
      return <SelectPreview {...baseProps} />
    case 'Textarea':
      return <TextareaPreview {...baseProps} />
    case 'Checkbox':
      return <CheckboxPreview {...baseProps} />
    case 'Radio':
      return <RadioPreview {...baseProps} />
    case 'Switch':
      return <SwitchPreview {...baseProps} />
    case 'Alert':
      return <AlertPreview {...baseProps} />
    case 'Badge':
      return <BadgePreview {...baseProps} />
    case 'Avatar':
      return <AvatarPreview {...baseProps} />
    case 'Progress':
      return <ProgressPreview {...baseProps} />
    default:
      return <DefaultComponentPreview {...baseProps} componentName={component.name} />
  }
}

// Component preview implementations
const ButtonPreview: React.FC<any> = ({ variant, size, loading, disabled, className, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-primary-500 hover:bg-primary-50',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  const sizeStyles = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
    xl: 'h-11 px-8 text-base'
  }

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary,
        sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {loading ? 'Loading...' : 'Button'}
    </button>
  )
}

const InputPreview: React.FC<any> = ({ variant, size, error, disabled, className, ...props }) => {
  const baseStyles = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  
  const variantStyles = {
    default: 'border-gray-300',
    filled: 'border-0 bg-gray-100',
    outlined: 'border-2 border-gray-300'
  }

  const sizeStyles = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  }

  return (
    <input
      className={cn(
        baseStyles,
        variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
        error && 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500',
        className
      )}
      placeholder="Enter text..."
      disabled={disabled}
      {...props}
    />
  )
}

const CardPreview: React.FC<any> = ({ variant, className, ...props }) => {
  const baseStyles = 'rounded-lg'
  
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-md border border-gray-100'
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
        className
      )}
      {...props}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Card Title</h3>
        <p className="text-gray-600">
          This is a sample card component with some content to demonstrate the design.
        </p>
      </div>
    </div>
  )
}

const SelectPreview: React.FC<any> = ({ variant, size, disabled, className, ...props }) => {
  const baseStyles = 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  
  const sizeStyles = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  }

  return (
    <select
      className={cn(
        baseStyles,
        sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
        className
      )}
      disabled={disabled}
      {...props}
    >
      <option value="">Select an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </select>
  )
}

const TextareaPreview: React.FC<any> = ({ variant, size, error, disabled, className, ...props }) => {
  const baseStyles = 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <textarea
      className={cn(
        baseStyles,
        error && 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500',
        className
      )}
      placeholder="Enter your message..."
      disabled={disabled}
      {...props}
    />
  )
}

const CheckboxPreview: React.FC<any> = ({ size, disabled, className, ...props }) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        className={cn(
          'rounded border-gray-300 text-primary-600 focus:ring-primary-500',
          sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
          className
        )}
        disabled={disabled}
        {...props}
      />
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Checkbox option
      </label>
    </div>
  )
}

const RadioPreview: React.FC<any> = ({ size, disabled, className, ...props }) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        className={cn(
          'border-gray-300 text-primary-600 focus:ring-primary-500',
          sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
          className
        )}
        disabled={disabled}
        {...props}
      />
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Radio option
      </label>
    </div>
  )
}

const SwitchPreview: React.FC<any> = ({ size, disabled, className, ...props }) => {
  const [checked, setChecked] = useState(false)
  
  const sizeStyles = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11'
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
          checked ? 'bg-primary-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={() => !disabled && setChecked(!checked)}
        disabled={disabled}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
            checked ? (size === 'sm' ? 'translate-x-3' : size === 'lg' ? 'translate-x-5' : 'translate-x-4') : 'translate-x-0'
          )}
        />
      </button>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Switch option
      </label>
    </div>
  )
}

const AlertPreview: React.FC<any> = ({ variant, className, ...props }) => {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <div className="text-sm font-medium">
          {variant === 'success' && 'Success'}
          {variant === 'warning' && 'Warning'}
          {variant === 'error' && 'Error'}
          {(!variant || variant === 'default') && 'Information'}
        </div>
      </div>
      <div className="mt-1 text-sm opacity-90">
        This is a sample alert message demonstrating the {variant || 'default'} variant.
      </div>
    </div>
  )
}

const BadgePreview: React.FC<any> = ({ variant, size, className, ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium'
  
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
        className
      )}
      {...props}
    >
      Badge
    </span>
  )
}

const AvatarPreview: React.FC<any> = ({ size, className, ...props }) => {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div
      className={cn(
        'relative inline-flex rounded-full bg-gray-100 items-center justify-center text-gray-500 font-medium',
        sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
        className
      )}
      {...props}
    >
      <span className="text-sm">JD</span>
    </div>
  )
}

const ProgressPreview: React.FC<any> = ({ variant, size, className, ...props }) => {
  const [progress, setProgress] = useState(65)

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className="w-full max-w-xs">
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md,
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        {progress}% complete
      </div>
    </div>
  )
}

const DefaultComponentPreview: React.FC<any> = ({ componentName, variant, size, className, ...props }) => {
  return (
    <div
      className={cn(
        'p-4 bg-gray-50 border border-gray-200 rounded-lg text-center',
        className
      )}
      {...props}
    >
      <div className="text-gray-600 text-sm">
        {componentName} Component
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Variant: {variant} | Size: {size}
      </div>
    </div>
  )
}