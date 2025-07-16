'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Eye,
  Plus,
  Settings,
  Wand2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomizationValue } from './advanced-customization-panel'
import { ColorPicker } from './color-picker'

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  category: 'light' | 'dark' | 'high-contrast' | 'custom'
  customization: CustomizationValue
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

interface AdvancedThemeEditorProps {
  currentTheme: ThemeDefinition
  themes: ThemeDefinition[]
  onThemeChange: (theme: ThemeDefinition) => void
  onThemeCreate: (
    theme: Omit<ThemeDefinition, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  onThemeUpdate: (theme: ThemeDefinition) => void
  onThemeDelete: (themeId: string) => void
  onThemeExport: (theme: ThemeDefinition) => void
  onThemeImport: (themeData: string) => void
  className?: string
}

const BUILT_IN_THEMES: Omit<
  ThemeDefinition,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: 'Modern Light',
    description: 'Clean and modern light theme with subtle shadows',
    category: 'light',
    isBuiltIn: true,
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
    name: 'Dark Pro',
    description: 'Professional dark theme optimized for long work sessions',
    category: 'dark',
    isBuiltIn: true,
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
    name: 'High Contrast',
    description: 'Maximum contrast theme for accessibility',
    category: 'high-contrast',
    isBuiltIn: true,
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

export const AdvancedThemeEditor: React.FC<AdvancedThemeEditorProps> = ({
  currentTheme,
  themes,
  onThemeChange,
  onThemeCreate,
  onThemeUpdate,
  onThemeDelete,
  onThemeExport,
  onThemeImport,
  className = '',
}) => {
  const [editingTheme, setEditingTheme] = useState<ThemeDefinition | null>(null)
  const [newThemeName, setNewThemeName] = useState('')
  const [newThemeDescription, setNewThemeDescription] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [previewMode, setPreviewMode] = useState<'live' | 'side-by-side'>(
    'live'
  )
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return themes
    return themes.filter(theme => theme.category === selectedCategory)
  }, [themes, selectedCategory])

  const handleThemeSelect = useCallback(
    (theme: ThemeDefinition) => {
      onThemeChange(theme)
      setEditingTheme(null)
    },
    [onThemeChange]
  )

  const handleThemeEdit = useCallback((theme: ThemeDefinition) => {
    setEditingTheme({ ...theme })
  }, [])

  const handleThemeSave = useCallback(() => {
    if (!editingTheme) return

    if (editingTheme.isBuiltIn) {
      // Create a new theme based on built-in theme
      const newTheme = {
        ...editingTheme,
        name: `${editingTheme.name} (Custom)`,
        isBuiltIn: false,
        category: 'custom' as const,
      }
      onThemeCreate(newTheme)
    } else {
      onThemeUpdate(editingTheme)
    }
    setEditingTheme(null)
  }, [editingTheme, onThemeCreate, onThemeUpdate])

  const handleThemeCreate = useCallback(() => {
    if (!newThemeName.trim()) return

    const newTheme = {
      name: newThemeName,
      description: newThemeDescription || 'Custom theme',
      category: 'custom' as const,
      isBuiltIn: false,
      customization: { ...currentTheme.customization },
    }

    onThemeCreate(newTheme)
    setNewThemeName('')
    setNewThemeDescription('')
    setShowCreateForm(false)
  }, [
    newThemeName,
    newThemeDescription,
    currentTheme.customization,
    onThemeCreate,
  ])

  const handleColorChange = useCallback(
    (colorKey: keyof CustomizationValue['colors'], color: string) => {
      if (!editingTheme) return

      setEditingTheme({
        ...editingTheme,
        customization: {
          ...editingTheme.customization,
          colors: {
            ...editingTheme.customization.colors,
            [colorKey]: color,
          },
        },
      })
    },
    [editingTheme]
  )

  const generateThemeFromColors = useCallback(
    (baseColor: string) => {
      // Generate a complete theme from a base color
      const hsl = hexToHsl(baseColor)
      const variations = generateColorVariations(hsl)

      if (editingTheme) {
        setEditingTheme({
          ...editingTheme,
          customization: {
            ...editingTheme.customization,
            colors: {
              ...editingTheme.customization.colors,
              primary: baseColor,
              secondary: variations.secondary,
              accent: variations.accent,
              success: variations.success,
              warning: variations.warning,
              error: variations.error,
            },
          },
        })
      }
    },
    [editingTheme]
  )

  const getThemeIcon = (category: string) => {
    switch (category) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'high-contrast':
        return <Monitor className="h-4 w-4" />
      default:
        return <Palette className="h-4 w-4" />
    }
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Advanced Theme Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPreviewMode(prev =>
                prev === 'live' ? 'side-by-side' : 'live'
              )
            }
          >
            <Eye className="h-4 w-4" />
            {previewMode === 'live' ? 'Live' : 'Side-by-Side'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4" />
            New Theme
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4 mt-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Category:</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredThemes.map(theme => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme.category)}
                        <CardTitle className="text-sm">{theme.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {theme.isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">
                            Built-in
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            handleThemeEdit(theme)
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Color Palette Preview */}
                    <div className="flex gap-1 mb-2">
                      {Object.entries(theme.customization.colors)
                        .slice(0, 6)
                        .map(([key, color]) => (
                          <div
                            key={key}
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: color }}
                            title={`${key}: ${color}`}
                          />
                        ))}
                    </div>

                    {/* Theme Stats */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Radius: {theme.customization.borderRadius.md}px
                      </span>
                      <span>
                        Animation:{' '}
                        {theme.customization.animations.enabled ? 'On' : 'Off'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create Theme Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Create New Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm">Theme Name</Label>
                        <Input
                          value={newThemeName}
                          onChange={e => setNewThemeName(e.target.value)}
                          placeholder="Enter theme name..."
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Description</Label>
                        <Input
                          value={newThemeDescription}
                          onChange={e => setNewThemeDescription(e.target.value)}
                          placeholder="Enter theme description..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleThemeCreate}
                          disabled={!newThemeName.trim()}
                        >
                          Create Theme
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4 mt-4">
            {editingTheme ? (
              <div className="space-y-6">
                {/* Theme Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Editing: {editingTheme.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {editingTheme.description}
                    </p>
                  </CardHeader>
                </Card>

                {/* Color Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(editingTheme.customization.colors).map(
                      ([key, color]) => (
                        <div key={key} className="flex items-center gap-3">
                          <Label className="capitalize min-w-[80px] text-sm">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <ColorPicker
                            value={color}
                            onChange={newColor =>
                              handleColorChange(
                                key as keyof CustomizationValue['colors'],
                                newColor
                              )
                            }
                          />
                          <Input
                            value={color}
                            onChange={e =>
                              handleColorChange(
                                key as keyof CustomizationValue['colors'],
                                e.target.value
                              )
                            }
                            className="font-mono text-xs flex-1"
                            placeholder="#000000"
                          />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTheme(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleThemeSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Theme
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a theme to start editing</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="generator" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Theme Generator</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Generate themes automatically from colors or descriptions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Base Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <ColorPicker
                      value="#3b82f6"
                      onChange={generateThemeFromColors}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateThemeFromColors('#3b82f6')}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Helper functions
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (0 <= h && h < 1 / 6) {
    r = c
    g = x
    b = 0
  } else if (1 / 6 <= h && h < 1 / 3) {
    r = x
    g = c
    b = 0
  } else if (1 / 3 <= h && h < 1 / 2) {
    r = 0
    g = c
    b = x
  } else if (1 / 2 <= h && h < 2 / 3) {
    r = 0
    g = x
    b = c
  } else if (2 / 3 <= h && h < 5 / 6) {
    r = x
    g = 0
    b = c
  } else if (5 / 6 <= h && h < 1) {
    r = c
    g = 0
    b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function generateColorVariations(baseHsl: [number, number, number]) {
  const [h, s, l] = baseHsl

  return {
    secondary: hslToHex(h + 180, Math.max(s - 20, 10), l),
    accent: hslToHex(h + 60, s, l),
    success: hslToHex(120, s, l),
    warning: hslToHex(45, s, l),
    error: hslToHex(0, s, l),
  }
}
