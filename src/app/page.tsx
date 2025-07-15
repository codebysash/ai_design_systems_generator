import { Hero, Features, HowItWorks, CTA } from '@/components/sections'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Design System Generator',
  description:
    'Transform design briefs into production-ready design systems with AI. Generate React components, design tokens, and documentation in under 30 seconds.',
  url: 'https://ai-design-system-generator.vercel.app',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'AI Design System Generator',
  },
  featureList: [
    'AI-powered design system generation',
    'React component creation',
    'Design token generation',
    'Accessibility compliance',
    'Multiple export formats',
    'Real-time preview',
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  )
}
