import { GeneratedDesignSystem, GeneratedComponent, DesignSystemConfig } from '@/types'
import { componentCodeGenerator } from '@/lib/design-system/code-generator'
import { designTokenGenerator } from '@/lib/design-system/tokens'
import { themeGenerator } from '@/lib/design-system/themes'
import { componentLibraryGenerator } from '@/lib/design-system/component-library'
import { CSSExporter } from './css-exporter'
import { TailwindExporter } from './tailwind-exporter'
import { TokenExporter } from './token-exporter'
import { DocumentationExporter } from './documentation-exporter'
import JSZip from 'jszip'

export interface ExportOptions {
  format: 'zip' | 'individual'
  includeComponents: boolean
  includeStyles: boolean
  includeTokens: boolean
  includeDocumentation: boolean
  includeTests: boolean
  includeStorybook: boolean
  framework: 'react' | 'vue' | 'angular' | 'svelte'
  language: 'typescript' | 'javascript'
  cssFramework: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion' | 'scss'
  packageManager: 'npm' | 'yarn' | 'pnpm'
  includeDarkMode: boolean
  includeAccessibilityDocs: boolean
}

export interface ExportResult {
  files: ExportFile[]
  packageJson?: string
  readme?: string
  metadata: {
    exportedAt: string
    totalFiles: number
    totalSize: number
    options: ExportOptions
  }
}

export interface ExportFile {
  path: string
  content: string
  type: 'component' | 'style' | 'token' | 'documentation' | 'config' | 'test' | 'story'
  size: number
}

export class ExportManager {
  private cssExporter = new CSSExporter()
  private tailwindExporter = new TailwindExporter()
  private tokenExporter = new TokenExporter()
  private documentationExporter = new DocumentationExporter()

