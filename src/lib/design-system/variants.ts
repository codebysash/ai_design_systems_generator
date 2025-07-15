import { GeneratedComponent, ComponentVariant, DesignSystemConfig } from '@/types'

export interface VariantConfig {
  name: string
  displayName: string
  description: string
  properties: VariantProperty[]
  combinations: VariantCombination[]
  defaultValues: Record<string, any>
  dependencies: string[]
  conflicts: string[]
}

export interface VariantProperty {
  name: string
  type: 'boolean' | 'string' | 'number' | 'enum' | 'compound'
  values?: string[]
  description: string
  affects: ('style' | 'behavior' | 'accessibility')[]
  required: boolean
  default?: any
}

export interface VariantCombination {
  name: string
  description: string
  properties: Record<string, any>
  styles: Record<string, string>
  priority: number
  conditions?: string[]
}

export interface VariantSystem {
  component: string
  variants: VariantConfig[]
  compoundVariants: CompoundVariant[]
  defaultVariant: string
  variantClassNames: Record<string, Record<string, string>>
  responsiveVariants: ResponsiveVariant[]
}

export interface CompoundVariant {
  name: string
  description: string
  conditions: Record<string, any>
  styles: Record<string, string>
  priority: number
  overrides: string[]
}

export interface ResponsiveVariant {
  name: string
  breakpoints: Record<string, any>
  styles: Record<string, Record<string, string>>
}

export class VariantSystemGenerator {
  private styleGenerator = new VariantStyleGenerator()
  private typeGenerator = new VariantTypeGenerator()
  private validationGenerator = new VariantValidationGenerator()
  private responsiveGenerator = new ResponsiveVariantGenerator()

  generateVariantSystem(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig
  ): VariantSystem {
    const variants = this.generateVariants(component, designSystem)
    const compoundVariants = this.generateCompoundVariants(component, designSystem)
    const defaultVariant = this.determineDefaultVariant(component)
    const variantClassNames = this.generateVariantClassNames(component, designSystem)
    const responsiveVariants = this.responsiveGenerator.generateResponsiveVariants(component, designSystem)

    return {
      component: component.name,
      variants,
      compoundVariants,
      defaultVariant,
      variantClassNames,
      responsiveVariants
    }
  }

  generateVariantCode(
    component: GeneratedComponent,
    variantSystem: VariantSystem,
    framework: 'react' | 'vue' | 'angular' = 'react'
  ): string {
    switch (framework) {
      case 'react':
        return this.generateReactVariantCode(component, variantSystem)
      case 'vue':
        return this.generateVueVariantCode(component, variantSystem)
      case 'angular':
        return this.generateAngularVariantCode(component, variantSystem)
      default:
        throw new Error(`Unsupported framework: ${framework}`)
    }
  }

  private generateVariants(component: GeneratedComponent, designSystem: DesignSystemConfig): VariantConfig[] {
    const variants: VariantConfig[] = []

    // Generate style variants
    if (component.variants.length > 0) {
      variants.push({
        name: 'variant',
        displayName: 'Style Variant',
        description: 'Visual style of the component',
        properties: [
          {
            name: 'variant',
            type: 'enum',
            values: component.variants.map(v => v.name),
            description: 'Component style variant',
            affects: ['style'],
            required: false,
            default: component.variants[0]?.name || 'default'
          }
        ],
        combinations: component.variants.map(v => ({
          name: v.name,
          description: v.description,
          properties: { variant: v.name },
          styles: this.styleGenerator.generateVariantStyles(v, designSystem),
          priority: 1
        })),
        defaultValues: { variant: component.variants[0]?.name || 'default' },
        dependencies: [],
        conflicts: []
      })
    }

    // Generate size variants
    if (component.sizes.length > 0) {
      variants.push({
        name: 'size',
        displayName: 'Size',
        description: 'Size of the component',
        properties: [
          {
            name: 'size',
            type: 'enum',
            values: component.sizes,
            description: 'Component size',
            affects: ['style'],
            required: false,
            default: 'md'
          }
        ],
        combinations: component.sizes.map(size => ({
          name: size,
          description: `${size} size variant`,
          properties: { size },
          styles: this.styleGenerator.generateSizeStyles(size, designSystem),
          priority: 2
        })),
        defaultValues: { size: 'md' },
        dependencies: [],
        conflicts: []
      })
    }

    // Generate state variants
    if (component.states.length > 0) {
      variants.push({
        name: 'state',
        displayName: 'State',
        description: 'Interactive state of the component',
        properties: [
          {
            name: 'loading',
            type: 'boolean',
            description: 'Loading state',
            affects: ['style', 'behavior', 'accessibility'],
            required: false,
            default: false
          },
          {
            name: 'disabled',
            type: 'boolean',
            description: 'Disabled state',
            affects: ['style', 'behavior', 'accessibility'],
            required: false,
            default: false
          },
          {
            name: 'error',
            type: 'boolean',
            description: 'Error state',
            affects: ['style', 'accessibility'],
            required: false,
            default: false
          }
        ],
        combinations: [
          {
            name: 'loading',
            description: 'Loading state styles',
            properties: { loading: true },
            styles: this.styleGenerator.generateStateStyles('loading', designSystem),
            priority: 3
          },
          {
            name: 'disabled',
            description: 'Disabled state styles',
            properties: { disabled: true },
            styles: this.styleGenerator.generateStateStyles('disabled', designSystem),
            priority: 3
          },
          {
            name: 'error',
            description: 'Error state styles',
            properties: { error: true },
            styles: this.styleGenerator.generateStateStyles('error', designSystem),
            priority: 3
          }
        ],
        defaultValues: { loading: false, disabled: false, error: false },
        dependencies: [],
        conflicts: []
      })
    }

    return variants
  }

