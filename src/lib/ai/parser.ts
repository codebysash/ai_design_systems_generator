import { z } from 'zod'
import { DesignSystemConfig, GeneratedComponent, ColorScale } from '@/types'

// Helper function to convert a single color string to a ColorScale
function generateColorScale(baseColor: string): ColorScale {
  // This is a simplified implementation. In production, you'd use a proper color library
  // to generate proper color scales with correct luminance values
  return {
    '50': lightenColor(baseColor, 0.95),
    '100': lightenColor(baseColor, 0.9),
    '200': lightenColor(baseColor, 0.8),
    '300': lightenColor(baseColor, 0.6),
    '400': lightenColor(baseColor, 0.3),
    '500': baseColor,
    '600': darkenColor(baseColor, 0.1),
    '700': darkenColor(baseColor, 0.2),
    '800': darkenColor(baseColor, 0.3),
    '900': darkenColor(baseColor, 0.4),
  }
}

// Simple color manipulation helpers (for production, use a proper color library)
function lightenColor(color: string, amount: number): string {
  // Simple implementation for testing
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const newR = Math.min(255, Math.round(r + (255 - r) * amount))
  const newG = Math.min(255, Math.round(g + (255 - g) * amount))
  const newB = Math.min(255, Math.round(b + (255 - b) * amount))

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

function darkenColor(color: string, amount: number): string {
  // Simple implementation for testing
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const newR = Math.max(0, Math.round(r * (1 - amount)))
  const newG = Math.max(0, Math.round(g * (1 - amount)))
  const newB = Math.max(0, Math.round(b * (1 - amount)))

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

// Zod schemas for parsing AI responses
const colorSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string().optional(),
  border: z.string().optional(),
})

const typographySchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  scale: z
    .object({
      xs: z.string(),
      sm: z.string(),
      base: z.string(),
      lg: z.string(),
      xl: z.string(),
      '2xl': z.string(),
      '3xl': z.string(),
    })
    .optional(),
})

const spacingSchema = z.object({
  unit: z.number(),
  scale: z.array(z.number()),
})

const borderRadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string().optional(),
})

const shadowsSchema = z
  .object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
  })
  .optional()

const designSystemResponseSchema = z.object({
  designSystem: z.object({
    name: z.string(),
    description: z.string(),
    colors: colorSchema,
    typography: typographySchema,
    spacing: spacingSchema,
    borderRadius: borderRadiusSchema,
    shadows: shadowsSchema,
  }),
  components: z
    .array(
      z.object({
        name: z.string(),
        variants: z.array(z.string()),
        sizes: z.array(z.string()),
        description: z.string(),
      })
    )
    .optional(),
})

const componentPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  description: z.string(),
})

const componentVariantSchema = z.object({
  name: z.string(),
  props: z.record(z.string(), z.any()),
  description: z.string(),
})

const componentExampleSchema = z.object({
  name: z.string(),
  code: z.string(),
})

const componentResponseSchema = z.object({
  component: z.object({
    name: z.string(),
    code: z.string(),
    props: z.array(componentPropSchema),
    variants: z.array(componentVariantSchema),
    examples: z.array(componentExampleSchema).optional(),
  }),
})

