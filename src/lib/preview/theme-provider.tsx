'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { DesignSystemConfig } from '@/types'
import { themeGenerator } from '@/lib/design-system/themes'
import { designTokenGenerator } from '@/lib/design-system/tokens'

export interface ThemeContextType {
  theme: 'light' | 'dark'
  designSystem: DesignSystemConfig | null
  currentTheme: any
  tokens: any
  setTheme: (theme: 'light' | 'dark') => void
  setDesignSystem: (designSystem: DesignSystemConfig) => void
  toggleTheme: () => void
  applyTheme: (theme: any) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark'
  designSystem?: DesignSystemConfig
  storageKey?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  designSystem,
  storageKey = 'ai-design-system-theme'
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme)
  const [currentDesignSystem, setCurrentDesignSystem] = useState<DesignSystemConfig | null>(designSystem || null)
  const [currentTheme, setCurrentTheme] = useState<any>(null)
  const [tokens, setTokens] = useState<any>(null)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemPreference)
    }
  }, [storageKey])

  // Generate theme when design system or theme changes
  useEffect(() => {
    if (currentDesignSystem) {
      const generatedTheme = themeGenerator.generateTheme(currentDesignSystem, theme)
      const generatedTokens = designTokenGenerator.generateTokens(currentDesignSystem)
      
      setCurrentTheme(generatedTheme)
      setTokens(generatedTokens)
      
      // Apply theme to DOM
      applyThemeToDOM(generatedTheme, generatedTokens)
    }
  }, [currentDesignSystem, theme])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const applyThemeToDOM = (themeObj: any, tokensObj: any) => {
    const root = document.documentElement
    
    // Apply CSS variables
    Object.entries(themeObj.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value as string)
    })
    
    // Apply theme class
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Apply data attribute for theme-specific styling
    root.setAttribute('data-theme', theme)
  }

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
  }

  const handleSetDesignSystem = (newDesignSystem: DesignSystemConfig) => {
    setCurrentDesignSystem(newDesignSystem)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const applyTheme = (themeObj: any) => {
    setCurrentTheme(themeObj)
    applyThemeToDOM(themeObj, tokens)
  }

  const resetTheme = () => {
    if (currentDesignSystem) {
      const defaultTheme = themeGenerator.generateTheme(currentDesignSystem, 'light')
      setTheme('light')
      setCurrentTheme(defaultTheme)
      applyThemeToDOM(defaultTheme, tokens)
    }
  }

  const value: ThemeContextType = {
    theme,
    designSystem: currentDesignSystem,
    currentTheme,
    tokens,
    setTheme: handleSetTheme,
    setDesignSystem: handleSetDesignSystem,
    toggleTheme,
    applyTheme,
    resetTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider