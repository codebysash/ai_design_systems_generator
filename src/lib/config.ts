export const config = {
  app: {
    name: 'AI Design System Generator',
    description: 'Generate comprehensive design systems with AI',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: process.env.npm_package_version || '0.1.0',
  },
  ai: {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: {
      designSystem: 3000,
      component: 2500,
    },
    temperature: {
      designSystem: 0.7,
      component: 0.5,
    },
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  },
  limits: {
    maxGenerationsPerHour: 10,
    maxComponentsPerSystem: 20,
    maxPromptLength: 2000,
  },
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

export type Config = typeof config