  async exportDesignSystem(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions = this.getDefaultOptions()
  ): Promise<ExportResult> {
    const files: ExportFile[] = []
    
    // Export components
    if (options.includeComponents) {
      const componentFiles = await this.exportComponents(designSystem, options)
      files.push(...componentFiles)
    }

    // Export styles
    if (options.includeStyles) {
      const styleFiles = await this.exportStyles(designSystem, options)
      files.push(...styleFiles)
    }

    // Export tokens
    if (options.includeTokens) {
      const tokenFiles = await this.exportTokens(designSystem, options)
      files.push(...tokenFiles)
    }

    // Export documentation
    if (options.includeDocumentation) {
      const docFiles = await this.exportDocumentation(designSystem, options)
      files.push(...docFiles)
    }

    // Export configuration files
    const configFiles = await this.exportConfigurations(designSystem, options)
    files.push(...configFiles)

    // Generate package.json
    const packageJson = await this.generatePackageJson(designSystem, options)
    
    // Generate README
    const readme = await this.generateReadme(designSystem, options)

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    return {
      files,
      packageJson,
      readme,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalFiles: files.length,
        totalSize,
        options
      }
    }
  }

  async downloadAsZip(exportResult: ExportResult, filename?: string): Promise<void> {
    const zip = new JSZip()
    
    // Add all files to zip
    exportResult.files.forEach(file => {
      zip.file(file.path, file.content)
    })

    // Add package.json
    if (exportResult.packageJson) {
      zip.file('package.json', exportResult.packageJson)
    }

    // Add README
    if (exportResult.readme) {
      zip.file('README.md', exportResult.readme)
    }

    // Add metadata
    zip.file('export-metadata.json', JSON.stringify(exportResult.metadata, null, 2))

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `design-system-${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async downloadIndividualFiles(exportResult: ExportResult): Promise<void> {
    for (const file of exportResult.files) {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.path.split('/').pop() || 'file'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  private async exportComponents(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []

    for (const component of designSystem.components) {
      const componentFiles = await this.reactExporter.exportComponent(component, designSystem.designSystem, options)
      files.push(...componentFiles)
    }

    // Export main index file
    const indexFile = this.reactExporter.generateIndexFile(designSystem.components, options)
    files.push(indexFile)

    return files
  }

  private async exportStyles(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    return this.cssExporter.exportStyles(designSystem, options)
  }

  private async exportTokens(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    return this.tokenExporter.exportTokens(designSystem, options)
  }

  private async exportDocumentation(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    return this.documentationExporter.exportDocumentation(designSystem, options)
  }

  private async exportConfigurations(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    return this.configExporter.exportConfigurations(designSystem, options)
  }

  private async generatePackageJson(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<string> {
    const libraryResult = await componentLibraryGenerator.generateComponentLibrary(designSystem, {
      framework: options.framework,
      language: options.language,
      cssFramework: options.cssFramework,
      includeTests: options.includeTests,
      includeStories: options.includeStorybook,
      includeDocumentation: options.includeDocumentation,
      accessibility: true,
      variants: true,
      responsive: true,
      darkMode: options.includeDarkMode
    })

    return libraryResult.packageJson
  }

  private async generateReadme(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<string> {
    const libraryResult = await componentLibraryGenerator.generateComponentLibrary(designSystem, {
      framework: options.framework,
      language: options.language,
      cssFramework: options.cssFramework,
      includeTests: options.includeTests,
      includeStories: options.includeStorybook,
      includeDocumentation: options.includeDocumentation,
      accessibility: true,
      variants: true,
      responsive: true,
      darkMode: options.includeDarkMode
    })

    return libraryResult.readme
  }

  private getDefaultOptions(): ExportOptions {
    return {
      format: 'zip',
      includeComponents: true,
      includeStyles: true,
      includeTokens: true,
      includeDocumentation: true,
      includeTests: false,
      includeStorybook: false,
      framework: 'react',
      language: 'typescript',
      cssFramework: 'tailwind',
      packageManager: 'npm',
      includeDarkMode: true,
      includeAccessibilityDocs: true
    }
  }
}

class ReactExporter {
  async exportComponent(
    component: GeneratedComponent,
    designSystem: DesignSystemConfig,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []

    // Generate component code
    const generatedCode = componentCodeGenerator.generateComponent(component, designSystem, {
      framework: options.framework,
      language: options.language,
      cssFramework: options.cssFramework,
      includeTests: options.includeTests,
      includeStories: options.includeStorybook,
      includeDocumentation: options.includeDocumentation,
      accessibility: true,
      variant: 'compound'
    })

    // Main component file
    const extension = options.language === 'typescript' ? '.tsx' : '.jsx'
    const componentFile: ExportFile = {
      path: `src/components/${component.name}${extension}`,
      content: generatedCode.component,
      type: 'component',
      size: generatedCode.component.length
    }
    files.push(componentFile)

    // Types file (if TypeScript)
    if (options.language === 'typescript') {
      const typesFile: ExportFile = {
        path: `src/components/${component.name}.types.ts`,
        content: generatedCode.types,
        type: 'component',
        size: generatedCode.types.length
      }
      files.push(typesFile)
    }

    // Styles file (if using CSS modules)
    if (options.cssFramework === 'css-modules' && generatedCode.styles) {
      const stylesFile: ExportFile = {
        path: `src/components/${component.name}.module.css`,
        content: generatedCode.styles,
        type: 'style',
        size: generatedCode.styles.length
      }
      files.push(stylesFile)
    }

    // Test file
    if (options.includeTests && generatedCode.tests) {
      const testFile: ExportFile = {
        path: `src/components/${component.name}.test.${options.language === 'typescript' ? 'tsx' : 'jsx'}`,
        content: generatedCode.tests,
        type: 'test',
        size: generatedCode.tests.length
      }
      files.push(testFile)
    }

    // Story file
    if (options.includeStorybook && generatedCode.stories) {
      const storyFile: ExportFile = {
        path: `src/components/${component.name}.stories.${options.language === 'typescript' ? 'tsx' : 'jsx'}`,
        content: generatedCode.stories,
        type: 'story',
        size: generatedCode.stories.length
      }
      files.push(storyFile)
    }

    return files
  }

  generateIndexFile(components: GeneratedComponent[], options: ExportOptions): ExportFile {
    const exports = components.map(component => {
      const exports = [`export { ${component.name} }`]
      if (options.language === 'typescript') {
        exports.push(`export type { ${component.name}Props }`)
      }
      return exports.join('\n')
    }).join('\n')

    const content = `// Auto-generated component exports
${exports}

// Re-export types and utilities
export * from './types'
export * from './utils'
`

    return {
      path: `src/components/index.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content,
      type: 'component',
      size: content.length
    }
  }
}

