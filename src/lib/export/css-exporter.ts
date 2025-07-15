import { GeneratedDesignSystem, GeneratedComponent, DesignSystemConfig } from '@/types'
import { designTokenGenerator } from '@/lib/design-system/tokens'
import { themeGenerator } from '@/lib/design-system/themes'

export interface CSSExportOptions {
  format: 'css' | 'scss' | 'less' | 'stylus'
  includeVariables: boolean
  includeComponents: boolean
  includeUtilities: boolean
  includeNormalize: boolean
  includeDarkMode: boolean
  includeRTL: boolean
  includeAnimations: boolean
  includeResponsive: boolean
  prefix: string
  minify: boolean
  autoprefixer: boolean
  generateSourceMaps: boolean
}

export interface CSSExportResult {
  main: string
  variables: string
  components: string
  utilities: string
  normalize: string
  darkMode?: string
  rtl?: string
  animations?: string
  responsive?: string
  sourceMap?: string
}

export class CSSExporter {
  async exportCSS(
    designSystem: GeneratedDesignSystem,
    options: CSSExportOptions = this.getDefaultOptions()
  ): Promise<CSSExportResult> {
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)
    const lightTheme = themeGenerator.generateTheme(designSystem.designSystem, 'light')
    const darkTheme = options.includeDarkMode ? 
      themeGenerator.generateTheme(designSystem.designSystem, 'dark') : null

    const result: CSSExportResult = {
      main: '',
      variables: '',
      components: '',
      utilities: '',
      normalize: ''
    }

    // Generate CSS variables
    if (options.includeVariables) {
      result.variables = this.generateVariables(tokens, lightTheme, darkTheme, options)
    }

    // Generate component styles
    if (options.includeComponents) {
      result.components = this.generateComponentStyles(designSystem, tokens, options)
    }

    // Generate utility classes
    if (options.includeUtilities) {
      result.utilities = this.generateUtilities(tokens, options)
    }

    // Generate normalize/reset styles
    if (options.includeNormalize) {
      result.normalize = this.generateNormalize(tokens, options)
    }

    // Generate dark mode styles
    if (options.includeDarkMode && darkTheme) {
      result.darkMode = this.generateDarkModeStyles(darkTheme, options)
    }

    // Generate RTL styles
    if (options.includeRTL) {
      result.rtl = this.generateRTLStyles(tokens, options)
    }

    // Generate animations
    if (options.includeAnimations) {
      result.animations = this.generateAnimations(tokens, options)
    }

    // Generate responsive styles
    if (options.includeResponsive) {
      result.responsive = this.generateResponsiveStyles(tokens, options)
    }

    // Generate main file
    result.main = this.generateMainFile(result, options)

    // Minify if requested
    if (options.minify) {
      result.main = this.minifyCSS(result.main)
      result.variables = this.minifyCSS(result.variables)
      result.components = this.minifyCSS(result.components)
      result.utilities = this.minifyCSS(result.utilities)
    }

