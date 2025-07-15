export interface DesignSystemConfig {
  name: string
  description: string
  style: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  typography: {
    headingFont: string
    bodyFont: string
  }
  spacing: {
    unit: number
    scale: number[]
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

export interface GeneratedComponent {
  name: string
  code: string
  props: ComponentProp[]
  variants: ComponentVariant[]
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  description: string
}

export interface ComponentVariant {
  name: string
  props: Record<string, any>
  description: string
}
