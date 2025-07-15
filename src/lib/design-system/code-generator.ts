import { GeneratedComponent, DesignSystemConfig, ComponentProp, ComponentVariant } from '@/types'
import { componentTemplateEngine } from './templates'
import { designTokenGenerator } from './tokens'

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte'
  language: 'typescript' | 'javascript'
  cssFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion'
  includeTests: boolean
  includeStories: boolean
  includeDocumentation: boolean
  accessibility: boolean
  variant: 'default' | 'compound' | 'polymorphic'
}

export interface GeneratedCode {
  component: string
  types: string
  styles: string
  tests?: string
  stories?: string
  documentation?: string
  exports: string
  imports: string[]
}

export class ComponentCodeGenerator {
  private typeGenerator = new TypeDefinitionGenerator()
  private accessibilityGenerator = new AccessibilityGenerator()
  private variantGenerator = new VariantGenerator()
  private testGenerator = new TestGenerator()
  private storyGenerator = new StoryGenerator()
  private docGenerator = new DocumentationGenerator()

  generateComponent(
    componentSpec: GeneratedComponent,
    designSystem: DesignSystemConfig,
    options: CodeGenerationOptions = this.getDefaultOptions()
  ): GeneratedCode {
    const tokens = designTokenGenerator.generateTokens(designSystem)
    
    switch (options.framework) {
      case 'react':
        return this.generateReactComponent(componentSpec, tokens, options)
      case 'vue':
        return this.generateVueComponent(componentSpec, tokens, options)
      case 'angular':
        return this.generateAngularComponent(componentSpec, tokens, options)
      case 'svelte':
        return this.generateSvelteComponent(componentSpec, tokens, options)
      default:
        throw new Error(`Unsupported framework: ${options.framework}`)
    }
  }

  private generateReactComponent(
    spec: GeneratedComponent,
    tokens: any,
    options: CodeGenerationOptions
  ): GeneratedCode {
    const types = this.typeGenerator.generateReactTypes(spec, options)
    const variants = this.variantGenerator.generateVariantStyles(spec.variants, tokens, options)
    const accessibility = this.accessibilityGenerator.generateAccessibilityProps(spec)
    
    const componentCode = this.buildReactComponentCode(spec, variants, accessibility, options)
    const stylesCode = this.generateStyles(spec, tokens, options)
    const exportsCode = this.generateExports(spec, options)
    const imports = this.generateImports(spec, options)

    const result: GeneratedCode = {
      component: componentCode,
      types,
      styles: stylesCode,
      exports: exportsCode,
      imports
    }

    if (options.includeTests) {
      result.tests = this.testGenerator.generateReactTests(spec, options)
    }

    if (options.includeStories) {
      result.stories = this.storyGenerator.generateReactStories(spec, options)
    }

    if (options.includeDocumentation) {
      result.documentation = this.docGenerator.generateComponentDocs(spec, options)
    }

    return result
  }

  private buildReactComponentCode(
    spec: GeneratedComponent,
    variants: VariantStyles,
    accessibility: AccessibilityProps,
    options: CodeGenerationOptions
  ): string {
    const isTypeScript = options.language === 'typescript'
    const componentName = spec.name
    const propsInterface = isTypeScript ? `${componentName}Props` : ''
    
    const imports = this.generateComponentImports(options)
    const propsDefinition = this.generatePropsDefinition(spec, isTypeScript)
    const variantLogic = this.generateVariantLogic(variants, options)
    const accessibilityLogic = this.generateAccessibilityLogic(accessibility)
    const componentBody = this.generateComponentBody(spec, options)

    return `${imports}

${propsDefinition}

export const ${componentName} = ${isTypeScript ? `React.forwardRef<HTMLElement, ${propsInterface}>` : 'React.forwardRef'}(
  (${this.generatePropsDestructuring(spec, isTypeScript)}, ref) => {
    ${variantLogic}
    ${accessibilityLogic}
    
    return (
      ${componentBody}
    )
  }
)

${componentName}.displayName = '${componentName}'`
  }

