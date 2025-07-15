import { DesignSystemFormData } from '@/lib/validations'

interface PromptContext {
  formData: DesignSystemFormData
  targetLength?: 'concise' | 'detailed' | 'comprehensive'
  focus?: 'design' | 'technical' | 'balanced'
}

interface OptimizedPrompt {
  prompt: string
  estimatedTokens: number
  complexity: 'low' | 'medium' | 'high'
  reasoning: string[]
}

const STYLE_DESCRIPTORS = {
  modern: {
    visual: 'clean lines, subtle shadows, rounded corners, contemporary feel',
    colors: 'sophisticated color palettes with good contrast',
    typography: 'sans-serif fonts, clear hierarchy, generous spacing',
    components: 'minimalist design with subtle hover effects'
  },
  classic: {
    visual: 'timeless design, traditional proportions, balanced layouts',
    colors: 'refined color schemes, professional appearance',
    typography: 'serif or elegant sans-serif fonts, traditional hierarchy',
    components: 'established UI patterns with conservative styling'
  },
  playful: {
    visual: 'vibrant colors, creative shapes, engaging interactions',
    colors: 'bright, energetic color combinations with high contrast',
    typography: 'friendly fonts, varied sizes, dynamic spacing',
    components: 'animated elements, creative layouts, fun interactions'
  },
  minimal: {
    visual: 'maximum whitespace, simple forms, clean aesthetics',
    colors: 'neutral palettes with strategic accent colors',
    typography: 'simple fonts, clear hierarchy, restrained styling',
    components: 'stripped-down design focusing on functionality'
  },
  bold: {
    visual: 'strong contrasts, dramatic layouts, attention-grabbing elements',
    colors: 'high-contrast combinations, saturated colors',
    typography: 'impactful fonts, varied weights, dynamic sizing',
    components: 'statement pieces with strong visual presence'
  }
} as const

const INDUSTRY_CONTEXTS = {
  technology: {
    expectations: 'cutting-edge, innovative, data-focused interfaces',
    patterns: 'dashboards, forms, data visualization, technical documentation',
    accessibility: 'developer-friendly, keyboard navigation, screen reader support'
  },
  healthcare: {
    expectations: 'trustworthy, professional, clear information hierarchy',
    patterns: 'forms, patient information, appointment scheduling, alerts',
    accessibility: 'high contrast, large touch targets, clear labels'
  },
  finance: {
    expectations: 'secure, professional, data-heavy interfaces',
    patterns: 'tables, charts, transaction flows, security features',
    accessibility: 'precise data presentation, clear error states'
  },
  ecommerce: {
    expectations: 'conversion-focused, product showcasing, smooth checkout',
    patterns: 'product cards, shopping carts, filters, reviews',
    accessibility: 'clear pricing, accessible product information'
  },
  education: {
    expectations: 'clear learning paths, progress tracking, engaging content',
    patterns: 'course layouts, progress bars, interactive elements',
    accessibility: 'learning disabilities support, clear navigation'
  }
} as const

export function buildOptimizedPrompt(context: PromptContext): OptimizedPrompt {
  const { formData, targetLength = 'detailed', focus = 'balanced' } = context
  const reasoning: string[] = []

  // Base prompt structure
  let prompt = `Create a comprehensive design system for "${formData.name}".

Project Description: ${formData.description}

Design Requirements:`

  // Add style-specific guidance
  const styleInfo = STYLE_DESCRIPTORS[formData.style]
  if (styleInfo) {
    prompt += `\n- Style: ${formData.style} (${styleInfo.visual})`
    prompt += `\n- Color approach: ${styleInfo.colors}`
    prompt += `\n- Typography: ${styleInfo.typography}`
    prompt += `\n- Component style: ${styleInfo.components}`
    reasoning.push(`Enhanced ${formData.style} style with specific visual guidance`)
  }

  // Add industry context if provided
  if (formData.industry && formData.industry in INDUSTRY_CONTEXTS) {
    const industryInfo = INDUSTRY_CONTEXTS[formData.industry as keyof typeof INDUSTRY_CONTEXTS]
    prompt += `\n\nIndustry Context (${formData.industry}):`
    prompt += `\n- User expectations: ${industryInfo.expectations}`
    prompt += `\n- Common patterns: ${industryInfo.patterns}`
    prompt += `\n- Accessibility focus: ${industryInfo.accessibility}`
    reasoning.push(`Added industry-specific context for ${formData.industry}`)
  }

  // Add color constraints
  prompt += `\n\nColor System:`
  prompt += `\n- Primary color: ${formData.primaryColor}`
  prompt += `\n- Generate complementary secondary and accent colors`
  prompt += `\n- Ensure WCAG AA contrast ratios for text`
  prompt += `\n- Create both light and dark theme variants`

  // Add component prioritization
  if (formData.components && formData.components.length > 0) {
    prompt += `\n\nPrioritized Components: ${formData.components.join(', ')}`
    prompt += `\n- Focus on these component types first`
    prompt += `\n- Ensure consistency across all components`
    reasoning.push(`Prioritized ${formData.components.length} specific component types`)
  }

  // Add technical requirements based on focus
  if (focus === 'technical' || focus === 'balanced') {
    prompt += `\n\nTechnical Requirements:`
    prompt += `\n- Generate TypeScript interfaces for all design tokens`
    prompt += `\n- Include Tailwind CSS configuration`
    prompt += `\n- Provide CSS custom properties as fallback`
    prompt += `\n- Include component prop definitions`
    reasoning.push('Added technical implementation requirements')
  }

  // Add accessibility requirements
  prompt += `\n\nAccessibility Requirements:`
  prompt += `\n- WCAG 2.1 AA compliance for all components`
  prompt += `\n- Keyboard navigation support`
  prompt += `\n- Screen reader compatibility`
  prompt += `\n- Focus indicators and states`
  prompt += `\n- Color-blind friendly palette`

  // Adjust detail level based on target length
  if (targetLength === 'comprehensive') {
    prompt += `\n\nAdditional Requirements:`
    prompt += `\n- Include animation and transition guidelines`
    prompt += `\n- Responsive breakpoint system`
    prompt += `\n- Documentation for each component`
    prompt += `\n- Usage examples and best practices`
    reasoning.push('Added comprehensive documentation requirements')
  }

  // Add output format specification
  prompt += `\n\nOutput Format: Return a valid JSON object with the complete design system specification including colors, typography, spacing, components, and usage guidelines.`

  // Estimate complexity and tokens
  const estimatedTokens = Math.ceil(prompt.length / 3.5) // Rough estimation
  const complexity = estimatedTokens > 1500 ? 'high' : estimatedTokens > 800 ? 'medium' : 'low'

  return {
    prompt,
    estimatedTokens,
    complexity,
    reasoning
  }
}

export function validatePromptInputs(formData: DesignSystemFormData): string[] {
  const issues: string[] = []

  if (!formData.name.trim()) {
    issues.push('Design system name is required')
  }

  if (formData.description.length < 10) {
    issues.push('Description should be more detailed for better AI results')
  }

  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.primaryColor)) {
    issues.push('Invalid primary color format')
  }

  return issues
}

export function optimizePromptForModel(prompt: string, model: string): string {
  // Model-specific optimizations
  switch (model) {
    case 'gpt-4':
    case 'gpt-4-turbo':
      // GPT-4 handles complex prompts well, no changes needed
      return prompt
      
    case 'gpt-3.5-turbo':
      // Simplify for GPT-3.5
      return prompt.replace(/\n\n/g, '\n').replace(/- /g, '• ')
      
    default:
      return prompt
  }
}