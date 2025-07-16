'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { GeneratedComponent, DesignSystemConfig } from '@/types'

// Performance optimization utilities for component preview

/**
 * Memoized component wrapper to prevent unnecessary re-renders
 */
export const withMemoization = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) => {
  return memo(Component, areEqual)
}

/**
 * Custom comparison function for component props
 */
export const componentPropsEqual = (
  prevProps: any,
  nextProps: any
): boolean => {
  // Check if component reference changed
  if (prevProps.component?.name !== nextProps.component?.name) {
    return false
  }

  // Check variant, size, and state changes
  if (
    prevProps.variant !== nextProps.variant ||
    prevProps.size !== nextProps.size ||
    JSON.stringify(prevProps.state) !== JSON.stringify(nextProps.state) ||
    JSON.stringify(prevProps.props) !== JSON.stringify(nextProps.props)
  ) {
    return false
  }

  // Check theme changes
  if (prevProps.theme !== nextProps.theme) {
    return false
  }

  return true
}

/**
 * Debounced hook for expensive operations
 */
export const useDebounced = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Memoized style computation hook
 */
export const useComputedStyles = (
  component: GeneratedComponent,
  variant: string,
  size: string,
  designSystem: DesignSystemConfig
) => {
  return useMemo(() => {
    const computeStyles = () => {
      // Base styles computation
      const baseStyles = {
        fontFamily: designSystem.typography.bodyFont,
        borderRadius: designSystem.borderRadius.md,
        transition: 'all 0.2s ease-in-out',
      }

      // Variant-specific styles
      const variantConfig = component.variants.find(v => v.name === variant)
      const variantStyles = {} // TODO: Add variant styles when ComponentVariant has styles property

      // Size-specific styles
      const sizeStyles = getSizeStyles(size, component.name)

      return {
        base: baseStyles,
        variant: variantStyles,
        size: sizeStyles,
        combined: { ...baseStyles, ...variantStyles, ...sizeStyles },
      }
    }

    return computeStyles()
  }, [
    component.name,
    variant,
    size,
    designSystem.typography.bodyFont,
    designSystem.borderRadius.md,
  ])
}

/**
 * Cached size styles to avoid recomputation
 */
const sizeStylesCache = new Map<string, Record<string, any>>()

const getSizeStyles = (
  size: string,
  componentName: string
): Record<string, any> => {
  const cacheKey = `${componentName}-${size}`

  if (sizeStylesCache.has(cacheKey)) {
    return sizeStylesCache.get(cacheKey)!
  }

  const sizeMap: Record<string, Record<string, any>> = {
    Button: {
      xs: { height: '1.75rem', padding: '0 0.5rem', fontSize: '0.75rem' },
      sm: { height: '2rem', padding: '0 0.75rem', fontSize: '0.875rem' },
      md: { height: '2.25rem', padding: '0 1rem', fontSize: '0.875rem' },
      lg: { height: '2.5rem', padding: '0 1.5rem', fontSize: '1rem' },
      xl: { height: '2.75rem', padding: '0 2rem', fontSize: '1rem' },
    },
    Input: {
      sm: { height: '2rem', fontSize: '0.875rem' },
      md: { height: '2.25rem', fontSize: '0.875rem' },
      lg: { height: '2.5rem', fontSize: '1rem' },
    },
    // Add more component size maps as needed
  }

  const componentSizes = sizeMap[componentName] || {}
  const styles = componentSizes[size] || componentSizes.md || {}

  sizeStylesCache.set(cacheKey, styles)
  return styles
}

/**
 * Throttled callback hook for performance-sensitive operations
 */
export const useThrottledCallback = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const lastCall = React.useRef<number>(0)

  return useCallback(
    (...args: T) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        callback(...args)
      }
    },
    [callback, delay]
  )
}

/**
 * Virtual rendering hook for large component lists
 */
export const useVirtualizedComponents = (
  components: GeneratedComponent[],
  containerHeight: number,
  itemHeight: number = 100
) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleComponents = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      components.length
    )

    return {
      startIndex,
      endIndex,
      visibleItems: components.slice(startIndex, endIndex),
      totalHeight: components.length * itemHeight,
      offsetY: startIndex * itemHeight,
    }
  }, [components, scrollTop, containerHeight, itemHeight])

  const handleScroll = useThrottledCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
    16
  ) // ~60fps

  return {
    ...visibleComponents,
    handleScroll,
  }
}

/**
 * Lazy component loader with suspense
 */
export const LazyComponentPreview = React.lazy(() =>
  import('./component-preview').then(module => ({
    default: module.ComponentPreview,
  }))
)

/**
 * Error boundary for component preview failures
 */
export class PreviewErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error }>
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component preview error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-medium">Preview Error</h3>
    <p className="text-red-600 text-sm mt-1">
      Failed to render component: {error.message}
    </p>
  </div>
)

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = React.useRef<number>(0)

  React.useEffect(() => {
    renderStart.current = performance.now()
  })

  React.useEffect(() => {
    const renderTime = performance.now() - renderStart.current
    if (renderTime > 16) {
      // > 16ms might impact 60fps
      console.warn(
        `Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`
      )
    }
  })
}
