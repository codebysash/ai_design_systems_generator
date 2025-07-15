import { GeneratedComponent, DesignSystemConfig, GeneratedDesignSystem } from '@/types'
import { componentCodeGenerator, CodeGenerationOptions } from './code-generator'
import { typeGenerator, TypeGenerationOptions } from './type-generator'
import { accessibilityValidator } from './accessibility'
import { variantSystemGenerator } from './variants'
import { componentTemplateEngine } from './templates'

export interface ComponentLibraryOptions {
  framework: 'react' | 'vue' | 'angular' | 'svelte'
  language: 'typescript' | 'javascript'
  cssFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion'
  includeTests: boolean
  includeStories: boolean
  includeDocumentation: boolean
  accessibility: boolean
  variants: boolean
  responsive: boolean
  darkMode: boolean
}

export interface GeneratedComponentLibrary {
  components: GeneratedComponentFile[]
  types: string
  exports: string
  packageJson: string
  readme: string
  metadata: {
    framework: string
    language: string
    cssFramework: string
    totalComponents: number
    accessibilityScore: number
    generatedAt: string
    version: string
  }
}

export interface GeneratedComponentFile {
  name: string
  path: string
  code: string
  types: string
  styles: string
  tests?: string
  stories?: string
  documentation?: string
  accessibilityReport: any
}

export class ComponentLibraryGenerator {
  private codeGenerator = componentCodeGenerator
  private typeGenerator = typeGenerator
  private accessibilityValidator = accessibilityValidator
  private variantGenerator = variantSystemGenerator
  private templateEngine = componentTemplateEngine

  async generateComponentLibrary(
    designSystem: GeneratedDesignSystem,
    options: ComponentLibraryOptions = this.getDefaultOptions()
  ): Promise<GeneratedComponentLibrary> {
    const components = await this.generateComponents(designSystem, options)
    const types = this.generateGlobalTypes(designSystem.components, options)
    const exports = this.generateExports(designSystem.components, options)
    const packageJson = this.generatePackageJson(designSystem, options)
    const readme = this.generateReadme(designSystem, options)
    const metadata = this.generateMetadata(designSystem, options, components)

    return {
      components,
      types,
      exports,
      packageJson,
      readme,
      metadata
    }
  }

  private async generateComponents(
    designSystem: GeneratedDesignSystem,
    options: ComponentLibraryOptions
  ): Promise<GeneratedComponentFile[]> {
    const generatedComponents: GeneratedComponentFile[] = []

    for (const component of designSystem.components) {
      const generatedFile = await this.generateComponent(component, designSystem.designSystem, options)
      generatedComponents.push(generatedFile)
    }

    return generatedComponents
  }

  private async generateComponent(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig,
    options: ComponentLibraryOptions
  ): Promise<GeneratedComponentFile> {
    // Generate accessibility report and apply fixes
    const accessibilityReport = this.accessibilityValidator.validateComponent(component, designSystem)
    const fixedComponent = this.accessibilityValidator.applyFixes(component, accessibilityReport.fixes)

    // Generate variant system
    const variantSystem = options.variants ? 
      this.variantGenerator.generateVariantSystem(fixedComponent, designSystem) : 
      null

    // Generate code
    const codeOptions: CodeGenerationOptions = {
      framework: options.framework,
      language: options.language,
      cssFramework: options.cssFramework,
      includeTests: options.includeTests,
      includeStories: options.includeStories,
      includeDocumentation: options.includeDocumentation,
      accessibility: options.accessibility,
      variant: variantSystem ? 'compound' : 'default'
    }

    const generatedCode = this.codeGenerator.generateComponent(fixedComponent, designSystem, codeOptions)

    // Generate types
    const typeOptions: TypeGenerationOptions = {
      strict: true,
      includeUtilityTypes: true,
      includeEventHandlers: true,
      includeRefTypes: true,
      includePolymorphicTypes: false,
      generateEnums: false,
      generateUnions: true,
      generateGenerics: false
    }

    const generatedTypes = this.typeGenerator.generateTypes(fixedComponent, designSystem, typeOptions)

    // Generate variant code if enabled
    let variantCode = ''
    if (variantSystem) {
      variantCode = this.variantGenerator.generateVariantCode(fixedComponent, variantSystem, options.framework)
    }

    // Combine all code
    const finalCode = this.combineComponentCode(generatedCode, generatedTypes, variantCode, options)

    return {
      name: component.name,
      path: this.getComponentPath(component.name, options),
      code: finalCode,
      types: generatedTypes.interfaces + '\n\n' + generatedTypes.types,
      styles: generatedCode.styles,
      tests: generatedCode.tests,
      stories: generatedCode.stories,
      documentation: generatedCode.documentation,
      accessibilityReport
    }
  }

