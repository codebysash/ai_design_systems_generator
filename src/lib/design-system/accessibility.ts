import { GeneratedComponent, DesignSystemConfig } from '@/types'

export interface AccessibilityRule {
  id: string
  name: string
  description: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriteria: string
  category: 'keyboard' | 'screen-reader' | 'visual' | 'cognitive' | 'motor'
  componentTypes: string[]
  validator: (component: GeneratedComponent, designSystem: DesignSystemConfig) => AccessibilityViolation[]
  autoFix?: (component: GeneratedComponent, designSystem: DesignSystemConfig) => AccessibilityFix[]
}

export interface AccessibilityViolation {
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  message: string
  element?: string
  suggestion?: string
  wcagReference?: string
}

export interface AccessibilityFix {
  type: 'add-attribute' | 'modify-attribute' | 'add-element' | 'modify-style' | 'add-handler'
  target: string
  value: string
  description: string
}

export interface AccessibilityReport {
  componentName: string
  violations: AccessibilityViolation[]
  fixes: AccessibilityFix[]
  score: number
  wcagCompliance: {
    A: boolean
    AA: boolean
    AAA: boolean
  }
  summary: {
    totalRules: number
    passedRules: number
    failedRules: number
    coverage: number
  }
}

export class AccessibilityValidator {
  private rules: AccessibilityRule[] = []

  constructor() {
    this.initializeRules()
  }

  validateComponent(component: GeneratedComponent, designSystem: DesignSystemConfig): AccessibilityReport {
    const applicableRules = this.getApplicableRules(component)
    const violations: AccessibilityViolation[] = []
    const fixes: AccessibilityFix[] = []

    for (const rule of applicableRules) {
      const ruleViolations = rule.validator(component, designSystem)
      violations.push(...ruleViolations)

      if (rule.autoFix && ruleViolations.length > 0) {
        const ruleFixes = rule.autoFix(component, designSystem)
        fixes.push(...ruleFixes)
      }
    }

    const score = this.calculateAccessibilityScore(violations, applicableRules.length)
    const wcagCompliance = this.checkWCAGCompliance(violations)
    const summary = this.generateSummary(violations, applicableRules.length)

    return {
      componentName: component.name,
      violations,
      fixes,
      score,
      wcagCompliance,
      summary
    }
  }

  applyFixes(component: GeneratedComponent, fixes: AccessibilityFix[]): GeneratedComponent {
    let fixedComponent = { ...component }

    for (const fix of fixes) {
      fixedComponent = this.applyFix(fixedComponent, fix)
    }

    return fixedComponent
  }

  generateAccessibilityCode(component: GeneratedComponent, designSystem: DesignSystemConfig): string {
    const report = this.validateComponent(component, designSystem)
    const fixes = report.fixes

    let code = ''

    // Generate accessibility hooks
    code += this.generateAccessibilityHooks(component, fixes)

    // Generate ARIA attributes
    code += this.generateAriaAttributes(component, fixes)

    // Generate keyboard handlers
    code += this.generateKeyboardHandlers(component, fixes)

    // Generate focus management
    code += this.generateFocusManagement(component, fixes)

    // Generate screen reader announcements
    code += this.generateScreenReaderAnnouncements(component, fixes)

    return code
  }

