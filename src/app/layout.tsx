import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header, Footer } from '@/components/layout'
import { SkipLink } from '@/components/ui/skip-link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title:
    'AI Design System Generator | Create Production-Ready Design Systems in Minutes',
  description:
    'Transform design briefs into production-ready design systems with AI. Generate React components, design tokens, and documentation in under 30 seconds. Free to use, no signup required.',
  keywords: [
    'design system',
    'AI',
    'React components',
    'design tokens',
    'CSS',
    'Tailwind CSS',
    'TypeScript',
    'accessibility',
    'UI components',
  ],
  authors: [{ name: 'AI Design System Generator' }],
  creator: 'AI Design System Generator',
  publisher: 'AI Design System Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ai-design-system-generator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:
      'AI Design System Generator | Create Production-Ready Design Systems in Minutes',
    description:
      'Transform design briefs into production-ready design systems with AI. Generate React components, design tokens, and documentation in under 30 seconds.',
    url: 'https://ai-design-system-generator.vercel.app',
    siteName: 'AI Design System Generator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Design System Generator - Create design systems with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'AI Design System Generator | Create Production-Ready Design Systems in Minutes',
    description:
      'Transform design briefs into production-ready design systems with AI. Generate React components, design tokens, and documentation in under 30 seconds.',
    images: ['/og-image.png'],
    creator: '@ai_design_gen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        <Header />
        <div id="main-content" role="main">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