    return result
  }

  private generateVariables(
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    options: CSSExportOptions
  ): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    let css = ''

    if (options.format === 'scss') {
      css = this.generateSCSSVariables(tokens, prefix)
    } else if (options.format === 'less') {
      css = this.generateLESSVariables(tokens, prefix)
    } else if (options.format === 'stylus') {
      css = this.generateStylusVariables(tokens, prefix)
    } else {
      css = this.generateCSSVariables(tokens, lightTheme, darkTheme, prefix)
    }

    return css
  }

  private generateCSSVariables(
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    prefix: string
  ): string {
    let css = `/* Design System Variables */\n:root {\n`

    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      css += `  --${prefix}color-primary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      css += `  --${prefix}color-secondary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      css += `  --${prefix}color-accent-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      css += `  --${prefix}color-neutral-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
      css += `  --${prefix}color-${key}: ${value};\n`
    })

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      css += `  --${prefix}font-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      css += `  --${prefix}font-size-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      css += `  --${prefix}font-weight-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      css += `  --${prefix}line-height-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
      css += `  --${prefix}letter-spacing-${key}: ${value};\n`
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      css += `  --${prefix}spacing-${key}: ${value};\n`
    })

    // Border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      css += `  --${prefix}border-radius-${key}: ${value};\n`
    })

    // Shadows
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      css += `  --${prefix}shadow-${key}: ${value};\n`
    })

    // Animation
    Object.entries(tokens.animation.duration).forEach(([key, value]) => {
      css += `  --${prefix}duration-${key}: ${value};\n`
    })
    Object.entries(tokens.animation.easing).forEach(([key, value]) => {
      css += `  --${prefix}easing-${key}: ${value};\n`
    })

    // Breakpoints
    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      css += `  --${prefix}breakpoint-${key}: ${value};\n`
    })

    css += `}\n\n`

    // Dark mode variables
    if (darkTheme) {
      css += `[data-theme="dark"] {\n`
      Object.entries(darkTheme.cssVariables).forEach(([key, value]) => {
        css += `  ${key}: ${value};\n`
      })
      css += `}\n\n`
    }

    return css
  }

  private generateSCSSVariables(tokens: any, prefix: string): string {
    let scss = `// Design System Variables\n`

    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      scss += `$${prefix}color-primary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      scss += `$${prefix}color-secondary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      scss += `$${prefix}color-accent-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      scss += `$${prefix}color-neutral-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
      scss += `$${prefix}color-${key}: ${value};\n`
    })

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      scss += `$${prefix}font-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      scss += `$${prefix}font-size-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      scss += `$${prefix}font-weight-${key}: ${value};\n`
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      scss += `$${prefix}spacing-${key}: ${value};\n`
    })

    // Border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      scss += `$${prefix}border-radius-${key}: ${value};\n`
    })

    // Shadows
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      scss += `$${prefix}shadow-${key}: ${value};\n`
    })

    // Create color maps
    scss += `\n// Color Maps\n`
    scss += `$${prefix}colors: (\n`
    scss += `  primary: (\n`
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      scss += `    ${key}: ${value},\n`
    })
    scss += `  ),\n`
    scss += `  secondary: (\n`
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      scss += `    ${key}: ${value},\n`
    })
    scss += `  ),\n`
    scss += `  accent: (\n`
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      scss += `    ${key}: ${value},\n`
    })
    scss += `  ),\n`
    scss += `  neutral: (\n`
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      scss += `    ${key}: ${value},\n`
    })
    scss += `  )\n`
    scss += `);\n\n`

    // Add functions
    scss += `// Helper Functions\n`
    scss += `@function color($palette, $shade: 500) {\n`
    scss += `  @return map-get(map-get($${prefix}colors, $palette), $shade);\n`
    scss += `}\n\n`

    scss += `@function spacing($size) {\n`
    scss += `  @return map-get((\n`
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      scss += `    ${key}: ${value},\n`
    })
    scss += `  ), $size);\n`
    scss += `}\n\n`

    return scss
  }

  private generateLESSVariables(tokens: any, prefix: string): string {
    let less = `// Design System Variables\n`

    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      less += `@${prefix}color-primary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      less += `@${prefix}color-secondary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      less += `@${prefix}color-accent-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      less += `@${prefix}color-neutral-${key}: ${value};\n`
    })

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      less += `@${prefix}font-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      less += `@${prefix}font-size-${key}: ${value};\n`
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      less += `@${prefix}spacing-${key}: ${value};\n`
    })

    return less
  }

  private generateStylusVariables(tokens: any, prefix: string): string {
    let stylus = `// Design System Variables\n`

    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      stylus += `${prefix}color-primary-${key} = ${value}\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      stylus += `${prefix}color-secondary-${key} = ${value}\n`
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      stylus += `${prefix}color-accent-${key} = ${value}\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      stylus += `${prefix}color-neutral-${key} = ${value}\n`
    })

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      stylus += `${prefix}font-${key} = ${value}\n`
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      stylus += `${prefix}font-size-${key} = ${value}\n`
    })

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      stylus += `${prefix}spacing-${key} = ${value}\n`
    })

    return stylus
  }

  private generateComponentStyles(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: CSSExportOptions
  ): string {
    let css = `/* Component Styles */\n`
    const prefix = options.prefix ? `${options.prefix}-` : ''

    for (const component of designSystem.components) {
      css += this.generateComponentCSS(component, tokens, prefix, options)
    }

    return css
  }

  private generateComponentCSS(
    component: GeneratedComponent,
    tokens: any,
    prefix: string,
    options: CSSExportOptions
  ): string {
    const className = `${prefix}${component.name.toLowerCase()}`
    let css = `\n/* ${component.name} Component */\n`

    // Base styles
    css += `.${className} {\n`
    css += this.getComponentBaseStyles(component, tokens, options)
    css += `}\n\n`

    // Variants
    component.variants.forEach(variant => {
      css += `.${className}--${variant.name} {\n`
      css += this.getVariantStyles(component, variant, tokens, options)
      css += `}\n\n`
    })

    // Sizes
    component.sizes.forEach(size => {
      css += `.${className}--${size} {\n`
      css += this.getSizeStyles(component, size, tokens, options)
      css += `}\n\n`
    })

    // States
    component.states.forEach(state => {
      css += `.${className}--${state} {\n`
      css += this.getStateStyles(component, state, tokens, options)
      css += `}\n\n`
    })

    // Accessibility styles
    css += `.${className}:focus-visible {\n`
    css += `  outline: 2px solid var(--${prefix}color-primary-500);\n`
    css += `  outline-offset: 2px;\n`
    css += `}\n\n`

    return css
  }

  private getComponentBaseStyles(
    component: GeneratedComponent,
    tokens: any,
    options: CSSExportOptions
  ): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    let styles = ''
    
    switch (component.name) {
      case 'Button':
        styles = `  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--${prefix}border-radius-md);
  font-family: var(--${prefix}font-body);
  font-weight: var(--${prefix}font-weight-medium);
  cursor: pointer;
  transition: all var(--${prefix}duration-normal) var(--${prefix}easing-ease);
  text-decoration: none;
  user-select: none;
`
        break
      case 'Input':
        styles = `  width: 100%;
  border: 1px solid var(--${prefix}color-neutral-300);
  border-radius: var(--${prefix}border-radius-md);
  padding: var(--${prefix}spacing-2) var(--${prefix}spacing-3);
  font-family: var(--${prefix}font-body);
  font-size: var(--${prefix}font-size-sm);
  line-height: var(--${prefix}line-height-normal);
  transition: border-color var(--${prefix}duration-normal) var(--${prefix}easing-ease);
  background-color: var(--${prefix}color-neutral-50);
  color: var(--${prefix}color-neutral-900);
`
        break
      case 'Card':
        styles = `  background-color: var(--${prefix}color-neutral-50);
  border: 1px solid var(--${prefix}color-neutral-200);
  border-radius: var(--${prefix}border-radius-lg);
  padding: var(--${prefix}spacing-6);
  box-shadow: var(--${prefix}shadow-sm);
`
        break
      default:
        styles = `  font-family: var(--${prefix}font-body);
  color: var(--${prefix}color-neutral-900);
`
    }

    return styles
  }

  private getVariantStyles(
    component: GeneratedComponent,
    variant: any,
    tokens: any,
    options: CSSExportOptions
  ): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    let styles = ''
    
    if (component.name === 'Button') {
      switch (variant.name) {
        case 'primary':
          styles = `  background-color: var(--${prefix}color-primary-500);
  color: var(--${prefix}color-neutral-50);
  border: 1px solid var(--${prefix}color-primary-500);
`
          break
        case 'secondary':
          styles = `  background-color: var(--${prefix}color-secondary-500);
  color: var(--${prefix}color-neutral-50);
  border: 1px solid var(--${prefix}color-secondary-500);
`
          break
        case 'outline':
          styles = `  background-color: transparent;
  color: var(--${prefix}color-primary-500);
  border: 1px solid var(--${prefix}color-primary-500);
`
          break
        case 'ghost':
          styles = `  background-color: transparent;
  color: var(--${prefix}color-primary-500);
  border: 1px solid transparent;
`
          break
      }
    }

    return styles
  }

  private getSizeStyles(
    component: GeneratedComponent,
    size: string,
    tokens: any,
    options: CSSExportOptions
  ): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    let styles = ''
    
    if (component.name === 'Button') {
      switch (size) {
        case 'xs':
          styles = `  height: 1.75rem;
  padding: 0 var(--${prefix}spacing-2);
  font-size: var(--${prefix}font-size-xs);
`
          break
        case 'sm':
          styles = `  height: 2rem;
  padding: 0 var(--${prefix}spacing-3);
  font-size: var(--${prefix}font-size-sm);
`
          break
        case 'md':
          styles = `  height: 2.25rem;
  padding: 0 var(--${prefix}spacing-4);
  font-size: var(--${prefix}font-size-sm);
`
          break
        case 'lg':
          styles = `  height: 2.5rem;
  padding: 0 var(--${prefix}spacing-6);
  font-size: var(--${prefix}font-size-base);
`
          break
        case 'xl':
          styles = `  height: 2.75rem;
  padding: 0 var(--${prefix}spacing-8);
  font-size: var(--${prefix}font-size-base);
`
          break
      }
    }

    return styles
  }

  private getStateStyles(
    component: GeneratedComponent,
    state: string,
    tokens: any,
    options: CSSExportOptions
  ): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    let styles = ''
    
    switch (state) {
      case 'disabled':
        styles = `  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
`
        break
      case 'loading':
        styles = `  opacity: 0.7;
  cursor: wait;
`
        break
      case 'error':
        if (component.name === 'Input') {
          styles = `  border-color: var(--${prefix}color-error);
  color: var(--${prefix}color-error);
`
        }
        break
      case 'success':
        if (component.name === 'Input') {
          styles = `  border-color: var(--${prefix}color-success);
`
        }
        break
    }

    return styles
  }

  private generateUtilities(tokens: any, options: CSSExportOptions): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    let css = `/* Utility Classes */\n`

    // Spacing utilities
    css += `\n/* Spacing */\n`
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      css += `.${prefix}p-${key} { padding: ${value}; }\n`
      css += `.${prefix}pt-${key} { padding-top: ${value}; }\n`
      css += `.${prefix}pr-${key} { padding-right: ${value}; }\n`
      css += `.${prefix}pb-${key} { padding-bottom: ${value}; }\n`
      css += `.${prefix}pl-${key} { padding-left: ${value}; }\n`
      css += `.${prefix}px-${key} { padding-left: ${value}; padding-right: ${value}; }\n`
      css += `.${prefix}py-${key} { padding-top: ${value}; padding-bottom: ${value}; }\n`
      
      css += `.${prefix}m-${key} { margin: ${value}; }\n`
      css += `.${prefix}mt-${key} { margin-top: ${value}; }\n`
      css += `.${prefix}mr-${key} { margin-right: ${value}; }\n`
      css += `.${prefix}mb-${key} { margin-bottom: ${value}; }\n`
      css += `.${prefix}ml-${key} { margin-left: ${value}; }\n`
      css += `.${prefix}mx-${key} { margin-left: ${value}; margin-right: ${value}; }\n`
      css += `.${prefix}my-${key} { margin-top: ${value}; margin-bottom: ${value}; }\n`
    })

    // Typography utilities
    css += `\n/* Typography */\n`
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      css += `.${prefix}text-${key} { font-size: ${value}; }\n`
    })
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      css += `.${prefix}font-${key} { font-weight: ${value}; }\n`
    })
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      css += `.${prefix}leading-${key} { line-height: ${value}; }\n`
    })

    // Color utilities
    css += `\n/* Colors */\n`
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      css += `.${prefix}text-primary-${key} { color: ${value}; }\n`
      css += `.${prefix}bg-primary-${key} { background-color: ${value}; }\n`
      css += `.${prefix}border-primary-${key} { border-color: ${value}; }\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      css += `.${prefix}text-secondary-${key} { color: ${value}; }\n`
      css += `.${prefix}bg-secondary-${key} { background-color: ${value}; }\n`
      css += `.${prefix}border-secondary-${key} { border-color: ${value}; }\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      css += `.${prefix}text-neutral-${key} { color: ${value}; }\n`
      css += `.${prefix}bg-neutral-${key} { background-color: ${value}; }\n`
      css += `.${prefix}border-neutral-${key} { border-color: ${value}; }\n`
    })

    // Border radius utilities
    css += `\n/* Border Radius */\n`
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      css += `.${prefix}rounded-${key} { border-radius: ${value}; }\n`
    })

    // Shadow utilities
    css += `\n/* Shadows */\n`
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      css += `.${prefix}shadow-${key} { box-shadow: ${value}; }\n`
    })

    return css
  }

  private generateNormalize(tokens: any, options: CSSExportOptions): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    return `/* Normalize/Reset Styles */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
}

body {
  margin: 0;
  font-family: var(--${prefix}font-body);
  font-size: var(--${prefix}font-size-base);
  line-height: var(--${prefix}line-height-normal);
  color: var(--${prefix}color-neutral-900);
  background-color: var(--${prefix}color-neutral-50);
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

abbr:where([title]) {
  text-decoration: underline dotted;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  font-family: var(--${prefix}font-heading);
  font-weight: var(--${prefix}font-weight-semibold);
  line-height: var(--${prefix}line-height-tight);
}

a {
  color: var(--${prefix}color-primary-600);
  text-decoration: inherit;
}

a:hover {
  color: var(--${prefix}color-primary-700);
  text-decoration: underline;
}

b,
strong {
  font-weight: var(--${prefix}font-weight-bold);
}

code,
kbd,
samp,
pre {
  font-family: var(--${prefix}font-mono);
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

table {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: inherit;
  color: inherit;
  margin: 0;
}

button,
select {
  text-transform: none;
}

button,
[type='button'],
[type='reset'],
[type='submit'] {
  appearance: button;
  background-color: transparent;
  background-image: none;
}

:-moz-focusring {
  outline: auto;
}

:-moz-ui-invalid {
  box-shadow: none;
}

progress {
  vertical-align: baseline;
}

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

[type='search'] {
  appearance: textfield;
  outline-offset: -2px;
}

::-webkit-search-decoration {
  appearance: none;
}

::-webkit-file-upload-button {
  appearance: button;
  font: inherit;
}

summary {
  display: list-item;
}

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

textarea {
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  color: var(--${prefix}color-neutral-400);
}

button,
[role="button"] {
  cursor: pointer;
}

:disabled {
  cursor: default;
}

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  vertical-align: middle;
}

img,
video {
  max-width: 100%;
  height: auto;
}

[hidden] {
  display: none;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--${prefix}color-primary-500);
  outline-offset: 2px;
}
`
  }

  private generateDarkModeStyles(darkTheme: any, options: CSSExportOptions): string {
    let css = `/* Dark Mode Styles */\n`
    
    css += `[data-theme="dark"] {\n`
    css += `  color-scheme: dark;\n`
    Object.entries(darkTheme.cssVariables).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`
    })
    css += `}\n\n`

    css += `@media (prefers-color-scheme: dark) {\n`
    css += `  :root {\n`
    css += `    color-scheme: dark;\n`
    Object.entries(darkTheme.cssVariables).forEach(([key, value]) => {
      css += `    ${key}: ${value};\n`
    })
    css += `  }\n`
    css += `}\n`

    return css
  }

  private generateRTLStyles(tokens: any, options: CSSExportOptions): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    return `/* RTL Styles */

