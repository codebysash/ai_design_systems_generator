import { DesignSystemConfig, ColorScale } from '@/types'
import { designTokenGenerator } from './tokens'

export interface Theme {
  name: string
  displayName: string
  description: string
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
  typography: DesignSystemConfig['typography']
  mode: 'light' | 'dark'
  cssVariables: Record<string, string>
}

export interface ThemeVariant {
  name: string
  displayName: string
  description: string
  colorModifications: {
    primary?: Partial<ColorScale>
    secondary?: Partial<ColorScale>
    accent?: Partial<ColorScale>
    neutral?: Partial<ColorScale>
    semantic?: Partial<{
      success: string
      warning: string
      error: string
      info: string
    }>
  }
  typographyModifications?: Partial<DesignSystemConfig['typography']>
  spacingModifications?: Partial<DesignSystemConfig['spacing']>
}

export class ThemeGenerator {
  private colorUtils = new ThemeColorUtils()
  private variantUtils = new ThemeVariantUtils()

  generateTheme(designSystem: DesignSystemConfig, mode: 'light' | 'dark' = 'light'): Theme {
    const baseColors = mode === 'dark' ? 
      this.colorUtils.generateDarkModeColors(designSystem.colors) : 
      designSystem.colors

    const tokens = designTokenGenerator.generateTokens({
      ...designSystem,
      colors: baseColors
    })

    return {
      name: `${designSystem.name.toLowerCase().replace(/\s+/g, '-')}-${mode}`,
      displayName: `${designSystem.name} (${mode === 'light' ? 'Light' : 'Dark'})`,
      description: `${mode === 'light' ? 'Light' : 'Dark'} theme for ${designSystem.name}`,
      colors: baseColors,
      typography: designSystem.typography,
      mode,
      cssVariables: this.generateCSSVariables(tokens)
    }
  }

  generateThemeVariants(baseTheme: Theme): ThemeVariant[] {
    const variants: ThemeVariant[] = []

    // Accent color variants
    const accentVariants = this.variantUtils.generateAccentVariants(baseTheme.colors.accent)
    variants.push(...accentVariants.map(variant => ({
      name: `${baseTheme.name}-accent-${variant.name}`,
      displayName: `${baseTheme.displayName} - ${variant.displayName}`,
      description: `${baseTheme.displayName} with ${variant.displayName.toLowerCase()} accent`,
      colorModifications: {
        accent: variant.colors
      }
    })))

    // Intensity variants
    const intensityVariants = this.variantUtils.generateIntensityVariants(baseTheme.colors)
    variants.push(...intensityVariants.map(variant => ({
      name: `${baseTheme.name}-${variant.name}`,
      displayName: `${baseTheme.displayName} - ${variant.displayName}`,
      description: `${baseTheme.displayName} with ${variant.displayName.toLowerCase()} intensity`,
      colorModifications: variant.colorModifications
    })))

    // Typography variants
    const typographyVariants = this.variantUtils.generateTypographyVariants(baseTheme.typography)
    variants.push(...typographyVariants.map(variant => ({
      name: `${baseTheme.name}-${variant.name}`,
      displayName: `${baseTheme.displayName} - ${variant.displayName}`,
      description: `${baseTheme.displayName} with ${variant.displayName.toLowerCase()} typography`,
      colorModifications: {},
      typographyModifications: variant.modifications
    })))

    return variants
  }