  private generateCompoundVariants(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig
  ): CompoundVariant[] {
    const compoundVariants: CompoundVariant[] = []

    // Generate combinations of variant + size
    if (component.variants.length > 0 && component.sizes.length > 0) {
      component.variants.forEach(variant => {
        component.sizes.forEach(size => {
          compoundVariants.push({
            name: `${variant.name}-${size}`,
            description: `${variant.name} variant in ${size} size`,
            conditions: { variant: variant.name, size },
            styles: this.styleGenerator.generateCompoundStyles(variant.name, size, designSystem),
            priority: 5,
            overrides: []
          })
        })
      })
    }

    // Generate state combinations
    if (component.variants.length > 0) {
      component.variants.forEach(variant => {
        compoundVariants.push({
          name: `${variant.name}-loading`,
          description: `${variant.name} variant in loading state`,
          conditions: { variant: variant.name, loading: true },
          styles: this.styleGenerator.generateCompoundStyles(variant.name, 'loading', designSystem),
          priority: 6,
          overrides: []
        })

        compoundVariants.push({
          name: `${variant.name}-disabled`,
          description: `${variant.name} variant in disabled state`,
          conditions: { variant: variant.name, disabled: true },
          styles: this.styleGenerator.generateCompoundStyles(variant.name, 'disabled', designSystem),
          priority: 6,
          overrides: []
        })
      })
    }

    return compoundVariants
  }

  private determineDefaultVariant(component: GeneratedComponent): string {
    return component.variants[0]?.name || 'default'
  }

  private generateVariantClassNames(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig
  ): Record<string, Record<string, string>> {
    const classNames: Record<string, Record<string, string>> = {}

    // Variant class names
    if (component.variants.length > 0) {
      classNames.variant = {}
      component.variants.forEach(variant => {
        classNames.variant[variant.name] = this.styleGenerator.generateVariantClassName(variant, designSystem)
      })
    }

    // Size class names
    if (component.sizes.length > 0) {
      classNames.size = {}
      component.sizes.forEach(size => {
        classNames.size[size] = this.styleGenerator.generateSizeClassName(size, designSystem)
      })
    }

    // State class names
    classNames.state = {
      loading: 'opacity-50 pointer-events-none',
      disabled: 'opacity-50 cursor-not-allowed',
      error: 'border-red-500 text-red-900'
    }

    return classNames
  }

  private generateReactVariantCode(component: GeneratedComponent, variantSystem: VariantSystem): string {
    const variantTypes = this.typeGenerator.generateVariantTypes(variantSystem)
    const variantLogic = this.generateVariantLogic(variantSystem)
    const compoundVariantLogic = this.generateCompoundVariantLogic(variantSystem)

    return `${variantTypes}

// Variant configuration
const ${component.name.toLowerCase()}Variants = {
  ${this.generateVariantConfig(variantSystem)}
}

// Compound variant configuration
const ${component.name.toLowerCase()}CompoundVariants = [
  ${this.generateCompoundVariantConfig(variantSystem)}
]

// Variant logic hook
export const use${component.name}Variants = (props: ${component.name}VariantProps) => {
  ${variantLogic}
  
  ${compoundVariantLogic}
  
  return {
    className: cn(baseStyles, variantStyles, compoundStyles, props.className),
    styles: mergedStyles
  }
}`
  }

