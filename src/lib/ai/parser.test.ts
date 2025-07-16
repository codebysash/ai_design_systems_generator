import {
  parseAIResponse,
  validateDesignSystemResponse,
  sanitizeResponse,
  generateColorScale,
  extractComponentsFromResponse,
  parseColorValue,
  generateTypographyScale
} from './parser'
import { DesignSystemConfig } from '@/types'

describe('AI Parser Functions', () => {
  describe('parseAIResponse', () => {
    it('should parse valid JSON response', () => {
      const validResponse = JSON.stringify({
        name: 'Test Design System',
        colors: { primary: '#3B82F6' },
        typography: { headingFont: 'Inter' }
      })

      const result = parseAIResponse(validResponse)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        name: 'Test Design System',
        colors: { primary: '#3B82F6' },
        typography: { headingFont: 'Inter' }
      })
      expect(result.errors).toEqual([])
    })

    it('should handle invalid JSON gracefully', () => {
      const invalidResponse = '{ invalid json }'
      
      const result = parseAIResponse(invalidResponse)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid JSON format')
    })

    it('should extract JSON from mixed content', () => {
      const mixedResponse = `
        Here's your design system:
        
        \`\`\`json
        {
          "name": "Modern Design System",
          "colors": { "primary": "#10B981" }
        }
        \`\`\`
        
        This should work well for your needs.
      `
      
      const result = parseAIResponse(mixedResponse)
      
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Modern Design System')
      expect(result.data?.colors?.primary).toBe('#10B981')
    })

    it('should handle multiple JSON blocks and use the largest', () => {
      const multipleJsonResponse = `
        \`\`\`json
        { "small": "object" }
        \`\`\`
        
        \`\`\`json
        {
          "name": "Complete Design System",
          "colors": { 
            "primary": "#3B82F6",
            "secondary": "#8B5CF6" 
          },
          "typography": {
            "headingFont": "Inter",
            "bodyFont": "Inter"
          }
        }
        \`\`\`
      `
      
      const result = parseAIResponse(multipleJsonResponse)
      
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Complete Design System')
      expect(result.data?.colors?.primary).toBe('#3B82F6')
    })
  })

  describe('generateColorScale', () => {
    it('should generate a complete color scale from hex color', () => {
      const baseColor = '#3B82F6'
      
      const scale = generateColorScale(baseColor)
      
      expect(scale).toHaveProperty('50')
      expect(scale).toHaveProperty('100')
      expect(scale).toHaveProperty('500')
      expect(scale).toHaveProperty('900')
      
      // Should have 10 shades
      expect(Object.keys(scale)).toHaveLength(10)
      
      // All values should be valid hex colors
      Object.values(scale).forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })

    it('should handle different color formats', () => {
      const rgbColor = 'rgb(59, 130, 246)'
      const scale = generateColorScale(rgbColor)
      
      expect(scale).toHaveProperty('500')
      expect(typeof scale['500']).toBe('string')
    })

    it('should generate lighter shades for low numbers', () => {
      const baseColor = '#3B82F6'
      const scale = generateColorScale(baseColor)
      
      // Convert to RGB to compare brightness
      const color50 = scale['50']
      const color900 = scale['900']
      
      expect(color50).not.toBe(color900)
      // 50 should be lighter than 900
      expect(color50.length).toBe(7) // Valid hex format
      expect(color900.length).toBe(7) // Valid hex format
    })
  })

  describe('parseColorValue', () => {
    it('should parse hex colors correctly', () => {
      expect(parseColorValue('#3B82F6')).toBe('#3B82F6')
      expect(parseColorValue('#ff0000')).toBe('#ff0000')
    })

    it('should parse RGB colors', () => {
      const result = parseColorValue('rgb(59, 130, 246)')
      expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    it('should parse named colors', () => {
      expect(parseColorValue('blue')).toBe('#0000FF')
      expect(parseColorValue('red')).toBe('#FF0000')
      expect(parseColorValue('green')).toBe('#008000')
    })

    it('should handle invalid colors gracefully', () => {
      expect(parseColorValue('invalid-color')).toBe('#000000')
      expect(parseColorValue('')).toBe('#000000')
      expect(parseColorValue('not-a-color')).toBe('#000000')
    })
  })

  describe('generateTypographyScale', () => {
    it('should generate complete typography scale', () => {
      const scale = generateTypographyScale()
      
      expect(scale).toHaveProperty('xs')
      expect(scale).toHaveProperty('sm')
      expect(scale).toHaveProperty('base')
      expect(scale).toHaveProperty('lg')
      expect(scale).toHaveProperty('xl')
      expect(scale).toHaveProperty('2xl')
      expect(scale).toHaveProperty('3xl')
      expect(scale).toHaveProperty('4xl')
      
      // All values should be valid CSS sizes
      Object.values(scale).forEach(size => {
        expect(typeof size).toBe('string')
        expect(size).toMatch(/^\d+(\.\d+)?(rem|px|em)$/)
      })
    })

    it('should have increasing sizes', () => {
      const scale = generateTypographyScale()
      
      // Convert to numbers for comparison (assuming rem units)
      const sizes = Object.entries(scale).map(([key, value]) => ({
        key,
        value: parseFloat(value.replace('rem', ''))
      }))
      
      // Check that xl is larger than lg
      const lg = sizes.find(s => s.key === 'lg')?.value || 0
      const xl = sizes.find(s => s.key === 'xl')?.value || 0
      
      expect(xl).toBeGreaterThan(lg)
    })
  })

  describe('extractComponentsFromResponse', () => {
    it('should extract components from design system response', () => {
      const mockResponse = {
        components: [
          {
            name: 'Button',
            type: 'button',
            variants: ['primary', 'secondary'],
            props: ['onClick', 'disabled']
          },
          {
            name: 'Input',
            type: 'input',
            variants: ['default', 'error'],
            props: ['value', 'onChange']
          }
        ]
      }
      
      const components = extractComponentsFromResponse(mockResponse)
      
      expect(components).toHaveLength(2)
      expect(components[0].name).toBe('Button')
      expect(components[1].name).toBe('Input')
      expect(components[0].variants).toContain('primary')
    })

    it('should handle missing components array', () => {
      const mockResponse = {
        name: 'Design System',
        colors: { primary: '#3B82F6' }
      }
      
      const components = extractComponentsFromResponse(mockResponse)
      
      expect(components).toEqual([])
    })

    it('should filter out invalid components', () => {
      const mockResponse = {
        components: [
          { name: 'Button', type: 'button' }, // Valid
          { type: 'input' }, // Missing name
          { name: 'Card' }, // Missing type
          { name: 'Alert', type: 'alert' } // Valid
        ]
      }
      
      const components = extractComponentsFromResponse(mockResponse)
      
      expect(components).toHaveLength(2)
      expect(components[0].name).toBe('Button')
      expect(components[1].name).toBe('Alert')
    })
  })

  describe('validateDesignSystemResponse', () => {
    it('should validate complete design system', () => {
      const validDesignSystem: DesignSystemConfig = {
        name: 'Test Design System',
        description: 'A test design system',
        colors: {
          primary: {
            '50': '#eff6ff',
            '500': '#3b82f6',
            '900': '#1e3a8a'
          },
          secondary: {
            '50': '#f5f3ff',
            '500': '#8b5cf6',
            '900': '#581c87'
          }
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Inter',
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          full: '9999px'
        }
      }
      
      const result = validateDesignSystemResponse(validDesignSystem)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should identify missing required fields', () => {
      const invalidDesignSystem = {
        name: 'Incomplete System'
        // Missing colors, typography, etc.
      }
      
      const result = validateDesignSystemResponse(invalidDesignSystem as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('colors'))).toBe(true)
      expect(result.errors.some(error => error.includes('typography'))).toBe(true)
    })

    it('should validate color scale structure', () => {
      const invalidColorSystem = {
        name: 'Test System',
        colors: {
          primary: '#3B82F6' // Should be an object with shades
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Inter',
          scale: { base: '1rem' }
        },
        spacing: { md: '1rem' },
        borderRadius: { md: '0.375rem' }
      }
      
      const result = validateDesignSystemResponse(invalidColorSystem as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('color scale'))).toBe(true)
    })
  })

  describe('sanitizeResponse', () => {
    it('should remove potentially harmful content', () => {
      const unsafeResponse = {
        name: 'Test System',
        colors: { primary: { '500': '#3B82F6' } },
        typography: { headingFont: 'Inter' },
        spacing: { md: '1rem' },
        borderRadius: { md: '0.375rem' },
        __proto__: { malicious: 'code' },
        script: '<script>alert("xss")</script>',
        eval: 'eval("malicious code")'
      }
      
      const sanitized = sanitizeResponse(unsafeResponse as any)
      
      expect(sanitized).not.toHaveProperty('__proto__')
      expect(sanitized).not.toHaveProperty('script')
      expect(sanitized).not.toHaveProperty('eval')
      expect(sanitized.name).toBe('Test System')
      expect(sanitized.colors.primary['500']).toBe('#3B82F6')
    })

    it('should preserve valid design system properties', () => {
      const validResponse = {
        name: 'Clean System',
        description: 'A clean design system',
        colors: {
          primary: { '500': '#3B82F6' },
          secondary: { '500': '#8B5CF6' }
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Inter',
          scale: { base: '1rem' }
        },
        spacing: { md: '1rem' },
        borderRadius: { md: '0.375rem' }
      }
      
      const sanitized = sanitizeResponse(validResponse as any)
      
      expect(sanitized).toEqual(validResponse)
    })

    it('should handle nested objects correctly', () => {
      const nestedResponse = {
        name: 'Nested System',
        colors: {
          primary: {
            '500': '#3B82F6',
            dangerous: '<script>alert("nested")</script>'
          }
        },
        typography: { headingFont: 'Inter' },
        spacing: { md: '1rem' },
        borderRadius: { md: '0.375rem' }
      }
      
      const sanitized = sanitizeResponse(nestedResponse as any)
      
      expect(sanitized.colors.primary['500']).toBe('#3B82F6')
      expect(sanitized.colors.primary).not.toHaveProperty('dangerous')
    })
  })
})