  applyThemeVariant(baseTheme: Theme, variant: ThemeVariant): Theme {
    const modifiedColors = this.colorUtils.applyColorModifications(
      baseTheme.colors,
      variant.colorModifications
    )

    const modifiedTypography = variant.typographyModifications ? {
      ...baseTheme.typography,
      ...variant.typographyModifications
    } : baseTheme.typography

    const tokens = designTokenGenerator.generateTokens({
      name: baseTheme.name,
      description: baseTheme.description,
      style: 'modern' as const,
      colors: modifiedColors,
      typography: modifiedTypography,
      spacing: { unit: 4, scale: [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256] },
      borderRadius: { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px' },
      shadows: { sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' },
      animation: { transition: { fast: '0.15s', normal: '0.2s', slow: '0.3s' }, easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' } },
      breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' }
    })

    return {
      ...baseTheme,
      name: variant.name,
      displayName: variant.displayName,
      description: variant.description,
      colors: modifiedColors,
      typography: modifiedTypography,
      cssVariables: this.generateCSSVariables(tokens)
    }
  }

  private generateCSSVariables(tokens: any): Record<string, string> {
    const variables: Record<string, string> = {}

    // Color variables
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      variables[`--color-primary-${key}`] = value as string
    })
    Object.entries(tokens.colors.secondary).forEach(([key, value]) => {
      variables[`--color-secondary-${key}`] = value as string
    })
    Object.entries(tokens.colors.accent).forEach(([key, value]) => {
      variables[`--color-accent-${key}`] = value as string
    })
    Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
      variables[`--color-neutral-${key}`] = value as string
    })
    Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
      variables[`--color-${key}`] = value as string
    })

    // Typography variables
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      variables[`--font-${key}`] = value as string
    })
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      variables[`--font-size-${key}`] = value as string
    })
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      variables[`--font-weight-${key}`] = value as string
    })

    // Spacing variables
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value as string
    })

    // Border radius variables
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      variables[`--border-radius-${key}`] = value as string
    })

    // Shadow variables
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      variables[`--shadow-${key}`] = value as string
    })

    return variables
  }

  generateThemeCSS(theme: Theme): string {
    const selector = theme.mode === 'dark' ? '[data-theme="dark"]' : ':root'
    let css = `${selector} {\n`

    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`
    })

    css += '}\n'

    return css
  }

  generateThemeConfig(theme: Theme): string {
    const config = {
      name: theme.name,
      displayName: theme.displayName,
      description: theme.description,
      mode: theme.mode,
      tokens: theme.cssVariables
    }

    return JSON.stringify(config, null, 2)
  }
}

class ThemeColorUtils {
  generateDarkModeColors(lightColors: DesignSystemConfig['colors']): DesignSystemConfig['colors'] {
    return {
      primary: this.invertColorScale(lightColors.primary),
      secondary: this.invertColorScale(lightColors.secondary),
      accent: this.invertColorScale(lightColors.accent),
      neutral: this.generateDarkNeutralScale(),
      semantic: {
        success: this.darkenColor(lightColors.semantic.success),
        warning: this.darkenColor(lightColors.semantic.warning),
        error: this.darkenColor(lightColors.semantic.error),
        info: this.darkenColor(lightColors.semantic.info)
      }
    }
  }

  private invertColorScale(scale: ColorScale): ColorScale {
    return {
      '50': scale['900'],
      '100': scale['800'],
      '200': scale['700'],
      '300': scale['600'],
      '400': scale['500'],
      '500': scale['400'],
      '600': scale['300'],
      '700': scale['200'],
      '800': scale['100'],
      '900': scale['50']
    }
  }

  private generateDarkNeutralScale(): ColorScale {
    return {
      '50': '#0a0a0a',
      '100': '#171717',
      '200': '#262626',
      '300': '#404040',
      '400': '#525252',
      '500': '#737373',
      '600': '#a3a3a3',
      '700': '#d4d4d4',
      '800': '#e5e5e5',
      '900': '#f5f5f5'
    }
  }

  private darkenColor(color: string): string {
    // Simple color darkening - in a real implementation, you'd use a color library
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const amt = -40
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  applyColorModifications(
    baseColors: DesignSystemConfig['colors'],
    modifications: ThemeVariant['colorModifications']
  ): DesignSystemConfig['colors'] {
    const modified = { ...baseColors }

    if (modifications.primary) {
      modified.primary = { ...modified.primary, ...modifications.primary }
    }
    if (modifications.secondary) {
      modified.secondary = { ...modified.secondary, ...modifications.secondary }
    }
    if (modifications.accent) {
      modified.accent = { ...modified.accent, ...modifications.accent }
    }
    if (modifications.neutral) {
      modified.neutral = { ...modified.neutral, ...modifications.neutral }
    }
    if (modifications.semantic) {
      modified.semantic = { ...modified.semantic, ...modifications.semantic }
    }

    return modified
  }
}

class ThemeVariantUtils {
  generateAccentVariants(baseAccent: ColorScale): Array<{
    name: string
    displayName: string
    colors: Partial<ColorScale>
  }> {
    return [
      {
        name: 'warm',
        displayName: 'Warm Accent',
        colors: this.generateWarmAccentScale(baseAccent)
      },
      {
        name: 'cool',
        displayName: 'Cool Accent',
        colors: this.generateCoolAccentScale(baseAccent)
      },
      {
        name: 'vibrant',
        displayName: 'Vibrant Accent',
        colors: this.generateVibrantAccentScale(baseAccent)
      }
    ]
  }

  generateIntensityVariants(colors: DesignSystemConfig['colors']): Array<{
    name: string
    displayName: string
    colorModifications: ThemeVariant['colorModifications']
  }> {
    return [
      {
        name: 'subtle',
        displayName: 'Subtle',
        colorModifications: {
          primary: this.reduceIntensity(colors.primary),
          secondary: this.reduceIntensity(colors.secondary),
          accent: this.reduceIntensity(colors.accent)
        }
      },
      {
        name: 'bold',
        displayName: 'Bold',
        colorModifications: {
          primary: this.increaseIntensity(colors.primary),
          secondary: this.increaseIntensity(colors.secondary),
          accent: this.increaseIntensity(colors.accent)
        }
      }
    ]
  }

  generateTypographyVariants(typography: DesignSystemConfig['typography']): Array<{
    name: string
    displayName: string
    modifications: Partial<DesignSystemConfig['typography']>
  }> {
    return [
      {
        name: 'compact',
        displayName: 'Compact',
        modifications: {
          scale: this.generateCompactScale(typography.scale),
          lineHeight: this.generateCompactLineHeight(typography.lineHeight)
        }
      },
      {
        name: 'comfortable',
        displayName: 'Comfortable',
        modifications: {
          scale: this.generateComfortableScale(typography.scale),
          lineHeight: this.generateComfortableLineHeight(typography.lineHeight)
        }
      }
    ]
  }

  private generateWarmAccentScale(base: ColorScale): Partial<ColorScale> {
    // Shift colors towards warmer tones
    return {
      '500': this.shiftHue(base['500'], 30),
      '600': this.shiftHue(base['600'], 30),
      '700': this.shiftHue(base['700'], 30)
    }
  }

  private generateCoolAccentScale(base: ColorScale): Partial<ColorScale> {
    // Shift colors towards cooler tones
    return {
      '500': this.shiftHue(base['500'], -30),
      '600': this.shiftHue(base['600'], -30),
      '700': this.shiftHue(base['700'], -30)
    }
  }

  private generateVibrantAccentScale(base: ColorScale): Partial<ColorScale> {
    // Increase saturation
    return {
      '500': this.increaseSaturation(base['500']),
      '600': this.increaseSaturation(base['600']),
      '700': this.increaseSaturation(base['700'])
    }
  }

  private reduceIntensity(scale: ColorScale): Partial<ColorScale> {
    // Reduce contrast between shades
    return {
      '400': scale['300'],
      '500': scale['400'],
      '600': scale['500']
    }
  }

  private increaseIntensity(scale: ColorScale): Partial<ColorScale> {
    // Increase contrast between shades
    return {
      '400': scale['500'],
      '500': scale['600'],
      '600': scale['700']
    }
  }

  private generateCompactScale(scale: DesignSystemConfig['typography']['scale']): Partial<DesignSystemConfig['typography']['scale']> {
    return {
      xs: '0.7rem',
      sm: '0.8rem',
      base: '0.9rem',
      lg: '1rem',
      xl: '1.1rem',
      '2xl': '1.3rem',
      '3xl': '1.6rem'
    }
  }

  private generateComfortableScale(scale: DesignSystemConfig['typography']['scale']): Partial<DesignSystemConfig['typography']['scale']> {
    return {
      xs: '0.8rem',
      sm: '0.95rem',
      base: '1.1rem',
      lg: '1.3rem',
      xl: '1.5rem',
      '2xl': '1.8rem',
      '3xl': '2.2rem'
    }
  }

  private generateCompactLineHeight(lineHeight: DesignSystemConfig['typography']['lineHeight']): Partial<DesignSystemConfig['typography']['lineHeight']> {
    return {
      tight: 1.2,
      snug: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.6
    }
  }

  private generateComfortableLineHeight(lineHeight: DesignSystemConfig['typography']['lineHeight']): Partial<DesignSystemConfig['typography']['lineHeight']> {
    return {
      tight: 1.4,
      snug: 1.5,
      normal: 1.6,
      relaxed: 1.7,
      loose: 1.8
    }
  }

  private shiftHue(color: string, degrees: number): string {
    // Simplified hue shifting - in real implementation, use a color library
    return color
  }

  private increaseSaturation(color: string): string {
    // Simplified saturation increase - in real implementation, use a color library
    return color
  }
}

export const themeGenerator = new ThemeGenerator()