  private generateComponentImports(options: CodeGenerationOptions): string {
    const imports = ['import React from \'react\'']
    
    if (options.cssFramework === 'tailwind') {
      imports.push('import { cn } from \'@/lib/utils\'')
    } else if (options.cssFramework === 'styled-components') {
      imports.push('import styled from \'styled-components\'')
    } else if (options.cssFramework === 'emotion') {
      imports.push('import { css } from \'@emotion/react\'')
    }

    if (options.accessibility) {
      imports.push('import { useId } from \'react\'')
    }

    return imports.join('\n')
  }

  private generatePropsDefinition(spec: GeneratedComponent, isTypeScript: boolean): string {
    if (!isTypeScript) return ''

    const baseProps = this.getBasePropsForComponent(spec)
    const customProps = spec.props.map(prop => {
      const optional = prop.required ? '' : '?'
      const defaultValue = prop.default ? ` // default: ${prop.default}` : ''
      return `  ${prop.name}${optional}: ${prop.type}${defaultValue}`
    }).join('\n')

    return `interface ${spec.name}Props extends ${baseProps} {
${customProps}
}`
  }

  private getBasePropsForComponent(spec: GeneratedComponent): string {
    const baseProps = {
      'Button': 'React.ButtonHTMLAttributes<HTMLButtonElement>',
      'Input': 'React.InputHTMLAttributes<HTMLInputElement>',
      'Card': 'React.HTMLAttributes<HTMLDivElement>',
      'Modal': 'React.HTMLAttributes<HTMLDivElement>',
      'Select': 'React.SelectHTMLAttributes<HTMLSelectElement>',
      'Textarea': 'React.TextareaHTMLAttributes<HTMLTextAreaElement>',
      'Link': 'React.AnchorHTMLAttributes<HTMLAnchorElement>',
      'List': 'React.HTMLAttributes<HTMLUListElement>',
      'Table': 'React.TableHTMLAttributes<HTMLTableElement>'
    }

    return baseProps[spec.name as keyof typeof baseProps] || 'React.HTMLAttributes<HTMLElement>'
  }

  private generatePropsDestructuring(spec: GeneratedComponent, isTypeScript: boolean): string {
    const requiredProps = spec.props.filter(p => p.required).map(p => p.name)
    const optionalProps = spec.props.filter(p => !p.required).map(p => {
      const defaultValue = p.default ? ` = ${JSON.stringify(p.default)}` : ''
      return `${p.name}${defaultValue}`
    })

    const allProps = [...requiredProps, ...optionalProps, 'className', '...props']
    const propsString = `{ ${allProps.join(', ')} }`

    return isTypeScript ? `${propsString}: ${spec.name}Props` : propsString
  }

  private generateVariantLogic(variants: VariantStyles, options: CodeGenerationOptions): string {
    if (options.cssFramework === 'tailwind') {
      return this.generateTailwindVariantLogic(variants)
    } else if (options.cssFramework === 'styled-components') {
      return this.generateStyledComponentsVariantLogic(variants)
    } else if (options.cssFramework === 'css-modules') {
      return this.generateCSSModulesVariantLogic(variants)
    }
    return ''
  }

  private generateTailwindVariantLogic(variants: VariantStyles): string {
    const variantMaps = Object.entries(variants).map(([key, styles]) => {
      const styleEntries = Object.entries(styles).map(([name, classes]) => 
        `  ${name}: '${classes}'`
      ).join(',\n')
      
      return `const ${key.toUpperCase()}_STYLES = {\n${styleEntries}\n}`
    }).join('\n\n')

    return `${variantMaps}

    const classes = cn(
      'base-component-styles',
      ${Object.keys(variants).map(key => `${key} && ${key.toUpperCase()}_STYLES[${key}]`).join(',\n      ')},
      className
    )`
  }

