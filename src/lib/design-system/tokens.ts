import { DesignSystemConfig, ColorScale } from '@/types'

export interface DesignTokens {
  colors: {
    primary: ColorScale
    secondary: ColorScale
    accent: ColorScale
    neutral: ColorScale
    semantic: {
      success: string
      warning: string
      error: string
      info: string
    }
  }
  typography: {
    fontFamily: {
      heading: string
      body: string
      mono: string
    }
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
    letterSpacing: Record<string, string>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animation: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
  breakpoints: Record<string, string>
}

export class DesignTokenGenerator {
  private colorUtils = new ColorUtils()
  private spacingUtils = new SpacingUtils()
  private typographyUtils = new TypographyUtils()

  generateTokens(designSystem: DesignSystemConfig): DesignTokens {
    return {
      colors: this.generateColorTokens(designSystem.colors),
      typography: this.generateTypographyTokens(designSystem.typography),
      spacing: this.generateSpacingTokens(designSystem.spacing),
      borderRadius: this.generateBorderRadiusTokens(designSystem.borderRadius),
      shadows: this.generateShadowTokens(designSystem.shadows),
      animation: this.generateAnimationTokens(designSystem.animation),
      breakpoints: this.generateBreakpointTokens(designSystem.breakpoints)
    }
  }

  private generateColorTokens(colors: DesignSystemConfig['colors']): DesignTokens['colors'] {
    return {
      primary: this.colorUtils.validateColorScale(colors.primary),
      secondary: this.colorUtils.validateColorScale(colors.secondary),
      accent: this.colorUtils.validateColorScale(colors.accent),
      neutral: this.colorUtils.validateColorScale(colors.neutral),
      semantic: this.colorUtils.validateSemanticColors(colors.semantic)
    }
  }

  private generateTypographyTokens(typography: DesignSystemConfig['typography']): DesignTokens['typography'] {
    return {
      fontFamily: {
        heading: this.typographyUtils.validateFontFamily(typography.headingFont),
        body: this.typographyUtils.validateFontFamily(typography.bodyFont),
        mono: this.typographyUtils.validateFontFamily(typography.monoFont)
      },
      fontSize: this.typographyUtils.validateFontSizes(typography.scale),
      fontWeight: this.typographyUtils.validateFontWeights(typography.fontWeight),
      lineHeight: this.typographyUtils.validateLineHeights(typography.lineHeight),
      letterSpacing: this.typographyUtils.validateLetterSpacing(typography.letterSpacing)
    }
  }

  private generateSpacingTokens(spacing: DesignSystemConfig['spacing']): Record<string, string> {
    return this.spacingUtils.generateSpacingScale(spacing.scale, spacing.unit)
  }

  private generateBorderRadiusTokens(borderRadius: DesignSystemConfig['borderRadius']): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(borderRadius)) {
      tokens[key] = this.spacingUtils.validateRemValue(value)
    }
    
