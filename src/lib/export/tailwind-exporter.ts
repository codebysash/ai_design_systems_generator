import { GeneratedDesignSystem, DesignSystemConfig } from '@/types'
import { designTokenGenerator } from '@/lib/design-system/tokens'
import { themeGenerator } from '@/lib/design-system/themes'

export interface TailwindExportOptions {
  format: 'js' | 'ts' | 'cjs' | 'mjs'
  includePlugins: boolean
  includeComponents: boolean
  includeUtilities: boolean
  includeAnimation: boolean
  includeCustomColors: boolean
  includeCustomFonts: boolean
  includeCustomSpacing: boolean
  includeCustomBreakpoints: boolean
  includeDarkMode: boolean
  includeRTL: boolean
  includeAccessibility: boolean
  prefix: string
  corePlugins: string[]
  generatePresets: boolean
  generateSafelistPatterns: boolean
  minify: boolean
}

export interface TailwindExportResult {
  config: string
  preset?: string
  plugins?: string[]
  components?: string
  utilities?: string
  safelist?: string[]
  theme?: string
  variants?: string
  plugins_code?: string
}

export class TailwindExporter {
  async exportTailwindConfig(
    designSystem: GeneratedDesignSystem,
    options: TailwindExportOptions = this.getDefaultOptions()
  ): Promise<TailwindExportResult> {
    const tokens = designTokenGenerator.generateTokens(
      designSystem.designSystem
    )
    const lightTheme = themeGenerator.generateTheme(
      designSystem.designSystem,
      'light'
    )
    const darkTheme = options.includeDarkMode
      ? themeGenerator.generateTheme(designSystem.designSystem, 'dark')
      : null

    const result: TailwindExportResult = {
      config: '',
      safelist: [],
    }

    // Generate theme configuration
    const themeConfig = this.generateThemeConfig(
      tokens,
      lightTheme,
      darkTheme,
      options
    )

    // Generate plugins
    const plugins = this.generatePlugins(designSystem, tokens, options)

    // Generate components
    if (options.includeComponents) {
      result.components = this.generateComponents(designSystem, tokens, options)
    }

    // Generate utilities
    if (options.includeUtilities) {
      result.utilities = this.generateUtilities(tokens, options)
    }

    // Generate safelist patterns
    if (options.generateSafelistPatterns) {
      result.safelist = this.generateSafelistPatterns(designSystem, options)
    }

    // Generate preset
    if (options.generatePresets) {
      result.preset = this.generatePreset(themeConfig, plugins, options)
    }

    // Generate main config
    result.config = this.generateMainConfig(
      themeConfig,
      plugins,
      result,
      options
    )

    // Generate plugins code
    if (options.includePlugins) {
      result.plugins_code = this.generatePluginsCode(plugins, options)
    }

    return result
  }

