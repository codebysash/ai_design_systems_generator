import { z } from 'zod'
import { DesignSystemConfig, GeneratedComponent } from '@/types'

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
  props: z.record(z.any()),
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
        primary: validated.designSystem.colors.primary,
        secondary: validated.designSystem.colors.secondary,
        accent: validated.designSystem.colors.accent,
        background: validated.designSystem.colors.background,
        foreground: validated.designSystem.colors.foreground,
      },
      typography: validated.designSystem.typography,
      spacing: validated.designSystem.spacing,
      borderRadius: validated.designSystem.borderRadius,
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
      code: validated.component.code,
      props: validated.component.props,
      variants: validated.component.variants,
    }
  } catch (error) {
    console.error('Error parsing component response:', error)
    throw new Error(
      `Failed to parse component response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function cleanJsonResponse(response: string): string {
  // Remove any markdown code blocks
  const withoutCodeBlocks = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')

  // Find the JSON content between first { and last }
  const firstBrace = withoutCodeBlocks.indexOf('{')
  const lastBrace = withoutCodeBlocks.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON found in response')
  }

  return withoutCodeBlocks.slice(firstBrace, lastBrace + 1)
}

export function validateJsonResponse(response: string): boolean {
  try {
    JSON.parse(cleanJsonResponse(response))
    return true
  } catch {
    return false
  }
}
