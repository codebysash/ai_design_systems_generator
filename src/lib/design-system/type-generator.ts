import {
  GeneratedComponent,
  ComponentProp,
  ComponentVariant,
  DesignSystemConfig,
} from '@/types'

export interface TypeGenerationOptions {
  strict: boolean
  includeUtilityTypes: boolean
  includeEventHandlers: boolean
  includeRefTypes: boolean
  includePolymorphicTypes: boolean
  generateEnums: boolean
  generateUnions: boolean
  generateGenerics: boolean
}

export interface GeneratedTypes {
  interfaces: string
  types: string
  enums: string
  utilities: string
  exports: string
  imports: string
}

export class TypeScriptTypeGenerator {
  private utilityGenerator = new UtilityTypeGenerator()
  private interfaceGenerator = new InterfaceGenerator()
  private enumGenerator = new EnumGenerator()
  private unionGenerator = new UnionTypeGenerator()
  private genericGenerator = new GenericTypeGenerator()
  private eventGenerator = new EventHandlerGenerator()
  private refGenerator = new RefTypeGenerator()
  private polymorphicGenerator = new PolymorphicTypeGenerator()

  generateTypes(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig,
    options: TypeGenerationOptions = this.getDefaultOptions()
  ): GeneratedTypes {
    const interfaces = this.generateInterfaces(component, options)
    const types = this.generateTypeDefinitions(component, options)
    const enums = options.generateEnums
      ? this.generateEnums(component, designSystem)
      : ''
    const utilities = options.includeUtilityTypes
      ? this.generateUtilityTypes(component)
      : ''
    const exports = this.generateExports(component, options)
    const imports = this.generateImports(component, options)

    return {
      interfaces,
      types,
      enums,
      utilities,
      exports,
      imports,
    }
  }

  private generateInterfaces(
    component: GeneratedComponent,
    options: TypeGenerationOptions
  ): string {
    const baseInterface =
      this.interfaceGenerator.generateBaseInterface(component)
    const propsInterface = this.interfaceGenerator.generatePropsInterface(
      component,
      options
    )
    const variantInterface =
      this.interfaceGenerator.generateVariantInterface(component)
    const stateInterface =
      this.interfaceGenerator.generateStateInterface(component)

    const interfaces = [
      baseInterface,
      propsInterface,
      variantInterface,
      stateInterface,
    ]
      .filter(Boolean)
      .join('\n\n')

    return interfaces
  }

  private generateTypeDefinitions(
    component: GeneratedComponent,
    options: TypeGenerationOptions
  ): string {
    const variantTypes = this.unionGenerator.generateVariantTypes(component)
    const sizeTypes = this.unionGenerator.generateSizeTypes(component)
    const stateTypes = this.unionGenerator.generateStateTypes(component)
    const eventTypes = options.includeEventHandlers
      ? this.eventGenerator.generateEventTypes(component)
      : ''
    const refTypes = options.includeRefTypes
      ? this.refGenerator.generateRefTypes(component)
      : ''
    const polymorphicTypes = options.includePolymorphicTypes
      ? this.polymorphicGenerator.generatePolymorphicTypes(component)
      : ''

    const types = [
      variantTypes,
      sizeTypes,
      stateTypes,
      eventTypes,
      refTypes,
      polymorphicTypes,
    ]
      .filter(Boolean)
      .join('\n\n')

    return types
  }

  private generateEnums(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig
  ): string {
    return this.enumGenerator.generateEnums(component, designSystem)
  }

  private generateUtilityTypes(component: GeneratedComponent): string {
    return this.utilityGenerator.generateUtilityTypes(component)
  }

  private generateExports(
    component: GeneratedComponent,
    options: TypeGenerationOptions
  ): string {
    const exports = [
      `export type { ${component.name}Props }`,
      `export type { ${component.name}Variant }`,
      `export type { ${component.name}Size }`,
      `export type { ${component.name}State }`,
    ]

    if (options.includeEventHandlers) {
      exports.push(`export type { ${component.name}EventHandlers }`)
    }

    if (options.includeRefTypes) {
      exports.push(`export type { ${component.name}Ref }`)
    }

    if (options.includePolymorphicTypes) {
      exports.push(`export type { ${component.name}AsProps }`)
    }

    if (options.generateEnums) {
      exports.push(
        `export { ${component.name}Variant as ${component.name}VariantEnum }`
      )
      exports.push(
        `export { ${component.name}Size as ${component.name}SizeEnum }`
      )
    }

    return exports.join('\n')
  }

  private generateImports(
    component: GeneratedComponent,
    options: TypeGenerationOptions
  ): string {
    const imports = ["import React from 'react'"]

    if (options.includePolymorphicTypes) {
      imports.push("import type { ElementType, ComponentProps } from 'react'")
    }

    if (options.includeEventHandlers) {
      imports.push(
        "import type { MouseEvent, KeyboardEvent, FocusEvent } from 'react'"
      )
    }

    return imports.join('\n')
  }

