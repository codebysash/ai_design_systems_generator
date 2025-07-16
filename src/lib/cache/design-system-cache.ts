/**
 * Design System Caching System
 * Optimizes performance by caching generated design systems and components
 */

import { DesignSystemConfig, GeneratedComponent } from '@/types'
import { DesignSystemFormData } from '@/lib/validations'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  accessCount: number
  lastAccessed: number
}

interface DesignSystemCacheEntry extends CacheEntry<DesignSystemConfig> {
  formDataHash: string
  componentCache: Map<string, CacheEntry<GeneratedComponent>>
}

class DesignSystemCache {
  private cache = new Map<string, DesignSystemCacheEntry>()
  private maxCacheSize = 50 // Maximum number of cached design systems
  private defaultTTL = 30 * 60 * 1000 // 30 minutes in milliseconds
  private maxTTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  
  // Component-level cache for individual components
  private componentCache = new Map<string, CacheEntry<GeneratedComponent>>()
  private maxComponentCacheSize = 200

  /**
   * Generate a cache key from form data
   */
  private generateCacheKey(formData: DesignSystemFormData): string {
    const keyData = {
      description: formData.description,
      style: formData.style,
      colors: formData.colors,
      industry: formData.industry,
      complexity: formData.complexity,
      components: formData.components?.sort()
    }
    
    return this.hashObject(keyData)
  }

  /**
   * Generate a component cache key
   */
  private generateComponentKey(
    componentName: string, 
    designSystemHash: string, 
    variant?: string, 
    size?: string
  ): string {
    return `${componentName}-${designSystemHash}-${variant || 'default'}-${size || 'md'}`
  }

  /**
   * Simple hash function for objects
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Get cached design system
   */
  getCachedDesignSystem(formData: DesignSystemFormData): DesignSystemConfig | null {
    this.cleanupExpiredEntries()
    
    const key = this.generateCacheKey(formData)
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    return entry.data
  }

  /**
   * Cache a generated design system
   */
  cacheDesignSystem(
    formData: DesignSystemFormData, 
    designSystem: DesignSystemConfig,
    ttl?: number
  ): void {
    this.cleanupExpiredEntries()
    this.enforceMaxCacheSize()
    
    const key = this.generateCacheKey(formData)
    const now = Date.now()
    const expiration = now + (ttl || this.defaultTTL)
    
    const entry: DesignSystemCacheEntry = {
      data: designSystem,
      timestamp: now,
      expiresAt: expiration,
      accessCount: 1,
      lastAccessed: now,
      formDataHash: key,
      componentCache: new Map()
    }
    
    this.cache.set(key, entry)
  }

  /**
   * Get cached component
   */
  getCachedComponent(
    componentName: string,
    designSystemHash: string,
    variant?: string,
    size?: string
  ): GeneratedComponent | null {
    const key = this.generateComponentKey(componentName, designSystemHash, variant, size)
    const entry = this.componentCache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.componentCache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    return entry.data
  }

  /**
   * Cache a generated component
   */
  cacheComponent(
    componentName: string,
    designSystemHash: string,
    component: GeneratedComponent,
    variant?: string,
    size?: string,
    ttl?: number
  ): void {
    this.enforceMaxComponentCacheSize()
    
    const key = this.generateComponentKey(componentName, designSystemHash, variant, size)
    const now = Date.now()
    const expiration = now + (ttl || this.defaultTTL)
    
    const entry: CacheEntry<GeneratedComponent> = {
      data: component,
      timestamp: now,
      expiresAt: expiration,
      accessCount: 1,
      lastAccessed: now
    }
    
    this.componentCache.set(key, entry)
  }

