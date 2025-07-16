'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ThemeDefinition } from '@/components/customization/advanced-theme-editor'
import { CustomizationValue } from '@/components/customization/advanced-customization-panel'

const STORAGE_KEY = 'ai-design-system-themes'
const CURRENT_THEME_KEY = 'ai-design-system-current-theme'

// Built-in themes
const BUILT_IN_THEMES: ThemeDefinition[] = [
  {
    id: 'modern-light',
    name: 'Modern Light',
    description: 'Clean and modern light theme with subtle shadows',
    category: 'light',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customization: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
        neutral: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        foreground: '#0f172a',
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        lineHeight: 1.5,
        letterSpacing: 0,
        fontWeight: 400,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        sm: 6,
        md: 12,
        lg: 16,
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animations: {
        duration: 200,
        easing: 'ease-in-out',
        enabled: true,
      },
    },
  },
  {
    id: 'dark-pro',
    name: 'Dark Pro',
    description: 'Professional dark theme optimized for long work sessions',
    category: 'dark',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customization: {
      colors: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        accent: '#a78bfa',
        neutral: '#9ca3af',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        background: '#0f172a',
        foreground: '#f8fafc',
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        lineHeight: 1.6,
        letterSpacing: 0.025,
        fontWeight: 400,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
      },
      animations: {
        duration: 250,
        easing: 'ease-out',
        enabled: true,
      },
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast theme for accessibility',
    category: 'high-contrast',
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customization: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0066cc',
        neutral: '#333333',
        success: '#006600',
        warning: '#cc6600',
        error: '#cc0000',
        background: '#ffffff',
        foreground: '#000000',
      },
      typography: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontWeight: 500,
      },
      spacing: {
        xs: 6,
        sm: 12,
        md: 20,
        lg: 32,
        xl: 48,
      },
      borderRadius: {
        sm: 2,
        md: 4,
        lg: 6,
      },
      shadows: {
        sm: '0 2px 4px 0 rgb(0 0 0 / 0.8)',
        md: '0 4px 8px 0 rgb(0 0 0 / 0.8)',
        lg: '0 8px 16px 0 rgb(0 0 0 / 0.8)',
      },
      animations: {
        duration: 0,
        easing: 'linear',
        enabled: false,
      },
    },
  },
]

export interface UseThemeManagerReturn {
  themes: ThemeDefinition[]
  currentTheme: ThemeDefinition
  isLoading: boolean
  error: string | null

  // Theme operations
  setCurrentTheme: (theme: ThemeDefinition) => void
  createTheme: (
    theme: Omit<ThemeDefinition, 'id' | 'createdAt' | 'updatedAt'>
  ) => ThemeDefinition
  updateTheme: (theme: ThemeDefinition) => void
  deleteTheme: (themeId: string) => void
  duplicateTheme: (themeId: string, newName?: string) => ThemeDefinition

  // Import/Export
  exportTheme: (theme: ThemeDefinition) => string
  importTheme: (themeData: string) => ThemeDefinition
  exportAllThemes: () => string
  importThemes: (themesData: string) => ThemeDefinition[]

  // Utilities
  resetToDefaults: () => void
  getThemeById: (id: string) => ThemeDefinition | undefined
  getThemesByCategory: (category: string) => ThemeDefinition[]
  generateThemeId: () => string
  applyThemeToDom: (theme: ThemeDefinition) => void
}

