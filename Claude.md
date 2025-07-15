# Claude Context: AI Design System Generator

## Project Overview

This is an AI-powered design system generator built with Next.js that transforms text descriptions into comprehensive, production-ready design systems. The application generates cohesive component libraries, style guides, and design tokens that can be immediately used in development projects.

## Technical Stack

### Core Framework

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 18+** with modern hooks

### AI Integration

- **OpenAI GPT-4** for design system generation
- **Anthropic Claude** for design analysis and refinement
- Custom prompts for component generation
- Structured output parsing for design tokens

### UI/Component Libraries

- **Radix UI** for accessible primitives
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Zod** for schema validation

### Development Tools

- **ESLint** with strict TypeScript rules
- **Prettier** for code formatting
- **Husky** for git hooks
- **Jest + Testing Library** for testing

### Deployment & Infrastructure

- **Vercel** for hosting and deployment
- **Vercel Analytics** for performance monitoring
- **GitHub Actions** for CI/CD

## Code Style Preferences

### File Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI primitives
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and configs
│   ├── ai/              # AI integration logic
│   ├── design-system/   # Design system generation
│   └── utils/           # General utilities
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── constants/           # Application constants
```

### Naming Conventions

- **Components**: PascalCase (`DesignSystemGenerator`)
- **Files**: kebab-case (`design-system-generator.tsx`)
- **Functions**: camelCase (`generateDesignSystem`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_COLOR_PALETTE`)
- **Types/Interfaces**: PascalCase with descriptive names (`DesignSystemConfig`)

### Component Guidelines

- Use functional components with hooks
- Prefer composition over inheritance
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props
- Include JSDoc comments for complex functions
- Implement proper error boundaries

### Code Quality Standards

- Maximum function length: 50 lines
- Maximum file length: 300 lines
- Prefer explicit over implicit
- Use descriptive variable names
- Avoid nested ternary operators
- Implement proper error handling

## Key Project Requirements

### Functional Requirements

1. **AI Prompt Processing**: Parse user input and generate structured design system specifications
2. **Component Generation**: Create React components with consistent styling and variants
3. **Token System**: Generate comprehensive design tokens (colors, typography, spacing)
4. **Export Functionality**: Support multiple export formats (CSS, Tailwind, tokens)
5. **Real-time Preview**: Live preview of generated components and styles
6. **Customization Interface**: Allow users to refine generated systems

### Technical Requirements

1. **Performance**: Sub-30-second generation time, <2s page loads
2. **Accessibility**: WCAG 2.1 AA compliance for all generated components
3. **Responsive Design**: Mobile-first approach with responsive layouts
4. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
5. **SEO Optimization**: Proper meta tags, structured data, sitemap
6. **Error Handling**: Graceful degradation and user-friendly error messages

### Security & Privacy

1. **Data Protection**: No storage of user prompts or generated content
2. **API Security**: Rate limiting and input validation
3. **Content Safety**: Filter inappropriate or harmful content
4. **Privacy Compliance**: GDPR-compliant data handling

## Development Workflow

### Git Workflow

- Main branch for production
- Feature branches for new development
- Pull request reviews required
- Conventional commit messages
- Automated testing on PR

### Testing Strategy

- Unit tests for utility functions
- Component testing with Testing Library
- Integration tests for AI workflows
- E2E tests for critical user paths
- Visual regression testing for components

### Deployment Process

- Automatic deployment on main branch merge
- Preview deployments for pull requests
- Environment-specific configurations
- Health checks and rollback procedures

## AI Integration Guidelines

### Prompt Engineering

- Use structured prompts with clear examples
- Implement fallback strategies for AI failures
- Validate AI outputs against schemas
- Provide context about design best practices
- Include accessibility requirements in prompts

### Output Processing

- Parse AI responses into structured data
- Validate generated code for syntax errors
- Ensure consistent naming conventions
- Apply design system constraints
- Generate comprehensive documentation

## Performance Considerations

### Optimization Strategies

- Code splitting for large AI models
- Lazy loading for preview components
- Caching for frequently generated patterns
- Optimize bundle size with tree shaking
- Use Next.js Image optimization

### Monitoring

- Track generation success rates
- Monitor API response times
- Log user interaction patterns
- Measure export completion rates
- Alert on error thresholds

## Constraints and Limitations

### Technical Constraints

- AI token limits for large requests
- Browser memory limits for complex previews
- Export file size limitations
- API rate limiting considerations

### Design Constraints

- Focus on modern web design patterns
- Maintain accessibility standards
- Ensure cross-browser compatibility
- Support common component patterns

### Business Constraints

- Free tier usage limitations
- Premium feature access controls
- Content generation guidelines
- Copyright and licensing considerations

## Success Metrics

### Development Metrics

- Code coverage >80%
- Build time <2 minutes
- Zero critical security vulnerabilities
- TypeScript strict mode compliance

### User Experience Metrics

- Generation success rate >95%
- User satisfaction score >4.5/5
- Task completion rate >90%
- Support ticket reduction

Remember to prioritize user experience, maintain high code quality, and ensure the generated design systems are production-ready and accessible.