  private generateStyledComponentsVariantLogic(variants: VariantStyles): string {
    return `const StyledComponent = styled.div\`
      /* Base styles */
      ${this.generateBaseStyles()}
      
      /* Variant styles */
      ${Object.entries(variants).map(([key, styles]) => 
        `\${props => props.${key} && css\`${Object.values(styles).join('; ')}\`}`
      ).join('\n      ')}
    \``
  }

  private generateCSSModulesVariantLogic(variants: VariantStyles): string {
    return `const classes = [
      styles.base,
      ${Object.keys(variants).map(key => `${key} && styles[\`\${${key}}\`]`).join(',\n      ')},
      className
    ].filter(Boolean).join(' ')`
  }

  private generateAccessibilityLogic(accessibility: AccessibilityProps): string {
    const id = accessibility.needsId ? 'const id = useId()' : ''
    const ariaProps = accessibility.ariaProps.map(prop => 
      `const ${prop.name} = ${prop.value}`
    ).join('\n    ')

    return `${id}
    ${ariaProps}`.trim()
  }

  private generateComponentBody(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    const element = this.getHTMLElement(spec)
    const attributes = this.generateAttributes(spec, options)
    const children = this.generateChildren(spec)

    return `<${element}
        ${attributes}
        ref={ref}
      >
        ${children}
      </${element}>`
  }

  private getHTMLElement(spec: GeneratedComponent): string {
    const elementMap = {
      'Button': 'button',
      'Input': 'input',
      'Card': 'div',
      'Modal': 'div',
      'Select': 'select',
      'Textarea': 'textarea',
      'Link': 'a',
      'List': 'ul',
      'Table': 'table'
    }

    return elementMap[spec.name as keyof typeof elementMap] || 'div'
  }

  private generateAttributes(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    const attributes = []

    if (options.cssFramework === 'tailwind') {
      attributes.push('className={classes}')
    } else if (options.cssFramework === 'css-modules') {
      attributes.push('className={classes}')
    }

    if (options.accessibility) {
      attributes.push(...this.generateAccessibilityAttributes(spec))
    }

    attributes.push('{...props}')

    return attributes.join('\n        ')
  }

  private generateAccessibilityAttributes(spec: GeneratedComponent): string[] {
    const attributes = []

    if (spec.accessibility.includes('aria-label')) {
      attributes.push('aria-label={ariaLabel}')
    }

    if (spec.accessibility.includes('keyboard navigation')) {
      attributes.push('onKeyDown={handleKeyDown}')
    }

    if (spec.accessibility.includes('focus indicators')) {
      attributes.push('onFocus={handleFocus}')
      attributes.push('onBlur={handleBlur}')
    }

    return attributes
  }

  private generateChildren(spec: GeneratedComponent): string {
    if (spec.name === 'Input' || spec.name === 'Textarea') {
      return '' // Self-closing elements
    }

    return spec.name === 'Button' ? '{children}' : '{children}'
  }

  private generateStyles(spec: GeneratedComponent, tokens: any, options: CodeGenerationOptions): string {
    if (options.cssFramework === 'tailwind') {
      return '' // Tailwind uses utility classes
    } else if (options.cssFramework === 'css-modules') {
      return this.generateCSSModules(spec, tokens)
    } else if (options.cssFramework === 'styled-components') {
      return '' // Styled components are defined inline
    }
    return ''
  }

  private generateCSSModules(spec: GeneratedComponent, tokens: any): string {
    return `.base {
  /* Base styles for ${spec.name} */
  font-family: ${tokens.typography.fontFamily.body};
  transition: ${tokens.animation.duration.normal} ${tokens.animation.easing.ease};
}

${spec.variants.map(variant => `
.${variant.name} {
  /* Styles for ${variant.name} variant */
}
`).join('')}

