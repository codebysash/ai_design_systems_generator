'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Palette,
  Eye,
  Split,
  Maximize2,
  Minimize2,
  Download,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComponentPlayground } from '@/lib/preview/component-playground'
import {
  AdvancedCustomizationPanel,
  CustomizationValue,
} from './advanced-customization-panel'
import { AdvancedThemeEditor, ThemeDefinition } from './advanced-theme-editor'
import { ThemeLivePreview } from './theme-live-preview'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { GeneratedDesignSystem } from '@/types'

interface EnhancedPlaygroundWithThemesProps {
  designSystem?: GeneratedDesignSystem
  onExport?: (format: 'react' | 'css' | 'tokens', data: any) => void
  className?: string
}

type ViewMode = 'playground' | 'themes' | 'preview'
type LayoutMode = 'split' | 'fullscreen' | 'tabs'

export const EnhancedPlaygroundWithThemes: React.FC<
  EnhancedPlaygroundWithThemesProps
> = ({ designSystem, onExport, className = '' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('playground')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState('components')

  const {
    themes,
    currentTheme,
    setCurrentTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    exportTheme,
    importTheme,
  } = useThemeManager()

  const [customization, setCustomization] = useState<CustomizationValue>(
    currentTheme.customization
  )

  const handleThemeChange = useCallback(
    (theme: ThemeDefinition) => {
      setCurrentTheme(theme)
      setCustomization(theme.customization)
    },
    [setCurrentTheme]
  )

  const handleCustomizationChange = useCallback(
    (newCustomization: CustomizationValue) => {
      setCustomization(newCustomization)

      // Update current theme with new customization
      const updatedTheme: ThemeDefinition = {
        ...currentTheme,
        customization: newCustomization,
      }

      if (!currentTheme.isBuiltIn) {
        updateTheme(updatedTheme)
      }
    },
    [currentTheme, updateTheme]
  )

  const handleThemeCreate = useCallback(
    (themeData: Omit<ThemeDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTheme = createTheme(themeData)
      setCurrentTheme(newTheme)
    },
    [createTheme, setCurrentTheme]
  )

  const handleExport = useCallback(
    (format: 'react' | 'css' | 'tokens') => {
      let exportData

      switch (format) {
        case 'css':
          exportData = generateCSS(customization)
          break
        case 'tokens':
          exportData = generateTokens(customization)
          break
        case 'react':
          exportData = generateReactTheme(customization)
          break
      }

      onExport?.(format, exportData)
    },
    [customization, onExport]
  )

  const handleThemeExport = useCallback(
    (theme: ThemeDefinition) => {
      const themeData = exportTheme(theme)

      // Create and download file
      const blob = new Blob([themeData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [exportTheme]
  )

  const handleThemeImport = useCallback(
    (themeData: string) => {
      try {
        const importedTheme = importTheme(themeData)
        setCurrentTheme(importedTheme)
      } catch (error) {
        console.error('Failed to import theme:', error)
      }
    },
    [importTheme, setCurrentTheme]
  )

  const renderMainContent = () => {
    if (layoutMode === 'tabs') {
      return (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="flex-1 mt-4">
            {designSystem ? (
              <ComponentPlayground
                designSystem={designSystem.designSystem}
                components={designSystem.components}
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No design system loaded</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="themes" className="flex-1 mt-4">
            <AdvancedThemeEditor
              currentTheme={currentTheme}
              themes={themes}
              onThemeChange={handleThemeChange}
              onThemeCreate={handleThemeCreate}
              onThemeUpdate={updateTheme}
              onThemeDelete={deleteTheme}
              onThemeExport={handleThemeExport}
              onThemeImport={handleThemeImport}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 mt-4">
            <ThemeLivePreview theme={currentTheme} className="h-full" />
          </TabsContent>
        </Tabs>
      )
    }

    if (layoutMode === 'fullscreen') {
      switch (viewMode) {
        case 'playground':
          return designSystem ? (
            <ComponentPlayground
              designSystem={designSystem.designSystem}
              components={designSystem.components}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No design system loaded</p>
            </div>
          )
        case 'themes':
          return (
            <AdvancedThemeEditor
              currentTheme={currentTheme}
              themes={themes}
              onThemeChange={handleThemeChange}
              onThemeCreate={handleThemeCreate}
              onThemeUpdate={updateTheme}
              onThemeDelete={deleteTheme}
              onThemeExport={handleThemeExport}
              onThemeImport={handleThemeImport}
              className="h-full"
            />
          )
        case 'preview':
          return <ThemeLivePreview theme={currentTheme} className="h-full" />
      }
    }

    // Split layout
    return (
      <div className="flex h-full gap-4">
        <div className="flex-1 min-w-0">
          {viewMode === 'playground' && designSystem ? (
            <ComponentPlayground
              designSystem={designSystem.designSystem}
              components={designSystem.components}
              className="h-full"
            />
          ) : viewMode === 'themes' ? (
            <AdvancedThemeEditor
              currentTheme={currentTheme}
              themes={themes}
              onThemeChange={handleThemeChange}
              onThemeCreate={handleThemeCreate}
              onThemeUpdate={updateTheme}
              onThemeDelete={deleteTheme}
              onThemeExport={handleThemeExport}
              onThemeImport={handleThemeImport}
              className="h-full"
            />
          ) : (
            <ThemeLivePreview theme={currentTheme} className="h-full" />
          )}
        </div>

        <div className="w-96 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Customization</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {currentTheme.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)]">
              <AdvancedCustomizationPanel
                value={customization}
                onChange={handleCustomizationChange}
                onReset={() => setCustomization(currentTheme.customization)}
                onExport={() => handleExport('css')}
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Design System Playground</h1>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {currentTheme.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentTheme.name}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
            <Button
              variant={viewMode === 'playground' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('playground')}
            >
              <Settings className="h-4 w-4" />
              Components
            </Button>
            <Button
              variant={viewMode === 'themes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('themes')}
            >
              <Palette className="h-4 w-4" />
              Themes
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          {/* Layout Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
            <Button
              variant={layoutMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutMode('split')}
              title="Split Layout"
            >
              <Split className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === 'tabs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutMode('tabs')}
              title="Tabbed Layout"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === 'fullscreen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutMode('fullscreen')}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('tokens')}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">{renderMainContent()}</div>
    </div>
  )
}

// Helper functions for export
function generateCSS(customization: CustomizationValue): string {
  return `
:root {
  /* Colors */
  --color-primary: ${customization.colors.primary};
  --color-secondary: ${customization.colors.secondary};
  --color-accent: ${customization.colors.accent};
  --color-neutral: ${customization.colors.neutral};
  --color-success: ${customization.colors.success};
  --color-warning: ${customization.colors.warning};
  --color-error: ${customization.colors.error};
  --color-background: ${customization.colors.background};
  --color-foreground: ${customization.colors.foreground};
  
  /* Typography */
  --font-family: ${customization.typography.fontFamily};
  --font-size: ${customization.typography.fontSize}px;
  --line-height: ${customization.typography.lineHeight};
  --letter-spacing: ${customization.typography.letterSpacing}px;
  --font-weight: ${customization.typography.fontWeight};
  
  /* Spacing */
  --spacing-xs: ${customization.spacing.xs}px;
  --spacing-sm: ${customization.spacing.sm}px;
  --spacing-md: ${customization.spacing.md}px;
  --spacing-lg: ${customization.spacing.lg}px;
  --spacing-xl: ${customization.spacing.xl}px;
  
  /* Border Radius */
  --radius-sm: ${customization.borderRadius.sm}px;
  --radius-md: ${customization.borderRadius.md}px;
  --radius-lg: ${customization.borderRadius.lg}px;
  
  /* Shadows */
  --shadow-sm: ${customization.shadows.sm};
  --shadow-md: ${customization.shadows.md};
  --shadow-lg: ${customization.shadows.lg};
  
  /* Animations */
  --animation-duration: ${customization.animations.duration}ms;
  --animation-easing: ${customization.animations.easing};
}`.trim()
}

function generateTokens(
  customization: CustomizationValue
): Record<string, any> {
  return {
    colors: customization.colors,
    typography: customization.typography,
    spacing: customization.spacing,
    borderRadius: customization.borderRadius,
    shadows: customization.shadows,
    animations: customization.animations,
  }
}

function generateReactTheme(customization: CustomizationValue): string {
  return `
export const theme = {
  colors: ${JSON.stringify(customization.colors, null, 2)},
  typography: ${JSON.stringify(customization.typography, null, 2)},
  spacing: ${JSON.stringify(customization.spacing, null, 2)},
  borderRadius: ${JSON.stringify(customization.borderRadius, null, 2)},
  shadows: ${JSON.stringify(customization.shadows, null, 2)},
  animations: ${JSON.stringify(customization.animations, null, 2)}
};`.trim()
}
