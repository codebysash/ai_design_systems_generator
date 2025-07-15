import { Container, Section, Grid } from '@/components/layout'

const features = [
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: 'Lightning Fast Generation',
    description:
      'Generate complete design systems in under 30 seconds. From concept to production-ready components instantly.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z"
        />
      </svg>
    ),
    title: 'Smart Component Library',
    description:
      'AI-generated React components with TypeScript, accessibility features, and multiple variants built-in.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
    title: 'Comprehensive Design Tokens',
    description:
      'Structured color palettes, typography scales, spacing systems, and more. Export to CSS, Tailwind, or design tools.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Accessibility First',
    description:
      'Every generated component meets WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and focus management.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
        />
      </svg>
    ),
    title: 'Multiple Export Formats',
    description:
      'Export as React components, Vue, Angular, CSS modules, Tailwind config, Figma tokens, or JSON for any workflow.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: 'Real-time Preview',
    description:
      'See your design system come to life with interactive previews. Test components and themes before export.',
  },
]

export function Features() {
  return (
    <Section padding="xl" background="muted">
      <Container size="lg">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            Everything you need to build
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From initial concept to production deployment, our AI generates
            complete design systems with all the components, tokens, and
            documentation your team needs.
          </p>
        </div>

        <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </Grid>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Trusted by design teams at startups and Fortune 500 companies
          </p>
        </div>
      </Container>
    </Section>
  )
}
