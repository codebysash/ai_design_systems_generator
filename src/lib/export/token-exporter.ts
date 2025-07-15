import { GeneratedDesignSystem, DesignSystemConfig } from '@/types'
import { designTokenGenerator } from '@/lib/design-system/tokens'
import { themeGenerator } from '@/lib/design-system/themes'

export interface TokenExportOptions {
  format: 'json' | 'js' | 'ts' | 'yaml' | 'toml' | 'css' | 'scss' | 'style-dictionary'
  platform: 'web' | 'ios' | 'android' | 'flutter' | 'react-native'
  includeMetadata: boolean
  includeDocumentation: boolean
  includeComments: boolean
  groupByCategory: boolean
  flattenStructure: boolean
  transformNames: 'camelCase' | 'kebab-case' | 'snake_case' | 'CONSTANT_CASE'
  includeDarkMode: boolean
  includeSemanticTokens: boolean
  includeComponentTokens: boolean
  includeAliases: boolean
  validateTokens: boolean
  sortTokens: boolean
  minify: boolean
  includeVersion: boolean
  includeTimestamp: boolean
}

export interface TokenExportResult {
  tokens: string
  metadata?: TokenMetadata
  documentation?: string
  types?: string
  validation?: TokenValidationResult
}

export interface TokenMetadata {
  name: string
  version: string
  description: string
  author?: string
  license?: string
  repository?: string
  exportedAt: string
  platform: string
  format: string
  tokenCount: number
  categories: string[]
}

export interface TokenValidationResult {
  valid: boolean
  errors: TokenValidationError[]
  warnings: TokenValidationWarning[]
}

export interface TokenValidationError {
  path: string
  message: string
  code: string
}

export interface TokenValidationWarning {
  path: string
  message: string
  code: string
}

export class TokenExporter {
  async exportTokens(
    designSystem: GeneratedDesignSystem,
    options: TokenExportOptions = this.getDefaultOptions()
  ): Promise<TokenExportResult> {
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)
    const lightTheme = themeGenerator.generateTheme(designSystem.designSystem, 'light')
    const darkTheme = options.includeDarkMode ? 
      themeGenerator.generateTheme(designSystem.designSystem, 'dark') : null

    // Validate tokens if requested
    let validation: TokenValidationResult | undefined
    if (options.validateTokens) {
      validation = this.validateTokens(tokens, options)
    }

    // Transform tokens based on options
    const transformedTokens = this.transformTokens(tokens, lightTheme, darkTheme, options)

    // Generate output based on format
    const result: TokenExportResult = {
      tokens: await this.generateTokensOutput(transformedTokens, options),
      validation
    }

    // Generate metadata if requested
    if (options.includeMetadata) {
      result.metadata = this.generateMetadata(designSystem, transformedTokens, options)
    }

    // Generate documentation if requested
    if (options.includeDocumentation) {
      result.documentation = this.generateDocumentation(transformedTokens, options)
    }

    // Generate TypeScript types if requested
    if (options.format === 'ts' || options.format === 'js') {
      result.types = this.generateTypes(transformedTokens, options)
    }