class CSSExporter {
  async exportStyles(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []

    switch (options.cssFramework) {
      case 'tailwind':
        files.push(...await this.exportTailwindStyles(designSystem, options))
        break
      case 'scss':
        files.push(...await this.exportSCSSStyles(designSystem, options))
        break
      case 'css-modules':
        files.push(...await this.exportCSSModules(designSystem, options))
        break
      case 'styled-components':
        files.push(...await this.exportStyledComponents(designSystem, options))
        break
      case 'emotion':
        files.push(...await this.exportEmotionStyles(designSystem, options))
        break
    }

    return files
  }

  private async exportTailwindStyles(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // Tailwind config
    const tailwindConfig = designTokenGenerator.exportTokens(tokens, 'tailwind')
    files.push({
      path: 'tailwind.config.js',
      content: tailwindConfig,
      type: 'config',
      size: tailwindConfig.length
    })

    // Global styles
    const globalStyles = this.generateGlobalStyles(designSystem, options)
    files.push({
      path: 'src/styles/globals.css',
      content: globalStyles,
      type: 'style',
      size: globalStyles.length
    })

    return files
  }

  private async exportSCSSStyles(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // Variables file
    const variablesContent = this.generateSCSSVariables(tokens)
    files.push({
      path: 'src/styles/_variables.scss',
      content: variablesContent,
      type: 'style',
      size: variablesContent.length
    })

    // Mixins file
    const mixinsContent = this.generateSCSSMixins(tokens)
    files.push({
      path: 'src/styles/_mixins.scss',
      content: mixinsContent,
      type: 'style',
      size: mixinsContent.length
    })

    // Main styles
    const mainStyles = this.generateSCSSMain(designSystem, options)
    files.push({
      path: 'src/styles/main.scss',
      content: mainStyles,
      type: 'style',
      size: mainStyles.length
    })

    // Component styles
    for (const component of designSystem.components) {
      const componentStyles = this.generateSCSSComponent(component, tokens)
      files.push({
        path: `src/styles/components/_${component.name.toLowerCase()}.scss`,
        content: componentStyles,
        type: 'style',
        size: componentStyles.length
      })
    }

    return files
  }

  private async exportCSSModules(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // Global styles
    const globalStyles = this.generateGlobalStyles(designSystem, options)
    files.push({
      path: 'src/styles/globals.css',
      content: globalStyles,
      type: 'style',
      size: globalStyles.length
    })

    // Component-specific CSS modules are generated in the component exporter
    return files
  }

  private async exportStyledComponents(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // Theme provider
    const themeContent = this.generateStyledComponentsTheme(tokens, options)
    files.push({
      path: `src/styles/theme.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content: themeContent,
      type: 'style',
      size: themeContent.length
    })

    // Global styles
    const globalStyles = this.generateStyledComponentsGlobal(tokens, options)
    files.push({
      path: `src/styles/global.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content: globalStyles,
      type: 'style',
      size: globalStyles.length
    })

    return files
  }

  private async exportEmotionStyles(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // Theme provider
    const themeContent = this.generateEmotionTheme(tokens, options)
    files.push({
      path: `src/styles/theme.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content: themeContent,
      type: 'style',
      size: themeContent.length
    })

    // Global styles
    const globalStyles = this.generateEmotionGlobal(tokens, options)
    files.push({
      path: `src/styles/global.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content: globalStyles,
      type: 'style',
      size: globalStyles.length
    })

    return files
  }