    return tokens
  }

  private generateShadowTokens(shadows: DesignSystemConfig['shadows']): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(shadows)) {
      tokens[key] = this.colorUtils.validateShadowValue(value)
    }
    
    return tokens
  }

  private generateAnimationTokens(animation: DesignSystemConfig['animation']): DesignTokens['animation'] {
    return {
      duration: this.validateAnimationDurations(animation.transition),
      easing: this.validateAnimationEasing(animation.easing)
    }
  }

  private generateBreakpointTokens(breakpoints: DesignSystemConfig['breakpoints']): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(breakpoints)) {
      tokens[key] = this.spacingUtils.validatePixelValue(value)
    }
    
    return tokens
  }

  private validateAnimationDurations(durations: Record<string, string>): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(durations)) {
      tokens[key] = this.validateDurationValue(value)
    }
    
    return tokens
  }

  private validateAnimationEasing(easing: Record<string, string>): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(easing)) {
      tokens[key] = this.validateEasingValue(value)
    }
    
    return tokens
  }

  private validateDurationValue(value: string): string {
    const durationRegex = /^(\d+(\.\d+)?)(ms|s)$/
    return durationRegex.test(value) ? value : '0.2s'
  }

  private validateEasingValue(value: string): string {
    const easingFunctions = [
      'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
      'cubic-bezier'
    ]
    
    if (easingFunctions.some(fn => value.includes(fn))) {
      return value
    }
    
    return 'ease'
  }

  exportTokens(tokens: DesignTokens, format: 'css' | 'json' | 'js' | 'tailwind'): string {
    switch (format) {
      case 'css':
        return this.exportToCSS(tokens)
      case 'json':
        return this.exportToJSON(tokens)
      case 'js':
        return this.exportToJS(tokens)
      case 'tailwind':
        return this.exportToTailwind(tokens)
      default:
        return this.exportToJSON(tokens)
    }
  }

  private exportToCSS(tokens: DesignTokens): string {
    let css = ':root {\n'
    
    // Colors
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      css += `  --color-primary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      css += `  --color-secondary-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      css += `  --color-accent-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      css += `  --color-neutral-${key}: ${value};\n`
    })
    Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`
    })
    
    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      css += `  --font-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      css += `  --font-weight-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      css += `  --line-height-${key}: ${value};\n`
    })
    Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
      css += `  --letter-spacing-${key}: ${value};\n`
    })
    
    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`
    })
    
    // Border Radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      css += `  --border-radius-${key}: ${value};\n`
    })
    
    // Shadows
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      css += `  --shadow-${key}: ${value};\n`
    })
    
    // Animation
    Object.entries(tokens.animation.duration).forEach(([key, value]) => {
      css += `  --duration-${key}: ${value};\n`
    })
    Object.entries(tokens.animation.easing).forEach(([key, value]) => {
      css += `  --easing-${key}: ${value};\n`
    })
    
    // Breakpoints
    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      css += `  --breakpoint-${key}: ${value};\n`
    })
    
    css += '}'
    
    return css
  }

  private exportToJSON(tokens: DesignTokens): string {
    return JSON.stringify(tokens, null, 2)
  }

  private exportToJS(tokens: DesignTokens): string {
    return `export const designTokens = ${JSON.stringify(tokens, null, 2)}`
  }

  private exportToTailwind(tokens: DesignTokens): string {
    const config = {
      theme: {
        extend: {
          colors: {
            primary: tokens.colors.primary,
            secondary: tokens.colors.secondary,
            accent: tokens.colors.accent,
            neutral: tokens.colors.neutral,
            ...tokens.colors.semantic
          },
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.fontSize,
          fontWeight: tokens.typography.fontWeight,
          lineHeight: tokens.typography.lineHeight,
          letterSpacing: tokens.typography.letterSpacing,
          spacing: tokens.spacing,
          borderRadius: tokens.borderRadius,
          boxShadow: tokens.shadows,
          transitionDuration: tokens.animation.duration,
          transitionTimingFunction: tokens.animation.easing,
          screens: tokens.breakpoints
        }
      }
    }
    
    return `module.exports = ${JSON.stringify(config, null, 2)}`
  }
}

class ColorUtils {
  validateColorScale(scale: ColorScale): ColorScale {
    const validatedScale: ColorScale = {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a'
    }
    
    for (const [key, value] of Object.entries(scale)) {
      if (this.isValidHexColor(value)) {
        validatedScale[key as keyof ColorScale] = value
      }
    }
    
    return validatedScale
  }

  validateSemanticColors(colors: { success: string; warning: string; error: string; info: string }) {
    return {
      success: this.isValidHexColor(colors.success) ? colors.success : '#10b981',
      warning: this.isValidHexColor(colors.warning) ? colors.warning : '#f59e0b',
      error: this.isValidHexColor(colors.error) ? colors.error : '#ef4444',
      info: this.isValidHexColor(colors.info) ? colors.info : '#3b82f6'
    }
  }

  isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  validateShadowValue(value: string): string {
    const shadowRegex = /^(\d+px\s+\d+px\s+\d+px\s+\d+px\s+rgba?\([^)]+\))/
    return shadowRegex.test(value) ? value : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  }
}

class SpacingUtils {
  generateSpacingScale(scale: number[], unit: number): Record<string, string> {
    const tokens: Record<string, string> = {}
    
    scale.forEach(value => {
      const remValue = (value * unit) / 16
      tokens[value.toString()] = `${remValue}rem`
    })
    
    return tokens
  }

  validateRemValue(value: string): string {
    const remRegex = /^(\d+(\.\d+)?)(rem|px)$/
    return remRegex.test(value) ? value : '0.25rem'
  }

  validatePixelValue(value: string): string {
    const pixelRegex = /^(\d+)px$/
    return pixelRegex.test(value) ? value : '640px'
  }
}

class TypographyUtils {
  validateFontFamily(fontFamily: string): string {
    if (!fontFamily || fontFamily.trim() === '') {
      return 'Inter, sans-serif'
    }
    
    // Add fallback if not present
    if (!fontFamily.includes(',')) {
      if (fontFamily.toLowerCase().includes('mono')) {
        return `${fontFamily}, monospace`
      } else if (fontFamily.toLowerCase().includes('serif')) {
        return `${fontFamily}, serif`
      } else {
        return `${fontFamily}, sans-serif`
      }
    }
    
    return fontFamily
  }

  validateFontSizes(scale: Record<string, string>): Record<string, string> {
    const defaultScale = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    }
    
    const validated: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(scale)) {
      validated[key] = this.isValidFontSize(value) ? value : defaultScale[key as keyof typeof defaultScale] || '1rem'
    }
    
    return validated
  }

  validateFontWeights(weights: Record<string, number>): Record<string, number> {
    const validWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
    const validated: Record<string, number> = {}
    
    for (const [key, value] of Object.entries(weights)) {
      validated[key] = validWeights.includes(value) ? value : 400
    }
    
    return validated
  }

  validateLineHeights(lineHeights: Record<string, number>): Record<string, number> {
    const validated: Record<string, number> = {}
    
    for (const [key, value] of Object.entries(lineHeights)) {
      validated[key] = (value >= 1 && value <= 3) ? value : 1.5
    }
    
    return validated
  }

  validateLetterSpacing(letterSpacing: Record<string, string>): Record<string, string> {
    const validated: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(letterSpacing)) {
      validated[key] = this.isValidLetterSpacing(value) ? value : '0em'
    }
    
    return validated
  }

  private isValidFontSize(size: string): boolean {
    return /^(\d+(\.\d+)?)(rem|px|em)$/.test(size)
  }

  private isValidLetterSpacing(spacing: string): boolean {
    return /^-?(\d+(\.\d+)?)(em|px|rem)$/.test(spacing)
  }
}

export const designTokenGenerator = new DesignTokenGenerator()