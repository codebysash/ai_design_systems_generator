'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './theme-provider'
import { themeGenerator } from '@/lib/design-system/themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface ThemeSwitcherProps {
  className?: string
  showVariants?: boolean
  showPresets?: boolean
  compact?: boolean
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  showVariants = true,
  showPresets = true,
  compact = false
}) => {
  const { theme, designSystem, currentTheme, toggleTheme, applyTheme, resetTheme } = useTheme()
  const [selectedVariant, setSelectedVariant] = useState<string>('default')
  const [selectedPreset, setSelectedPreset] = useState<string>('system')

  if (!designSystem) {
    return null
  }

  const handleVariantChange = (variantName: string) => {
    setSelectedVariant(variantName)
    if (variantName === 'default') {
      const defaultTheme = themeGenerator.generateTheme(designSystem, theme)
      applyTheme(defaultTheme)
    } else {
      // Generate theme variant
      const baseTheme = themeGenerator.generateTheme(designSystem, theme)
      const variants = themeGenerator.generateThemeVariants(baseTheme)
      const selectedVariantObj = variants.find(v => v.name.includes(variantName))
      
      if (selectedVariantObj) {
        const variantTheme = themeGenerator.applyThemeVariant(baseTheme, selectedVariantObj)
        applyTheme(variantTheme)
      }
    }
  }

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName)
    
    switch (presetName) {
      case 'system':
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        const systemTheme = themeGenerator.generateTheme(designSystem, systemPreference)
        applyTheme(systemTheme)
        break
      case 'light':
        const lightTheme = themeGenerator.generateTheme(designSystem, 'light')
        applyTheme(lightTheme)
        break
      case 'dark':
        const darkTheme = themeGenerator.generateTheme(designSystem, 'dark')
        applyTheme(darkTheme)
        break
      case 'high-contrast':
        const highContrastTheme = generateHighContrastTheme(designSystem, theme)
        applyTheme(highContrastTheme)
        break
      default:
        resetTheme()
    }
  }

  const generateHighContrastTheme = (designSystem: any, mode: 'light' | 'dark') => {
    const baseTheme = themeGenerator.generateTheme(designSystem, mode)
    // Enhance contrast for accessibility
    const highContrastTheme = {
      ...baseTheme,
      cssVariables: {
        ...baseTheme.cssVariables,
        '--color-primary-500': mode === 'light' ? '#000000' : '#ffffff',
        '--color-neutral-900': mode === 'light' ? '#000000' : '#ffffff',
        '--color-neutral-50': mode === 'light' ? '#ffffff' : '#000000',
      }
    }
    return highContrastTheme
  }

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="flex items-center space-x-2"
        >
          {theme === 'light' ? '🌙' : '☀️'}
          <span className="capitalize">{theme}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetTheme}
        >
          Reset
        </Button>
      </div>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Theme Controls</CardTitle>
        <CardDescription>
          Customize the appearance and theme of your design system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Theme Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme Mode</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={cn('text-sm', theme === 'light' ? 'font-medium' : 'text-gray-500')}>
                Light
              </span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
              <span className={cn('text-sm', theme === 'dark' ? 'font-medium' : 'text-gray-500')}>
                Dark
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {theme}
            </Badge>
          </div>
        </div>

        {/* Theme Presets */}
        {showPresets && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme Presets</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Theme Variants */}
        {showVariants && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme Variants</Label>
            <Select value={selectedVariant} onValueChange={handleVariantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="subtle">Subtle</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Theme Info */}
        {currentTheme && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Theme</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Name:</span>
                <Badge variant="outline">{currentTheme.displayName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mode:</span>
                <Badge variant="outline">{currentTheme.mode}</Badge>
              </div>
              <p className="text-xs text-gray-500">
                {currentTheme.description}
              </p>
            </div>
          </div>
        )}

        {/* Color Palette Preview */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Palette</Label>
          <ColorPalettePreview theme={currentTheme} />
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetTheme}
          >
            Reset Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ColorPalettePreviewProps {
  theme: any
}

const ColorPalettePreview: React.FC<ColorPalettePreviewProps> = ({ theme }) => {
  if (!theme || !theme.colors) {
    return (
      <div className="text-xs text-gray-500">
        No color palette available
      </div>
    )
  }

  const colorGroups = [
    { name: 'Primary', colors: theme.colors.primary },
    { name: 'Secondary', colors: theme.colors.secondary },
    { name: 'Accent', colors: theme.colors.accent },
    { name: 'Neutral', colors: theme.colors.neutral }
  ]

  return (
    <div className="space-y-3">
      {colorGroups.map((group) => (
        <div key={group.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{group.name}</span>
            <Badge variant="outline" className="text-xs">
              {Object.keys(group.colors).length} shades
            </Badge>
          </div>
          <div className="flex space-x-1">
            {Object.entries(group.colors).map(([shade, color]) => (
              <ColorSwatch
                key={shade}
                color={color as string}
                shade={shade}
                name={`${group.name} ${shade}`}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Semantic Colors */}
      {theme.colors.semantic && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Semantic</span>
            <Badge variant="outline" className="text-xs">
              {Object.keys(theme.colors.semantic).length} colors
            </Badge>
          </div>
          <div className="flex space-x-1">
            {Object.entries(theme.colors.semantic).map(([name, color]) => (
              <ColorSwatch
                key={name}
                color={color as string}
                shade={name}
                name={name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ColorSwatchProps {
  color: string
  shade: string
  name: string
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, shade, name }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy color:', err)
    }
  }

  return (
    <div className="relative">
      <button
        className="w-6 h-6 rounded border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={`${name}: ${color}`}
      />
      
      <AnimatePresence>
        {(showTooltip || copied) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10"
          >
            {copied ? 'Copied!' : `${shade}: ${color}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeSwitcher