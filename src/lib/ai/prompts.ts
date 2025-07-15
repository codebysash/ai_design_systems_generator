import { DesignSystemConfig } from '@/types'

export const DESIGN_SYSTEM_PROMPT = `You are an expert design system architect. Generate a comprehensive design system based on the user's requirements.

Your response must be valid JSON with the following structure:
{
  "designSystem": {
    "name": "string",
    "description": "string",
    "colors": {
      "primary": "hex color",
      "secondary": "hex color",
      "accent": "hex color",
      "background": "hex color",
      "foreground": "hex color",
      "muted": "hex color",
      "border": "hex color"
    },
    "typography": {
      "headingFont": "font family name",
      "bodyFont": "font family name",
      "scale": {
        "xs": "font size",
        "sm": "font size",
        "base": "font size",
        "lg": "font size",
        "xl": "font size",
        "2xl": "font size",
        "3xl": "font size"
      }
    },
    "spacing": {
      "unit": 4,
      "scale": [2, 4, 8, 16, 24, 32, 48, 64, 96, 128]
    },
    "borderRadius": {
      "sm": "px value",
      "md": "px value",
      "lg": "px value",
      "xl": "px value"
    },
    "shadows": {
      "sm": "css shadow value",
      "md": "css shadow value", 
      "lg": "css shadow value"
    }
  },
  "components": [
    {
      "name": "Button",
      "variants": ["primary", "secondary", "outline", "ghost"],
      "sizes": ["sm", "md", "lg"],
      "description": "Interactive button component"
    }
  ]
}

Requirements:
- Follow modern design principles
- Ensure accessibility (WCAG 2.1 AA compliance)
- Create semantic color names
- Use professional typography pairings
- Maintain consistent spacing scale
- Include hover and focus states
- Generate 8-12 essential components

User Requirements:`

export function createDesignSystemPrompt(requirements: {
  description: string
  style: string
  primaryColor?: string
  industry?: string
  components?: string[]
}): string {
  return `${DESIGN_SYSTEM_PROMPT}

Description: ${requirements.description}
Style: ${requirements.style}
${requirements.primaryColor ? `Primary Color: ${requirements.primaryColor}` : ''}
${requirements.industry ? `Industry/Domain: ${requirements.industry}` : ''}
${requirements.components?.length ? `Requested Components: ${requirements.components.join(', ')}` : ''}

Generate a cohesive design system that matches these requirements. Ensure all colors work well together and the typography is appropriate for the ${requirements.style} style.`
}

export const COMPONENT_GENERATION_PROMPT = `You are an expert React developer. Generate a React component based on the design system and requirements provided.

Your response must be valid JSON with this structure:
{
  "component": {
    "name": "ComponentName",
    "code": "complete React component code with TypeScript",
    "props": [
      {
        "name": "prop name",
        "type": "TypeScript type",
        "required": boolean,
        "description": "prop description"
      }
    ],
    "variants": [
      {
        "name": "variant name",
        "props": {},
        "description": "variant description"
      }
    ],
    "examples": [
      {
        "name": "example name",
        "code": "JSX usage example"
      }
    ]
  }
}

Requirements:
- Use TypeScript with proper types
- Follow React best practices
- Include forwardRef for DOM components
- Use Tailwind CSS classes
- Implement accessibility features
- Include proper ARIA attributes
- Support all required variants
- Add hover and focus states

Component Requirements:`

export function createComponentPrompt(
  componentName: string,
  designSystem: DesignSystemConfig,
  requirements?: string
): string {
  return `${COMPONENT_GENERATION_PROMPT}

Component: ${componentName}
Design System Colors: ${JSON.stringify(designSystem.colors, null, 2)}
Typography: ${JSON.stringify(designSystem.typography, null, 2)}
Border Radius: ${JSON.stringify(designSystem.borderRadius, null, 2)}
${requirements ? `Additional Requirements: ${requirements}` : ''}

Generate a production-ready ${componentName} component that follows the design system specifications.`
}