[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .${prefix}text-left {
  text-align: right;
}

[dir="rtl"] .${prefix}text-right {
  text-align: left;
}

[dir="rtl"] .${prefix}float-left {
  float: right;
}

[dir="rtl"] .${prefix}float-right {
  float: left;
}

[dir="rtl"] .${prefix}ml-auto {
  margin-right: auto;
  margin-left: 0;
}

[dir="rtl"] .${prefix}mr-auto {
  margin-left: auto;
  margin-right: 0;
}

[dir="rtl"] .${prefix}pl-0 {
  padding-right: 0;
  padding-left: initial;
}

[dir="rtl"] .${prefix}pr-0 {
  padding-left: 0;
  padding-right: initial;
}
`
  }

  private generateAnimations(tokens: any, options: CSSExportOptions): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    
    return `/* Animations */

@keyframes ${prefix}fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes ${prefix}fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes ${prefix}slide-in-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes ${prefix}slide-in-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes ${prefix}slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes ${prefix}slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes ${prefix}scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ${prefix}scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}

@keyframes ${prefix}spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ${prefix}pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ${prefix}bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Animation utility classes */
.${prefix}animate-fade-in {
  animation: ${prefix}fade-in var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-fade-out {
  animation: ${prefix}fade-out var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-slide-in-up {
  animation: ${prefix}slide-in-up var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-slide-in-down {
  animation: ${prefix}slide-in-down var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-slide-in-left {
  animation: ${prefix}slide-in-left var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-slide-in-right {
  animation: ${prefix}slide-in-right var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-scale-in {
  animation: ${prefix}scale-in var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-scale-out {
  animation: ${prefix}scale-out var(--${prefix}duration-normal) var(--${prefix}easing-ease);
}

.${prefix}animate-spin {
  animation: ${prefix}spin 1s linear infinite;
}

.${prefix}animate-pulse {
  animation: ${prefix}pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.${prefix}animate-bounce {
  animation: ${prefix}bounce 1s infinite;
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .${prefix}animate-fade-in,
  .${prefix}animate-fade-out,
  .${prefix}animate-slide-in-up,
  .${prefix}animate-slide-in-down,
  .${prefix}animate-slide-in-left,
  .${prefix}animate-slide-in-right,
  .${prefix}animate-scale-in,
  .${prefix}animate-scale-out,
  .${prefix}animate-spin,
  .${prefix}animate-pulse,
  .${prefix}animate-bounce {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`
  }

  private generateResponsiveStyles(tokens: any, options: CSSExportOptions): string {
    const prefix = options.prefix ? `${options.prefix}-` : ''
    let css = `/* Responsive Utilities */\n`

    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      css += `\n/* ${key} breakpoint: ${value} */\n`
      css += `@media (min-width: ${value}) {\n`
      
      // Generate responsive utilities for each breakpoint
      css += `  /* Spacing */\n`
      Object.entries(tokens.spacing).forEach(([spaceKey, spaceValue]) => {
        css += `  .${prefix}${key}\\:p-${spaceKey} { padding: ${spaceValue}; }\n`
        css += `  .${prefix}${key}\\:m-${spaceKey} { margin: ${spaceValue}; }\n`
      })
      
      css += `  /* Typography */\n`
      Object.entries(tokens.typography.fontSize).forEach(([sizeKey, sizeValue]) => {
        css += `  .${prefix}${key}\\:text-${sizeKey} { font-size: ${sizeValue}; }\n`
      })
      
      css += `  /* Display */\n`
      css += `  .${prefix}${key}\\:block { display: block; }\n`
      css += `  .${prefix}${key}\\:inline-block { display: inline-block; }\n`
      css += `  .${prefix}${key}\\:inline { display: inline; }\n`
      css += `  .${prefix}${key}\\:flex { display: flex; }\n`
      css += `  .${prefix}${key}\\:grid { display: grid; }\n`
      css += `  .${prefix}${key}\\:hidden { display: none; }\n`
      
      css += `}\n`
    })

    return css
  }

  private generateMainFile(result: CSSExportResult, options: CSSExportOptions): string {
    const imports = []
    
    if (options.includeNormalize) {
      imports.push(options.format === 'scss' ? '@import "normalize";' : '/* Normalize styles included */')
    }
    
    if (options.includeVariables) {
      imports.push(options.format === 'scss' ? '@import "variables";' : '/* Variables included */')
    }
    
    if (options.includeComponents) {
      imports.push(options.format === 'scss' ? '@import "components";' : '/* Components included */')
    }
    
    if (options.includeUtilities) {
      imports.push(options.format === 'scss' ? '@import "utilities";' : '/* Utilities included */')
    }

    let main = `/* Design System - Generated ${new Date().toISOString()} */\n\n`
    
    if (options.format === 'scss') {
      main += imports.join('\n') + '\n\n'
    } else {
      main += result.normalize + '\n\n'
      main += result.variables + '\n\n'
      main += result.components + '\n\n'
      main += result.utilities + '\n\n'
      
      if (result.darkMode) {
        main += result.darkMode + '\n\n'
      }
      
      if (result.rtl) {
        main += result.rtl + '\n\n'
      }
      
      if (result.animations) {
        main += result.animations + '\n\n'
      }
      
      if (result.responsive) {
        main += result.responsive + '\n\n'
      }
    }

    return main
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
      .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
      .replace(/\s*:\s*/g, ':') // Remove spaces around colons
      .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .trim()
  }

  private getDefaultOptions(): CSSExportOptions {
    return {
      format: 'css',
      includeVariables: true,
      includeComponents: true,
      includeUtilities: true,
      includeNormalize: true,
      includeDarkMode: true,
      includeRTL: false,
      includeAnimations: true,
      includeResponsive: true,
      prefix: '',
      minify: false,
      autoprefixer: true,
      generateSourceMaps: false
    }
  }
}

export const cssExporter = new CSSExporter()