  private generateGlobalStyles(designSystem: GeneratedDesignSystem, options: ExportOptions): string {
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)
    const cssVariables = designTokenGenerator.exportTokens(tokens, 'css')

    return `/* Global styles for ${designSystem.designSystem.name} */
${cssVariables}

/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-body);
  line-height: var(--line-height-normal);
  color: var(--color-neutral-900);
  background-color: var(--color-neutral-50);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

p {
  margin: 0 0 var(--spacing-4) 0;
}

/* Links */
a {
  color: var(--color-primary-600);
  text-decoration: none;
}

a:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Dark mode */
${options.includeDarkMode ? `
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="dark"] body {
  color: var(--color-neutral-100);
  background-color: var(--color-neutral-900);
}
` : ''}
`
  }

  private generateSCSSVariables(tokens: any): string {
    const variables = []

    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      variables.push(`$color-primary-${key}: ${value};`)
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      variables.push(`$color-secondary-${key}: ${value};`)
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      variables.push(`$color-accent-${key}: ${value};`)
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      variables.push(`$color-neutral-${key}: ${value};`)
    })

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      variables.push(`$font-${key}: ${value};`)
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      variables.push(`$font-size-${key}: ${value};`)
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      variables.push(`$spacing-${key}: ${value};`)
    })

    return variables.join('\n')
  }

  private generateSCSSMixins(tokens: any): string {
    return `// Mixins for ${tokens.name || 'Design System'}

@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $border-radius-md;
  font-family: $font-body;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus-visible {
    outline: 2px solid $color-primary-500;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@mixin button-size($size) {
  @if $size == 'sm' {
    height: 2rem;
    padding: 0 0.75rem;
    font-size: $font-size-sm;
  } @else if $size == 'md' {
    height: 2.25rem;
    padding: 0 1rem;
    font-size: $font-size-sm;
  } @else if $size == 'lg' {
    height: 2.5rem;
    padding: 0 1.5rem;
    font-size: $font-size-base;
  }
}

@mixin input-base {
  width: 100%;
  border: 1px solid $color-neutral-300;
  border-radius: $border-radius-md;
  padding: 0.5rem 0.75rem;
  font-family: $font-body;
  font-size: $font-size-sm;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: $color-primary-500;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@mixin card-base {
  background: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-6;
}

@mixin screen-reader-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`
  }

  private generateSCSSMain(designSystem: GeneratedDesignSystem, options: ExportOptions): string {
    return `// Main styles for ${designSystem.designSystem.name}

@import 'variables';
@import 'mixins';

// Component imports
${designSystem.components.map(c => `@import 'components/${c.name.toLowerCase()}';`).join('\n')}

// Reset and base styles
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: $font-body;
  line-height: $line-height-normal;
  color: $color-neutral-900;
  background-color: $color-neutral-50;
}

// Typography
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-family: $font-heading;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
}

p {
  margin: 0 0 $spacing-4 0;
}

// Links
a {
  color: $color-primary-600;
  text-decoration: none;
  
  &:hover {
    color: $color-primary-700;
    text-decoration: underline;
  }
}

// Focus styles
*:focus-visible {
  outline: 2px solid $color-primary-500;
  outline-offset: 2px;
}
`
  }

  private generateSCSSComponent(component: GeneratedComponent, tokens: any): string {
    const className = component.name.toLowerCase()
    
    return `// ${component.name} component styles

.${className} {
  @include button-base;
  
  // Variants
  ${component.variants.map(variant => `
  &--${variant.name} {
    // ${variant.description}
  }
  `).join('')}
  
  // Sizes
  ${component.sizes.map(size => `
  &--${size} {
    @include button-size(${size});
  }
  `).join('')}
  
  // States
  &--loading {
    opacity: 0.7;
    cursor: wait;
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
`
  }

  private generateStyledComponentsTheme(tokens: any, options: ExportOptions): string {
    const isTS = options.language === 'typescript'
    
    return `${isTS ? 'import { DefaultTheme } from \'styled-components\'' : ''}

export const theme${isTS ? ': DefaultTheme' : ''} = ${JSON.stringify(tokens, null, 2)}

export default theme
`
  }

  private generateStyledComponentsGlobal(tokens: any, options: ExportOptions): string {
    return `import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle\`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: \${props => props.theme.typography.fontFamily.body};
    line-height: \${props => props.theme.typography.lineHeight.normal};
    color: \${props => props.theme.colors.neutral['900']};
    background-color: \${props => props.theme.colors.neutral['50']};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: \${props => props.theme.typography.fontFamily.heading};
    font-weight: \${props => props.theme.typography.fontWeight.semibold};
    line-height: \${props => props.theme.typography.lineHeight.tight};
  }

  p {
    margin: 0 0 \${props => props.theme.spacing['4']} 0;
  }

  a {
    color: \${props => props.theme.colors.primary['600']};
    text-decoration: none;

    &:hover {
      color: \${props => props.theme.colors.primary['700']};
      text-decoration: underline;
    }
  }

  *:focus-visible {
    outline: 2px solid \${props => props.theme.colors.primary['500']};
    outline-offset: 2px;
  }
\`
`
  }

  private generateEmotionTheme(tokens: any, options: ExportOptions): string {
    return `export const theme = ${JSON.stringify(tokens, null, 2)}

export default theme
`
  }

  private generateEmotionGlobal(tokens: any, options: ExportOptions): string {
    return `import { css } from '@emotion/react'

export const globalStyles = css\`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: \${theme.typography.fontFamily.body};
    line-height: \${theme.typography.lineHeight.normal};
    color: \${theme.colors.neutral['900']};
    background-color: \${theme.colors.neutral['50']};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: \${theme.typography.fontFamily.heading};
    font-weight: \${theme.typography.fontWeight.semibold};
    line-height: \${theme.typography.lineHeight.tight};
  }

  p {
    margin: 0 0 \${theme.spacing['4']} 0;
  }

  a {
    color: \${theme.colors.primary['600']};
    text-decoration: none;

    &:hover {
      color: \${theme.colors.primary['700']};
      text-decoration: underline;
    }
  }

  *:focus-visible {
    outline: 2px solid \${theme.colors.primary['500']};
    outline-offset: 2px;
  }
\`
`
  }
}