  private combineComponentCode(
    generatedCode: any,
    generatedTypes: any,
    variantCode: string,
    options: ComponentLibraryOptions
  ): string {
    const sections = []

    // Imports
    sections.push(generatedCode.imports.join('\n'))

    // Types (if TypeScript)
    if (options.language === 'typescript') {
      sections.push(generatedTypes.interfaces)
      sections.push(generatedTypes.types)
    }

    // Variant code
    if (variantCode) {
      sections.push(variantCode)
    }

    // Component code
    sections.push(generatedCode.component)

    // Exports
    sections.push(generatedCode.exports)

    return sections.filter(Boolean).join('\n\n')
  }

  private generateGlobalTypes(components: GeneratedComponent[], options: ComponentLibraryOptions): string {
    if (options.language !== 'typescript') return ''

    return this.typeGenerator.generateGlobalTypes(components)
  }

  private generateExports(components: GeneratedComponent[], options: ComponentLibraryOptions): string {
    const componentExports = components.map(component => {
      const exports = [`export { ${component.name} }`]
      
      if (options.language === 'typescript') {
        exports.push(`export type { ${component.name}Props }`)
      }

      return exports.join('\n')
    }).join('\n')

    // Add global exports
    const globalExports = `
// Global exports
export * from './types'
export * from './tokens'
export * from './themes'
`

    return `${componentExports}\n${globalExports}`
  }

  private generatePackageJson(designSystem: GeneratedDesignSystem, options: ComponentLibraryOptions): string {
    const packageJson = {
      name: designSystem.designSystem.name.toLowerCase().replace(/\s+/g, '-'),
      version: designSystem.metadata.version,
      description: designSystem.designSystem.description,
      main: options.language === 'typescript' ? 'dist/index.js' : 'src/index.js',
      types: options.language === 'typescript' ? 'dist/index.d.ts' : undefined,
      scripts: {
        build: options.language === 'typescript' ? 'tsc' : 'babel src --out-dir dist',
        test: 'jest',
        'test:watch': 'jest --watch',
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build'
      },
      dependencies: this.getPackageDependencies(options),
      devDependencies: this.getPackageDevDependencies(options),
      peerDependencies: this.getPackagePeerDependencies(options),
      keywords: [
        'design-system',
        'component-library',
        'react',
        'typescript',
        'tailwind',
        'accessibility',
        'ui'
      ],
      author: 'AI Design System Generator',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/your-org/design-system.git'
      },
      files: ['dist', 'src'],
      engines: {
        node: '>=16.0.0'
      }
    }