    return result
  }

  private transformTokens(
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    options: TokenExportOptions
  ): any {
    let transformedTokens = { ...tokens }

    // Add theme tokens
    if (lightTheme) {
      transformedTokens.theme = {
        light: lightTheme
      }
      
      if (darkTheme) {
        transformedTokens.theme.dark = darkTheme
      }
    }

    // Add semantic tokens
    if (options.includeSemanticTokens) {
      transformedTokens.semantic = this.generateSemanticTokens(tokens, lightTheme, darkTheme)
    }

    // Add component tokens
    if (options.includeComponentTokens) {
      transformedTokens.component = this.generateComponentTokens(tokens)
    }

    // Add aliases
    if (options.includeAliases) {
      transformedTokens.alias = this.generateAliases(tokens)
    }

    // Transform names
    if (options.transformNames !== 'camelCase') {
      transformedTokens = this.transformTokenNames(transformedTokens, options.transformNames)
    }

    // Flatten structure if requested
    if (options.flattenStructure) {
      transformedTokens = this.flattenTokens(transformedTokens)
    }

    // Group by category if requested
    if (options.groupByCategory) {
      transformedTokens = this.groupTokensByCategory(transformedTokens)
    }

    // Sort tokens if requested
    if (options.sortTokens) {
      transformedTokens = this.sortTokens(transformedTokens)
    }

    return transformedTokens
  }

  private generateSemanticTokens(tokens: any, lightTheme: any, darkTheme: any): any {
    return {
      color: {
        text: {
          primary: lightTheme?.foreground?.primary || tokens.colors.neutral[900],
          secondary: lightTheme?.foreground?.secondary || tokens.colors.neutral[600],
          tertiary: lightTheme?.foreground?.tertiary || tokens.colors.neutral[400],
          inverse: lightTheme?.foreground?.inverse || tokens.colors.neutral[50],
          disabled: lightTheme?.foreground?.disabled || tokens.colors.neutral[300]
        },
        background: {
          primary: lightTheme?.background?.primary || tokens.colors.neutral[50],
          secondary: lightTheme?.background?.secondary || tokens.colors.neutral[100],
          tertiary: lightTheme?.background?.tertiary || tokens.colors.neutral[200],
          inverse: lightTheme?.background?.inverse || tokens.colors.neutral[900],
          disabled: lightTheme?.background?.disabled || tokens.colors.neutral[100]
        },
        border: {
          primary: lightTheme?.border?.primary || tokens.colors.neutral[200],
          secondary: lightTheme?.border?.secondary || tokens.colors.neutral[100],
          focus: tokens.colors.primary[500],
          error: tokens.colors.error[500],
          warning: tokens.colors.warning[500],
          success: tokens.colors.success[500]
        },
        interactive: {
          primary: tokens.colors.primary[500],
          'primary-hover': tokens.colors.primary[600],
          'primary-active': tokens.colors.primary[700],
          'primary-disabled': tokens.colors.primary[200],
          secondary: tokens.colors.secondary[500],
          'secondary-hover': tokens.colors.secondary[600],
          'secondary-active': tokens.colors.secondary[700],
          'secondary-disabled': tokens.colors.secondary[200]
        },
        feedback: {
          error: tokens.colors.error[500],
          'error-subtle': tokens.colors.error[50],
          'error-strong': tokens.colors.error[700],
          warning: tokens.colors.warning[500],
          'warning-subtle': tokens.colors.warning[50],
          'warning-strong': tokens.colors.warning[700],
          success: tokens.colors.success[500],
          'success-subtle': tokens.colors.success[50],
          'success-strong': tokens.colors.success[700],
          info: tokens.colors.info[500],
          'info-subtle': tokens.colors.info[50],
          'info-strong': tokens.colors.info[700]
        }
      },
      typography: {
        heading: {
          fontFamily: tokens.typography.headingFont,
          fontWeight: tokens.typography.headingWeight || 600,
          lineHeight: tokens.typography.headingLineHeight || 1.2
        },
        body: {
          fontFamily: tokens.typography.bodyFont,
          fontWeight: tokens.typography.bodyWeight || 400,
          lineHeight: tokens.typography.bodyLineHeight || 1.5
        },
        code: {
          fontFamily: tokens.typography.monoFont,
          fontWeight: tokens.typography.monoWeight || 400,
          lineHeight: tokens.typography.monoLineHeight || 1.4
        }
      },
      spacing: {
        component: {
          padding: {
            sm: tokens.spacing.sm,
            md: tokens.spacing.md,
            lg: tokens.spacing.lg
          },
          margin: {
            sm: tokens.spacing.sm,
            md: tokens.spacing.md,
            lg: tokens.spacing.lg
          },
          gap: {
            sm: tokens.spacing.xs,
            md: tokens.spacing.sm,
            lg: tokens.spacing.md
          }
        },
        layout: {
          container: tokens.spacing['6xl'],
          section: tokens.spacing['4xl'],
          content: tokens.spacing['3xl']
        }
      },
      elevation: {
        low: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        high: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        highest: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        interactive: tokens.borderRadius.md,
        decorative: tokens.borderRadius.lg,
        overlay: tokens.borderRadius.xl
      },
      animation: {
        duration: {
          instant: '0ms',
          fast: '150ms',
          normal: '200ms',
          slow: '300ms',
          slower: '500ms'
        },
        easing: {
          linear: 'linear',
          ease: 'ease',
          'ease-in': 'ease-in',
          'ease-out': 'ease-out',
          'ease-in-out': 'ease-in-out'
        }
      }
    }
  }

  private generateComponentTokens(tokens: any): any {
    return {
      button: {
        padding: {
          sm: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
          md: `${tokens.spacing.sm} ${tokens.spacing.md}`,
          lg: `${tokens.spacing.md} ${tokens.spacing.lg}`
        },
        fontSize: {
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem'
        },
        borderRadius: tokens.borderRadius.md,
        borderWidth: '1px',
        minHeight: {
          sm: '2rem',
          md: '2.5rem',
          lg: '3rem'
        }
      },
      input: {
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        fontSize: '1rem',
        borderRadius: tokens.borderRadius.md,
        borderWidth: '1px',
        minHeight: '2.5rem'
      },
      card: {
        padding: tokens.spacing.lg,
        borderRadius: tokens.borderRadius.lg,
        borderWidth: '1px',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
      modal: {
        padding: tokens.spacing.xl,
        borderRadius: tokens.borderRadius.xl,
        maxWidth: '32rem',
        backdrop: 'rgba(0, 0, 0, 0.5)'
      },
      tooltip: {
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        fontSize: '0.875rem',
        borderRadius: tokens.borderRadius.sm,
        maxWidth: '20rem'
      },
      badge: {
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        fontSize: '0.75rem',
        borderRadius: tokens.borderRadius.full,
        fontWeight: '500'
      }
    }
  }

  private generateAliases(tokens: any): any {
    return {
      // Color aliases
      brand: tokens.colors.primary,
      accent: tokens.colors.secondary,
      muted: tokens.colors.neutral[100],
      subtle: tokens.colors.neutral[50],
      
      // Typography aliases
      'font-primary': tokens.typography.headingFont,
      'font-secondary': tokens.typography.bodyFont,
      'font-mono': tokens.typography.monoFont,
      
      // Spacing aliases
      'space-tight': tokens.spacing.xs,
      'space-normal': tokens.spacing.md,
      'space-loose': tokens.spacing.lg,
      
      // Border radius aliases
      'radius-tight': tokens.borderRadius.sm,
      'radius-normal': tokens.borderRadius.md,
      'radius-loose': tokens.borderRadius.lg
    }
  }

  private transformTokenNames(tokens: any, transform: string): any {
    const transformName = (name: string): string => {
      switch (transform) {
        case 'kebab-case':
          return name.replace(/([A-Z])/g, '-$1').toLowerCase()
        case 'snake_case':
          return name.replace(/([A-Z])/g, '_$1').toLowerCase()
        case 'CONSTANT_CASE':
          return name.replace(/([A-Z])/g, '_$1').toUpperCase()
        default:
          return name
      }
    }

    const transformObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      if (Array.isArray(obj)) {
        return obj.map(transformObject)
      }

      const transformed: any = {}
      for (const [key, value] of Object.entries(obj)) {
        transformed[transformName(key)] = transformObject(value)
      }
      return transformed
    }

    return transformObject(tokens)
  }

  private flattenTokens(tokens: any, prefix = '', result: any = {}): any {
    for (const [key, value] of Object.entries(tokens)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenTokens(value, newKey, result)
      } else {
        result[newKey] = value
      }
    }
    
    return result
  }

  private groupTokensByCategory(tokens: any): any {
    const categories = {
      color: {},
      typography: {},
      spacing: {},
      sizing: {},
      layout: {},
      animation: {},
      interaction: {},
      semantic: {},
      component: {},
      alias: {}
    }

    const categorizeTokens = (obj: any, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key]
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          categorizeTokens(value, currentPath)
        } else {
          const category = this.determineCategory(currentPath)
          this.setNestedValue(categories[category], currentPath, value)
        }
      }
    }

    categorizeTokens(tokens)
    return categories
  }

  private determineCategory(path: string[]): keyof typeof categories {
    const firstSegment = path[0]?.toLowerCase()
    
    if (firstSegment?.includes('color') || firstSegment?.includes('background') || firstSegment?.includes('border')) {
      return 'color'
    }
    if (firstSegment?.includes('font') || firstSegment?.includes('text') || firstSegment?.includes('typography')) {
      return 'typography'
    }
    if (firstSegment?.includes('space') || firstSegment?.includes('gap') || firstSegment?.includes('margin') || firstSegment?.includes('padding')) {
      return 'spacing'
    }
    if (firstSegment?.includes('size') || firstSegment?.includes('width') || firstSegment?.includes('height')) {
      return 'sizing'
    }
    if (firstSegment?.includes('animation') || firstSegment?.includes('transition') || firstSegment?.includes('duration')) {
      return 'animation'
    }
    if (firstSegment?.includes('semantic')) {
      return 'semantic'
    }
    if (firstSegment?.includes('component')) {
      return 'component'
    }
    if (firstSegment?.includes('alias')) {
      return 'alias'
    }
    
    return 'layout'
  }

  private setNestedValue(obj: any, path: string[], value: any): void {
    const [head, ...tail] = path
    if (tail.length === 0) {
      obj[head] = value
    } else {
      if (!obj[head]) {
        obj[head] = {}
      }
      this.setNestedValue(obj[head], tail, value)
    }
  }

  private sortTokens(tokens: any): any {
    const sortObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return obj
      }

      const sorted: any = {}
      const keys = Object.keys(obj).sort()
      
      for (const key of keys) {
        sorted[key] = sortObject(obj[key])
      }
      
      return sorted
    }

    return sortObject(tokens)
  }

  private async generateTokensOutput(tokens: any, options: TokenExportOptions): Promise<string> {
    switch (options.format) {
      case 'json':
        return this.generateJSONOutput(tokens, options)
      case 'js':
        return this.generateJSOutput(tokens, options)
      case 'ts':
        return this.generateTSOutput(tokens, options)
      case 'yaml':
        return this.generateYAMLOutput(tokens, options)
      case 'toml':
        return this.generateTOMLOutput(tokens, options)
      case 'css':
        return this.generateCSSOutput(tokens, options)
      case 'scss':
        return this.generateSCSSOutput(tokens, options)
      case 'style-dictionary':
        return this.generateStyleDictionaryOutput(tokens, options)
      default:
        return this.generateJSONOutput(tokens, options)
    }
  }

  private generateJSONOutput(tokens: any, options: TokenExportOptions): string {
    const output = {
      ...(options.includeMetadata && { $metadata: this.generateInlineMetadata(options) }),
      ...tokens
    }

    return JSON.stringify(output, null, options.minify ? 0 : 2)
  }

  private generateJSOutput(tokens: any, options: TokenExportOptions): string {
    const tokensString = JSON.stringify(tokens, null, 2)
    
    return `${options.includeComments ? '// Design System Tokens\n' : ''}${options.includeMetadata ? `// Generated at: ${new Date().toISOString()}\n` : ''}
const tokens = ${tokensString}

module.exports = tokens
module.exports.default = tokens`
  }

  private generateTSOutput(tokens: any, options: TokenExportOptions): string {
    const tokensString = JSON.stringify(tokens, null, 2)
    
    return `${options.includeComments ? '// Design System Tokens\n' : ''}${options.includeMetadata ? `// Generated at: ${new Date().toISOString()}\n` : ''}
export interface DesignTokens {
  [key: string]: any
}

const tokens: DesignTokens = ${tokensString}

export default tokens
export { tokens }`
  }

  private generateYAMLOutput(tokens: any, options: TokenExportOptions): string {
    // Simple YAML generation - in production, use a proper YAML library
    const yamlString = this.objectToYAML(tokens)
    
    return `${options.includeComments ? '# Design System Tokens\n' : ''}${options.includeMetadata ? `# Generated at: ${new Date().toISOString()}\n` : ''}
${yamlString}`
  }

  private generateTOMLOutput(tokens: any, options: TokenExportOptions): string {
    // Simple TOML generation - in production, use a proper TOML library
    const tomlString = this.objectToTOML(tokens)
    
    return `${options.includeComments ? '# Design System Tokens\n' : ''}${options.includeMetadata ? `# Generated at: ${new Date().toISOString()}\n` : ''}
${tomlString}`
  }

  private generateCSSOutput(tokens: any, options: TokenExportOptions): string {
    let css = ''
    
    if (options.includeComments) {
      css += '/* Design System Tokens */\n'
    }
    
    if (options.includeMetadata) {
      css += `/* Generated at: ${new Date().toISOString()} */\n`
    }
    
    css += '\n:root {\n'
    css += this.generateCSSVariables(tokens)
    css += '}\n'
    
    // Add dark mode if included
    if (options.includeDarkMode && tokens.theme?.dark) {
      css += '\n[data-theme="dark"] {\n'
      css += this.generateCSSVariables(tokens.theme.dark, '--')
      css += '}\n'
    }
    
    return css
  }

  private generateSCSSOutput(tokens: any, options: TokenExportOptions): string {
    let scss = ''
    
    if (options.includeComments) {
      scss += '// Design System Tokens\n'
    }
    
    if (options.includeMetadata) {
      scss += `// Generated at: ${new Date().toISOString()}\n`
    }
    
    scss += '\n// SCSS Variables\n'
    scss += this.generateSCSSVariables(tokens)
    
    scss += '\n// CSS Custom Properties\n'
    scss += ':root {\n'
    scss += this.generateCSSVariables(tokens)
    scss += '}\n'
    
    return scss
  }

  private generateStyleDictionaryOutput(tokens: any, options: TokenExportOptions): string {
    const styleDictionaryFormat = {
      source: ['tokens/**/*.json'],
      platforms: {
        web: {
          transformGroup: 'web',
          buildPath: 'dist/web/',
          files: [{
            destination: 'tokens.css',
            format: 'css/variables'
          }]
        }
      }
    }

    return JSON.stringify({
      ...styleDictionaryFormat,
      tokens
    }, null, 2)
  }

  private generateCSSVariables(tokens: any, prefix = '--'): string {
    let css = ''
    
    const generateVars = (obj: any, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key]
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          generateVars(value, currentPath)
        } else {
          const varName = currentPath.join('-')
          css += `  ${prefix}${varName}: ${value};\n`
        }
      }
    }
    
    generateVars(tokens)
    return css
  }

  private generateSCSSVariables(tokens: any): string {
    let scss = ''
    
    const generateVars = (obj: any, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key]
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          generateVars(value, currentPath)
        } else {
          const varName = currentPath.join('-')
          scss += `$${varName}: ${value};\n`
        }
      }
    }
    
    generateVars(tokens)
    return scss
  }

  private objectToYAML(obj: any, indent = 0): string {
    let yaml = ''
    const spaces = '  '.repeat(indent)
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`
        yaml += this.objectToYAML(value, indent + 1)
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`
      }
    }
    
    return yaml
  }

  private objectToTOML(obj: any): string {
    let toml = ''
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        toml += `[${key}]\n`
        for (const [subKey, subValue] of Object.entries(value)) {
          toml += `${subKey} = ${JSON.stringify(subValue)}\n`
        }
        toml += '\n'
      } else {
        toml += `${key} = ${JSON.stringify(value)}\n`
      }
    }
    
    return toml
  }

  private validateTokens(tokens: any, options: TokenExportOptions): TokenValidationResult {
    const errors: TokenValidationError[] = []
    const warnings: TokenValidationWarning[] = []

    // Validate color tokens
    this.validateColorTokens(tokens.colors, errors, warnings)
    
    // Validate typography tokens
    this.validateTypographyTokens(tokens.typography, errors, warnings)
    
    // Validate spacing tokens
    this.validateSpacingTokens(tokens.spacing, errors, warnings)
    
    // Validate border radius tokens
    this.validateBorderRadiusTokens(tokens.borderRadius, errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateColorTokens(colors: any, errors: TokenValidationError[], warnings: TokenValidationWarning[]): void {
    if (!colors) {
      errors.push({
        path: 'colors',
        message: 'Color tokens are required',
        code: 'MISSING_COLORS'
      })
      return
    }

    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (typeof colorValue === 'string') {
        if (!this.isValidColor(colorValue as string)) {
          errors.push({
            path: `colors.${colorName}`,
            message: `Invalid color value: ${colorValue}`,
            code: 'INVALID_COLOR'
          })
        }
      } else if (typeof colorValue === 'object' && colorValue !== null) {
        for (const [shade, shadeValue] of Object.entries(colorValue)) {
          if (typeof shadeValue === 'string' && !this.isValidColor(shadeValue)) {
            errors.push({
              path: `colors.${colorName}.${shade}`,
              message: `Invalid color value: ${shadeValue}`,
              code: 'INVALID_COLOR'
            })
          }
        }
      }
    }
  }

  private validateTypographyTokens(typography: any, errors: TokenValidationError[], warnings: TokenValidationWarning[]): void {
    if (!typography) {
      errors.push({
        path: 'typography',
        message: 'Typography tokens are required',
        code: 'MISSING_TYPOGRAPHY'
      })
      return
    }

    const requiredFields = ['headingFont', 'bodyFont']
    for (const field of requiredFields) {
      if (!typography[field]) {
        warnings.push({
          path: `typography.${field}`,
          message: `Missing recommended typography field: ${field}`,
          code: 'MISSING_TYPOGRAPHY_FIELD'
        })
      }
    }
  }

  private validateSpacingTokens(spacing: any, errors: TokenValidationError[], warnings: TokenValidationWarning[]): void {
    if (!spacing) {
      errors.push({
        path: 'spacing',
        message: 'Spacing tokens are required',
        code: 'MISSING_SPACING'
      })
      return
    }

    for (const [spaceName, spaceValue] of Object.entries(spacing)) {
      if (typeof spaceValue === 'string' && !this.isValidLength(spaceValue as string)) {
        errors.push({
          path: `spacing.${spaceName}`,
          message: `Invalid spacing value: ${spaceValue}`,
          code: 'INVALID_SPACING'
        })
      }
    }
  }

  private validateBorderRadiusTokens(borderRadius: any, errors: TokenValidationError[], warnings: TokenValidationWarning[]): void {
    if (!borderRadius) {
      warnings.push({
        path: 'borderRadius',
        message: 'Border radius tokens are recommended',
        code: 'MISSING_BORDER_RADIUS'
      })
      return
    }

    for (const [radiusName, radiusValue] of Object.entries(borderRadius)) {
      if (typeof radiusValue === 'string' && !this.isValidLength(radiusValue as string)) {
        errors.push({
          path: `borderRadius.${radiusName}`,
          message: `Invalid border radius value: ${radiusValue}`,
          code: 'INVALID_BORDER_RADIUS'
        })
      }
    }
  }

  private isValidColor(color: string): boolean {
    // Basic color validation - in production, use a proper color library
    const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
    const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/
    const hslaPattern = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/
    
    return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color) || 
           hslPattern.test(color) || hslaPattern.test(color)
  }

  private isValidLength(length: string): boolean {
    // Basic length validation
    const lengthPattern = /^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|in|cm|mm|pt|pc)$/
    return lengthPattern.test(length) || length === '0'
  }

  private generateMetadata(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: TokenExportOptions
  ): TokenMetadata {
    return {
      name: designSystem.designSystem.name || 'Design System',
      version: '1.0.0',
      description: designSystem.designSystem.description || 'AI-generated design system tokens',
      exportedAt: new Date().toISOString(),
      platform: options.platform,
      format: options.format,
      tokenCount: this.countTokens(tokens),
      categories: Object.keys(tokens)
    }
  }

  private generateInlineMetadata(options: TokenExportOptions): any {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      platform: options.platform,
      format: options.format
    }
  }

  private generateDocumentation(tokens: any, options: TokenExportOptions): string {
    let docs = '# Design System Tokens\n\n'
    
    if (options.includeMetadata) {
      docs += `Generated at: ${new Date().toISOString()}\n\n`
    }
    
    docs += '## Token Categories\n\n'
    
    for (const [category, categoryTokens] of Object.entries(tokens)) {
      docs += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`
      docs += this.generateCategoryDocumentation(categoryTokens, category)
      docs += '\n'
    }
    
    return docs
  }

  private generateCategoryDocumentation(tokens: any, category: string): string {
    let docs = ''
    
    if (typeof tokens === 'object' && tokens !== null && !Array.isArray(tokens)) {
      for (const [key, value] of Object.entries(tokens)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          docs += `#### ${key}\n\n`
          docs += this.generateTokenTable(value)
          docs += '\n'
        } else {
          docs += `- **${key}**: ${value}\n`
        }
      }
    }
    
    return docs
  }

  private generateTokenTable(tokens: any): string {
    let table = '| Token | Value |\n'
    table += '|-------|-------|\n'
    
    for (const [key, value] of Object.entries(tokens)) {
      table += `| ${key} | ${value} |\n`
    }
    
    return table
  }

  private generateTypes(tokens: any, options: TokenExportOptions): string {
    let types = '// Design System Token Types\n\n'
    
    types += this.generateTokenInterfaces(tokens)
    
    return types
  }

  private generateTokenInterfaces(tokens: any, interfaceName = 'DesignTokens'): string {
    let interfaces = `export interface ${interfaceName} {\n`
    
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const subInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`
        interfaces += `  ${key}: ${subInterfaceName}\n`
      } else {
        interfaces += `  ${key}: ${typeof value === 'string' ? 'string' : 'number'}\n`
      }
    }
    
    interfaces += '}\n\n'
    
    // Generate sub-interfaces
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const subInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`
        interfaces += this.generateTokenInterfaces(value, subInterfaceName)
      }
    }
    
    return interfaces
  }

  private countTokens(tokens: any): number {
    let count = 0
    
    const countRecursive = (obj: any): void => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          countRecursive(value)
        } else {
          count++
        }
      }
    }
    
    countRecursive(tokens)
    return count
  }

  private getDefaultOptions(): TokenExportOptions {
    return {
      format: 'json',
      platform: 'web',
      includeMetadata: true,
      includeDocumentation: false,
      includeComments: true,
      groupByCategory: false,
      flattenStructure: false,
      transformNames: 'camelCase',
      includeDarkMode: true,
      includeSemanticTokens: true,
      includeComponentTokens: true,
      includeAliases: true,
      validateTokens: true,
      sortTokens: true,
      minify: false,
      includeVersion: true,
      includeTimestamp: true
    }
  }
}

export const tokenExporter = new TokenExporter()