  private initializeRules(): void {
    this.rules = [
      // Keyboard Navigation Rules
      {
        id: 'keyboard-navigation',
        name: 'Keyboard Navigation',
        description: 'Interactive elements must be keyboard accessible',
        wcagLevel: 'A',
        wcagCriteria: '2.1.1',
        category: 'keyboard',
        componentTypes: ['Button', 'Link', 'Input', 'Select', 'Textarea'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (!component.accessibility.includes('keyboard navigation')) {
            violations.push({
              ruleId: 'keyboard-navigation',
              severity: 'error',
              message: 'Component must support keyboard navigation',
              suggestion: 'Add onKeyDown handler and support for Enter/Space keys',
              wcagReference: 'WCAG 2.1.1 - Keyboard'
            })
          }

          return violations
        },
        autoFix: (component) => {
          return [
            {
              type: 'add-handler',
              target: 'onKeyDown',
              value: 'handleKeyDown',
              description: 'Add keyboard event handler'
            }
          ]
        }
      },

      // Focus Management Rules
      {
        id: 'focus-indicators',
        name: 'Focus Indicators',
        description: 'Interactive elements must have visible focus indicators',
        wcagLevel: 'AA',
        wcagCriteria: '2.4.7',
        category: 'visual',
        componentTypes: ['Button', 'Link', 'Input', 'Select', 'Textarea'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (!component.accessibility.includes('focus indicators')) {
            violations.push({
              ruleId: 'focus-indicators',
              severity: 'error',
              message: 'Component must have visible focus indicators',
              suggestion: 'Add focus-visible:ring-2 focus-visible:ring-offset-2 classes',
              wcagReference: 'WCAG 2.4.7 - Focus Visible'
            })
          }

          return violations
        },
        autoFix: (component) => {
          return [
            {
              type: 'add-attribute',
              target: 'className',
              value: 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring',
              description: 'Add focus indicator styles'
            }
          ]
        }
      },

      // Screen Reader Rules
      {
        id: 'screen-reader-support',
        name: 'Screen Reader Support',
        description: 'Components must be accessible to screen readers',
        wcagLevel: 'A',
        wcagCriteria: '4.1.2',
        category: 'screen-reader',
        componentTypes: ['Button', 'Link', 'Input', 'Select', 'Textarea', 'Modal', 'Alert'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (!component.accessibility.includes('screen reader support')) {
            violations.push({
              ruleId: 'screen-reader-support',
              severity: 'error',
              message: 'Component must support screen readers',
              suggestion: 'Add appropriate ARIA labels and roles',
              wcagReference: 'WCAG 4.1.2 - Name, Role, Value'
            })
          }

          return violations
        },
        autoFix: (component) => {
          const fixes: AccessibilityFix[] = []
          
          if (component.name === 'Button') {
            fixes.push({
              type: 'add-attribute',
              target: 'role',
              value: 'button',
              description: 'Add button role for screen readers'
            })
          }

          return fixes
        }
      },

      // Color Contrast Rules
      {
        id: 'color-contrast',
        name: 'Color Contrast',
        description: 'Text must have sufficient color contrast',
        wcagLevel: 'AA',
        wcagCriteria: '1.4.3',
        category: 'visual',
        componentTypes: ['Button', 'Link', 'Input', 'Select', 'Textarea', 'Card', 'Alert'],
        validator: (component, designSystem) => {
          const violations: AccessibilityViolation[] = []
          
          // Check if contrast ratios meet WCAG AA standards
          const contrastRatio = this.calculateContrastRatio(
            designSystem.colors.primary['500'],
            designSystem.colors.neutral['50']
          )

          if (contrastRatio < 4.5) {
            violations.push({
              ruleId: 'color-contrast',
              severity: 'error',
              message: `Color contrast ratio ${contrastRatio.toFixed(2)} is below WCAG AA standard (4.5:1)`,
              suggestion: 'Use darker colors or increase contrast',
              wcagReference: 'WCAG 1.4.3 - Contrast (Minimum)'
            })
          }

          return violations
        }
      },

      // Form Labels Rules
      {
        id: 'form-labels',
        name: 'Form Labels',
        description: 'Form inputs must have associated labels',
        wcagLevel: 'A',
        wcagCriteria: '3.3.2',
        category: 'screen-reader',
        componentTypes: ['Input', 'Select', 'Textarea'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (!component.accessibility.includes('label association')) {
            violations.push({
              ruleId: 'form-labels',
              severity: 'error',
              message: 'Form input must have an associated label',
              suggestion: 'Add htmlFor attribute to label or aria-label to input',
              wcagReference: 'WCAG 3.3.2 - Labels or Instructions'
            })
          }

          return violations
        },
        autoFix: (component) => {
          return [
            {
              type: 'add-attribute',
              target: 'aria-label',
              value: '${label || placeholder}',
              description: 'Add aria-label for accessibility'
            }
          ]
        }
      },

      // Modal and Dialog Rules
      {
        id: 'modal-focus-trap',
        name: 'Modal Focus Trap',
        description: 'Modals must trap focus within their content',
        wcagLevel: 'AA',
        wcagCriteria: '2.4.3',
        category: 'keyboard',
        componentTypes: ['Modal', 'Dialog', 'Popover'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (component.name === 'Modal' && !component.accessibility.includes('focus trap')) {
            violations.push({
              ruleId: 'modal-focus-trap',
              severity: 'error',
              message: 'Modal must trap focus within its content',
              suggestion: 'Implement focus trap with first/last focusable elements',
              wcagReference: 'WCAG 2.4.3 - Focus Order'
            })
          }

          return violations
        },
        autoFix: (component) => {
          return [
            {
              type: 'add-handler',
              target: 'onKeyDown',
              value: 'handleModalKeyDown',
              description: 'Add focus trap keyboard handler'
            }
          ]
        }
      },

      // Alternative Text Rules
      {
        id: 'alternative-text',
        name: 'Alternative Text',
        description: 'Images must have alternative text',
        wcagLevel: 'A',
        wcagCriteria: '1.1.1',
        category: 'screen-reader',
        componentTypes: ['Image', 'Avatar', 'Icon'],
        validator: (component) => {
          const violations: AccessibilityViolation[] = []
          
          if (component.name === 'Image' && !component.props.some(p => p.name === 'alt')) {
            violations.push({
              ruleId: 'alternative-text',
              severity: 'error',
              message: 'Image component must have alt text',
              suggestion: 'Add alt prop to image component',
              wcagReference: 'WCAG 1.1.1 - Non-text Content'
            })
          }

          return violations
        },
        autoFix: (component) => {
          return [
            {
              type: 'add-attribute',
              target: 'alt',
              value: '${alt || ""}',
              description: 'Add alt attribute for images'
            }
          ]
        }
      }
    ]
  }