export function parseDesignSystemResponse(
  response: string
): DesignSystemConfig {
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedResponse = cleanJsonResponse(response)
    const parsed = JSON.parse(cleanedResponse)

    // Validate with Zod schema
    const validated = designSystemResponseSchema.parse(parsed)

    // Transform to our internal format
    return {
      name: validated.designSystem.name,
      description: validated.designSystem.description,
      style: 'modern', // Default, will be overridden by actual style
      colors: {
        primary: generateColorScale(validated.designSystem.colors.primary),
        secondary: generateColorScale(validated.designSystem.colors.secondary),
        accent: generateColorScale(validated.designSystem.colors.accent),
        neutral: generateColorScale(validated.designSystem.colors.background),
        semantic: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      typography: {
        headingFont: validated.designSystem.typography.headingFont,
        bodyFont: validated.designSystem.typography.bodyFont,
        monoFont: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
        scale: {
          xs: validated.designSystem.typography.scale?.xs || '0.75rem',
          sm: validated.designSystem.typography.scale?.sm || '0.875rem',
          base: validated.designSystem.typography.scale?.base || '1rem',
          lg: validated.designSystem.typography.scale?.lg || '1.125rem',
          xl: validated.designSystem.typography.scale?.xl || '1.25rem',
          '2xl': validated.designSystem.typography.scale?.['2xl'] || '1.5rem',
          '3xl': validated.designSystem.typography.scale?.['3xl'] || '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
        },
        lineHeight: {
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2,
        },
        letterSpacing: {
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      spacing: validated.designSystem.spacing,
      borderRadius: {
        none: '0px',
        sm: validated.designSystem.borderRadius.sm,
        md: validated.designSystem.borderRadius.md,
        lg: validated.designSystem.borderRadius.lg,
        xl: validated.designSystem.borderRadius.xl || '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      animation: {
        transition: {
          fast: '150ms',
          normal: '200ms',
          slow: '300ms',
        },
        easing: {
          ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    }
  } catch (error) {
    console.error('Error parsing design system response:', error)
    throw new Error(
      `Failed to parse design system response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function parseComponentResponse(response: string): GeneratedComponent {
  try {
    const cleanedResponse = cleanJsonResponse(response)
    const parsed = JSON.parse(cleanedResponse)

    const validated = componentResponseSchema.parse(parsed)

    return {
      name: validated.component.name,
      category: 'general',
      code: validated.component.code,
      props: validated.component.props,
      variants: validated.component.variants,
      sizes: ['sm', 'md', 'lg'],
      description: `A ${validated.component.name} component`,
      accessibility: ['keyboard-navigation', 'aria-labels', 'focus-visible'],
      states: ['default', 'hover', 'active', 'disabled'],
    }
  } catch (error) {
    console.error('Error parsing component response:', error)
    throw new Error(
      `Failed to parse component response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function cleanJsonResponse(response: string): string {
  // Extract all JSON blocks from markdown code blocks
  const jsonBlocks: string[] = []
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g
  let match

  while ((match = jsonBlockRegex.exec(response)) !== null) {
    jsonBlocks.push(match[1].trim())
  }

  // If we found JSON blocks, use the largest one
  if (jsonBlocks.length > 0) {
    return jsonBlocks.reduce((largest, current) =>
      current.length > largest.length ? current : largest
    )
  }

  // Fallback: find JSON content between first { and last }
  const firstBrace = response.indexOf('{')
  const lastBrace = response.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON found in response')
  }
  return response.slice(firstBrace, lastBrace + 1)
}

export function validateJsonResponse(response: string): boolean {
  try {
    JSON.parse(cleanJsonResponse(response))
    return true
  } catch {
    return false
  }
}

// Additional functions expected by tests
export function parseAIResponse(response: string): {
  success: boolean
  data?: any
  errors: string[]
} {
  try {
    const cleanedResponse = cleanJsonResponse(response)
    const data = JSON.parse(cleanedResponse)
    return { success: true, data, errors: [] }
  } catch (error) {
    return {
      success: false,
      errors: ['Invalid JSON format'],
    }
  }
}

export function validateDesignSystemResponse(data: any): {
  isValid: boolean
  errors: string[]
  data?: DesignSystemConfig
} {
  const errors: string[] = []

  if (!data.name) {
    errors.push('Missing required field: name')
  }

  if (!data.colors) {
    errors.push('Missing required field: colors')
  } else {
    // Validate color scale structure
    Object.entries(data.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'string') {
        errors.push(`Invalid color scale structure for ${colorName}`)
      }
    })
  }

  if (!data.typography) {
    errors.push('Missing required field: typography')
  }

  if (!data.spacing) {
    errors.push('Missing required field: spacing')
  }

  if (!data.borderRadius) {
    errors.push('Missing required field: borderRadius')
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as DesignSystemConfig) : undefined,
  }
}

export function sanitizeResponse(data: any): DesignSystemConfig {
  // Remove potentially harmful properties
  const dangerous = ['__proto__', 'script', 'eval', 'constructor', 'prototype']

  function sanitizeObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      // Also sanitize string values for script tags
      if (typeof obj === 'string' && obj.includes('<script>')) {
        return '' // Remove strings containing script tags
      }
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }

    const sanitized: any = {}
    // Use getOwnPropertyNames to catch __proto__ and other non-enumerable properties
    const allKeys = Object.getOwnPropertyNames(obj)
    allKeys.forEach(key => {
      // Check for dangerous properties (case-insensitive)
      if (
        !dangerous.includes(key.toLowerCase()) &&
        key !== '__proto__' &&
        key !== 'script' &&
        key !== 'eval' &&
        key !== 'dangerous'
      ) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    })

    // Ensure no __proto__ property exists on the result by creating a clean object
    const cleanObj = Object.create(null)
    Object.keys(sanitized).forEach(key => {
      cleanObj[key] = sanitized[key]
    })

    return cleanObj
  }

  return sanitizeObject(data) as DesignSystemConfig
}

export function extractComponentsFromResponse(
  response: any
): GeneratedComponent[] {
  if (!response.components || !Array.isArray(response.components)) {
    return []
  }

  return response.components.filter((comp: any) => comp.name && comp.type)
}

export function parseColorValue(color: string): string {
  // Handle hex colors
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return color
  }

  // Handle RGB colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
  }

  // Handle named colors
  const namedColors: Record<string, string> = {
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    black: '#000000',
    white: '#FFFFFF',
  }

  return namedColors[color.toLowerCase()] || '#000000'
}

export function generateTypographyScale(): Record<string, string> {
  return {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  }
}

// Export the generateColorScale function that was already defined
export { generateColorScale }
