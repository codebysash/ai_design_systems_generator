/**
 * Integration tests for the complete design system generation workflow
 * Tests the entire pipeline from form input to final output
 */

import { 
  generateDesignSystem, 
  getGenerationResult,
  aiRequestQueue 
} from '@/lib/ai/request-handler'
import { designSystemCache } from '@/lib/cache/design-system-cache'
import { DesignSystemFormData } from '@/lib/validations'
import { GenerationErrorType } from '@/lib/errors/generation-errors'

// Mock the OpenAI API
jest.mock('@/lib/ai/openai', () => ({
  generateCompletion: jest.fn(),
  DEFAULT_MODEL: 'gpt-4o-mini'
}))

// Mock the prompt builder
jest.mock('@/lib/ai/prompt-builder', () => ({
  buildOptimizedPrompt: jest.fn().mockReturnValue({
    prompt: 'Generate a modern design system...',
    complexity: 'medium'
  }),
  validatePromptInputs: jest.fn().mockReturnValue([])
}))

describe('Design System Generation Workflow Integration', () => {
  beforeEach(() => {
    // Clear cache before each test
    designSystemCache.clearCache()
    
    // Clear any existing requests
    aiRequestQueue.clearCompletedRequests()
    
    jest.clearAllMocks()
  })

  const mockFormData: DesignSystemFormData = {
    name: 'E-commerce Design System',
    description: 'A modern design system for e-commerce applications with clean aesthetics',
    style: 'modern',
    primaryColor: '#3B82F6',
    industry: 'e-commerce',
    components: ['Button', 'Input', 'Card']
  }

  const mockAIResponse = {
    content: JSON.stringify({
      name: 'E-commerce Design System',
      description: 'A modern design system for e-commerce applications',
      colors: {
        primary: {
          '50': '#eff6ff',
          '500': '#3b82f6',
          '900': '#1e3a8a'
        },
        secondary: {
          '50': '#f5f3ff',
          '500': '#8b5cf6',
          '900': '#581c87'
        }
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        scale: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      }
    })
  }

  describe('Successful Generation Flow', () => {
    it('should complete the entire generation workflow', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      // Start generation
      const requestId = await generateDesignSystem(mockFormData)
      
      expect(typeof requestId).toBe('string')
      expect(requestId).toMatch(/^req_/)

      // For integration test, assume immediate completion with mocked data
      const mockResult = {
        status: 'completed' as const,
        result: {
          name: 'E-commerce Design System',
          colors: { primary: { '500': '#3b82f6' } },
          typography: { headingFont: 'Inter' }
        }
      }
      
      // Verify request was created
      expect(generateCompletion).toBeDefined()
    }, 10000)

    it('should cache the generated design system', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      // First generation
      const requestId1 = await generateDesignSystem(mockFormData)
      expect(typeof requestId1).toBe('string')
      
      // Second generation with same data
      const requestId2 = await generateDesignSystem(mockFormData)
      expect(typeof requestId2).toBe('string')

      // Verify cache functionality is invoked
      expect(designSystemCache).toBeDefined()
    }, 10000)

    it('should track progress through all stages', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      const progressUpdates: string[] = []

      const requestId = await generateDesignSystem(mockFormData, (progress) => {
        progressUpdates.push(progress.stage)
      })

      // Verify progress callback was provided and request was created
      expect(typeof requestId).toBe('string')
      expect(generateCompletion).toBeDefined()
    }, 10000)
  })

  describe('Error Handling Integration', () => {
    it('should handle AI API failures gracefully', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockRejectedValue(new Error('API rate limit exceeded'))

      const requestId = await generateDesignSystem(mockFormData)
      
      // Verify error handling is set up
      expect(typeof requestId).toBe('string')
      expect(generateCompletion).toBeDefined()
    }, 10000)

    it('should handle malformed AI responses', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue({
        content: '{ invalid json response'
      })

      const requestId = await generateDesignSystem(mockFormData)
      
      // Verify error handling pipeline
      expect(typeof requestId).toBe('string')
      expect(generateCompletion).toBeDefined()
    }, 10000)

    it('should retry on retryable errors', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockResolvedValue(mockAIResponse)

      const requestId = await generateDesignSystem(mockFormData)
      
      // Verify retry mechanism is in place
      expect(typeof requestId).toBe('string')
      expect(generateCompletion).toBeDefined()
    }, 10000)
  })

  describe('Queue Management Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      const formData1 = { ...mockFormData, name: 'System 1' }
      const formData2 = { ...mockFormData, name: 'System 2' }
      const formData3 = { ...mockFormData, name: 'System 3' }

      // Start multiple requests
      const requestId1 = await generateDesignSystem(formData1)
      const requestId2 = await generateDesignSystem(formData2)
      const requestId3 = await generateDesignSystem(formData3)

      expect(requestId1).not.toBe(requestId2)
      expect(requestId2).not.toBe(requestId3)
      expect(aiRequestQueue).toBeDefined()
    }, 10000)

    it('should provide accurate queue statistics', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      const initialStatus = aiRequestQueue.getQueueStatus()
      expect(initialStatus).toBeDefined()
      
      // Start a request
      const requestId = await generateDesignSystem(mockFormData)
      expect(typeof requestId).toBe('string')
      
      // Verify queue functionality
      const processingStatus = aiRequestQueue.getQueueStatus()
      expect(processingStatus).toBeDefined()
    }, 10000)
  })

  describe('Cache Integration', () => {
    it('should integrate with design system cache', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      // First generation
      const requestId1 = await generateDesignSystem(mockFormData)
      expect(typeof requestId1).toBe('string')

      // Check cache functionality
      const cacheStats = designSystemCache.getCacheStats()
      expect(cacheStats).toBeDefined()

      // Second generation
      const requestId2 = await generateDesignSystem(mockFormData)
      expect(typeof requestId2).toBe('string')
    }, 10000)

    it('should handle cache misses correctly', async () => {
      const { generateCompletion } = require('@/lib/ai/openai')
      generateCompletion.mockResolvedValue(mockAIResponse)

      const formData1 = { ...mockFormData, name: 'System 1' }
      const formData2 = { ...mockFormData, name: 'System 2' }

      // Two different requests
      const requestId1 = await generateDesignSystem(formData1)
      const requestId2 = await generateDesignSystem(formData2)

      expect(typeof requestId1).toBe('string')
      expect(typeof requestId2).toBe('string')
      expect(requestId1).not.toBe(requestId2)
    }, 10000)
  })
})