import { z } from 'zod'

// Schema for design system response validation
const ColorSchema = z.object({
  primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  foreground: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  muted: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
  border: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
})

const TypographyScaleSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  base: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  '3xl': z.string(),
})

const TypographySchema = z.object({
  headingFont: z.string().min(1, 'Heading font is required'),
  bodyFont: z.string().min(1, 'Body font is required'),
  scale: TypographyScaleSchema,
})

const SpacingSchema = z.object({
  unit: z.number().min(1, 'Spacing unit must be positive'),
  scale: z.array(z.number()).min(5, 'Spacing scale must have at least 5 values'),
})

const BorderRadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string().optional(),
})

const ShadowsSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
}).optional()

const ComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  variants: z.array(z.string()).min(1, 'At least one variant is required'),
  sizes: z.array(z.string()).optional(),
  description: z.string().min(1, 'Component description is required'),
})

const DesignSystemSchema = z.object({
  name: z.string().min(1, 'Design system name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  colors: ColorSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  borderRadius: BorderRadiusSchema,
  shadows: ShadowsSchema,
})

const AIResponseSchema = z.object({
  designSystem: DesignSystemSchema,
  components: z.array(ComponentSchema).min(1, 'At least one component is required'),
})

export interface ValidationResult {
  isValid: boolean
  data?: z.infer<typeof AIResponseSchema>
  errors: string[]
  warnings: string[]
}

export interface ResponseParseResult {
  success: boolean
  data?: any
  errors: string[]
  rawContent: string
  extractedJson?: string
}

export function parseAIResponse(content: string): ResponseParseResult {
  const result: ResponseParseResult = {
    success: false,
    errors: [],
    rawContent: content
  }

  try {
    // Multiple strategies to extract JSON from AI response
    let jsonString = extractJsonFromResponse(content)
    
    if (!jsonString) {
      result.errors.push('No valid JSON found in AI response')
      return result
    }

    result.extractedJson = jsonString

    // Parse the JSON
    const parsed = JSON.parse(jsonString)
    result.data = parsed
    result.success = true

    return result
  } catch (error) {
    if (error instanceof SyntaxError) {
      result.errors.push(`JSON parsing error: ${error.message}`)
    } else {
      result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    return result
  }
}

export function validateDesignSystemResponse(data: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: []
  }

  try {
    // Validate using Zod schema
    const validatedData = AIResponseSchema.parse(data)
    
    result.isValid = true
    result.data = validatedData

    // Additional quality checks
    performQualityChecks(validatedData, result)

    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
    } else {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    return result
  }
}

function extractJsonFromResponse(content: string): string | null {
  // Strategy 1: Look for JSON wrapped in code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Strategy 2: Look for standalone JSON object
  const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    const candidate = jsonObjectMatch[0]
    // Basic validation - should be balanced braces
    if (isBalancedBraces(candidate)) {
      return candidate
    }
  }

  // Strategy 3: Try to find JSON after specific keywords
  const keywordPatterns = [
    /(?:here's|here is) (?:the|your) (?:json|design system):?\s*(\{[\s\S]*?\})/i,
    /(?:result|response|output):?\s*(\{[\s\S]*?\})/i,
    /```\s*(\{[\s\S]*?\})\s*$/i
  ]

  for (const pattern of keywordPatterns) {
    const match = content.match(pattern)
    if (match && isBalancedBraces(match[1])) {
      return match[1].trim()
    }
  }

  return null
}

function isBalancedBraces(str: string): boolean {
  let count = 0
  for (const char of str) {
    if (char === '{') count++
    else if (char === '}') count--
    if (count < 0) return false
  }
  return count === 0
}

function performQualityChecks(data: z.infer<typeof AIResponseSchema>, result: ValidationResult): void {
  const { designSystem, components } = data

  // Check color contrast (basic check)
  const { colors } = designSystem
  if (colors.primary === colors.background) {
    result.warnings.push('Primary color is the same as background color - may cause contrast issues')
  }

  // Check font combinations
  if (designSystem.typography.headingFont === designSystem.typography.bodyFont) {
    result.warnings.push('Heading and body fonts are the same - consider using different fonts for better hierarchy')
  }

  // Check spacing scale progression
  const spacingScale = designSystem.spacing.scale
  if (spacingScale.length > 1) {
    for (let i = 1; i < spacingScale.length; i++) {
      if (spacingScale[i] <= spacingScale[i - 1]) {
        result.warnings.push('Spacing scale should be in ascending order')
        break
      }
    }
  }

  // Check component coverage
  const componentNames = components.map(c => c.name.toLowerCase())
  const essentialComponents = ['button', 'input', 'card']
  const missingEssentials = essentialComponents.filter(name => 
    !componentNames.some(compName => compName.includes(name))
  )
  
  if (missingEssentials.length > 0) {
    result.warnings.push(`Missing essential components: ${missingEssentials.join(', ')}`)
  }

  // Check for duplicate component names
  const duplicates = componentNames.filter((name, index) => componentNames.indexOf(name) !== index)
  if (duplicates.length > 0) {
    result.errors.push(`Duplicate component names found: ${duplicates.join(', ')}`)
    result.isValid = false
  }
}

export function sanitizeResponse(data: any): any {
  // Remove any potentially dangerous content
  const sanitized = JSON.parse(JSON.stringify(data))
  
  // Remove any script tags or potentially dangerous content from strings
  function sanitizeString(str: string): string {
    return str
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeString(obj)
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    } else if (obj && typeof obj === 'object') {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitizeObject(value)
      }
      return result
    }
    return obj
  }

  return sanitizeObject(sanitized)
}

// Enhanced error handling for common AI response issues
export function handleResponseErrors(content: string): string[] {
  const issues: string[] = []

  // Check for common AI response issues
  if (content.includes('I cannot') || content.includes('I\'m unable to')) {
    issues.push('AI refused to generate content - try rephrasing your request')
  }

  if (content.includes('```') && !content.includes('{')) {
    issues.push('AI returned code blocks but no JSON data')
  }

  if (content.length < 100) {
    issues.push('AI response is too short - may be incomplete')
  }

  if (!content.includes('{') && !content.includes('}')) {
    issues.push('No JSON structure found in AI response')
  }

  return issues
}

export type { ValidationResult, ResponseParseResult }