  private getDefaultOptions(): TypeGenerationOptions {
    return {
      strict: true,
      includeUtilityTypes: true,
      includeEventHandlers: true,
      includeRefTypes: true,
      includePolymorphicTypes: false,
      generateEnums: false,
      generateUnions: true,
      generateGenerics: false,
    }
  }

  generateGlobalTypes(components: GeneratedComponent[]): string {
    const globalTypes = `
// Global design system types
export interface DesignSystemComponent {
  name: string
  category: string
  variants: string[]
  sizes: string[]
  states: string[]
}

export type ComponentCategory = ${components.map(c => `'${c.category}'`).join(' | ')}

export type ComponentName = ${components.map(c => `'${c.name}'`).join(' | ')}

export interface ComponentRegistry {
  ${components.map(c => `${c.name}: ${c.name}Props`).join('\n  ')}
}

export type ComponentVariants<T extends ComponentName> = 
  T extends keyof ComponentRegistry ? ComponentRegistry[T] : never

export type ComponentSizes<T extends ComponentName> = 
  T extends keyof ComponentRegistry ? ComponentRegistry[T]['size'] : never
`

    return globalTypes
  }
}

class InterfaceGenerator {
  generateBaseInterface(component: GeneratedComponent): string {
    const baseElement = this.getBaseElement(component.name)

    return `interface ${component.name}BaseProps {
  /** Additional CSS classes */
  className?: string
  /** Component children */
  children?: React.ReactNode
  /** Data test ID for testing */
  'data-testid'?: string
}`
  }

  generatePropsInterface(
    component: GeneratedComponent,
    options: TypeGenerationOptions
  ): string {
    const baseElement = this.getBaseElement(component.name)
    const extendedProps = this.getExtendedProps(component.name)

    const props = component.props
      .map(prop => {
        const optional = prop.required ? '' : '?'
        const jsDoc = this.generateJSDoc(prop)
        const defaultValue = prop.default
          ? ` // default: ${JSON.stringify(prop.default)}`
          : ''

        return `${jsDoc}
  ${prop.name}${optional}: ${prop.type}${defaultValue}`
      })
      .join('\n\n')

    const variantProps = this.generateVariantProps(component)
    const sizeProps = this.generateSizeProps(component)
    const stateProps = this.generateStateProps(component)
    const eventProps = options.includeEventHandlers
      ? this.generateEventProps(component)
      : ''
    const refProps = options.includeRefTypes
      ? this.generateRefProps(component)
      : ''

    return `interface ${component.name}Props extends ${extendedProps}, ${component.name}BaseProps {
${props}

${variantProps}

${sizeProps}

${stateProps}

${eventProps}

${refProps}
}`
  }

