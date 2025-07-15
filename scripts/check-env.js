#!/usr/bin/env node

const requiredEnvVars = {
  development: ['OPENAI_API_KEY'],
  production: ['OPENAI_API_KEY', 'VERCEL_TOKEN'],
}

const environment = process.env.NODE_ENV || 'development'
const required = requiredEnvVars[environment] || requiredEnvVars.development

console.log(`🔍 Checking environment variables for ${environment}...`)

let hasErrors = false

required.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    hasErrors = true
  } else {
    console.log(`✅ ${envVar} is set`)
  }
})

if (hasErrors) {
  console.error(
    '\n💡 Please check your .env.local file or environment configuration'
  )
  process.exit(1)
} else {
  console.log('\n✨ All required environment variables are set!')
}