  private generateVueVariantCode(component: GeneratedComponent, variantSystem: VariantSystem): string {
    // Vue variant implementation
    return `// Vue variant implementation for ${component.name}
export const ${component.name.toLowerCase()}Variants = {
  // Vue-specific variant logic
}`
  }

  private generateAngularVariantCode(component: GeneratedComponent, variantSystem: VariantSystem): string {
    // Angular variant implementation
    return `// Angular variant implementation for ${component.name}
export class ${component.name}Variants {
  // Angular-specific variant logic
}`
  }

  private generateVariantLogic(variantSystem: VariantSystem): string {
    return `
  const baseStyles = '${this.getBaseStyles(variantSystem.component)}'
  
  const variantStyles = cn(
    ${variantSystem.variants.map(variant => {
      const variantName = variant.name
      const combinations = variant.combinations.map(combo => 
        `props.${variantName} === '${combo.name}' && '${Object.values(combo.styles).join(' ')}'`
      ).join(',\n    ')
      
      return `${combinations}`
    }).join(',\n    ')}
  )`
  }

  private generateCompoundVariantLogic(variantSystem: VariantSystem): string {
    return `
  const compoundStyles = cn(
    ${variantSystem.compoundVariants.map(compound => {
      const conditions = Object.entries(compound.conditions).map(([key, value]) => 
        typeof value === 'boolean' ? `props.${key} === ${value}` : `props.${key} === '${value}'`
      ).join(' && ')
      
      return `(${conditions}) && '${Object.values(compound.styles).join(' ')}'`
    }).join(',\n    ')}
  )`
  }

  private generateVariantConfig(variantSystem: VariantSystem): string {
    return variantSystem.variants.map(variant => {
      const combinations = variant.combinations.map(combo => 
        `${combo.name}: '${Object.values(combo.styles).join(' ')}'`
      ).join(',\n    ')
      
      return `${variant.name}: {
    ${combinations}
  }`
    }).join(',\n  ')
  }

  private generateCompoundVariantConfig(variantSystem: VariantSystem): string {
    return variantSystem.compoundVariants.map(compound => {
      const conditions = Object.entries(compound.conditions).map(([key, value]) => 
        `${key}: ${typeof value === 'string' ? `'${value}'` : value}`
      ).join(', ')
      
      return `{
    conditions: { ${conditions} },
    styles: '${Object.values(compound.styles).join(' ')}'
  }`
    }).join(',\n  ')
  }

  private getBaseStyles(componentName: string): string {
    const baseStyles = {
      'Button': 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      'Input': 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'Card': 'rounded-lg border bg-card text-card-foreground shadow-sm',
      'Modal': 'fixed inset-0 z-50 flex items-center justify-center p-4'
    }

    return baseStyles[componentName as keyof typeof baseStyles] || 'component-base'
  }
}

class VariantStyleGenerator {
  generateVariantStyles(variant: ComponentVariant, designSystem: DesignSystemConfig): Record<string, string> {
    const styles: Record<string, string> = {}

    // Generate styles based on variant name and design system
    switch (variant.name) {
      case 'primary':
        styles.background = `bg-[${designSystem.colors.primary['500']}]`
        styles.text = 'text-white'
        styles.hover = `hover:bg-[${designSystem.colors.primary['600']}]`
        break
      case 'secondary':
        styles.background = `bg-[${designSystem.colors.secondary['500']}]`
        styles.text = 'text-white'
        styles.hover = `hover:bg-[${designSystem.colors.secondary['600']}]`
        break
      case 'outline':
        styles.border = `border border-[${designSystem.colors.primary['500']}]`
        styles.text = `text-[${designSystem.colors.primary['500']}]`
        styles.hover = `hover:bg-[${designSystem.colors.primary['50']}]`
        break
      case 'ghost':
        styles.text = `text-[${designSystem.colors.primary['500']}]`
        styles.hover = `hover:bg-[${designSystem.colors.primary['50']}]`
        break
      default:
        styles.background = 'bg-gray-500'
        styles.text = 'text-white'
        styles.hover = 'hover:bg-gray-600'
    }

    return styles
  }

