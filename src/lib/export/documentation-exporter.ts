import { GeneratedDesignSystem, GeneratedComponent, DesignSystemConfig } from '@/types'
import { designTokenGenerator } from '@/lib/design-system/tokens'
import { themeGenerator } from '@/lib/design-system/themes'
import { componentCodeGenerator } from '@/lib/design-system/code-generator'

export interface DocumentationExportOptions {
  format: 'markdown' | 'html' | 'json' | 'pdf'
  includeOverview: boolean
  includeTokens: boolean
  includeComponents: boolean
  includeUsageExamples: boolean
  includeCodeExamples: boolean
  includeAccessibility: boolean
  includeDesignPrinciples: boolean
  includeContribution: boolean
  includeChangelog: boolean
  includeTableOfContents: boolean
  includeNavigation: boolean
  includeSearch: boolean
  includeThemeToggle: boolean
  generateSeparateFiles: boolean
  includeAssets: boolean
  includeInteractiveExamples: boolean
  customSections: DocumentationSection[]
  template: 'default' | 'minimal' | 'comprehensive' | 'storybook'
  outputStyle: 'single-page' | 'multi-page' | 'component-pages'
  includeMetadata: boolean
  generateSitemap: boolean
  includeAnalytics: boolean
}

export interface DocumentationSection {
  title: string
  content: string
  order: number
  includeInToc: boolean
  category: 'overview' | 'tokens' | 'components' | 'guides' | 'api' | 'custom'
}

export interface DocumentationExportResult {
  files: DocumentationFile[]
  metadata: DocumentationMetadata
  assets?: DocumentationAsset[]
  sitemap?: string
  navigation?: NavigationItem[]
}

export interface DocumentationFile {
  path: string
  content: string
  type: 'markdown' | 'html' | 'json' | 'css' | 'js'
  category: string
  title: string
  description?: string
  keywords?: string[]
  lastModified: string
}

export interface DocumentationAsset {
  path: string
  content: string | Buffer
  type: 'image' | 'font' | 'icon' | 'video' | 'audio'
  mimeType: string
  size: number
}

export interface NavigationItem {
  title: string
  path: string
  children?: NavigationItem[]
  category: string
  order: number
}

export interface DocumentationMetadata {
  title: string
  description: string
  version: string
  author?: string
  license?: string
  repository?: string
  homepage?: string
  generatedAt: string
  totalFiles: number
  totalSize: number
  components: number
  tokens: number
  pages: number
}

export class DocumentationExporter {
  async exportDocumentation(
    designSystem: GeneratedDesignSystem,
    options: DocumentationExportOptions = this.getDefaultOptions()
  ): Promise<DocumentationExportResult> {
    const tokens = designTokenGenerator.generateTokens(designSystem.designSystem)
    const lightTheme = themeGenerator.generateTheme(designSystem.designSystem, 'light')
    const darkTheme = themeGenerator.generateTheme(designSystem.designSystem, 'dark')

    const files: DocumentationFile[] = []
    const assets: DocumentationAsset[] = []
    const navigation: NavigationItem[] = []

    // Generate main documentation files
    if (options.includeOverview) {
      files.push(await this.generateOverviewFile(designSystem, tokens, options))
    }

    if (options.includeTokens) {
      files.push(...await this.generateTokensFiles(designSystem, tokens, lightTheme, darkTheme, options))
    }

    if (options.includeComponents) {
      files.push(...await this.generateComponentsFiles(designSystem, tokens, options))
    }

    if (options.includeDesignPrinciples) {
      files.push(await this.generateDesignPrinciplesFile(designSystem, options))
    }

    if (options.includeAccessibility) {
      files.push(await this.generateAccessibilityFile(designSystem, options))
    }

    if (options.includeContribution) {
      files.push(await this.generateContributionFile(designSystem, options))
    }

    if (options.includeChangelog) {
      files.push(await this.generateChangelogFile(designSystem, options))
    }

    // Generate custom sections
    for (const section of options.customSections) {
      files.push(await this.generateCustomSectionFile(section, options))
    }

    // Generate navigation
    if (options.includeNavigation) {
      navigation.push(...this.generateNavigation(files, options))
    }

    // Generate assets
    if (options.includeAssets) {
      assets.push(...await this.generateAssets(designSystem, tokens, options))
    }

    // Generate sitemap
    let sitemap: string | undefined
    if (options.generateSitemap) {
      sitemap = this.generateSitemap(files, options)
    }

    // Generate metadata
    const metadata = this.generateMetadata(designSystem, files, options)

    return {
      files,
      metadata,
      assets,
      sitemap,
      navigation
    }
  }

