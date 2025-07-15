import { GeneratedComponent, DesignSystemConfig } from '@/types'

export interface ComponentTemplate {
  name: string
  category: string
  description: string
  baseCode: string
  variants: Record<string, string>
  sizes: Record<string, string>
  states: Record<string, string>
  accessibility: {
    ariaLabels: string[]
    keyboardNavigation: string[]
    screenReader: string[]
  }
  dependencies: string[]
  examples: Array<{
    name: string
    code: string
    description: string
  }>
}

export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  Button: {
    name: 'Button',
    category: 'Interactive',
    description: 'Versatile button component with multiple variants, sizes, and states',
    baseCode: `
import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
`,
    variants: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
      outline: 'border border-primary-300 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
      ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
    },
    sizes: {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
      xl: 'h-11 px-8 text-base'
    },
    states: {
      default: '',
      hover: 'hover:opacity-90',
      focus: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      active: 'active:scale-95',
      disabled: 'disabled:opacity-50 disabled:pointer-events-none',
      loading: 'cursor-not-allowed'
    },
    accessibility: {
      ariaLabels: ['aria-label', 'aria-describedby'],
      keyboardNavigation: ['Enter', 'Space'],
      screenReader: ['role="button"', 'aria-pressed for toggle buttons']
    },
    dependencies: ['React', 'cn utility'],
    examples: [
      {
        name: 'Primary Button',
        code: '<Button variant="primary">Click me</Button>',
        description: 'Standard primary button for main actions'
      },
      {
        name: 'Loading Button',
        code: '<Button loading>Processing...</Button>',
        description: 'Button with loading state'
      }
    ]
  },

  Input: {
    name: 'Input',
    category: 'Form',
    description: 'Text input component with validation states and accessibility features',
    baseCode: `
import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  helperText?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', size = 'md', error, helperText, label, className, id, ...props }, ref) => {
    const inputId = id || \`input-\${Math.random().toString(36).substr(2, 9)}\`
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            VARIANT_STYLES[variant],
            SIZE_STYLES[size],
            error && 'border-red-500 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={error}
          aria-describedby={helperText ? \`\${inputId}-helper\` : undefined}
          {...props}
        />
        {helperText && (
          <p 
            id={\`\${inputId}-helper\`}
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
`,
    variants: {
      default: 'border border-gray-300 bg-white px-3 py-2 rounded-md',
      filled: 'border-0 bg-gray-100 px-3 py-2 rounded-md',
      outlined: 'border-2 border-gray-300 bg-transparent px-3 py-2 rounded-md'
    },
    sizes: {
      sm: 'h-8 text-sm',
      md: 'h-9 text-sm',
      lg: 'h-10 text-base'
    },
    states: {
      default: '',
      hover: 'hover:border-gray-400',
      focus: 'focus:border-primary-500 focus:ring-primary-500',
      error: 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      readonly: 'readonly:bg-gray-50 readonly:cursor-default'
    },
    accessibility: {
      ariaLabels: ['aria-label', 'aria-describedby', 'aria-invalid'],
      keyboardNavigation: ['Tab navigation', 'Enter to submit'],
      screenReader: ['Label association', 'Error announcements']
    },
    dependencies: ['React', 'cn utility'],
    examples: [
      {
        name: 'Basic Input',
        code: '<Input placeholder="Enter your name" />',
        description: 'Basic text input'
      },
      {
        name: 'Input with Label',
        code: '<Input label="Full Name" placeholder="Enter your name" />',
        description: 'Input with associated label'
      }
    ]
  },

  Card: {
    name: 'Card',
    category: 'Layout',
    description: 'Flexible card component for content organization',
    baseCode: `
import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          VARIANT_STYLES[variant],
          PADDING_STYLES[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
`,
    variants: {
      default: 'bg-white border border-gray-200',
      outlined: 'bg-white border-2 border-gray-200',
      elevated: 'bg-white shadow-md border border-gray-100'
    },
    sizes: {},
    states: {
      default: '',
      hover: 'hover:shadow-lg transition-shadow',
      focus: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    },
    accessibility: {
      ariaLabels: ['aria-label', 'role'],
      keyboardNavigation: ['Tab navigation'],
      screenReader: ['Semantic markup']
    },
    dependencies: ['React', 'cn utility'],
    examples: [
      {
        name: 'Basic Card',
        code: '<Card><p>Card content</p></Card>',
        description: 'Simple card with content'
      }
    ]
  }
}

export class ComponentTemplateEngine {
  private templates: Record<string, ComponentTemplate> = COMPONENT_TEMPLATES

