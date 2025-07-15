import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2 py-1', 'text-blue-500')).toBe('px-2 py-1 text-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe(
      'base-class conditional-class'
    )
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
  })

  it('should handle Tailwind merge conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })
})
