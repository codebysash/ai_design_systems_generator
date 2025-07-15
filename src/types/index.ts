export interface ColorScale {
  '50': string
  '100': string
  '200': string
  '300': string
  '400': string
  '500': string
  '600': string
  '700': string
  '800': string
  '900': string
}

export interface DesignSystemConfig {
  name: string
  description: string
  style: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold'
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
    headingFont: string
    bodyFont: string
    monoFont: string
    scale: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
      '6xl': string
    }
    lineHeight: {
      tight: number
      snug: number
      normal: number
      relaxed: number
      loose: number
    }
    letterSpacing: {
      tight: string
      normal: string
      wide: string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    unit: number
    scale: number[]
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
  }
  animation: {
    transition: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      ease: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
}

export interface GeneratedComponent {
  name: string
  category: string
  code: string
  props: ComponentProp[]
  variants: ComponentVariant[]
  sizes: string[]
  description: string
  accessibility: string[]
  states: string[]
  examples?: ComponentExample[]
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  description: string
  default?: any
}

export interface ComponentVariant {
  name: string
  props: Record<string, any>
  description: string
  preview?: string
}

export interface ComponentExample {
  name: string
  code: string
  description?: string
}

export interface GeneratedDesignSystem {
  designSystem: DesignSystemConfig
  components: GeneratedComponent[]
  metadata: {
    version: string
    generatedAt: string
    totalComponents: number
    categories: string[]
  }
}

export interface DesignSystemGeneration {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  designSystem?: GeneratedDesignSystem
  error?: string
  createdAt: string
  updatedAt: string
}