  private async generateOverviewFile(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    const config = designSystem.designSystem
    
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# ${config.name || 'Design System'}

${config.description || 'A comprehensive design system for building consistent user interfaces.'}

## Overview

This design system provides a comprehensive set of design tokens, components, and guidelines to help you build consistent, accessible, and beautiful user interfaces.

### Key Features

- **Comprehensive Design Tokens**: Colors, typography, spacing, and more
- **Accessible Components**: WCAG 2.1 AA compliant components
- **Dark Mode Support**: Built-in dark theme support
- **Multiple Export Formats**: CSS, SCSS, Tailwind, and more
- **TypeScript Support**: Full TypeScript type definitions
- **Responsive Design**: Mobile-first responsive components

### Quick Start

1. Install the design system package
2. Import the tokens and components
3. Start building your application

### Design Tokens

This design system includes ${this.countTokens(tokens)} design tokens across the following categories:

- **Colors**: ${Object.keys(tokens.colors || {}).length} color tokens
- **Typography**: ${Object.keys(tokens.typography || {}).length} typography tokens
- **Spacing**: ${Object.keys(tokens.spacing || {}).length} spacing tokens
- **Border Radius**: ${Object.keys(tokens.borderRadius || {}).length} border radius tokens

### Components

The design system includes ${designSystem.components?.length || 0} components:

${designSystem.components?.map(component => `- **${component.name}**: ${component.description}`).join('\n') || ''}

### Getting Started

\`\`\`bash
npm install @your-org/design-system
\`\`\`

\`\`\`javascript
import { Button, Card } from '@your-org/design-system'
import '@your-org/design-system/dist/styles.css'

function App() {
  return (
    <Card>
      <Button variant="primary">Get Started</Button>
    </Card>
  )
}
\`\`\`

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### License

${config.license || 'MIT'}

### Contributing

We welcome contributions! Please see our [contribution guidelines](./CONTRIBUTING.md) for more information.
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>${config.name || 'Design System'}</h1>
        <p>${config.description || 'A comprehensive design system for building consistent user interfaces.'}</p>
        
        <h2>Overview</h2>
        <p>This design system provides a comprehensive set of design tokens, components, and guidelines to help you build consistent, accessible, and beautiful user interfaces.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li><strong>Comprehensive Design Tokens</strong>: Colors, typography, spacing, and more</li>
          <li><strong>Accessible Components</strong>: WCAG 2.1 AA compliant components</li>
          <li><strong>Dark Mode Support</strong>: Built-in dark theme support</li>
          <li><strong>Multiple Export Formats</strong>: CSS, SCSS, Tailwind, and more</li>
          <li><strong>TypeScript Support</strong>: Full TypeScript type definitions</li>
          <li><strong>Responsive Design</strong>: Mobile-first responsive components</li>
        </ul>
        
        <h3>Design Tokens</h3>
        <p>This design system includes ${this.countTokens(tokens)} design tokens across the following categories:</p>
        <ul>
          <li><strong>Colors</strong>: ${Object.keys(tokens.colors || {}).length} color tokens</li>
          <li><strong>Typography</strong>: ${Object.keys(tokens.typography || {}).length} typography tokens</li>
          <li><strong>Spacing</strong>: ${Object.keys(tokens.spacing || {}).length} spacing tokens</li>
          <li><strong>Border Radius</strong>: ${Object.keys(tokens.borderRadius || {}).length} border radius tokens</li>
        </ul>
        
        <h3>Components</h3>
        <p>The design system includes ${designSystem.components?.length || 0} components:</p>
        <ul>
          ${designSystem.components?.map(component => `<li><strong>${component.name}</strong>: ${component.description}</li>`).join('') || ''}
        </ul>
      `, 'Overview', options)
    }

    return {
      path: options.format === 'html' ? 'index.html' : 'README.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'overview',
      title: config.name || 'Design System',
      description: config.description,
      keywords: ['design system', 'tokens', 'components', 'ui'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateTokensFiles(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile[]> {
    const files: DocumentationFile[] = []

    if (options.generateSeparateFiles) {
      // Generate separate files for each token category
      for (const [category, categoryTokens] of Object.entries(tokens)) {
        files.push(await this.generateTokenCategoryFile(category, categoryTokens, lightTheme, darkTheme, options))
      }
    } else {
      // Generate single tokens file
      files.push(await this.generateAllTokensFile(tokens, lightTheme, darkTheme, options))
    }

    return files
  }

  private async generateTokenCategoryFile(
    category: string,
    categoryTokens: any,
    lightTheme: any,
    darkTheme: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
    
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# ${categoryName} Tokens

${this.getCategoryDescription(category)}

## Tokens

${this.generateTokensTable(categoryTokens, category)}

${options.includeCodeExamples ? this.generateTokensCodeExamples(categoryTokens, category) : ''}

${options.includeUsageExamples ? this.generateTokensUsageExamples(categoryTokens, category) : ''}
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>${categoryName} Tokens</h1>
        <p>${this.getCategoryDescription(category)}</p>
        
        <h2>Tokens</h2>
        ${this.generateTokensHTMLTable(categoryTokens, category)}
        
        ${options.includeCodeExamples ? `<h2>Code Examples</h2>${this.generateTokensCodeExamplesHTML(categoryTokens, category)}` : ''}
        
        ${options.includeUsageExamples ? `<h2>Usage Examples</h2>${this.generateTokensUsageExamplesHTML(categoryTokens, category)}` : ''}
      `, `${categoryName} Tokens`, options)
    }

    return {
      path: options.format === 'html' ? `tokens/${category}.html` : `tokens/${category}.md`,
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'tokens',
      title: `${categoryName} Tokens`,
      description: this.getCategoryDescription(category),
      keywords: ['tokens', category],
      lastModified: new Date().toISOString()
    }
  }

  private async generateAllTokensFile(
    tokens: any,
    lightTheme: any,
    darkTheme: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Design Tokens

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## Token Categories

${Object.keys(tokens).map(category => `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category})`).join('\n')}

${Object.entries(tokens).map(([category, categoryTokens]) => `
## ${category.charAt(0).toUpperCase() + category.slice(1)}

${this.getCategoryDescription(category)}

${this.generateTokensTable(categoryTokens, category)}

${options.includeCodeExamples ? this.generateTokensCodeExamples(categoryTokens, category) : ''}
`).join('\n')}
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Design Tokens</h1>
        <p>Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.</p>
        
        <h2>Token Categories</h2>
        <ul>
          ${Object.keys(tokens).map(category => `<li><a href="#${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</a></li>`).join('')}
        </ul>
        
        ${Object.entries(tokens).map(([category, categoryTokens]) => `
          <h2 id="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <p>${this.getCategoryDescription(category)}</p>
          ${this.generateTokensHTMLTable(categoryTokens, category)}
          ${options.includeCodeExamples ? this.generateTokensCodeExamplesHTML(categoryTokens, category) : ''}
        `).join('')}
      `, 'Design Tokens', options)
    }

    return {
      path: options.format === 'html' ? 'tokens.html' : 'tokens.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'tokens',
      title: 'Design Tokens',
      description: 'Complete reference of all design tokens',
      keywords: ['tokens', 'design tokens', 'variables'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateComponentsFiles(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile[]> {
    const files: DocumentationFile[] = []
    const components = designSystem.components || []

    if (options.generateSeparateFiles) {
      // Generate separate files for each component
      for (const component of components) {
        files.push(await this.generateComponentFile(component, designSystem, tokens, options))
      }
    } else {
      // Generate single components file
      files.push(await this.generateAllComponentsFile(components, designSystem, tokens, options))
    }

    return files
  }

  private async generateComponentFile(
    component: GeneratedComponent,
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# ${component.name}

${component.description}

## Props

${this.generatePropsTable(component.props)}

## Variants

${component.variants.map(variant => `
### ${variant.name}

${variant.description}

${options.includeCodeExamples ? this.generateComponentCodeExample(component, variant.name, options) : ''}
`).join('\n')}

## Sizes

${component.sizes.map(size => `- **${size}**: ${this.getSizeDescription(size)}`).join('\n')}

${options.includeAccessibility ? `## Accessibility

${component.accessibility.map(feature => `- ${feature}`).join('\n')}` : ''}

${options.includeUsageExamples ? this.generateComponentUsageExamples(component, options) : ''}
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>${component.name}</h1>
        <p>${component.description}</p>
        
        <h2>Props</h2>
        ${this.generatePropsHTMLTable(component.props)}
        
        <h2>Variants</h2>
        ${component.variants.map(variant => `
          <h3>${variant.name}</h3>
          <p>${variant.description}</p>
          ${options.includeCodeExamples ? this.generateComponentCodeExampleHTML(component, variant.name, options) : ''}
        `).join('')}
        
        <h2>Sizes</h2>
        <ul>
          ${component.sizes.map(size => `<li><strong>${size}</strong>: ${this.getSizeDescription(size)}</li>`).join('')}
        </ul>
        
        ${options.includeAccessibility ? `
          <h2>Accessibility</h2>
          <ul>
            ${component.accessibility.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${options.includeUsageExamples ? this.generateComponentUsageExamplesHTML(component, options) : ''}
      `, component.name, options)
    }

    return {
      path: options.format === 'html' ? `components/${component.name.toLowerCase()}.html` : `components/${component.name.toLowerCase()}.md`,
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'components',
      title: component.name,
      description: component.description,
      keywords: ['component', component.name.toLowerCase(), ...component.variants.map(v => v.name)],
      lastModified: new Date().toISOString()
    }
  }

  private async generateAllComponentsFile(
    components: GeneratedComponent[],
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Components

This design system includes ${components.length} components, each designed to be accessible, consistent, and easy to use.

## Component List

${components.map(component => `- [${component.name}](#${component.name.toLowerCase()})`).join('\n')}

${components.map(component => `
## ${component.name}

${component.description}

### Props

${this.generatePropsTable(component.props)}

### Variants

${component.variants.map(variant => `- **${variant.name}**: ${variant.description}`).join('\n')}

### Sizes

${component.sizes.map(size => `- **${size}**: ${this.getSizeDescription(size)}`).join('\n')}

${options.includeAccessibility ? `### Accessibility

${component.accessibility.map(feature => `- ${feature}`).join('\n')}` : ''}

${options.includeCodeExamples ? this.generateComponentCodeExample(component, component.variants[0]?.name || 'default', options) : ''}
`).join('\n')}
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Components</h1>
        <p>This design system includes ${components.length} components, each designed to be accessible, consistent, and easy to use.</p>
        
        <h2>Component List</h2>
        <ul>
          ${components.map(component => `<li><a href="#${component.name.toLowerCase()}">${component.name}</a></li>`).join('')}
        </ul>
        
        ${components.map(component => `
          <h2 id="${component.name.toLowerCase()}">${component.name}</h2>
          <p>${component.description}</p>
          
          <h3>Props</h3>
          ${this.generatePropsHTMLTable(component.props)}
          
          <h3>Variants</h3>
          <ul>
            ${component.variants.map(variant => `<li><strong>${variant.name}</strong>: ${variant.description}</li>`).join('')}
          </ul>
          
          <h3>Sizes</h3>
          <ul>
            ${component.sizes.map(size => `<li><strong>${size}</strong>: ${this.getSizeDescription(size)}</li>`).join('')}
          </ul>
          
          ${options.includeAccessibility ? `
            <h3>Accessibility</h3>
            <ul>
              ${component.accessibility.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${options.includeCodeExamples ? this.generateComponentCodeExampleHTML(component, component.variants[0]?.name || 'default', options) : ''}
        `).join('')}
      `, 'Components', options)
    }

    return {
      path: options.format === 'html' ? 'components.html' : 'components.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'components',
      title: 'Components',
      description: 'Complete reference of all components',
      keywords: ['components', 'ui', 'interface'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateDesignPrinciplesFile(
    designSystem: GeneratedDesignSystem,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Design Principles

Our design system is built on a foundation of key principles that guide every decision we make.

## Core Principles

### 1. Accessibility First
Every component and token is designed with accessibility in mind. We follow WCAG 2.1 AA guidelines to ensure our design system is usable by everyone.

### 2. Consistency
Consistent patterns and behaviors create predictable experiences. Our design tokens and components provide a unified language for design and development.

### 3. Flexibility
While maintaining consistency, our system allows for customization and adaptation to different contexts and use cases.

### 4. Performance
We prioritize performance in every aspect of our design system, from optimized code to efficient design tokens.

### 5. Scalability
Our system is designed to grow with your needs, supporting everything from small applications to large enterprise systems.

## Implementation Guidelines

### Use Semantic Tokens
Always use semantic tokens (like \`color-text-primary\`) instead of raw values (like \`#000000\`).

### Follow Component Patterns
Use our established component patterns to maintain consistency across your application.

### Test for Accessibility
Always test your implementations with screen readers and keyboard navigation.

### Document Your Customizations
When extending the system, document your customizations for future maintainers.

## Design Philosophy

Our design philosophy centers on creating interfaces that are:

- **Intuitive**: Users should be able to understand and use our interfaces without extensive training
- **Efficient**: Interfaces should help users accomplish their goals quickly and effectively
- **Inclusive**: Our designs should work for users of all abilities and backgrounds
- **Delightful**: While being functional, our interfaces should also be pleasant to use

## Brand Values

- **Clarity**: Clear communication through design
- **Reliability**: Consistent and dependable experiences
- **Innovation**: Progressive enhancement and modern approaches
- **Inclusivity**: Designing for everyone
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Design Principles</h1>
        <p>Our design system is built on a foundation of key principles that guide every decision we make.</p>
        
        <h2>Core Principles</h2>
        
        <h3>1. Accessibility First</h3>
        <p>Every component and token is designed with accessibility in mind. We follow WCAG 2.1 AA guidelines to ensure our design system is usable by everyone.</p>
        
        <h3>2. Consistency</h3>
        <p>Consistent patterns and behaviors create predictable experiences. Our design tokens and components provide a unified language for design and development.</p>
        
        <h3>3. Flexibility</h3>
        <p>While maintaining consistency, our system allows for customization and adaptation to different contexts and use cases.</p>
        
        <h3>4. Performance</h3>
        <p>We prioritize performance in every aspect of our design system, from optimized code to efficient design tokens.</p>
        
        <h3>5. Scalability</h3>
        <p>Our system is designed to grow with your needs, supporting everything from small applications to large enterprise systems.</p>
        
        <h2>Implementation Guidelines</h2>
        
        <h3>Use Semantic Tokens</h3>
        <p>Always use semantic tokens (like <code>color-text-primary</code>) instead of raw values (like <code>#000000</code>).</p>
        
        <h3>Follow Component Patterns</h3>
        <p>Use our established component patterns to maintain consistency across your application.</p>
        
        <h3>Test for Accessibility</h3>
        <p>Always test your implementations with screen readers and keyboard navigation.</p>
        
        <h3>Document Your Customizations</h3>
        <p>When extending the system, document your customizations for future maintainers.</p>
      `, 'Design Principles', options)
    }

    return {
      path: options.format === 'html' ? 'principles.html' : 'principles.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'guides',
      title: 'Design Principles',
      description: 'Core principles and guidelines for the design system',
      keywords: ['principles', 'guidelines', 'philosophy'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateAccessibilityFile(
    designSystem: GeneratedDesignSystem,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Accessibility

Accessibility is a core principle of our design system. We are committed to creating inclusive experiences that work for everyone.

## Standards Compliance

Our design system follows:

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines Level AA
- **Section 508**: U.S. federal accessibility requirements
- **ADA**: Americans with Disabilities Act guidelines

## Key Features

### Color Contrast
All color combinations meet WCAG 2.1 AA contrast requirements:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum

### Keyboard Navigation
All interactive elements are keyboard accessible:
- Tab order follows logical reading order
- Focus indicators are clearly visible
- Keyboard shortcuts are documented

### Screen Reader Support
Components include proper ARIA labels and descriptions:
- Semantic HTML elements
- ARIA landmarks and roles
- Descriptive alt text for images

### Motor Accessibility
Interactive elements meet minimum size requirements:
- Touch targets are at least 44x44 pixels
- Adequate spacing between interactive elements
- Support for hover, focus, and active states

## Testing Guidelines

### Automated Testing
Use these tools for automated accessibility testing:
- axe-core for automated auditing
- Lighthouse accessibility audit
- WAVE web accessibility evaluation tool

### Manual Testing
Perform these manual tests:
- Navigate using only keyboard
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify color contrast ratios
- Test at 200% zoom level

### User Testing
Include users with disabilities in your testing process:
- Recruit participants with various disabilities
- Test with assistive technologies
- Gather feedback on real-world usage

## Implementation Checklist

### For Developers
- [ ] Use semantic HTML elements
- [ ] Include proper ARIA labels
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Validate color contrast
- [ ] Test at high zoom levels

### For Designers
- [ ] Design with sufficient color contrast
- [ ] Consider focus states for all interactive elements
- [ ] Provide alternative text for images
- [ ] Design for keyboard navigation
- [ ] Test designs with accessibility tools

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/download/) (Windows, Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/mac/vision/) (macOS, Built-in)
- [Orca](https://help.gnome.org/users/orca/stable/) (Linux)
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Accessibility</h1>
        <p>Accessibility is a core principle of our design system. We are committed to creating inclusive experiences that work for everyone.</p>
        
        <h2>Standards Compliance</h2>
        <p>Our design system follows:</p>
        <ul>
          <li><strong>WCAG 2.1 AA</strong>: Web Content Accessibility Guidelines Level AA</li>
          <li><strong>Section 508</strong>: U.S. federal accessibility requirements</li>
          <li><strong>ADA</strong>: Americans with Disabilities Act guidelines</li>
        </ul>
        
        <h2>Key Features</h2>
        
        <h3>Color Contrast</h3>
        <p>All color combinations meet WCAG 2.1 AA contrast requirements:</p>
        <ul>
          <li>Normal text: 4.5:1 contrast ratio minimum</li>
          <li>Large text: 3:1 contrast ratio minimum</li>
        </ul>
        
        <h3>Keyboard Navigation</h3>
        <p>All interactive elements are keyboard accessible:</p>
        <ul>
          <li>Tab order follows logical reading order</li>
          <li>Focus indicators are clearly visible</li>
          <li>Keyboard shortcuts are documented</li>
        </ul>
        
        <h3>Screen Reader Support</h3>
        <p>Components include proper ARIA labels and descriptions:</p>
        <ul>
          <li>Semantic HTML elements</li>
          <li>ARIA landmarks and roles</li>
          <li>Descriptive alt text for images</li>
        </ul>
      `, 'Accessibility', options)
    }

    return {
      path: options.format === 'html' ? 'accessibility.html' : 'accessibility.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'guides',
      title: 'Accessibility',
      description: 'Accessibility guidelines and standards',
      keywords: ['accessibility', 'a11y', 'wcag', 'inclusive'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateContributionFile(
    designSystem: GeneratedDesignSystem,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Contributing

We welcome contributions to our design system! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/design-system.git
cd design-system

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build the project
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # React components
├── tokens/             # Design tokens
├── styles/             # CSS and SCSS files
├── docs/               # Documentation
├── tests/              # Test files
└── utils/              # Utility functions
\`\`\`

## Contribution Guidelines

### Code Style
- Follow existing code style and conventions
- Use TypeScript for all new code
- Include proper type definitions
- Write descriptive commit messages

### Testing
- Write tests for new components and features
- Ensure all tests pass before submitting
- Include accessibility tests
- Test across different browsers

### Documentation
- Update documentation for new features
- Include code examples and usage guidelines
- Document any breaking changes
- Update the changelog

## Types of Contributions

### Bug Fixes
- Search existing issues before creating new ones
- Provide clear reproduction steps
- Include relevant browser and version information

### New Components
- Follow existing component patterns
- Include all necessary variants and states
- Ensure accessibility compliance
- Write comprehensive tests

### Design Tokens
- Maintain consistency with existing tokens
- Document the purpose and usage
- Consider impact on existing components

### Documentation
- Improve clarity and completeness
- Add examples and use cases
- Fix typos and formatting issues

## Review Process

1. **Initial Review**: Maintainers will review for basic requirements
2. **Technical Review**: Code quality and architecture review
3. **Design Review**: Visual and UX consistency review
4. **Accessibility Review**: Compliance with accessibility standards
5. **Testing**: Automated and manual testing
6. **Approval**: Final approval and merge

## Release Process

We follow semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the code of conduct

## Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Annual contributor spotlight

Thank you for contributing to our design system!
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Contributing</h1>
        <p>We welcome contributions to our design system! This guide will help you get started.</p>
        
        <h2>Getting Started</h2>
        <ol>
          <li>Fork the repository</li>
          <li>Create a feature branch</li>
          <li>Make your changes</li>
          <li>Test your changes</li>
          <li>Submit a pull request</li>
        </ol>
        
        <h2>Development Setup</h2>
        <pre><code># Clone the repository
git clone https://github.com/your-org/design-system.git
cd design-system

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build the project
npm run build</code></pre>
        
        <h2>Contribution Guidelines</h2>
        
        <h3>Code Style</h3>
        <ul>
          <li>Follow existing code style and conventions</li>
          <li>Use TypeScript for all new code</li>
          <li>Include proper type definitions</li>
          <li>Write descriptive commit messages</li>
        </ul>
        
        <h3>Testing</h3>
        <ul>
          <li>Write tests for new components and features</li>
          <li>Ensure all tests pass before submitting</li>
          <li>Include accessibility tests</li>
          <li>Test across different browsers</li>
        </ul>
      `, 'Contributing', options)
    }

    return {
      path: options.format === 'html' ? 'contributing.html' : 'contributing.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'guides',
      title: 'Contributing',
      description: 'Guide for contributing to the design system',
      keywords: ['contributing', 'development', 'guidelines'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateChangelogFile(
    designSystem: GeneratedDesignSystem,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# Changelog

All notable changes to this design system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release of the design system
- ${designSystem.components?.length || 0} components with full accessibility support
- Comprehensive design tokens including colors, typography, and spacing
- Dark mode support
- Multiple export formats (CSS, SCSS, Tailwind, JSON)
- TypeScript support with full type definitions
- Responsive design patterns
- WCAG 2.1 AA accessibility compliance

### Components
${designSystem.components?.map(component => `- **${component.name}**: ${component.description}`).join('\n') || ''}

### Design Tokens
- Color system with semantic naming
- Typography scale with heading and body fonts
- Spacing system with consistent scale
- Border radius tokens for consistent corner styles
- Elevation tokens for depth and shadows

### Documentation
- Complete component documentation
- Design token reference
- Accessibility guidelines
- Contribution guidelines
- Usage examples and code snippets

## [Unreleased]

### Added
- [ ] Additional component variants
- [ ] Enhanced animation tokens
- [ ] Improved dark mode support
- [ ] Mobile component optimizations

### Changed
- [ ] Updated color contrast ratios
- [ ] Improved component accessibility
- [ ] Enhanced TypeScript types

### Fixed
- [ ] Minor styling inconsistencies
- [ ] Accessibility improvements
- [ ] Browser compatibility issues

---

## Version History

### Version 1.0.0 (${new Date().toISOString().split('T')[0]})
- Initial release
- Complete design system with tokens and components
- Full accessibility compliance
- Documentation and guidelines

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for information on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>Changelog</h1>
        <p>All notable changes to this design system will be documented in this file.</p>
        
        <h2>[1.0.0] - ${new Date().toISOString().split('T')[0]}</h2>
        
        <h3>Added</h3>
        <ul>
          <li>Initial release of the design system</li>
          <li>${designSystem.components?.length || 0} components with full accessibility support</li>
          <li>Comprehensive design tokens including colors, typography, and spacing</li>
          <li>Dark mode support</li>
          <li>Multiple export formats (CSS, SCSS, Tailwind, JSON)</li>
          <li>TypeScript support with full type definitions</li>
          <li>Responsive design patterns</li>
          <li>WCAG 2.1 AA accessibility compliance</li>
        </ul>
        
        <h3>Components</h3>
        <ul>
          ${designSystem.components?.map(component => `<li><strong>${component.name}</strong>: ${component.description}</li>`).join('') || ''}
        </ul>
        
        <h3>Design Tokens</h3>
        <ul>
          <li>Color system with semantic naming</li>
          <li>Typography scale with heading and body fonts</li>
          <li>Spacing system with consistent scale</li>
          <li>Border radius tokens for consistent corner styles</li>
          <li>Elevation tokens for depth and shadows</li>
        </ul>
      `, 'Changelog', options)
    }

    return {
      path: options.format === 'html' ? 'changelog.html' : 'changelog.md',
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: 'guides',
      title: 'Changelog',
      description: 'Version history and changes',
      keywords: ['changelog', 'history', 'versions'],
      lastModified: new Date().toISOString()
    }
  }

  private async generateCustomSectionFile(
    section: DocumentationSection,
    options: DocumentationExportOptions
  ): Promise<DocumentationFile> {
    let content = ''
    
    if (options.format === 'markdown') {
      content = `# ${section.title}

${section.content}
`
    } else if (options.format === 'html') {
      content = this.generateHTMLWrapper(`
        <h1>${section.title}</h1>
        <div>${section.content}</div>
      `, section.title, options)
    }

    return {
      path: options.format === 'html' ? `${section.title.toLowerCase().replace(/\s+/g, '-')}.html` : `${section.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      content,
      type: options.format === 'html' ? 'html' : 'markdown',
      category: section.category,
      title: section.title,
      description: section.content.substring(0, 200) + '...',
      keywords: [section.title.toLowerCase()],
      lastModified: new Date().toISOString()
    }
  }

  // Helper methods
  private generateHTMLWrapper(content: string, title: string, options: DocumentationExportOptions): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background: #f5f5f5;
        }
        .color-swatch {
            width: 20px;
            height: 20px;
            border-radius: 3px;
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`
  }

  private generateTokensTable(tokens: any, category: string): string {
    let table = '| Token | Value | Preview |\n'
    table += '|-------|-------|----------|\n'
    
    const generateTokenRows = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const tokenName = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          generateTokenRows(value, tokenName)
        } else {
          const preview = this.generateTokenPreview(value, category)
          table += `| ${tokenName} | ${value} | ${preview} |\n`
        }
      }
    }
    
    generateTokenRows(tokens)
    return table
  }

  private generateTokensHTMLTable(tokens: any, category: string): string {
    let table = '<table><thead><tr><th>Token</th><th>Value</th><th>Preview</th></tr></thead><tbody>'
    
    const generateTokenRows = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const tokenName = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          generateTokenRows(value, tokenName)
        } else {
          const preview = this.generateTokenPreviewHTML(value, category)
          table += `<tr><td>${tokenName}</td><td>${value}</td><td>${preview}</td></tr>`
        }
      }
    }
    
    generateTokenRows(tokens)
    table += '</tbody></table>'
    return table
  }

  private generateTokenPreview(value: any, category: string): string {
    if (category === 'colors') {
      return `<div style="width: 20px; height: 20px; background: ${value}; border-radius: 3px; display: inline-block;"></div>`
    } else if (category === 'spacing') {
      return `<div style="width: ${value}; height: 20px; background: #ddd; border-radius: 3px; display: inline-block;"></div>`
    } else if (category === 'typography') {
      return `<span style="font-family: ${value};">Sample text</span>`
    }
    return ''
  }

  private generateTokenPreviewHTML(value: any, category: string): string {
    if (category === 'colors') {
      return `<div class="color-swatch" style="background: ${value};"></div>`
    } else if (category === 'spacing') {
      return `<div style="width: ${value}; height: 20px; background: #ddd; border-radius: 3px; display: inline-block;"></div>`
    } else if (category === 'typography') {
      return `<span style="font-family: ${value};">Sample text</span>`
    }
    return ''
  }

  private generatePropsTable(props: any[]): string {
    let table = '| Name | Type | Required | Default | Description |\n'
    table += '|------|------|----------|---------|-------------|\n'
    
    for (const prop of props) {
      table += `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | ${prop.default || '-'} | ${prop.description || '-'} |\n`
    }
    
    return table
  }

  private generatePropsHTMLTable(props: any[]): string {
    let table = '<table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead><tbody>'
    
    for (const prop of props) {
      table += `<tr><td>${prop.name}</td><td>${prop.type}</td><td>${prop.required ? 'Yes' : 'No'}</td><td>${prop.default || '-'}</td><td>${prop.description || '-'}</td></tr>`
    }
    
    table += '</tbody></table>'
    return table
  }

  private generateComponentCodeExample(component: GeneratedComponent, variant: string, options: DocumentationExportOptions): string {
    return `
## Example

\`\`\`tsx
import { ${component.name} } from '@your-org/design-system'

function Example() {
  return (
    <${component.name} variant="${variant}">
      ${component.name === 'Button' ? 'Click me' : 'Content'}
    </${component.name}>
  )
}
\`\`\`

\`\`\`css
.${component.name.toLowerCase()} {
  /* Component styles */
}
\`\`\`
`
  }

  private generateComponentCodeExampleHTML(component: GeneratedComponent, variant: string, options: DocumentationExportOptions): string {
    return `
<h2>Example</h2>
<pre><code>import { ${component.name} } from '@your-org/design-system'

function Example() {
  return (
    &lt;${component.name} variant="${variant}"&gt;
      ${component.name === 'Button' ? 'Click me' : 'Content'}
    &lt;/${component.name}&gt;
  )
}</code></pre>
`
  }

  private generateComponentUsageExamples(component: GeneratedComponent, options: DocumentationExportOptions): string {
    return `
## Usage Examples

### Basic Usage
\`\`\`tsx
<${component.name}>Basic ${component.name}</${component.name}>
\`\`\`

### With Props
\`\`\`tsx
<${component.name} variant="primary" size="lg">
  Large Primary ${component.name}
</${component.name}>
\`\`\`

### Disabled State
\`\`\`tsx
<${component.name} disabled>
  Disabled ${component.name}
</${component.name}>
\`\`\`
`
  }

  private generateComponentUsageExamplesHTML(component: GeneratedComponent, options: DocumentationExportOptions): string {
    return `
<h2>Usage Examples</h2>

<h3>Basic Usage</h3>
<pre><code>&lt;${component.name}&gt;Basic ${component.name}&lt;/${component.name}&gt;</code></pre>

<h3>With Props</h3>
<pre><code>&lt;${component.name} variant="primary" size="lg"&gt;
  Large Primary ${component.name}
&lt;/${component.name}&gt;</code></pre>

<h3>Disabled State</h3>
<pre><code>&lt;${component.name} disabled&gt;
  Disabled ${component.name}
&lt;/${component.name}&gt;</code></pre>
`
  }

  private generateTokensCodeExamples(tokens: any, category: string): string {
    return `
## Code Examples

### CSS Variables
\`\`\`css
:root {
  ${Object.entries(tokens).map(([key, value]) => `--${category}-${key}: ${value};`).join('\n  ')}
}
\`\`\`

### SCSS Variables
\`\`\`scss
${Object.entries(tokens).map(([key, value]) => `$${category}-${key}: ${value};`).join('\n')}
\`\`\`

### JavaScript
\`\`\`js
const ${category} = ${JSON.stringify(tokens, null, 2)}
\`\`\`
`
  }

  private generateTokensCodeExamplesHTML(tokens: any, category: string): string {
    return `
<h2>Code Examples</h2>

<h3>CSS Variables</h3>
<pre><code>:root {
  ${Object.entries(tokens).map(([key, value]) => `--${category}-${key}: ${value};`).join('\n  ')}
}</code></pre>

<h3>SCSS Variables</h3>
<pre><code>${Object.entries(tokens).map(([key, value]) => `$${category}-${key}: ${value};`).join('\n')}</code></pre>

<h3>JavaScript</h3>
<pre><code>const ${category} = ${JSON.stringify(tokens, null, 2)}</code></pre>
`
  }

  private generateTokensUsageExamples(tokens: any, category: string): string {
    return `
## Usage Examples

### Using in CSS
\`\`\`css
.my-component {
  ${category === 'colors' ? 'color: var(--colors-primary-500);' : ''}
  ${category === 'spacing' ? 'margin: var(--spacing-md);' : ''}
  ${category === 'typography' ? 'font-family: var(--typography-heading-font);' : ''}
}
\`\`\`

### Using in JavaScript
\`\`\`js
const styles = {
  ${category === 'colors' ? 'color: tokens.colors.primary[500],' : ''}
  ${category === 'spacing' ? 'margin: tokens.spacing.md,' : ''}
  ${category === 'typography' ? 'fontFamily: tokens.typography.headingFont,' : ''}
}
\`\`\`
`
  }

  private generateTokensUsageExamplesHTML(tokens: any, category: string): string {
    return `
<h2>Usage Examples</h2>

<h3>Using in CSS</h3>
<pre><code>.my-component {
  ${category === 'colors' ? 'color: var(--colors-primary-500);' : ''}
  ${category === 'spacing' ? 'margin: var(--spacing-md);' : ''}
  ${category === 'typography' ? 'font-family: var(--typography-heading-font);' : ''}
}</code></pre>

<h3>Using in JavaScript</h3>
<pre><code>const styles = {
  ${category === 'colors' ? 'color: tokens.colors.primary[500],' : ''}
  ${category === 'spacing' ? 'margin: tokens.spacing.md,' : ''}
  ${category === 'typography' ? 'fontFamily: tokens.typography.headingFont,' : ''}
}</code></pre>
`
  }

  private generateNavigation(files: DocumentationFile[], options: DocumentationExportOptions): NavigationItem[] {
    const navigation: NavigationItem[] = []
    const categories = ['overview', 'tokens', 'components', 'guides', 'api']
    
    categories.forEach((category, index) => {
      const categoryFiles = files.filter(file => file.category === category)
      
      if (categoryFiles.length > 0) {
        navigation.push({
          title: category.charAt(0).toUpperCase() + category.slice(1),
          path: `/${category}`,
          category,
          order: index,
          children: categoryFiles.map(file => ({
            title: file.title,
            path: `/${file.path}`,
            category: file.category,
            order: 0
          }))
        })
      }
    })
    
    return navigation
  }

  private async generateAssets(
    designSystem: GeneratedDesignSystem,
    tokens: any,
    options: DocumentationExportOptions
  ): Promise<DocumentationAsset[]> {
    const assets: DocumentationAsset[] = []
    
    // Generate CSS file
    assets.push({
      path: 'assets/styles.css',
      content: this.generateAssetCSS(tokens),
      type: 'css' as const,
      mimeType: 'text/css',
      size: 0
    })
    
    // Generate JavaScript file
    assets.push({
      path: 'assets/tokens.js',
      content: `const tokens = ${JSON.stringify(tokens, null, 2)};\nexport default tokens;`,
      type: 'js' as const,
      mimeType: 'application/javascript',
      size: 0
    })
    
    return assets
  }

  private generateAssetCSS(tokens: any): string {
    return `/* Design System Styles */
:root {
  ${this.generateCSSVariables(tokens)}
}

/* Component styles would go here */
`
  }

  private generateCSSVariables(tokens: any): string {
    let css = ''
    
    const generateVars = (obj: any, path: string[] = []): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key]
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          generateVars(value, currentPath)
        } else {
          const varName = currentPath.join('-')
          css += `  --${varName}: ${value};\n`
        }
      }
    }
    
    generateVars(tokens)
    return css
  }

  private generateSitemap(files: DocumentationFile[], options: DocumentationExportOptions): string {
    const urls = files.map(file => `https://your-domain.com/${file.path}`).join('\n')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${files.map(file => `
    <url>
      <loc>https://your-domain.com/${file.path}</loc>
      <lastmod>${file.lastModified}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`
  }

  private generateMetadata(
    designSystem: GeneratedDesignSystem,
    files: DocumentationFile[],
    options: DocumentationExportOptions
  ): DocumentationMetadata {
    const totalSize = files.reduce((sum, file) => sum + file.content.length, 0)
    
    return {
      title: designSystem.designSystem.name || 'Design System',
      description: designSystem.designSystem.description || 'AI-generated design system documentation',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalFiles: files.length,
      totalSize,
      components: designSystem.components?.length || 0,
      tokens: this.countTokens(designSystem.designSystem),
      pages: files.length
    }
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      colors: 'Color tokens define the color palette for your design system, including primary, secondary, and semantic colors.',
      typography: 'Typography tokens define font families, sizes, weights, and line heights for consistent text styling.',
      spacing: 'Spacing tokens provide consistent spacing values for margins, padding, and gaps throughout your interface.',
      borderRadius: 'Border radius tokens define consistent corner styles for components and elements.',
      shadows: 'Shadow tokens create depth and hierarchy through consistent elevation styles.',
      animation: 'Animation tokens define consistent timing, easing, and duration values for motion design.'
    }
    
    return descriptions[category] || 'Design tokens for consistent styling across your interface.'
  }

  private getSizeDescription(size: string): string {
    const descriptions: Record<string, string> = {
      xs: 'Extra small size for compact interfaces',
      sm: 'Small size for dense layouts',
      md: 'Medium size for standard use cases',
      lg: 'Large size for prominent elements',
      xl: 'Extra large size for hero elements'
    }
    
    return descriptions[size] || 'Component size variant'
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

  private getDefaultOptions(): DocumentationExportOptions {
    return {
      format: 'markdown',
      includeOverview: true,
      includeTokens: true,
      includeComponents: true,
      includeUsageExamples: true,
      includeCodeExamples: true,
      includeAccessibility: true,
      includeDesignPrinciples: true,
      includeContribution: true,
      includeChangelog: true,
      includeTableOfContents: true,
      includeNavigation: true,
      includeSearch: false,
      includeThemeToggle: false,
      generateSeparateFiles: false,
      includeAssets: true,
      includeInteractiveExamples: false,
      customSections: [],
      template: 'default',
      outputStyle: 'multi-page',
      includeMetadata: true,
      generateSitemap: false,
      includeAnalytics: false
    }
  }
}

export const documentationExporter = new DocumentationExporter()