  private generateThemeConfig(
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    options: TailwindExportOptions
  ): any {
    const theme: any = {
      extend: {},
    }

    // Colors
    if (options.includeCustomColors) {
      theme.extend.colors = {
        primary: this.generateColorScale(tokens.colors.primary),
        secondary: this.generateColorScale(tokens.colors.secondary),
        neutral: this.generateColorScale(tokens.colors.neutral),
        success: this.generateColorScale(tokens.colors.success),
        warning: this.generateColorScale(tokens.colors.warning),
        error: this.generateColorScale(tokens.colors.error),
        info: this.generateColorScale(tokens.colors.info),
      }

      // Add semantic colors
      theme.extend.colors.background = {
        DEFAULT: lightTheme.background.primary,
        secondary: lightTheme.background.secondary,
        tertiary: lightTheme.background.tertiary,
      }

      theme.extend.colors.foreground = {
        DEFAULT: lightTheme.foreground.primary,
        secondary: lightTheme.foreground.secondary,
        tertiary: lightTheme.foreground.tertiary,
      }

      theme.extend.colors.border = {
        DEFAULT: lightTheme.border.primary,
        secondary: lightTheme.border.secondary,
      }
    }

    // Typography
    if (options.includeCustomFonts) {
      theme.extend.fontFamily = {
        heading: [tokens.typography.headingFont, 'system-ui', 'sans-serif'],
        body: [tokens.typography.bodyFont, 'system-ui', 'sans-serif'],
        mono: [tokens.typography.monoFont, 'Menlo', 'monospace'],
      }

      theme.extend.fontSize = {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      }

      theme.extend.fontWeight = {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      }

      theme.extend.lineHeight = {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      }

      theme.extend.letterSpacing = {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      }
    }

    // Spacing
    if (options.includeCustomSpacing) {
      theme.extend.spacing = {
        xs: tokens.spacing.xs,
        sm: tokens.spacing.sm,
        md: tokens.spacing.md,
        lg: tokens.spacing.lg,
        xl: tokens.spacing.xl,
        '2xl': tokens.spacing['2xl'],
        '3xl': tokens.spacing['3xl'],
        '4xl': tokens.spacing['4xl'],
        '5xl': tokens.spacing['5xl'],
        '6xl': tokens.spacing['6xl'],
      }

      theme.extend.borderRadius = {
        none: '0',
        sm: tokens.borderRadius.sm,
        DEFAULT: tokens.borderRadius.md,
        md: tokens.borderRadius.md,
        lg: tokens.borderRadius.lg,
        xl: tokens.borderRadius.xl,
        '2xl': tokens.borderRadius['2xl'],
        '3xl': tokens.borderRadius['3xl'],
        full: '9999px',
      }
    }

    // Breakpoints
    if (options.includeCustomBreakpoints) {
      theme.screens = {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      }
    }

    // Animations
    if (options.includeAnimation) {
      theme.extend.animation = {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'rotate-in': 'rotateIn 0.3s ease-out',
      }

      theme.extend.keyframes = {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0deg)', opacity: '1' },
        },
      }
    }

    // Box shadows
    theme.extend.boxShadow = {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT:
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
    }

    return theme
  }

  private generateColorScale(color: any): any {
    if (typeof color === 'string') {
      return color
    }

    if (color.scale) {
      return color.scale
    }

    // Generate scale from base color
    return {
      50: this.lightenColor(color.base || color, 0.95),
      100: this.lightenColor(color.base || color, 0.9),
      200: this.lightenColor(color.base || color, 0.8),
      300: this.lightenColor(color.base || color, 0.6),
      400: this.lightenColor(color.base || color, 0.4),
      500: color.base || color,
      600: this.darkenColor(color.base || color, 0.2),
      700: this.darkenColor(color.base || color, 0.4),
      800: this.darkenColor(color.base || color, 0.6),
      900: this.darkenColor(color.base || color, 0.8),
      950: this.darkenColor(color.base || color, 0.9),
    }
  }

  private lightenColor(color: string, amount: number): string {
    // Simple color lightening - in production, use a proper color library
    return color
  }

  private darkenColor(color: string, amount: number): string {
    // Simple color darkening - in production, use a proper color library
    return color
  }

  private generatePlugins(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: TailwindExportOptions
  ): any[] {
    const plugins: any[] = []

    // Component plugin
    if (options.includeComponents) {
      plugins.push({
        name: 'components',
        code: this.generateComponentsPlugin(designSystem, tokens, options),
      })
    }

    // Utilities plugin
    if (options.includeUtilities) {
      plugins.push({
        name: 'utilities',
        code: this.generateUtilitiesPlugin(tokens, options),
      })
    }

    // Accessibility plugin
    if (options.includeAccessibility) {
      plugins.push({
        name: 'accessibility',
        code: this.generateAccessibilityPlugin(options),
      })
    }

    // RTL plugin
    if (options.includeRTL) {
      plugins.push({
        name: 'rtl',
        code: this.generateRTLPlugin(options),
      })
    }

    return plugins
  }

  private generateComponentsPlugin(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: TailwindExportOptions
  ): string {
    const components = designSystem.components || []

    return `
function({ addComponents, theme }) {
  const components = {
    ${components.map(component => this.generateComponentCSS(component, tokens, options)).join(',\n    ')}
  }
  
  addComponents(components)
}`
  }

  private generateUtilitiesPlugin(
    tokens: any,
    options: TailwindExportOptions
  ): string {
    return `
function({ addUtilities, theme }) {
  const utilities = {
    // Custom spacing utilities
    ${Object.entries(tokens.spacing)
      .map(([key, value]) => `'.space-${key}': { margin: '${value}' }`)
      .join(',\n    ')},
    
    // Custom border radius utilities
    ${Object.entries(tokens.borderRadius)
      .map(([key, value]) => `'.rounded-${key}': { borderRadius: '${value}' }`)
      .join(',\n    ')},
    
    // Custom shadow utilities
    '.shadow-brand': { boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)' },
    '.shadow-brand-lg': { boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.15)' },
    
    // Focus utilities
    '.focus-ring': {
      '&:focus': {
        outline: '2px solid rgb(59 130 246)',
        outlineOffset: '2px'
      }
    },
    
    // Transition utilities
    '.transition-brand': {
      transitionProperty: 'all',
      transitionDuration: '0.2s',
      transitionTimingFunction: 'ease-in-out'
    }
  }
  
  addUtilities(utilities)
}`
  }

  private generateAccessibilityPlugin(options: TailwindExportOptions): string {
    return `
function({ addUtilities }) {
  const utilities = {
    // Screen reader utilities
    '.sr-only': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0'
    },
    
    '.not-sr-only': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal'
    },
    
    // Focus utilities
    '.focus-visible\\:focus-ring:focus-visible': {
      outline: '2px solid rgb(59 130 246)',
      outlineOffset: '2px'
    },
    
    // Skip links
    '.skip-link': {
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: 'white',
      color: 'black',
      padding: '8px',
      textDecoration: 'none',
      borderRadius: '4px',
      border: '1px solid black',
      zIndex: '100',
      '&:focus': {
        top: '6px'
      }
    }
  }
  
  addUtilities(utilities)
}`
  }

  private generateRTLPlugin(options: TailwindExportOptions): string {
    return `
function({ addUtilities }) {
  const utilities = {
    // RTL utilities
    '.rtl\\:text-right': {
      '[dir="rtl"] &': {
        textAlign: 'right'
      }
    },
    
    '.rtl\\:text-left': {
      '[dir="rtl"] &': {
        textAlign: 'left'
      }
    },
    
    '.rtl\\:ml-auto': {
      '[dir="rtl"] &': {
        marginLeft: 'auto'
      }
    },
    
    '.rtl\\:mr-auto': {
      '[dir="rtl"] &': {
        marginRight: 'auto'
      }
    },
    
    '.rtl\\:rotate-180': {
      '[dir="rtl"] &': {
        transform: 'rotate(180deg)'
      }
    }
  }
  
  addUtilities(utilities)
}`
  }

  private generateComponentCSS(
    component: any,
    tokens: any,
    options: TailwindExportOptions
  ): string {
    const componentName = component.name.toLowerCase()
    const baseClasses = this.generateBaseClasses(component, tokens)
    const variantClasses = this.generateVariantClasses(component, tokens)
    const sizeClasses = this.generateSizeClasses(component, tokens)

    return `
    '.${options.prefix}${componentName}': {
      ${baseClasses}
    },
    ${variantClasses}
    ${sizeClasses}`
  }

  private generateBaseClasses(component: any, tokens: any): string {
    const baseStyles = [
      'display: "inline-flex"',
      'alignItems: "center"',
      'justifyContent: "center"',
      'fontWeight: "500"',
      'fontSize: "0.875rem"',
      'lineHeight: "1.25rem"',
      'borderRadius: theme("borderRadius.md")',
      'transition: "all 0.2s ease-in-out"',
      'outline: "2px solid transparent"',
      'outlineOffset: "2px"',
      'cursor: "pointer"',
      '&:disabled: { opacity: "0.5", cursor: "not-allowed" }',
      '&:focus-visible: { outline: "2px solid rgb(59 130 246)", outlineOffset: "2px" }',
    ]

    return baseStyles.join(',\n      ')
  }

  private generateVariantClasses(component: any, tokens: any): string {
    return component.variants
      .map((variant: any) => {
        const variantName = variant.name
        const styles = this.getVariantStyles(variantName, tokens)

        return `'.${component.name.toLowerCase()}--${variantName}': {
        ${styles}
      }`
      })
      .join(',\n    ')
  }

  private generateSizeClasses(component: any, tokens: any): string {
    return component.sizes
      .map((size: string) => {
        const styles = this.getSizeStyles(size, tokens)

        return `'.${component.name.toLowerCase()}--${size}': {
        ${styles}
      }`
      })
      .join(',\n    ')
  }

  private getVariantStyles(variant: string, tokens: any): string {
    const variantStyles: Record<string, string> = {
      primary: `
        backgroundColor: theme("colors.primary.500"),
        color: theme("colors.white"),
        '&:hover': {
          backgroundColor: theme("colors.primary.600")
        },
        '&:active': {
          backgroundColor: theme("colors.primary.700")
        }`,
      secondary: `
        backgroundColor: theme("colors.secondary.500"),
        color: theme("colors.white"),
        '&:hover': {
          backgroundColor: theme("colors.secondary.600")
        },
        '&:active': {
          backgroundColor: theme("colors.secondary.700")
        }`,
      outline: `
        backgroundColor: "transparent",
        color: theme("colors.primary.500"),
        borderWidth: "1px",
        borderColor: theme("colors.primary.500"),
        '&:hover': {
          backgroundColor: theme("colors.primary.50"),
          borderColor: theme("colors.primary.600")
        },
        '&:active': {
          backgroundColor: theme("colors.primary.100")
        }`,
      ghost: `
        backgroundColor: "transparent",
        color: theme("colors.gray.700"),
        '&:hover': {
          backgroundColor: theme("colors.gray.100")
        },
        '&:active': {
          backgroundColor: theme("colors.gray.200")
        }`,
      destructive: `
        backgroundColor: theme("colors.red.500"),
        color: theme("colors.white"),
        '&:hover': {
          backgroundColor: theme("colors.red.600")
        },
        '&:active': {
          backgroundColor: theme("colors.red.700")
        }`,
    }

    return variantStyles[variant] || variantStyles.primary
  }

  private getSizeStyles(size: string, tokens: any): string {
    const sizeStyles: Record<string, string> = {
      sm: `
        height: "2rem",
        paddingLeft: "0.75rem",
        paddingRight: "0.75rem",
        fontSize: "0.75rem",
        lineHeight: "1rem"`,
      md: `
        height: "2.5rem",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        fontSize: "0.875rem",
        lineHeight: "1.25rem"`,
      lg: `
        height: "3rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        fontSize: "1rem",
        lineHeight: "1.5rem"`,
      xl: `
        height: "3.5rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        fontSize: "1.125rem",
        lineHeight: "1.75rem"`,
    }

    return sizeStyles[size] || sizeStyles.md
  }

  private generateComponents(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: TailwindExportOptions
  ): string {
    const components = designSystem.components || []

    return components
      .map(component => {
        return `// ${component.name} Component
@layer components {
  ${this.generateComponentCSS(component, tokens, options)}
}`
      })
      .join('\n\n')
  }

  private generateUtilities(
    tokens: any,
    options: TailwindExportOptions
  ): string {
    return `// Custom Utilities
@layer utilities {
  /* Spacing utilities */
  ${Object.entries(tokens.spacing)
    .map(([key, value]) => `.space-${key} { margin: ${value}; }`)
    .join('\n  ')}
  
  /* Border radius utilities */
  ${Object.entries(tokens.borderRadius)
    .map(([key, value]) => `.rounded-${key} { border-radius: ${value}; }`)
    .join('\n  ')}
  
  /* Focus utilities */
  .focus-ring:focus {
    outline: 2px solid rgb(59 130 246);
    outline-offset: 2px;
  }
  
  /* Transition utilities */
  .transition-brand {
    transition-property: all;
    transition-duration: 0.2s;
    transition-timing-function: ease-in-out;
  }
}`
  }

  private generateSafelistPatterns(
    designSystem: GeneratedDesignSystem,
    options: TailwindExportOptions
  ): string[] {
    const patterns: string[] = []
    const components = designSystem.components || []

    // Add component patterns
    components.forEach(component => {
      const componentName = component.name.toLowerCase()

      // Base component
      patterns.push(`${options.prefix}${componentName}`)

      // Variants
      component.variants.forEach((variant: any) => {
        patterns.push(`${options.prefix}${componentName}--${variant.name}`)
      })

      // Sizes
      component.sizes.forEach((size: string) => {
        patterns.push(`${options.prefix}${componentName}--${size}`)
      })
    })

    // Add color patterns
    const colorNames = [
      'primary',
      'secondary',
      'neutral',
      'success',
      'warning',
      'error',
      'info',
    ]
    const colorShades = [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ]

    colorNames.forEach(name => {
      colorShades.forEach(shade => {
        patterns.push(`bg-${name}-${shade}`)
        patterns.push(`text-${name}-${shade}`)
        patterns.push(`border-${name}-${shade}`)
      })
    })

    return patterns
  }

  private generatePreset(
    themeConfig: any,
    plugins: any[],
    options: TailwindExportOptions
  ): string {
    const presetContent = {
      content: [],
      theme: themeConfig,
      plugins: plugins.map(p => p.code),
    }

    const format = options.format === 'ts' ? 'ts' : 'js'
    const exportStatement =
      format === 'ts' ? 'export default' : 'module.exports ='

    return `${format === 'ts' ? 'import type { Config } from "tailwindcss"\n\n' : ''}${exportStatement} {
  ${JSON.stringify(presetContent, null, 2).replace(/"/g, '')}
}${format === 'ts' ? ' satisfies Config' : ''}`
  }

  private generateMainConfig(
    themeConfig: any,
    plugins: any[],
    result: TailwindExportResult,
    options: TailwindExportOptions
  ): string {
    const config = {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      darkMode: options.includeDarkMode ? 'class' : undefined,
      theme: themeConfig,
      plugins: plugins.map(p => `require('${p.name}')`),
      prefix: options.prefix || '',
      corePlugins:
        options.corePlugins.length > 0 ? options.corePlugins : undefined,
      safelist: result.safelist || undefined,
    }

    // Remove undefined values
    Object.keys(config).forEach(key => {
      if (config[key as keyof typeof config] === undefined) {
        delete config[key as keyof typeof config]
      }
    })

    const format = options.format === 'ts' ? 'ts' : 'js'
    const exportStatement =
      format === 'ts' ? 'export default' : 'module.exports ='

    let configString = JSON.stringify(config, null, 2)

    // Replace plugin references with actual function calls
    plugins.forEach(plugin => {
      configString = configString.replace(
        `"require('${plugin.name}')"`,
        plugin.code
      )
    })

    return `${format === 'ts' ? 'import type { Config } from "tailwindcss"\n\n' : ''}${exportStatement} {
  ${configString.slice(1, -1)}
}${format === 'ts' ? ' satisfies Config' : ''}`
  }

  private generatePluginsCode(
    plugins: any[],
    options: TailwindExportOptions
  ): string {
    return plugins
      .map(plugin => {
        const format = options.format === 'ts' ? 'ts' : 'js'
        const exportStatement =
          format === 'ts' ? 'export default' : 'module.exports ='

        return `// ${plugin.name} plugin
${exportStatement} ${plugin.code}`
      })
      .join('\n\n')
  }

  private getDefaultOptions(): TailwindExportOptions {
    return {
      format: 'js',
      includePlugins: true,
      includeComponents: true,
      includeUtilities: true,
      includeAnimation: true,
      includeCustomColors: true,
      includeCustomFonts: true,
      includeCustomSpacing: true,
      includeCustomBreakpoints: true,
      includeDarkMode: true,
      includeRTL: false,
      includeAccessibility: true,
      prefix: '',
      corePlugins: [],
      generatePresets: true,
      generateSafelistPatterns: true,
      minify: false,
    }
  }
}

export const tailwindExporter = new TailwindExporter()
