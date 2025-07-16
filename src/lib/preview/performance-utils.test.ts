import React from 'react'
import { renderHook, act } from '@testing-library/react'
import {
  useDebounced,
  useComputedStyles,
  useThrottledCallback,
  useVirtualizedComponents,
  componentPropsEqual,
  PreviewErrorBoundary
} from './performance-utils'
import { GeneratedComponent, DesignSystemConfig } from '@/types'

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn()
Object.defineProperty(window, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
})

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPerformanceNow.mockReturnValue(1000)
  })

  const mockComponent: GeneratedComponent = {
    name: 'Button',
    description: 'A button component',
    type: 'button',
    variants: [
      { name: 'primary', description: 'Primary style' },
      { name: 'secondary', description: 'Secondary style' }
    ],
    sizes: ['sm', 'md', 'lg'],
    props: [
      { name: 'onClick', type: 'function', required: false, description: 'Click handler' }
    ],
    code: 'export const Button = () => <button>Click me</button>',
    styles: '.button { padding: 1rem; }',
    accessibility: ['Keyboard navigable']
  }

  const mockDesignSystem: DesignSystemConfig = {
    name: 'Test System',
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      scale: { base: '1rem' }
    },
    colors: {
      primary: { '500': '#3B82F6' }
    },
    spacing: { md: '1rem' },
    borderRadius: { md: '0.375rem' }
  }

  describe('useDebounced', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounced('initial', 100))
      expect(result.current).toBe('initial')
    })

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounced(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      expect(result.current).toBe('initial')

      // Change value
      rerender({ value: 'updated', delay: 100 })
      expect(result.current).toBe('initial') // Should still be initial

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(result.current).toBe('updated')
    })

    it('should reset timer on rapid changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounced(value, 100),
        { initialProps: { value: 'initial' } }
      )

      // Rapid changes
      rerender({ value: 'change1' })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })
      
      rerender({ value: 'change2' })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })
      
      rerender({ value: 'final' })

      // Should still be initial after rapid changes
      expect(result.current).toBe('initial')

      // Wait for final debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(result.current).toBe('final')
    })
  })

  describe('useComputedStyles', () => {
    it('should compute styles for component', () => {
      const { result } = renderHook(() =>
        useComputedStyles(mockComponent, 'primary', 'md', mockDesignSystem)
      )

      expect(result.current).toHaveProperty('base')
      expect(result.current).toHaveProperty('variant')
      expect(result.current).toHaveProperty('size')
      expect(result.current).toHaveProperty('combined')

      expect(result.current.base).toHaveProperty('fontFamily', 'Inter')
      expect(result.current.base).toHaveProperty('borderRadius', '0.375rem')
      expect(result.current.base).toHaveProperty('transition', 'all 0.2s ease-in-out')
    })

    it('should memoize styles with same inputs', () => {
      const { result, rerender } = renderHook(
        ({ variant, size }) => useComputedStyles(mockComponent, variant, size, mockDesignSystem),
        { initialProps: { variant: 'primary', size: 'md' } }
      )

      const firstResult = result.current

      // Rerender with same props
      rerender({ variant: 'primary', size: 'md' })
      
      expect(result.current).toBe(firstResult) // Should be same reference
    })

    it('should recompute when inputs change', () => {
      const { result, rerender } = renderHook(
        ({ variant, size }) => useComputedStyles(mockComponent, variant, size, mockDesignSystem),
        { initialProps: { variant: 'primary', size: 'md' } }
      )

      const firstResult = result.current

      // Change variant
      rerender({ variant: 'secondary', size: 'md' })
      
      expect(result.current).not.toBe(firstResult) // Should be different reference
    })
  })

  describe('useThrottledCallback', () => {
    it('should throttle callback execution', async () => {
      const callback = jest.fn()
      const { result } = renderHook(() =>
        useThrottledCallback(callback, 100)
      )

      const throttledCallback = result.current

      // Call multiple times rapidly
      act(() => {
        throttledCallback('arg1')
        throttledCallback('arg2')
        throttledCallback('arg3')
      })

      // Should only be called once immediately
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('arg1')

      // Wait for throttle period
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      // Call again
      act(() => {
        throttledCallback('arg4')
      })

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenLastCalledWith('arg4')
    })

    it('should maintain callback reference when dependencies change', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      const { result, rerender } = renderHook(
        ({ callback }) => useThrottledCallback(callback, 100),
        { initialProps: { callback: callback1 } }
      )

      const throttledCallback1 = result.current

      rerender({ callback: callback2 })
      const throttledCallback2 = result.current

      expect(throttledCallback1).not.toBe(throttledCallback2)
    })
  })

  describe('useVirtualizedComponents', () => {
    const components = Array.from({ length: 100 }, (_, i) => ({
      ...mockComponent,
      name: `Component${i}`
    }))

    it('should calculate visible components', () => {
      const { result } = renderHook(() =>
        useVirtualizedComponents(components, 500, 100)
      )

      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBeLessThanOrEqual(components.length)
      expect(result.current.visibleItems.length).toBeGreaterThan(0)
      expect(result.current.totalHeight).toBe(components.length * 100)
      expect(result.current.offsetY).toBe(0)
    })

    it('should update visible range on scroll', () => {
      const { result } = renderHook(() =>
        useVirtualizedComponents(components, 500, 100)
      )

      const mockScrollEvent = {
        currentTarget: { scrollTop: 500 }
      } as React.UIEvent<HTMLDivElement>

      act(() => {
        result.current.handleScroll(mockScrollEvent)
      })

      expect(result.current.startIndex).toBeGreaterThan(0)
      expect(result.current.offsetY).toBeGreaterThan(0)
    })

    it('should handle empty component list', () => {
      const { result } = renderHook(() =>
        useVirtualizedComponents([], 500, 100)
      )

      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(0)
      expect(result.current.visibleItems).toEqual([])
      expect(result.current.totalHeight).toBe(0)
    })
  })

  describe('componentPropsEqual', () => {
    const baseProps = {
      component: mockComponent,
      variant: 'primary',
      size: 'md',
      state: { loading: false },
      props: { disabled: false },
      theme: 'light'
    }

    it('should return true for identical props', () => {
      const props1 = { ...baseProps }
      const props2 = { ...baseProps }

      expect(componentPropsEqual(props1, props2)).toBe(true)
    })

    it('should return false for different component names', () => {
      const props1 = { ...baseProps }
      const props2 = { 
        ...baseProps, 
        component: { ...mockComponent, name: 'DifferentComponent' }
      }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })

    it('should return false for different variants', () => {
      const props1 = { ...baseProps, variant: 'primary' }
      const props2 = { ...baseProps, variant: 'secondary' }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })

    it('should return false for different sizes', () => {
      const props1 = { ...baseProps, size: 'md' }
      const props2 = { ...baseProps, size: 'lg' }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })

    it('should return false for different states', () => {
      const props1 = { ...baseProps, state: { loading: false } }
      const props2 = { ...baseProps, state: { loading: true } }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })

    it('should return false for different themes', () => {
      const props1 = { ...baseProps, theme: 'light' }
      const props2 = { ...baseProps, theme: 'dark' }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })

    it('should handle nested object changes in props', () => {
      const props1 = { 
        ...baseProps, 
        props: { disabled: false, data: { value: 1 } }
      }
      const props2 = { 
        ...baseProps, 
        props: { disabled: false, data: { value: 2 } }
      }

      expect(componentPropsEqual(props1, props2)).toBe(false)
    })
  })

  describe('PreviewErrorBoundary', () => {
    it('should be defined', () => {
      expect(PreviewErrorBoundary).toBeDefined()
    })

    it('should be a React component class', () => {
      expect(typeof PreviewErrorBoundary).toBe('function')
    })
  })

  describe('Performance Monitoring', () => {
    it('should track render performance', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      // Mock slow render (>16ms)
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start
        .mockReturnValueOnce(1020) // End (20ms render)

      const { usePerformanceMonitor } = require('./performance-utils')
      
      renderHook(() => usePerformanceMonitor('TestComponent'))

      expect(consoleSpy).toHaveBeenCalledWith(
        'Slow render detected for TestComponent: 20.00ms'
      )

      consoleSpy.mockRestore()
    })

    it('should not warn for fast renders', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      // Mock fast render (<16ms)
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start
        .mockReturnValueOnce(1010) // End (10ms render)

      const { usePerformanceMonitor } = require('./performance-utils')
      
      renderHook(() => usePerformanceMonitor('TestComponent'))

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})