  private getApplicableRules(component: GeneratedComponent): AccessibilityRule[] {
    return this.rules.filter(rule => 
      rule.componentTypes.includes(component.name) || 
      rule.componentTypes.includes('*')
    )
  }

  private calculateAccessibilityScore(violations: AccessibilityViolation[], totalRules: number): number {
    const errorCount = violations.filter(v => v.severity === 'error').length
    const warningCount = violations.filter(v => v.severity === 'warning').length
    
    const errorPenalty = errorCount * 15
    const warningPenalty = warningCount * 5
    
    const score = Math.max(0, 100 - errorPenalty - warningPenalty)
    return Math.round(score)
  }

  private checkWCAGCompliance(violations: AccessibilityViolation[]): { A: boolean; AA: boolean; AAA: boolean } {
    const levelAViolations = violations.filter(v => v.wcagReference?.includes('A'))
    const levelAAViolations = violations.filter(v => v.wcagReference?.includes('AA'))
    const levelAAAViolations = violations.filter(v => v.wcagReference?.includes('AAA'))

    return {
      A: levelAViolations.length === 0,
      AA: levelAAViolations.length === 0,
      AAA: levelAAAViolations.length === 0
    }
  }

  private generateSummary(violations: AccessibilityViolation[], totalRules: number) {
    const failedRules = violations.filter(v => v.severity === 'error').length
    const passedRules = totalRules - failedRules
    const coverage = totalRules > 0 ? (passedRules / totalRules) * 100 : 0

    return {
      totalRules,
      passedRules,
      failedRules,
      coverage: Math.round(coverage)
    }
  }

