import {
  designSystemCache,
  getCachedDesignSystem,
  cacheDesignSystem,
  getCachedComponent,
  cacheComponent,
} from './design-system-cache'
import { DesignSystemFormData } from '@/lib/validations'
import { DesignSystemConfig, GeneratedComponent } from '@/types'

describe('Design System Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    designSystemCache.clearCache()
    // Reset cache configuration to defaults
    designSystemCache.configure({ maxCacheSize: 50 })
  })

  const mockFormData: DesignSystemFormData = {
    name: 'E-commerce Design System',
    description: 'Modern e-commerce design system',
    style: 'modern',
    primaryColor: '#3B82F6',
    industry: 'e-commerce',
    components: ['Button', 'Input', 'Card'],
  }

  const mockDesignSystem: DesignSystemConfig = {
    name: 'E-commerce Design System',
    description: 'Modern design system for e-commerce',
    colors: {
      primary: {
        '50': '#eff6ff',
        '500': '#3b82f6',
        '900': '#1e3a8a',
      },
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      scale: {
        base: '1rem',
        lg: '1.125rem',
      },
    },
    spacing: {
      md: '1rem',
    },
    borderRadius: {
      md: '0.375rem',
    },
  }

  const mockComponent: GeneratedComponent = {
    name: 'Button',
    description: 'A button component',
    type: 'button',
    variants: [
      { name: 'primary', description: 'Primary button style' },
      { name: 'secondary', description: 'Secondary button style' },
    ],
    sizes: ['sm', 'md', 'lg'],
    props: [
      {
        name: 'onClick',
        type: 'function',
        required: false,
        description: 'Click handler',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Disabled state',
      },
    ],
    code: 'export const Button = () => <button>Click me</button>',
    styles: '.button { padding: 1rem; }',
    accessibility: ['Keyboard navigable', 'Screen reader friendly'],
  }

  describe('Design System Caching', () => {
    it('should cache and retrieve design systems', () => {
      // Initially should return null
      expect(getCachedDesignSystem(mockFormData)).toBeNull()

      // Cache the design system
      cacheDesignSystem(mockFormData, mockDesignSystem)

      // Should now return the cached design system
      const cached = getCachedDesignSystem(mockFormData)
      expect(cached).toEqual(mockDesignSystem)
    })

    it('should return null for non-existent cache entries', () => {
      const differentFormData: DesignSystemFormData = {
        ...mockFormData,
        description: 'Different description',
      }

      const result = getCachedDesignSystem(differentFormData)
      expect(result).toBeNull()
    })

    it('should respect TTL and expire entries', async () => {
      const shortTTL = 100 // 100ms

      cacheDesignSystem(mockFormData, mockDesignSystem, shortTTL)

      // Should be available immediately
      expect(getCachedDesignSystem(mockFormData)).toEqual(mockDesignSystem)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should now be expired
      expect(getCachedDesignSystem(mockFormData)).toBeNull()
    })

    it('should update access statistics', () => {
      cacheDesignSystem(mockFormData, mockDesignSystem)

      // Access multiple times
      getCachedDesignSystem(mockFormData)
      getCachedDesignSystem(mockFormData)
      getCachedDesignSystem(mockFormData)

      const stats = designSystemCache.getCacheStats()
      expect(stats.designSystems.totalAccess).toBeGreaterThan(0)
    })
  })

  describe('Component Caching', () => {
    it('should cache and retrieve components', () => {
      const designSystemHash = 'test-hash'

      // Initially should return null
      expect(getCachedComponent('Button', designSystemHash)).toBeNull()

      // Cache the component
      cacheComponent('Button', designSystemHash, mockComponent)

      // Should now return the cached component
      const cached = getCachedComponent('Button', designSystemHash)
      expect(cached).toEqual(mockComponent)
    })

    it('should cache components with variant and size', () => {
      const designSystemHash = 'test-hash'

      cacheComponent('Button', designSystemHash, mockComponent, 'primary', 'lg')

      // Should return component for exact match
      expect(
        getCachedComponent('Button', designSystemHash, 'primary', 'lg')
      ).toEqual(mockComponent)

      // Should return null for different variant/size
      expect(
        getCachedComponent('Button', designSystemHash, 'secondary', 'lg')
      ).toBeNull()
      expect(
        getCachedComponent('Button', designSystemHash, 'primary', 'sm')
      ).toBeNull()
    })

    it('should handle component expiration', async () => {
      const designSystemHash = 'test-hash'
      const shortTTL = 100

      cacheComponent(
        'Button',
        designSystemHash,
        mockComponent,
        'primary',
        'md',
        shortTTL
      )

      // Should be available immediately
      expect(
        getCachedComponent('Button', designSystemHash, 'primary', 'md')
      ).toEqual(mockComponent)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should now be expired
      expect(
        getCachedComponent('Button', designSystemHash, 'primary', 'md')
      ).toBeNull()
    })
  })

  describe('Cache Management', () => {
    it('should provide accurate cache statistics', () => {
      // Add some entries
      cacheDesignSystem(mockFormData, mockDesignSystem)
      cacheComponent('Button', 'hash1', mockComponent)
      cacheComponent('Input', 'hash2', mockComponent)

      const stats = designSystemCache.getCacheStats()

      expect(stats.designSystems.total).toBe(1)
      expect(stats.components.total).toBe(2)
      expect(stats.designSystems.valid).toBe(1)
      expect(stats.components.valid).toBe(2)
      expect(typeof stats.memory.estimatedSize).toBe('string')
    })

    it('should clear expired entries manually', async () => {
      const shortTTL = 50

      // Add entries with short TTL
      cacheDesignSystem(mockFormData, mockDesignSystem, shortTTL)
      cacheComponent('Button', 'hash', mockComponent, 'primary', 'md', shortTTL)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100))

      const removedCount = designSystemCache.clearExpired()
      expect(removedCount).toBe(2)

      const stats = designSystemCache.getCacheStats()
      expect(stats.designSystems.total).toBe(0)
      expect(stats.components.total).toBe(0)
    })

    it('should enforce maximum cache size with LRU eviction', () => {
      // Configure small cache size
      designSystemCache.configure({ maxCacheSize: 2 })

      const formData1 = { ...mockFormData, description: 'System 1' }
      const formData2 = { ...mockFormData, description: 'System 2' }
      const formData3 = { ...mockFormData, description: 'System 3' }

      // Add entries up to limit
      cacheDesignSystem(formData1, mockDesignSystem)
      cacheDesignSystem(formData2, mockDesignSystem)

      // Both should be cached
      expect(getCachedDesignSystem(formData1)).not.toBeNull()
      expect(getCachedDesignSystem(formData2)).not.toBeNull()

      // Access formData1 to make it more recently used
      getCachedDesignSystem(formData1)

      // Add third entry - should evict formData2 (least recently used)
      cacheDesignSystem(formData3, mockDesignSystem)

      expect(getCachedDesignSystem(formData1)).not.toBeNull() // Still cached
      expect(getCachedDesignSystem(formData2)).toBeNull() // Evicted
      expect(getCachedDesignSystem(formData3)).not.toBeNull() // Newly cached

      // Reset cache size
      designSystemCache.configure({ maxCacheSize: 50 })
    })

    it('should clear all caches', () => {
      cacheDesignSystem(mockFormData, mockDesignSystem)
      cacheComponent('Button', 'hash', mockComponent)

      designSystemCache.clearCache()

      expect(getCachedDesignSystem(mockFormData)).toBeNull()
      expect(getCachedComponent('Button', 'hash')).toBeNull()

      const stats = designSystemCache.getCacheStats()
      expect(stats.designSystems.total).toBe(0)
      expect(stats.components.total).toBe(0)
    })
  })

  describe('Cache Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        maxCacheSize: 100,
        maxComponentCacheSize: 500,
        defaultTTL: 60000,
      }

      designSystemCache.configure(newConfig)

      // Configuration should be applied (we can't directly test private properties,
      // but we can test behavior that depends on them)
      expect(() => designSystemCache.configure(newConfig)).not.toThrow()
    })
  })

  describe('Hash Generation', () => {
    it('should generate consistent hashes for identical form data', () => {
      const formData1 = { ...mockFormData }
      const formData2 = { ...mockFormData }

      cacheDesignSystem(formData1, mockDesignSystem)

      // Should find cache with identical but separate object
      expect(getCachedDesignSystem(formData2)).toEqual(mockDesignSystem)
    })

    it('should generate different hashes for different form data', () => {
      const formData1 = { ...mockFormData, description: 'First system' }
      const formData2 = { ...mockFormData, description: 'Second system' }

      cacheDesignSystem(formData1, mockDesignSystem)

      // Should not find cache with different form data
      expect(getCachedDesignSystem(formData2)).toBeNull()
    })

    it('should handle order-independent hashing for arrays', () => {
      const formData1 = {
        ...mockFormData,
        components: ['Button', 'Input', 'Card'],
      }
      const formData2 = {
        ...mockFormData,
        components: ['Card', 'Button', 'Input'],
      }

      cacheDesignSystem(formData1, mockDesignSystem)

      // Should find cache despite different array order
      expect(getCachedDesignSystem(formData2)).toEqual(mockDesignSystem)
    })
  })

  describe('Memory Management', () => {
    it('should estimate memory usage', () => {
      cacheDesignSystem(mockFormData, mockDesignSystem)
      cacheComponent('Button', 'hash', mockComponent)

      const stats = designSystemCache.getCacheStats()
      expect(stats.memory.estimatedSize).toMatch(/^\d+(\.\d+)?\s*(B|KB|MB)$/)
    })

    it('should handle large datasets without crashing', () => {
      // Create large mock data
      const largeDesignSystem = {
        ...mockDesignSystem,
        colors: {},
      }

      // Add many color variations
      for (let i = 0; i < 100; i++) {
        largeDesignSystem.colors[`color${i}`] = {
          '500': `#${i.toString(16).padStart(6, '0')}`,
        }
      }

      expect(() => {
        cacheDesignSystem(mockFormData, largeDesignSystem as any)
      }).not.toThrow()

      expect(getCachedDesignSystem(mockFormData)).toEqual(largeDesignSystem)
    })
  })
})