  /**
   * Preload frequently used components
   */
  async preloadComponents(
    components: string[],
    designSystemHash: string
  ): Promise<void> {
    // This would typically trigger background generation
    // For now, we'll just mark these as priority
    console.log(`Preloading components: ${components.join(', ')} for design system: ${designSystemHash}`)
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let totalAccessCount = 0
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++
      } else {
        validEntries++
        totalAccessCount += entry.accessCount
      }
    }
    
    let validComponentEntries = 0
    let expiredComponentEntries = 0
    let totalComponentAccessCount = 0
    
    for (const entry of this.componentCache.values()) {
      if (now > entry.expiresAt) {
        expiredComponentEntries++
      } else {
        validComponentEntries++
        totalComponentAccessCount += entry.accessCount
      }
    }
    
    return {
      designSystems: {
        total: this.cache.size,
        valid: validEntries,
        expired: expiredEntries,
        totalAccess: totalAccessCount,
        avgAccess: validEntries > 0 ? totalAccessCount / validEntries : 0,
        hitRate: this.calculateHitRate('designSystems')
      },
      components: {
        total: this.componentCache.size,
        valid: validComponentEntries,
        expired: expiredComponentEntries,
        totalAccess: totalComponentAccessCount,
        avgAccess: validComponentEntries > 0 ? totalComponentAccessCount / validComponentEntries : 0,
        hitRate: this.calculateHitRate('components')
      },
      memory: {
        estimatedSize: this.estimateMemoryUsage(),
        maxDesignSystems: this.maxCacheSize,
        maxComponents: this.maxComponentCacheSize
      }
    }
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(type: 'designSystems' | 'components'): number {
    // This would typically track hits vs misses over time
    // For now, return a placeholder based on cache size
    const cache = type === 'designSystems' ? this.cache : this.componentCache
    const maxSize = type === 'designSystems' ? this.maxCacheSize : this.maxComponentCacheSize
    return Math.min(cache.size / maxSize, 1) * 100
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): string {
    // Very rough estimation
    let totalSize = 0
    
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry.data).length
    }
    
    for (const entry of this.componentCache.values()) {
      totalSize += JSON.stringify(entry.data).length
    }
    
    // Convert bytes to readable format
    if (totalSize < 1024) {
      return `${totalSize} B`
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(2)} KB`
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now()
    
    // Clean design system cache
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
    
    // Clean component cache
    for (const [key, entry] of this.componentCache.entries()) {
      if (now > entry.expiresAt) {
        this.componentCache.delete(key)
      }
    }
  }

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private enforceMaxCacheSize(): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Find least recently used entry
      let oldestKey = ''
      let oldestTime = Date.now()
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed
          oldestKey = key
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  /**
   * Enforce maximum component cache size using LRU eviction
   */
  private enforceMaxComponentCacheSize(): void {
    if (this.componentCache.size >= this.maxComponentCacheSize) {
      // Find least recently used entry
      let oldestKey = ''
      let oldestTime = Date.now()
      
      for (const [key, entry] of this.componentCache.entries()) {
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed
          oldestKey = key
        }
      }
      
      if (oldestKey) {
        this.componentCache.delete(oldestKey)
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
    this.componentCache.clear()
  }

  /**
   * Clear expired entries manually
   */
  clearExpired(): number {
    const initialSize = this.cache.size + this.componentCache.size
    this.cleanupExpiredEntries()
    return initialSize - (this.cache.size + this.componentCache.size)
  }

  /**
   * Set cache configuration
   */
  configure(options: {
    maxCacheSize?: number
    maxComponentCacheSize?: number
    defaultTTL?: number
    maxTTL?: number
  }): void {
    if (options.maxCacheSize) this.maxCacheSize = options.maxCacheSize
    if (options.maxComponentCacheSize) this.maxComponentCacheSize = options.maxComponentCacheSize
    if (options.defaultTTL) this.defaultTTL = options.defaultTTL
    if (options.maxTTL) this.maxTTL = options.maxTTL
  }
}

// Singleton instance
export const designSystemCache = new DesignSystemCache()

// Utility functions for easy access
export const getCachedDesignSystem = (formData: DesignSystemFormData) => 
  designSystemCache.getCachedDesignSystem(formData)

export const cacheDesignSystem = (
  formData: DesignSystemFormData, 
  designSystem: DesignSystemConfig,
  ttl?: number
) => designSystemCache.cacheDesignSystem(formData, designSystem, ttl)

export const getCachedComponent = (
  componentName: string,
  designSystemHash: string,
  variant?: string,
  size?: string
) => designSystemCache.getCachedComponent(componentName, designSystemHash, variant, size)

export const cacheComponent = (
  componentName: string,
  designSystemHash: string,
  component: GeneratedComponent,
  variant?: string,
  size?: string,
  ttl?: number
) => designSystemCache.cacheComponent(componentName, designSystemHash, component, variant, size, ttl)