class TokenExporter {
  async exportTokens(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    // JSON tokens
    const jsonTokens = designTokenGenerator.exportTokens(tokens, 'json')
    files.push({
      path: 'tokens/design-tokens.json',
      content: jsonTokens,
      type: 'token',
      size: jsonTokens.length
    })

    // JavaScript tokens
    const jsTokens = designTokenGenerator.exportTokens(tokens, 'js')
    files.push({
      path: `tokens/design-tokens.${options.language === 'typescript' ? 'ts' : 'js'}`,
      content: jsTokens,
      type: 'token',
      size: jsTokens.length
    })

    // CSS custom properties
    const cssTokens = designTokenGenerator.exportTokens(tokens, 'css')
    files.push({
      path: 'tokens/design-tokens.css',
      content: cssTokens,
      type: 'token',
      size: cssTokens.length
    })

    if (options.cssFramework === 'tailwind') {
      // Tailwind config
      const tailwindTokens = designTokenGenerator.exportTokens(tokens, 'tailwind')
      files.push({
        path: 'tokens/tailwind-tokens.js',
        content: tailwindTokens,
        type: 'token',
        size: tailwindTokens.length
      })
    }

    return files
  }
}

class DocumentationExporter {
  async exportDocumentation(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []

    // Main documentation
    const mainDocs = this.generateMainDocumentation(designSystem, options)
    files.push({
      path: 'docs/README.md',
      content: mainDocs,
      type: 'documentation',
      size: mainDocs.length
    })

    // Component documentation
    for (const component of designSystem.components) {
      const componentDocs = this.generateComponentDocumentation(component, options)
      files.push({
        path: `docs/components/${component.name}.md`,
        content: componentDocs,
        type: 'documentation',
        size: componentDocs.length
      })
    }

    // Token documentation
    const tokenDocs = this.generateTokenDocumentation(designSystem, options)
    files.push({
      path: 'docs/tokens.md',
      content: tokenDocs,
      type: 'documentation',
      size: tokenDocs.length
    })

    if (options.includeAccessibilityDocs) {
      // Accessibility documentation
      const accessibilityDocs = this.generateAccessibilityDocumentation(designSystem, options)
      files.push({
        path: 'docs/accessibility.md',
        content: accessibilityDocs,
        type: 'documentation',
        size: accessibilityDocs.length
      })
    }

    return files
  }

