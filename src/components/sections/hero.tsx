import { Button } from '@/components/ui/button'
import { Container, Section, Stack } from '@/components/layout'

export function Hero() {
  return (
    <Section padding="xl" background="default">
      <Container size="lg">
        <div className="flex flex-col items-center text-center space-y-8">
          <Stack gap="lg" align="center" className="max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Generate <span className="text-primary">Design Systems</span>{' '}
                with AI
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl">
                Transform your design briefs into production-ready design
                systems in minutes. Complete with components, tokens, and
                documentation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Generating
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Examples
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No signup required
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Export ready
              </div>
            </div>
          </Stack>

          {/* Visual Preview */}
          <div className="relative w-full max-w-5xl mt-16">
            <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 border shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Component Preview */}
                <div className="bg-card rounded-lg p-4 border">
                  <h3 className="font-medium mb-3">Components</h3>
                  <div className="space-y-2">
                    <div className="h-8 bg-primary/20 rounded"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>

                {/* Tokens Preview */}
                <div className="bg-card rounded-lg p-4 border">
                  <h3 className="font-medium mb-3">Design Tokens</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-primary rounded-full"></div>
                      <span className="text-xs">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-secondary rounded-full"></div>
                      <span className="text-xs">Secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-accent rounded-full"></div>
                      <span className="text-xs">Accent</span>
                    </div>
                  </div>
                </div>

                {/* Documentation Preview */}
                <div className="bg-card rounded-lg p-4 border">
                  <h3 className="font-medium mb-3">Documentation</h3>
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                    <div className="h-3 bg-muted rounded w-3/5"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