  generateVariantInterface(component: GeneratedComponent): string {
    const variants = component.variants.map(variant => ({
      name: variant.name,
      description: variant.description,
      props: variant.props,
    }))

    return `interface ${component.name}VariantConfig {
  ${variants
    .map(
      variant => `
  /** ${variant.description} */
  ${variant.name}: {
    ${Object.entries(variant.props)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === 'string' ? `'${value}'` : JSON.stringify(value)}`
      )
      .join('\n    ')}
  }`
    )
    .join('\n')}
}`
  }

  generateStateInterface(component: GeneratedComponent): string {
    const states = component.states.map(state => `'${state}'`).join(' | ')

    return `interface ${component.name}StateConfig {
  /** Current component state */
  state: ${states}
  /** Whether component is disabled */
  disabled?: boolean
  /** Whether component is loading */
  loading?: boolean
  /** Whether component has error */
  error?: boolean
}`
  }

  private getBaseElement(componentName: string): string {
    const elementMap = {
      Button: 'HTMLButtonElement',
      Input: 'HTMLInputElement',
      Card: 'HTMLDivElement',
      Modal: 'HTMLDivElement',
      Select: 'HTMLSelectElement',
      Textarea: 'HTMLTextAreaElement',
      Link: 'HTMLAnchorElement',
      List: 'HTMLUListElement',
      Table: 'HTMLTableElement',
    }

    return elementMap[componentName as keyof typeof elementMap] || 'HTMLElement'
  }

  private getExtendedProps(componentName: string): string {
    const propsMap = {
      Button: 'React.ButtonHTMLAttributes<HTMLButtonElement>',
      Input: 'React.InputHTMLAttributes<HTMLInputElement>',
      Card: 'React.HTMLAttributes<HTMLDivElement>',
      Modal: 'React.HTMLAttributes<HTMLDivElement>',
      Select: 'React.SelectHTMLAttributes<HTMLSelectElement>',
      Textarea: 'React.TextareaHTMLAttributes<HTMLTextAreaElement>',
      Link: 'React.AnchorHTMLAttributes<HTMLAnchorElement>',
      List: 'React.HTMLAttributes<HTMLUListElement>',
      Table: 'React.TableHTMLAttributes<HTMLTableElement>',
    }

    return (
      propsMap[componentName as keyof typeof propsMap] ||
      'React.HTMLAttributes<HTMLElement>'
    )
  }

  private generateJSDoc(prop: ComponentProp): string {
    const required = prop.required ? '@required' : '@optional'
    const defaultValue = prop.default
      ? `@default ${JSON.stringify(prop.default)}`
      : ''

    return `  /**
   * ${prop.description}
   * ${required}
   * ${defaultValue}
   */`
  }

  private generateVariantProps(component: GeneratedComponent): string {
    if (component.variants.length === 0) return ''

    const variantType = component.variants.map(v => `'${v.name}'`).join(' | ')

    return `  /**
   * Visual variant of the component
   * @default 'default'
   */
  variant?: ${variantType}`
  }

  private generateSizeProps(component: GeneratedComponent): string {
    if (component.sizes.length === 0) return ''

    const sizeType = component.sizes.map(s => `'${s}'`).join(' | ')

    return `  /**
   * Size of the component
   * @default 'md'
   */
  size?: ${sizeType}`
  }

  private generateStateProps(component: GeneratedComponent): string {
    return `  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Error state
   */
  error?: boolean | string
  
  /**
   * Success state
   */
  success?: boolean`
  }

  private generateEventProps(component: GeneratedComponent): string {
    const eventHandlers = this.getEventHandlers(component.name)

    return eventHandlers
      .map(
        handler => `  /**
   * ${handler.description}
   */
  ${handler.name}?: ${handler.type}`
      )
      .join('\n\n')
  }

  private generateRefProps(component: GeneratedComponent): string {
    const refType = this.getBaseElement(component.name)

    return `  /**
   * Ref to the underlying DOM element
   */
  ref?: React.Ref<${refType}>`
  }

  private getEventHandlers(
    componentName: string
  ): Array<{ name: string; type: string; description: string }> {
    const commonHandlers = [
      {
        name: 'onClick',
        type: '(event: MouseEvent<HTMLElement>) => void',
        description: 'Click event handler',
      },
      {
        name: 'onFocus',
        type: '(event: FocusEvent<HTMLElement>) => void',
        description: 'Focus event handler',
      },
      {
        name: 'onBlur',
        type: '(event: FocusEvent<HTMLElement>) => void',
        description: 'Blur event handler',
      },
      {
        name: 'onKeyDown',
        type: '(event: KeyboardEvent<HTMLElement>) => void',
        description: 'Key down event handler',
      },
    ]

    const specificHandlers = {
      Input: [
        {
          name: 'onChange',
          type: '(event: ChangeEvent<HTMLInputElement>) => void',
          description: 'Change event handler',
        },
        {
          name: 'onInput',
          type: '(event: FormEvent<HTMLInputElement>) => void',
          description: 'Input event handler',
        },
      ],
      Select: [
        {
          name: 'onChange',
          type: '(event: ChangeEvent<HTMLSelectElement>) => void',
          description: 'Change event handler',
        },
      ],
      Textarea: [
        {
          name: 'onChange',
          type: '(event: ChangeEvent<HTMLTextAreaElement>) => void',
          description: 'Change event handler',
        },
      ],
    }

    return [
      ...commonHandlers,
      ...(specificHandlers[componentName as keyof typeof specificHandlers] ||
        []),
    ]
  }
}

class UnionTypeGenerator {
  generateVariantTypes(component: GeneratedComponent): string {
    if (component.variants.length === 0) return ''

    const variants = component.variants.map(v => `'${v.name}'`).join(' | ')

    return `/** Available variants for ${component.name} */
export type ${component.name}Variant = ${variants}`
  }

  generateSizeTypes(component: GeneratedComponent): string {
    if (component.sizes.length === 0) return ''

    const sizes = component.sizes.map(s => `'${s}'`).join(' | ')

    return `/** Available sizes for ${component.name} */
export type ${component.name}Size = ${sizes}`
  }

  generateStateTypes(component: GeneratedComponent): string {
    const states = component.states.map(s => `'${s}'`).join(' | ')

    return `/** Available states for ${component.name} */
export type ${component.name}State = ${states}`
  }
}

class EnumGenerator {
  generateEnums(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig
  ): string {
    const variantEnum = this.generateVariantEnum(component)
    const sizeEnum = this.generateSizeEnum(component)

    return `${variantEnum}\n\n${sizeEnum}`
  }

  private generateVariantEnum(component: GeneratedComponent): string {
    if (component.variants.length === 0) return ''

    const enumValues = component.variants
      .map(variant => `  ${variant.name.toUpperCase()} = '${variant.name}'`)
      .join(',\n')

    return `/** ${component.name} variant enum */