  private applyFix(component: GeneratedComponent, fix: AccessibilityFix): GeneratedComponent {
    const fixedComponent = { ...component }

    switch (fix.type) {
      case 'add-attribute':
        // Add accessibility attribute to component
        fixedComponent.accessibility = [...fixedComponent.accessibility, fix.description]
        break
      case 'add-handler':
        // Add event handler to component
        fixedComponent.accessibility = [...fixedComponent.accessibility, fix.description]
        break
      case 'add-element':
        // Add accessible element to component
        fixedComponent.accessibility = [...fixedComponent.accessibility, fix.description]
        break
      case 'modify-style':
        // Modify component styles for accessibility
        fixedComponent.accessibility = [...fixedComponent.accessibility, fix.description]
        break
    }

    return fixedComponent
  }

  private generateAccessibilityHooks(component: GeneratedComponent, fixes: AccessibilityFix[]): string {
    const hooks = []

    // Add useId hook if needed
    if (fixes.some(f => f.target.includes('id'))) {
      hooks.push('const id = useId()')
    }

    // Add focus management hooks
    if (component.name === 'Modal' || component.name === 'Dialog') {
      hooks.push('const [focusTrap, setFocusTrap] = useFocusTrap()')
    }

    // Add announcement hooks
    if (component.states.includes('loading') || component.states.includes('error')) {
      hooks.push('const announce = useAnnouncer()')
    }

    return hooks.join('\n  ')
  }

  private generateAriaAttributes(component: GeneratedComponent, fixes: AccessibilityFix[]): string {
    const attributes = []

    // Add role attribute
    const role = this.getComponentRole(component.name)
    if (role) {
      attributes.push(`role="${role}"`)
    }

    // Add aria-label if needed
    if (fixes.some(f => f.target === 'aria-label')) {
      attributes.push('aria-label={ariaLabel}')
    }

    // Add aria-describedby if needed
    if (fixes.some(f => f.target === 'aria-describedby')) {
      attributes.push('aria-describedby={`${id}-description`}')
    }

    // Add component-specific ARIA attributes
    if (component.name === 'Button' && component.variants.some(v => v.name === 'toggle')) {
      attributes.push('aria-pressed={pressed}')
    }

    if (component.name === 'Modal') {
      attributes.push('aria-modal="true"')
      attributes.push('aria-labelledby={`${id}-title`}')
    }

    return attributes.join('\n        ')
  }

  private generateKeyboardHandlers(component: GeneratedComponent, fixes: AccessibilityFix[]): string {
    if (!fixes.some(f => f.type === 'add-handler')) return ''

    const handlers = []

    // Basic keyboard navigation
    handlers.push(`
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onClick?.(event as any)
        break
      case 'Escape':
        if (onClose) {
          onClose()
        }
        break
    }
  }`)

    // Modal-specific keyboard handling
    if (component.name === 'Modal') {
      handlers.push(`
  const handleModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      handleFocusTrap(event)
    }
  }`)
    }

    return handlers.join('\n')
  }

  private generateFocusManagement(component: GeneratedComponent, fixes: AccessibilityFix[]): string {
    if (component.name !== 'Modal' && component.name !== 'Dialog') return ''

    return `
  const handleFocusTrap = (event: KeyboardEvent<HTMLDivElement>) => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }`
  }

  private generateScreenReaderAnnouncements(component: GeneratedComponent, fixes: AccessibilityFix[]): string {
    if (!component.states.includes('loading') && !component.states.includes('error')) return ''

    return `
  useEffect(() => {
    if (loading) {
      announce('Loading content, please wait')
    }
  }, [loading, announce])
  
  useEffect(() => {
    if (error) {
      announce(\`Error: \${error}\`, 'assertive')
    }
  }, [error, announce])`
  }

  private getComponentRole(componentName: string): string | null {
    const roles = {
      'Button': 'button',
      'Link': 'link',
      'Modal': 'dialog',
      'Alert': 'alert',
      'List': 'list',
      'Table': 'table',
      'Input': 'textbox',
      'Select': 'combobox',
      'Textarea': 'textbox'
    }

    return roles[componentName as keyof typeof roles] || null
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)
    
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private getLuminance(hex: string): number {
    // Simplified luminance calculation
    const rgb = this.hexToRgb(hex)
    if (!rgb) return 0
    
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
}

export const accessibilityValidator = new AccessibilityValidator()