  private generateMainDocumentation(designSystem: GeneratedDesignSystem, options: ExportOptions): string {
    return `# ${designSystem.designSystem.name}

${designSystem.designSystem.description}

## Installation

\`\`\`bash
${options.packageManager} install ${designSystem.designSystem.name.toLowerCase().replace(/\s+/g, '-')}
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

${designSystem.components.map(component => `- [${component.name}](./components/${component.name}.md) - ${component.description}`).join('\n')}

## Design Tokens

See [Design Tokens](./tokens.md) for information about colors, typography, spacing, and other design tokens.

## Accessibility

See [Accessibility](./accessibility.md) for information about accessibility features and compliance.

## Framework Support

- ✅ React
- ⏳ Vue (coming soon)
- ⏳ Angular (coming soon)
- ⏳ Svelte (coming soon)

## Features

- ✅ **TypeScript Support** - Full type safety
- ✅ **Accessibility First** - WCAG 2.1 AA compliant
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark Mode** - Built-in theme support
- ✅ **Customizable** - Extensive variant system
- ✅ **Tree Shakeable** - Import only what you need

## Development

\`\`\`bash
# Install dependencies
${options.packageManager} install

# Start development server
${options.packageManager} run dev

# Run tests
${options.packageManager} test

# Build for production
${options.packageManager} run build
\`\`\`

## License

MIT
`
  }

  private generateComponentDocumentation(component: GeneratedComponent, options: ExportOptions): string {
    return `# ${component.name}

${component.description}

## Usage

\`\`\`${options.language === 'typescript' ? 'tsx' : 'jsx'}
import { ${component.name} } from './components'

function Example() {
  return (
    <${component.name} variant="primary">
      ${component.name === 'Button' ? 'Click me' : 'Component content'}
    </${component.name}>
  )
}
\`\`\`

## Props

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${component.props.map(prop => `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.default || '-'} | ${prop.description} |`).join('\n')}

## Variants

${component.variants.map(variant => `### ${variant.name}
${variant.description}

\`\`\`${options.language === 'typescript' ? 'tsx' : 'jsx'}
<${component.name} variant="${variant.name}">
  ${component.name === 'Button' ? 'Click me' : 'Component content'}
</${component.name}>
\`\`\`
`).join('\n')}

## Sizes

${component.sizes.map(size => `- **${size}**: ${size} size variant`).join('\n')}

## States

${component.states.map(state => `- **${state}**: ${state} state`).join('\n')}

## Accessibility

${component.accessibility.map(feature => `- ${feature}`).join('\n')}

## Examples

${component.examples?.map(example => `### ${example.name}

${example.description || ''}

\`\`\`${options.language === 'typescript' ? 'tsx' : 'jsx'}
${example.code}
\`\`\`
`).join('\n') || 'No examples available.'}
`
  }

  private generateTokenDocumentation(designSystem: GeneratedDesignSystem, options: ExportOptions): string {
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)

    return `# Design Tokens