  generateSizeStyles(size: string, designSystem: DesignSystemConfig): Record<string, string> {
    const styles: Record<string, string> = {}

    switch (size) {
      case 'xs':
        styles.height = 'h-7'
        styles.padding = 'px-2'
        styles.fontSize = 'text-xs'
        break
      case 'sm':
        styles.height = 'h-8'
        styles.padding = 'px-3'
        styles.fontSize = 'text-sm'
        break
      case 'md':
        styles.height = 'h-9'
        styles.padding = 'px-4'
        styles.fontSize = 'text-sm'
        break
      case 'lg':
        styles.height = 'h-10'
        styles.padding = 'px-6'
        styles.fontSize = 'text-base'
        break
      case 'xl':
        styles.height = 'h-11'
        styles.padding = 'px-8'
        styles.fontSize = 'text-base'
        break
      default:
        styles.height = 'h-9'
        styles.padding = 'px-4'
        styles.fontSize = 'text-sm'
    }

    return styles
  }

  generateStateStyles(state: string, designSystem: DesignSystemConfig): Record<string, string> {
    const styles: Record<string, string> = {}

    switch (state) {
      case 'loading':
        styles.opacity = 'opacity-50'
        styles.cursor = 'cursor-not-allowed'
        break
      case 'disabled':
        styles.opacity = 'opacity-50'
        styles.cursor = 'cursor-not-allowed'
        styles.pointerEvents = 'pointer-events-none'
        break
      case 'error':
        styles.border = `border-[${designSystem.colors.semantic.error}]`
        styles.text = `text-[${designSystem.colors.semantic.error}]`
        break
      default:
        break
    }

    return styles
  }

  generateCompoundStyles(variant: string, modifier: string, designSystem: DesignSystemConfig): Record<string, string> {
    const styles: Record<string, string> = {}

    // Generate compound styles based on variant and modifier combination
    if (variant === 'primary' && modifier === 'loading') {
      styles.background = `bg-[${designSystem.colors.primary['400']}]`
      styles.cursor = 'cursor-not-allowed'
    } else if (variant === 'outline' && modifier === 'disabled') {
      styles.border = `border-[${designSystem.colors.neutral['300']}]`
      styles.text = `text-[${designSystem.colors.neutral['400']}]`
    }

    return styles
  }

  generateVariantClassName(variant: ComponentVariant, designSystem: DesignSystemConfig): string {
    const styles = this.generateVariantStyles(variant, designSystem)
    return Object.values(styles).join(' ')
  }

  generateSizeClassName(size: string, designSystem: DesignSystemConfig): string {
    const styles = this.generateSizeStyles(size, designSystem)
    return Object.values(styles).join(' ')
  }
}

class VariantTypeGenerator {
  generateVariantTypes(variantSystem: VariantSystem): string {
    const variantTypes = variantSystem.variants.map(variant => {
      const properties = variant.properties.map(prop => {
        const optional = prop.required ? '' : '?'
        const type = prop.type === 'enum' ? prop.values?.map(v => `'${v}'`).join(' | ') : prop.type
        return `  ${prop.name}${optional}: ${type}`
      }).join('\n')

      return `interface ${variant.displayName.replace(/\s+/g, '')}Props {
${properties}
}`
    }).join('\n\n')

    const mainVariantType = `interface ${variantSystem.component}VariantProps {
  ${variantSystem.variants.map(variant => 
    variant.properties.map(prop => {
      const optional = prop.required ? '' : '?'
      const type = prop.type === 'enum' ? prop.values?.map(v => `'${v}'`).join(' | ') : prop.type
      return `${prop.name}${optional}: ${type}`
    }).join('\n  ')
  ).join('\n  ')}
}`

    return `${variantTypes}\n\n${mainVariantType}`
  }
}

class VariantValidationGenerator {
  generateValidationRules(variantSystem: VariantSystem): string {
    return `// Validation rules for ${variantSystem.component} variants
export const ${variantSystem.component.toLowerCase()}VariantValidation = {
  // Validation logic
}`
  }
}

class ResponsiveVariantGenerator {
  generateResponsiveVariants(component: GeneratedComponent, designSystem: DesignSystemConfig): ResponsiveVariant[] {
    const responsiveVariants: ResponsiveVariant[] = []

    // Generate responsive size variants
    if (component.sizes.length > 0) {
      responsiveVariants.push({
        name: 'responsiveSize',
        breakpoints: designSystem.breakpoints,
        styles: {
          sm: { size: 'sm' },
          md: { size: 'md' },
          lg: { size: 'lg' }
        }
      })
    }

    return responsiveVariants
  }
}

export const variantSystemGenerator = new VariantSystemGenerator()