  getTemplate(name: string): ComponentTemplate | undefined {
    return this.templates[name]
  }

  getAllTemplates(): ComponentTemplate[] {
    return Object.values(this.templates)
  }

  getTemplatesByCategory(category: string): ComponentTemplate[] {
    return Object.values(this.templates).filter(t => t.category === category)
  }

  generateComponent(
    templateName: string,
    designSystem: DesignSystemConfig,
    customizations?: Partial<ComponentTemplate>
  ): GeneratedComponent | null {
    const template = this.getTemplate(templateName)
    if (!template) return null

    const customized = { ...template, ...customizations }
    
    // Generate styled component code
    const styledCode = this.injectDesignTokens(customized.baseCode, designSystem)
    
    // Generate variants with design system colors
    const styledVariants = this.generateStyledVariants(customized.variants, designSystem)
    
    // Generate sizes with design system spacing
    const styledSizes = this.generateStyledSizes(customized.sizes, designSystem)

    return {
      name: customized.name,
      category: customized.category,
      code: styledCode,
      props: this.extractProps(styledCode),
      variants: Object.entries(styledVariants).map(([name, styles]) => ({
        name,
        props: { variant: name },
        description: `${name} variant of ${customized.name}`
      })),
      sizes: Object.keys(styledSizes),
      description: customized.description,
      accessibility: customized.accessibility.ariaLabels.concat(
        customized.accessibility.keyboardNavigation,
        customized.accessibility.screenReader
      ),
      states: Object.keys(customized.states),
      examples: customized.examples
    }
  }

  private injectDesignTokens(code: string, designSystem: DesignSystemConfig): string {
    // Replace color tokens
    let styledCode = code
      .replace(/primary-(\d+)/g, (match, shade) => {
        const shadeKey = shade as keyof typeof designSystem.colors.primary
        return `[${designSystem.colors.primary[shadeKey] || match}]`
      })
      .replace(/secondary-(\d+)/g, (match, shade) => {
        const shadeKey = shade as keyof typeof designSystem.colors.secondary
        return `[${designSystem.colors.secondary[shadeKey] || match}]`
      })
    
    // Replace typography tokens
    styledCode = styledCode
      .replace(/text-(\w+)/g, (match, size) => {
        const sizeKey = size as keyof typeof designSystem.typography.scale
        return designSystem.typography.scale[sizeKey] ? `text-[${designSystem.typography.scale[sizeKey]}]` : match
      })
    
    // Replace spacing tokens
    styledCode = styledCode
      .replace(/rounded-(\w+)/g, (match, size) => {
        const sizeKey = size as keyof typeof designSystem.borderRadius
        return designSystem.borderRadius[sizeKey] ? `rounded-[${designSystem.borderRadius[sizeKey]}]` : match
      })

    return styledCode
  }

  private generateStyledVariants(
    variants: Record<string, string>,
    designSystem: DesignSystemConfig
  ): Record<string, string> {
    const styled: Record<string, string> = {}
    
    for (const [name, styles] of Object.entries(variants)) {
      styled[name] = this.injectDesignTokens(styles, designSystem)
    }
    
    return styled
  }

  private generateStyledSizes(
    sizes: Record<string, string>,
    designSystem: DesignSystemConfig
  ): Record<string, string> {
    const styled: Record<string, string> = {}
    
    for (const [name, styles] of Object.entries(sizes)) {
      styled[name] = this.injectDesignTokens(styles, designSystem)
    }
    
    return styled
  }

  private extractProps(code: string): Array<{ name: string; type: string; required: boolean; description: string }> {
    const props: Array<{ name: string; type: string; required: boolean; description: string }> = []
    
    // Extract interface definition
    const interfaceMatch = code.match(/interface\s+\w+Props[^{]*\{([^}]+)\}/)
    if (interfaceMatch) {
      const interfaceContent = interfaceMatch[1]
      const propMatches = interfaceContent.match(/(\w+)\??:\s*([^;]+);?/g)
      
      if (propMatches) {
        for (const propMatch of propMatches) {
          const [, name, type] = propMatch.match(/(\w+)(\?)?:\s*([^;]+)/) || []
          if (name && type) {
            props.push({
              name,
              type: type.trim(),
              required: !propMatch.includes('?'),
              description: `${name} property`
            })
          }
        }
      }
    }
    
    return props
  }

  registerTemplate(name: string, template: ComponentTemplate): void {
    this.templates[name] = template
  }

  removeTemplate(name: string): void {
    delete this.templates[name]
  }
}

export const componentTemplateEngine = new ComponentTemplateEngine()