Design tokens are the visual design atoms of the design system. They are named entities that store visual design attributes.

## Colors

### Primary Colors
${Object.entries(tokens.colors.primary).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Secondary Colors
${Object.entries(tokens.colors.secondary).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Accent Colors
${Object.entries(tokens.colors.accent).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Neutral Colors
${Object.entries(tokens.colors.neutral).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Semantic Colors
${Object.entries(tokens.colors.semantic).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Typography

### Font Families
${Object.entries(tokens.typography.fontFamily).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Font Sizes
${Object.entries(tokens.typography.fontSize).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Font Weights
${Object.entries(tokens.typography.fontWeight).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Line Heights
${Object.entries(tokens.typography.lineHeight).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Letter Spacing
${Object.entries(tokens.typography.letterSpacing).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Spacing

${Object.entries(tokens.spacing).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Border Radius

${Object.entries(tokens.borderRadius).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Shadows

${Object.entries(tokens.shadows).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Breakpoints

${Object.entries(tokens.breakpoints).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Usage

### CSS Custom Properties

\`\`\`css
.my-component {
  color: var(--color-primary-600);
  font-size: var(--font-size-lg);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}
\`\`\`

### JavaScript/TypeScript

\`\`\`${options.language === 'typescript' ? 'typescript' : 'javascript'}
import { designTokens } from './tokens'

const MyComponent = () => (
  <div style={{
    color: designTokens.colors.primary['600'],
    fontSize: designTokens.typography.fontSize.lg,
    padding: designTokens.spacing['4'],
    borderRadius: designTokens.borderRadius.md
  }}>
    Content
  </div>
)
\`\`\`

${options.cssFramework === 'tailwind' ? `
### Tailwind CSS

\`\`\`html
<div class="text-primary-600 text-lg p-4 rounded-md">
  Content
</div>
\`\`\`
` : ''}
`
  }

  private generateAccessibilityDocumentation(designSystem: GeneratedDesignSystem, options: ExportOptions): string {
    return `# Accessibility

This design system is built with accessibility as a core principle. All components are designed to meet WCAG 2.1 AA standards.

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order is logical and predictable
- Escape key closes modals and dropdowns

### Screen Reader Support
- Proper ARIA labels and descriptions
- Semantic HTML structure
- Screen reader announcements for dynamic content
- Alternative text for images

### Color Contrast
- All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Color is not the only way to convey information
- Focus indicators have sufficient contrast

### Responsive Design
- Components work at all screen sizes
- Text can be zoomed to 200% without horizontal scrolling
- Touch targets are at least 44x44 pixels

## Component Accessibility

${designSystem.components.map(component => `### ${component.name}

**Accessibility Features:**
${component.accessibility.map(feature => `- ${feature}`).join('\n')}

**Keyboard Support:**
- Tab: Focus the component
- Enter/Space: Activate the component
${component.name === 'Modal' ? '- Escape: Close the modal' : ''}

**Screen Reader Support:**
- Proper role and state information
- Descriptive labels and help text
- Live region announcements for state changes
`).join('\n')}

## Testing

### Manual Testing Checklist

- [ ] All components are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] Components work with screen readers
- [ ] Components work at 200% zoom
- [ ] Touch targets are appropriately sized

### Automated Testing

\`\`\`bash
# Run accessibility tests
${options.packageManager} run test:a11y

# Run with axe-core
${options.packageManager} run test:axe
\`\`\`

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [axe-core](https://github.com/dequelabs/axe-core)

## Support

If you encounter any accessibility issues, please report them in our issue tracker. We are committed to maintaining the highest accessibility standards.
`
  }
}

class ConfigExporter {
  async exportConfigurations(
    designSystem: GeneratedDesignSystem,
    options: ExportOptions
  ): Promise<ExportFile[]> {
    const files: ExportFile[] = []

    // TypeScript config
    if (options.language === 'typescript') {
      const tsConfig = this.generateTSConfig(options)
      files.push({
        path: 'tsconfig.json',
        content: tsConfig,
        type: 'config',
        size: tsConfig.length
      })
    }

    // Build configuration
    const buildConfig = this.generateBuildConfig(options)
    files.push({
      path: buildConfig.path,
      content: buildConfig.content,
      type: 'config',
      size: buildConfig.content.length
    })

    // ESLint config
    const eslintConfig = this.generateESLintConfig(options)
    files.push({
      path: '.eslintrc.js',
      content: eslintConfig,
      type: 'config',
      size: eslintConfig.length
    })

    // Prettier config
    const prettierConfig = this.generatePrettierConfig(options)
    files.push({
      path: '.prettierrc',
      content: prettierConfig,
      type: 'config',
      size: prettierConfig.length
    })

    // Jest config (if tests are included)
    if (options.includeTests) {
      const jestConfig = this.generateJestConfig(options)
      files.push({
        path: 'jest.config.js',
        content: jestConfig,
        type: 'config',
        size: jestConfig.length
      })
    }

    // Storybook config (if storybook is included)
    if (options.includeStorybook) {
      const storybookFiles = this.generateStorybookConfig(options)
      files.push(...storybookFiles)
    }

    return files
  }

  private generateTSConfig(options: ExportOptions): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        declaration: true,
        outDir: 'dist',
        rootDir: 'src',
        jsx: 'react-jsx',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: options.framework === 'react' ? true : false
      },
      include: [
        'src/**/*'
      ],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.*',
        '**/*.stories.*'
      ]
    }, null, 2)
  }

  private generateBuildConfig(options: ExportOptions): { path: string; content: string } {
    if (options.framework === 'react') {
      return {
        path: 'rollup.config.js',
        content: `import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true
    }),
    terser()
  ]
}`
      }
    }
    
    return {
      path: 'webpack.config.js',
      content: `const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'commonjs2'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  externals: {
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom'
  }
}`
    }
  }

  private generateESLintConfig(options: ExportOptions): string {
    return `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    ${options.language === 'typescript' ? "'@typescript-eslint/recommended'," : ''}
    ${options.framework === 'react' ? "'plugin:react/recommended'," : ''}
    'plugin:react-hooks/recommended'
  ],
  parser: '${options.language === 'typescript' ? '@typescript-eslint/parser' : '@babel/eslint-parser'}',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    ${options.language === 'typescript' ? "'@typescript-eslint'," : ''}
    'react',
    'react-hooks'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    ${options.language === 'typescript' ? "'@typescript-eslint/no-unused-vars': 'error'," : ''}
    'no-unused-vars': 'warn',
    'no-console': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}`
  }

  private generatePrettierConfig(options: ExportOptions): string {
    return JSON.stringify({
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      arrowParens: 'avoid',
      endOfLine: 'lf'
    }, null, 2)
  }

  private generateJestConfig(options: ExportOptions): string {
    return `module.exports = {
  preset: '${options.language === 'typescript' ? 'ts-jest' : 'js-jest'}',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '${options.language === 'typescript' ? 'ts-jest' : 'babel-jest'}'
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json']
}`
  }

  private generateStorybookConfig(options: ExportOptions): ExportFile[] {
    const files: ExportFile[] = []

    // Main config
    const mainConfig = `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    storyStoreV7: true
  }
}`

    files.push({
      path: '.storybook/main.js',
      content: mainConfig,
      type: 'config',
      size: mainConfig.length
    })

    // Preview config
    const previewConfig = `export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    extractComponentDescription: (component, { notes }) => {
      if (notes) {
        return typeof notes === 'string' ? notes : notes.markdown || notes.text
      }
      return null
    }
  }
}`

    files.push({
      path: '.storybook/preview.js',
      content: previewConfig,
      type: 'config',
      size: previewConfig.length
    })

    return files
  }
}

export const exportManager = new ExportManager()