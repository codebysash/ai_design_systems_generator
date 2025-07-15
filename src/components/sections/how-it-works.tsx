import { Container, Section, Grid, Stack } from '@/components/layout'

const steps = [
  {
    step: '01',
    title: 'Describe Your Vision',
    description:
      'Tell us about your brand, industry, and design preferences. Our AI understands context from simple descriptions.',
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'AI Generates System',
    description:
      'Our advanced AI analyzes your requirements and generates a complete design system with components, tokens, and documentation.',
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Review & Customize',
    description:
      'Preview your design system in our interactive playground. Make adjustments and see changes in real-time.',
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
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Export & Implement',
    description:
      'Download your design system in your preferred format and start building. Ready for React, Vue, Angular, or plain CSS.',
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
]

export function HowItWorks() {
  return (
    <Section padding="xl" background="default">
      <Container size="lg">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From idea to implementation in four simple steps. Our AI handles the
            complexity so you can focus on building great products.
          </p>
        </div>

        <Grid cols={{ default: 1, md: 2, lg: 4 }} gap="lg">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </Grid>

        <div className="mt-16 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-8 border text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of designers and developers who are already using AI
            to create better design systems faster.
          </p>
          <Stack
            direction="row"
            gap="md"
            justify="center"
            className="flex-wrap"
          >
            <div className="text-sm text-muted-foreground">
              ⚡ Generate in 30 seconds
            </div>
            <div className="text-sm text-muted-foreground">
              🎨 Professional quality
            </div>
            <div className="text-sm text-muted-foreground">
              📱 Mobile responsive
            </div>
            <div className="text-sm text-muted-foreground">
              ♿ Accessibility included
            </div>
          </Stack>
        </div>
      </Container>
    </Section>
  )
}
