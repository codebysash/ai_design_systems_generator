import { DesignSystemConfig } from '@/types'

export const DESIGN_SYSTEM_PROMPT = `You are an expert design system architect with deep knowledge of modern web design, accessibility, and user experience principles. Generate a comprehensive, production-ready design system based on the user's requirements.

Your response must be valid JSON with the following structure:
{
  "designSystem": {
    "name": "string (professional name for the design system)",
    "description": "string (detailed description of the design system's purpose and style)",
    "colors": {
      "primary": {
        "50": "hex color (lightest)",
        "100": "hex color",
        "200": "hex color",
        "300": "hex color",
        "400": "hex color",
        "500": "hex color (base)",
        "600": "hex color",
        "700": "hex color",
        "800": "hex color",
        "900": "hex color (darkest)"
      },
      "secondary": {
        "50": "hex color (lightest)",
        "100": "hex color",
        "200": "hex color",
        "300": "hex color",
        "400": "hex color",
        "500": "hex color (base)",
        "600": "hex color",
        "700": "hex color",
        "800": "hex color",
        "900": "hex color (darkest)"
      },
      "accent": {
        "50": "hex color (lightest)",
        "100": "hex color",
        "200": "hex color",
        "300": "hex color",
        "400": "hex color",
        "500": "hex color (base)",
        "600": "hex color",
        "700": "hex color",
        "800": "hex color",
        "900": "hex color (darkest)"
      },
      "neutral": {
        "50": "hex color (lightest)",
        "100": "hex color",
        "200": "hex color",
        "300": "hex color",
        "400": "hex color",
        "500": "hex color (base)",
        "600": "hex color",
        "700": "hex color",
        "800": "hex color",
        "900": "hex color (darkest)"
      },
      "semantic": {
        "success": "hex color",
        "warning": "hex color",
        "error": "hex color",
        "info": "hex color"
      }
    },
    "typography": {
      "headingFont": "font family name",
      "bodyFont": "font family name",
      "monoFont": "font family name",
      "scale": {
        "xs": "rem value",
        "sm": "rem value",
        "base": "rem value",
        "lg": "rem value",
        "xl": "rem value",
        "2xl": "rem value",
        "3xl": "rem value",
        "4xl": "rem value",
        "5xl": "rem value",
        "6xl": "rem value"
      },
      "lineHeight": {
        "tight": "number",
        "snug": "number",
        "normal": "number",
        "relaxed": "number",
        "loose": "number"
      },
      "letterSpacing": {
        "tight": "em value",
        "normal": "em value",
        "wide": "em value"
      },
      "fontWeight": {
        "light": "number",
        "normal": "number",
        "medium": "number",
        "semibold": "number",
        "bold": "number"
      }
    },
    "spacing": {
      "unit": 4,
      "scale": [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256]
    },
    "borderRadius": {
      "none": "0",
      "sm": "rem value",
      "md": "rem value",
      "lg": "rem value",
      "xl": "rem value",
      "2xl": "rem value",
      "3xl": "rem value",
      "full": "9999px"
    },
    "shadows": {
      "sm": "css shadow value",
      "md": "css shadow value", 
      "lg": "css shadow value",
      "xl": "css shadow value",
      "2xl": "css shadow value",
      "inner": "css shadow value"
    },
    "animation": {
      "transition": {
        "fast": "css transition duration",
        "normal": "css transition duration",
        "slow": "css transition duration"
      },
      "easing": {
        "ease": "css easing function",
        "easeIn": "css easing function",
        "easeOut": "css easing function",
        "easeInOut": "css easing function"
      }
    },
    "breakpoints": {
      "sm": "px value",
      "md": "px value",
      "lg": "px value",
      "xl": "px value",
      "2xl": "px value"
    }
  },
  "components": [
    {
      "name": "Button",
      "category": "Interactive",
      "variants": ["primary", "secondary", "outline", "ghost", "danger"],
      "sizes": ["xs", "sm", "md", "lg", "xl"],
      "description": "Interactive button component with multiple variants and states",
      "accessibility": ["keyboard navigation", "screen reader support", "focus indicators"],
      "states": ["default", "hover", "focus", "active", "disabled", "loading"]
    },
    {
      "name": "Input",
      "category": "Form",
      "variants": ["default", "filled", "outlined"],
      "sizes": ["sm", "md", "lg"],
      "description": "Text input component with validation states",
      "accessibility": ["label association", "error announcements", "keyboard navigation"],
      "states": ["default", "hover", "focus", "error", "disabled", "readonly"]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. **Accessibility First**: All components must meet WCAG 2.1 AA standards
2. **Color Contrast**: Ensure minimum 4.5:1 contrast ratio for text
3. **Semantic Naming**: Use meaningful, descriptive names for all tokens
4. **Scalability**: Design for systems that can grow and evolve
5. **Cross-browser Compatibility**: Use standard CSS properties
6. **Performance**: Minimize CSS output and optimize for loading
7. **Responsive Design**: Include proper breakpoints and fluid typography
8. **Dark Mode Ready**: Ensure colors work in both light and dark themes
9. **Component Consistency**: Maintain visual harmony across all components
10. **Professional Quality**: Match or exceed industry design system standards

DESIGN PRINCIPLES:
- Prioritize user experience and usability
- Create intuitive visual hierarchy
- Maintain consistent spacing and proportions
- Use appropriate typography pairings
- Implement subtle but meaningful animations
- Ensure keyboard and screen reader accessibility
- Support internationalization and localization

COMPONENT REQUIREMENTS:
- Generate 10-15 essential components covering: Interactive (Button, Link), Form (Input, Select, Checkbox, Radio), Layout (Card, Modal, Tooltip), Navigation (Menu, Breadcrumb), Feedback (Alert, Toast), Data Display (Table, List)
- Each component must include proper TypeScript types
- All components must support theming
- Include comprehensive variant and size options
- Implement proper focus management
- Add loading and error states where applicable

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