export enum ${component.name}Variant {
${enumValues}
}`
  }

  private generateSizeEnum(component: GeneratedComponent): string {
    if (component.sizes.length === 0) return ''

    const enumValues = component.sizes
      .map(size => `  ${size.toUpperCase()} = '${size}'`)
      .join(',\n')

    return `/** ${component.name} size enum */
export enum ${component.name}Size {
${enumValues}
}`
  }
}

class UtilityTypeGenerator {
  generateUtilityTypes(component: GeneratedComponent): string {
    return `/** Utility types for ${component.name} */

/** Extract variant props */
export type ${component.name}VariantProps = Pick<${component.name}Props, 'variant'>

/** Extract size props */
export type ${component.name}SizeProps = Pick<${component.name}Props, 'size'>

/** Extract state props */
export type ${component.name}StateProps = Pick<${component.name}Props, 'loading' | 'error' | 'success'>

/** Extract event handler props */
export type ${component.name}EventProps = Pick<${component.name}Props, ${this.getEventHandlerKeys(component)}>

/** Required props only */
export type ${component.name}RequiredProps = Required<Pick<${component.name}Props, ${this.getRequiredProps(component)}>>

/** Optional props only */
export type ${component.name}OptionalProps = Partial<Pick<${component.name}Props, ${this.getOptionalProps(component)}>>

/** Component with default props applied */
export type ${component.name}WithDefaults = ${component.name}Props & Required<${component.name}RequiredProps>`
  }

  private getEventHandlerKeys(component: GeneratedComponent): string {
    return "'onClick' | 'onFocus' | 'onBlur' | 'onKeyDown'"
  }

  private getRequiredProps(component: GeneratedComponent): string {
    const required = component.props
      .filter(p => p.required)
      .map(p => `'${p.name}'`)
    return required.length > 0 ? required.join(' | ') : 'never'
  }

  private getOptionalProps(component: GeneratedComponent): string {
    const optional = component.props
      .filter(p => !p.required)
      .map(p => `'${p.name}'`)
    return optional.length > 0 ? optional.join(' | ') : 'never'
  }
}

class EventHandlerGenerator {
  generateEventTypes(component: GeneratedComponent): string {
    return `/** Event handler types for ${component.name} */
export interface ${component.name}EventHandlers {
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onFocus?: (event: FocusEvent<HTMLElement>) => void
  onBlur?: (event: FocusEvent<HTMLElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  ${this.getSpecificEventHandlers(component.name)}
}`
  }

  private getSpecificEventHandlers(componentName: string): string {
    const handlers = {
      Input: 'onChange?: (event: ChangeEvent<HTMLInputElement>) => void',
      Select: 'onChange?: (event: ChangeEvent<HTMLSelectElement>) => void',
      Textarea: 'onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void',
    }

    return handlers[componentName as keyof typeof handlers] || ''
  }
}

class RefTypeGenerator {
  generateRefTypes(component: GeneratedComponent): string {
    const elementType = this.getElementType(component.name)

    return `/** Ref types for ${component.name} */
export type ${component.name}Ref = React.Ref<${elementType}>

export type ${component.name}Element = ${elementType}`
  }

  private getElementType(componentName: string): string {
    const elementMap = {
      Button: 'HTMLButtonElement',
      Input: 'HTMLInputElement',
      Card: 'HTMLDivElement',
      Modal: 'HTMLDivElement',
      Select: 'HTMLSelectElement',
      Textarea: 'HTMLTextAreaElement',
      Link: 'HTMLAnchorElement',
      List: 'HTMLUListElement',
      Table: 'HTMLTableElement',
    }

    return elementMap[componentName as keyof typeof elementMap] || 'HTMLElement'
  }
}

class PolymorphicTypeGenerator {
  generatePolymorphicTypes(component: GeneratedComponent): string {
    return `/** Polymorphic types for ${component.name} */
export type ${component.name}AsProps<T extends ElementType = 'div'> = {
  as?: T
} & ComponentProps<T> & ${component.name}Props

export type ${component.name}Component = <T extends ElementType = 'div'>(
  props: ${component.name}AsProps<T>
) => React.ReactElement | null`
  }
}

class GenericTypeGenerator {
  generateGenericTypes(component: GeneratedComponent): string {
    return `/** Generic types for ${component.name} */
export interface ${component.name}Generic<T = any> extends ${component.name}Props {
  value?: T
  onChange?: (value: T) => void
  onValueChange?: (value: T) => void
}`
  }
}

export const typeGenerator = new TypeScriptTypeGenerator()