    return JSON.stringify(packageJson, null, 2)
  }

  private generateReadme(designSystem: GeneratedDesignSystem, options: ComponentLibraryOptions): string {
    const componentList = designSystem.components.map(component => 
      `- **${component.name}** - ${component.description}`
    ).join('\n')

    return `# ${designSystem.designSystem.name}

${designSystem.designSystem.description}

## Installation

\`\`\`bash
npm install ${designSystem.designSystem.name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`${options.language === 'typescript' ? 'tsx' : 'jsx'}
import { Button } from '${designSystem.designSystem.name.toLowerCase().replace(/\s+/g, '-')}'

function App() {
  return (
    <Button variant="primary">
      Click me
    </Button>
  )
}
\`\`\`

## Components

${componentList}

## Features

- ✅ **Accessibility First** - WCAG 2.1 AA compliant
- ✅ **TypeScript Support** - Full type safety
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark Mode** - Built-in theme support
- ✅ **Customizable** - Extensive variant system
- ✅ **Tree Shakeable** - Import only what you need

## Design Tokens

The design system includes a comprehensive set of design tokens:

- **Colors**: ${Object.keys(designSystem.designSystem.colors).join(', ')}
- **Typography**: ${Object.keys(designSystem.designSystem.typography.scale).join(', ')}
- **Spacing**: ${designSystem.designSystem.spacing.scale.join(', ')}
- **Border Radius**: ${Object.keys(designSystem.designSystem.borderRadius).join(', ')}

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## License

MIT © AI Design System Generator
`
  }

  private generateMetadata(
    designSystem: GeneratedDesignSystem,
    options: ComponentLibraryOptions,
    components: GeneratedComponentFile[]
  ) {
    const totalAccessibilityScore = components.reduce((sum, component) => 
      sum + component.accessibilityReport.score, 0
    )
    const averageAccessibilityScore = Math.round(totalAccessibilityScore / components.length)

    return {
      framework: options.framework,
      language: options.language,
      cssFramework: options.cssFramework,
      totalComponents: components.length,
      accessibilityScore: averageAccessibilityScore,
      generatedAt: new Date().toISOString(),
      version: designSystem.metadata.version
    }
  }

  private getComponentPath(componentName: string, options: ComponentLibraryOptions): string {
    const extension = options.language === 'typescript' ? '.tsx' : '.jsx'
    return `src/components/${componentName}${extension}`
  }

  private getPackageDependencies(options: ComponentLibraryOptions): Record<string, string> {
    const dependencies: Record<string, string> = {}

    if (options.framework === 'react') {
      dependencies['react'] = '^18.0.0'
      dependencies['react-dom'] = '^18.0.0'
    }

    if (options.cssFramework === 'tailwind') {
      dependencies['tailwindcss'] = '^3.0.0'
      dependencies['clsx'] = '^2.0.0'
    } else if (options.cssFramework === 'styled-components') {
      dependencies['styled-components'] = '^6.0.0'
    } else if (options.cssFramework === 'emotion') {
      dependencies['@emotion/react'] = '^11.0.0'
      dependencies['@emotion/styled'] = '^11.0.0'
    }

    return dependencies
  }

  private getPackageDevDependencies(options: ComponentLibraryOptions): Record<string, string> {
    const devDependencies: Record<string, string> = {}

    if (options.language === 'typescript') {
      devDependencies['typescript'] = '^5.0.0'
      devDependencies['@types/react'] = '^18.0.0'
      devDependencies['@types/react-dom'] = '^18.0.0'
    }

    if (options.includeTests) {
      devDependencies['jest'] = '^29.0.0'
      devDependencies['@testing-library/react'] = '^14.0.0'
      devDependencies['@testing-library/jest-dom'] = '^6.0.0'
    }

    if (options.includeStories) {
      devDependencies['@storybook/react'] = '^7.0.0'
      devDependencies['@storybook/addon-essentials'] = '^7.0.0'
    }

    return devDependencies
  }

  private getPackagePeerDependencies(options: ComponentLibraryOptions): Record<string, string> {
    const peerDependencies: Record<string, string> = {}

    if (options.framework === 'react') {
      peerDependencies['react'] = '>=16.8.0'
      peerDependencies['react-dom'] = '>=16.8.0'
    }

    return peerDependencies
  }

  private getDefaultOptions(): ComponentLibraryOptions {
    return {
      framework: 'react',
      language: 'typescript',
      cssFramework: 'tailwind',
      includeTests: true,
      includeStories: true,
      includeDocumentation: true,
      accessibility: true,
      variants: true,
      responsive: true,
      darkMode: true
    }
  }
}

export const componentLibraryGenerator = new ComponentLibraryGenerator()