export const useThemeManager = (): UseThemeManagerReturn => {
  const [themes, setThemes] = useState<ThemeDefinition[]>([])
  const [currentTheme, setCurrentThemeState] = useState<ThemeDefinition>(
    BUILT_IN_THEMES[0]
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize themes from localStorage
  useEffect(() => {
    try {
      const storedThemes = localStorage.getItem(STORAGE_KEY)
      const storedCurrentTheme = localStorage.getItem(CURRENT_THEME_KEY)

      let allThemes = [...BUILT_IN_THEMES]

      if (storedThemes) {
        const customThemes = JSON.parse(storedThemes)
        allThemes = [...BUILT_IN_THEMES, ...customThemes]
      }

      setThemes(allThemes)

      if (storedCurrentTheme) {
        const currentThemeData = JSON.parse(storedCurrentTheme)
        const foundTheme = allThemes.find(t => t.id === currentThemeData.id)
        if (foundTheme) {
          setCurrentThemeState(foundTheme)
        }
      }

      setIsLoading(false)
    } catch (err) {
      setError('Failed to load themes from storage')
      setIsLoading(false)
    }
  }, [])

  // Save themes to localStorage
  const saveThemesToStorage = useCallback((themesToSave: ThemeDefinition[]) => {
    try {
      const customThemes = themesToSave.filter(theme => !theme.isBuiltIn)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customThemes))
    } catch (err) {
      setError('Failed to save themes to storage')
    }
  }, [])

  // Save current theme to localStorage
  const saveCurrentThemeToStorage = useCallback((theme: ThemeDefinition) => {
    try {
      localStorage.setItem(CURRENT_THEME_KEY, JSON.stringify({ id: theme.id }))
    } catch (err) {
      setError('Failed to save current theme to storage')
    }
  }, [])

  // Generate unique theme ID
  const generateThemeId = useCallback(() => {
    return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Set current theme
  const setCurrentTheme = useCallback(
    (theme: ThemeDefinition) => {
      setCurrentThemeState(theme)
      saveCurrentThemeToStorage(theme)
      applyThemeToDom(theme)
    },
    [saveCurrentThemeToStorage]
  )

  // Apply theme to DOM
  const applyThemeToDom = useCallback((theme: ThemeDefinition) => {
    const root = document.documentElement
    const { customization } = theme

    // Apply CSS variables
    Object.entries(customization.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    root.style.setProperty('--font-family', customization.typography.fontFamily)
    root.style.setProperty(
      '--font-size',
      `${customization.typography.fontSize}px`
    )
    root.style.setProperty(
      '--line-height',
      customization.typography.lineHeight.toString()
    )
    root.style.setProperty(
      '--letter-spacing',
      `${customization.typography.letterSpacing}px`
    )
    root.style.setProperty(
      '--font-weight',
      customization.typography.fontWeight.toString()
    )

    Object.entries(customization.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, `${value}px`)
    })

    Object.entries(customization.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, `${value}px`)
    })

    Object.entries(customization.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    root.style.setProperty(
      '--animation-duration',
      `${customization.animations.duration}ms`
    )
    root.style.setProperty(
      '--animation-easing',
      customization.animations.easing
    )
  }, [])

  // Create new theme
  const createTheme = useCallback(
    (themeData: Omit<ThemeDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTheme: ThemeDefinition = {
        ...themeData,
        id: generateThemeId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedThemes = [...themes, newTheme]
      setThemes(updatedThemes)
      saveThemesToStorage(updatedThemes)

      return newTheme
    },
    [themes, generateThemeId, saveThemesToStorage]
  )

  // Update theme
  const updateTheme = useCallback(
    (updatedTheme: ThemeDefinition) => {
      const updatedThemeWithTimestamp = {
        ...updatedTheme,
        updatedAt: new Date().toISOString(),
      }

      const updatedThemes = themes.map(theme =>
        theme.id === updatedTheme.id ? updatedThemeWithTimestamp : theme
      )

      setThemes(updatedThemes)
      saveThemesToStorage(updatedThemes)

      // Update current theme if it's the one being updated
      if (currentTheme.id === updatedTheme.id) {
        setCurrentThemeState(updatedThemeWithTimestamp)
      }
    },
    [themes, currentTheme.id, saveThemesToStorage]
  )

  // Delete theme
  const deleteTheme = useCallback(
    (themeId: string) => {
      const updatedThemes = themes.filter(theme => theme.id !== themeId)
      setThemes(updatedThemes)
      saveThemesToStorage(updatedThemes)

      // If deleting current theme, switch to default
      if (currentTheme.id === themeId) {
        setCurrentTheme(BUILT_IN_THEMES[0])
      }
    },
    [themes, currentTheme.id, saveThemesToStorage, setCurrentTheme]
  )

  // Duplicate theme
  const duplicateTheme = useCallback(
    (themeId: string, newName?: string) => {
      const themeToClone = themes.find(theme => theme.id === themeId)
      if (!themeToClone) {
        throw new Error('Theme not found')
      }

      const duplicatedTheme = createTheme({
        ...themeToClone,
        name: newName || `${themeToClone.name} Copy`,
        isBuiltIn: false,
        category: 'custom',
      })

      return duplicatedTheme
    },
    [themes, createTheme]
  )

  // Export theme
  const exportTheme = useCallback((theme: ThemeDefinition) => {
    return JSON.stringify(theme, null, 2)
  }, [])

  // Import theme
  const importTheme = useCallback(
    (themeData: string) => {
      try {
        const parsedTheme = JSON.parse(themeData) as ThemeDefinition

        // Validate theme structure
        if (!parsedTheme.name || !parsedTheme.customization) {
          throw new Error('Invalid theme format')
        }

        // Create new theme with new ID
        const importedTheme = createTheme({
          ...parsedTheme,
          isBuiltIn: false,
          category: 'custom',
        })

        return importedTheme
      } catch (err) {
        throw new Error('Failed to import theme: Invalid format')
      }
    },
    [createTheme]
  )

  // Export all themes
  const exportAllThemes = useCallback(() => {
    const customThemes = themes.filter(theme => !theme.isBuiltIn)
    return JSON.stringify(customThemes, null, 2)
  }, [themes])

  // Import themes
  const importThemes = useCallback(
    (themesData: string) => {
      try {
        const parsedThemes = JSON.parse(themesData) as ThemeDefinition[]

        if (!Array.isArray(parsedThemes)) {
          throw new Error('Invalid themes format')
        }

        const importedThemes = parsedThemes.map(theme =>
          createTheme({
            ...theme,
            isBuiltIn: false,
            category: 'custom',
          })
        )

        return importedThemes
      } catch (err) {
        throw new Error('Failed to import themes: Invalid format')
      }
    },
    [createTheme]
  )

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setThemes(BUILT_IN_THEMES)
    setCurrentTheme(BUILT_IN_THEMES[0])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CURRENT_THEME_KEY)
  }, [setCurrentTheme])

  // Get theme by ID
  const getThemeById = useCallback(
    (id: string) => {
      return themes.find(theme => theme.id === id)
    },
    [themes]
  )

  // Get themes by category
  const getThemesByCategory = useCallback(
    (category: string) => {
      return themes.filter(theme => theme.category === category)
    },
    [themes]
  )

  // Apply current theme to DOM on mount and theme change
  useEffect(() => {
    if (currentTheme) {
      applyThemeToDom(currentTheme)
    }
  }, [currentTheme, applyThemeToDom])

  return {
    themes,
    currentTheme,
    isLoading,
    error,
    setCurrentTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    exportTheme,
    importTheme,
    exportAllThemes,
    importThemes,
    resetToDefaults,
    getThemeById,
    getThemesByCategory,
    generateThemeId,
    applyThemeToDom,
  }
}