${spec.sizes.map(size => `
.${size} {
  /* Styles for ${size} size */
}
`).join('')}`
  }

  private generateExports(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    const exports = [`export { ${spec.name} }`]

    if (options.language === 'typescript') {
      exports.push(`export type { ${spec.name}Props }`)
    }

    return exports.join('\n')
  }

  private generateImports(spec: GeneratedComponent, options: CodeGenerationOptions): string[] {
    const imports = ['react']

    if (options.cssFramework === 'tailwind') {
      imports.push('@/lib/utils')
    } else if (options.cssFramework === 'styled-components') {
      imports.push('styled-components')
    } else if (options.cssFramework === 'emotion') {
      imports.push('@emotion/react')
    }

    return imports
  }

  private generateVueComponent(spec: GeneratedComponent, tokens: any, options: CodeGenerationOptions): GeneratedCode {
    // Vue implementation would go here
    throw new Error('Vue generation not implemented yet')
  }

  private generateAngularComponent(spec: GeneratedComponent, tokens: any, options: CodeGenerationOptions): GeneratedCode {
    // Angular implementation would go here
    throw new Error('Angular generation not implemented yet')
  }

  private generateSvelteComponent(spec: GeneratedComponent, tokens: any, options: CodeGenerationOptions): GeneratedCode {
    // Svelte implementation would go here
    throw new Error('Svelte generation not implemented yet')
  }

  private generateBaseStyles(): string {
    return `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      
      &:focus-visible {
        outline: 2px solid var(--color-primary-500);
        outline-offset: 2px;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `
  }

  private getDefaultOptions(): CodeGenerationOptions {
    return {
      framework: 'react',
      language: 'typescript',
      cssFramework: 'tailwind',
      includeTests: false,
      includeStories: false,
      includeDocumentation: false,
      accessibility: true,
      variant: 'default'
    }
  }
}

interface VariantStyles {
  [key: string]: {
    [variant: string]: string
  }
}

interface AccessibilityProps {
  needsId: boolean
  ariaProps: Array<{
    name: string
    value: string
  }>
}

// Helper classes for specific generation tasks
class TypeDefinitionGenerator {
  generateReactTypes(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    if (options.language !== 'typescript') return ''

    const baseInterface = this.generateBaseInterface(spec)
    const variantTypes = this.generateVariantTypes(spec)
    const propsInterface = this.generatePropsInterface(spec)

    return `${baseInterface}

${variantTypes}

${propsInterface}`
  }

  private generateBaseInterface(spec: GeneratedComponent): string {
    return `interface ${spec.name}BaseProps {
  children?: React.ReactNode
  className?: string
}`
  }

  private generateVariantTypes(spec: GeneratedComponent): string {
    const variantTypes = spec.variants.map(variant => `'${variant.name}'`).join(' | ')
    const sizeTypes = spec.sizes.map(size => `'${size}'`).join(' | ')

    return `type ${spec.name}Variant = ${variantTypes || 'never'}
type ${spec.name}Size = ${sizeTypes || 'never'}`
  }

  private generatePropsInterface(spec: GeneratedComponent): string {
    const props = spec.props.map(prop => {
      const optional = prop.required ? '' : '?'
      return `  ${prop.name}${optional}: ${prop.type}`
    }).join('\n')

    return `interface ${spec.name}Props extends ${spec.name}BaseProps {
${props}
}`
  }
}

class AccessibilityGenerator {
  generateAccessibilityProps(spec: GeneratedComponent): AccessibilityProps {
    const needsId = spec.accessibility.some(feature => 
      feature.includes('label') || feature.includes('describedby')
    )

    const ariaProps = spec.accessibility.map(feature => {
      if (feature.includes('label')) {
        return { name: 'ariaLabel', value: 'ariaLabel' }
      }
      if (feature.includes('describedby')) {
        return { name: 'ariaDescribedBy', value: 'ariaDescribedBy' }
      }
      return { name: 'role', value: `"${this.getRoleForComponent(spec.name)}"` }
    }).filter(Boolean)

    return { needsId, ariaProps }
  }

  private getRoleForComponent(componentName: string): string {
    const roles = {
      'Button': 'button',
      'Link': 'link',
      'Modal': 'dialog',
      'Alert': 'alert',
      'List': 'list',
      'Table': 'table'
    }

    return roles[componentName as keyof typeof roles] || 'generic'
  }
}

class VariantGenerator {
  generateVariantStyles(variants: ComponentVariant[], tokens: any, options: CodeGenerationOptions): VariantStyles {
    const styles: VariantStyles = {}

    variants.forEach(variant => {
      if (!styles.variant) styles.variant = {}
      styles.variant[variant.name] = this.generateVariantClasses(variant, tokens, options)
    })

    return styles
  }

  private generateVariantClasses(variant: ComponentVariant, tokens: any, options: CodeGenerationOptions): string {
    if (options.cssFramework === 'tailwind') {
      return this.generateTailwindClasses(variant, tokens)
    } else if (options.cssFramework === 'css-modules') {
      return this.generateCSSModuleClasses(variant, tokens)
    }
    return ''
  }

  private generateTailwindClasses(variant: ComponentVariant, tokens: any): string {
    const variantMap = {
      'primary': 'bg-primary-500 text-white hover:bg-primary-600',
      'secondary': 'bg-secondary-500 text-white hover:bg-secondary-600',
      'outline': 'border border-primary-500 text-primary-500 hover:bg-primary-50',
      'ghost': 'text-primary-500 hover:bg-primary-50',
      'danger': 'bg-red-500 text-white hover:bg-red-600'
    }

    return variantMap[variant.name as keyof typeof variantMap] || 'bg-gray-500 text-white'
  }

  private generateCSSModuleClasses(variant: ComponentVariant, tokens: any): string {
    return `${variant.name}-variant`
  }
}

class TestGenerator {
  generateReactTests(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    return `import { render, screen } from '@testing-library/react'
import { ${spec.name} } from './${spec.name}'

describe('${spec.name}', () => {
  it('renders correctly', () => {
    render(<${spec.name}>${spec.name === 'Button' ? 'Test' : ''}</${spec.name}>)
    expect(screen.getByRole('${this.getRoleForComponent(spec.name)}')).toBeInTheDocument()
  })

  ${spec.variants.map(variant => `
  it('renders ${variant.name} variant', () => {
    render(<${spec.name} variant="${variant.name}">${spec.name === 'Button' ? 'Test' : ''}</${spec.name}>)
    const element = screen.getByRole('${this.getRoleForComponent(spec.name)}')
    expect(element).toHaveClass('${variant.name}')
  })
  `).join('')}
})`
  }

  private getRoleForComponent(componentName: string): string {
    const roles = {
      'Button': 'button',
      'Link': 'link',
      'Input': 'textbox',
      'Select': 'combobox',
      'Textarea': 'textbox'
    }

    return roles[componentName as keyof typeof roles] || 'generic'
  }
}

class StoryGenerator {
  generateReactStories(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    return `import type { Meta, StoryObj } from '@storybook/react'
import { ${spec.name} } from './${spec.name}'

const meta: Meta<typeof ${spec.name}> = {
  title: '${spec.category}/${spec.name}',
  component: ${spec.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ${spec.props.filter(p => p.default).map(p => `${p.name}: ${JSON.stringify(p.default)}`).join(',\n    ')}
  },
}

${spec.variants.map(variant => `
export const ${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}: Story = {
  args: {
    variant: '${variant.name}',
  },
}
`).join('')}

${spec.sizes.map(size => `
export const ${size.toUpperCase()}: Story = {
  args: {
    size: '${size}',
  },
}
`).join('')}`
  }
}

class DocumentationGenerator {
  generateComponentDocs(spec: GeneratedComponent, options: CodeGenerationOptions): string {
    return `# ${spec.name}

${spec.description}

## Props

${spec.props.map(prop => `
### ${prop.name}

- **Type:** \`${prop.type}\`
- **Required:** ${prop.required ? 'Yes' : 'No'}
${prop.default ? `- **Default:** \`${prop.default}\`` : ''}

${prop.description}
`).join('')}

## Variants

${spec.variants.map(variant => `
### ${variant.name}

${variant.description}
`).join('')}

## Accessibility

${spec.accessibility.map(feature => `- ${feature}`).join('\n')}

## Examples

${spec.examples?.map(example => `
### ${example.name}

${example.description || ''}

\`\`\`jsx
${example.code}
\`\`\`
`).join('') || ''}
`
  }
}

export const componentCodeGenerator = new ComponentCodeGenerator()