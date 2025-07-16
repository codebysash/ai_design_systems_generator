'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { ComponentPlayground } from '@/lib/preview/component-playground'
import {
  AdvancedCustomizationPanel,
  CustomizationValue,
} from './advanced-customization-panel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  Eye,
  Code,
  Download,
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeneratedDesignSystem } from '@/types'

interface EnhancedComponentPlaygroundProps {
  designSystem?: GeneratedDesignSystem
  initialCustomization?: Partial<CustomizationValue>
  onCustomizationChange?: (customization: CustomizationValue) => void
  onExport?: (format: 'react' | 'css' | 'tokens') => void
  className?: string
}

const DEFAULT_CUSTOMIZATION: CustomizationValue = {
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
    sm: 4,
    md: 8,
    lg: 12,
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
}

export const EnhancedComponentPlayground: React.FC<
  EnhancedComponentPlaygroundProps
> = ({
  designSystem,
  initialCustomization = {},
  onCustomizationChange,
  onExport,
  className = '',
}) => {
  const [customization, setCustomization] = useState<CustomizationValue>({
    ...DEFAULT_CUSTOMIZATION,
    ...initialCustomization,
  })

  const [layout, setLayout] = useState<'split' | 'preview' | 'customize'>(
    'split'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const handleCustomizationChange = useCallback(
    (newCustomization: CustomizationValue) => {
      setCustomization(newCustomization)
      onCustomizationChange?.(newCustomization)
    },
    [onCustomizationChange]
  )

  const handleReset = useCallback(() => {
    setCustomization(DEFAULT_CUSTOMIZATION)
    onCustomizationChange?.(DEFAULT_CUSTOMIZATION)
  }, [onCustomizationChange])

  const handleExport = useCallback(() => {
    // Generate export data based on current customization
    const exportData = {
      css: generateCSS(customization),
      tokens: generateTokens(customization),
      react: generateReactTheme(customization),
    }

    onExport?.('tokens')
  }, [customization, onExport])

  // Apply customization as CSS variables
  const customStyles = useMemo(() => {
    return {
      '--color-primary': customization.colors.primary,
      '--color-secondary': customization.colors.secondary,
      '--color-accent': customization.colors.accent,
      '--color-neutral': customization.colors.neutral,
      '--color-success': customization.colors.success,
      '--color-warning': customization.colors.warning,
      '--color-error': customization.colors.error,
      '--color-background': customization.colors.background,
      '--color-foreground': customization.colors.foreground,
      '--font-family': customization.typography.fontFamily,
      '--font-size': `${customization.typography.fontSize}px`,
      '--line-height': customization.typography.lineHeight,
      '--letter-spacing': `${customization.typography.letterSpacing}px`,
      '--font-weight': customization.typography.fontWeight,
      '--spacing-xs': `${customization.spacing.xs}px`,
      '--spacing-sm': `${customization.spacing.sm}px`,
      '--spacing-md': `${customization.spacing.md}px`,
      '--spacing-lg': `${customization.spacing.lg}px`,
      '--spacing-xl': `${customization.spacing.xl}px`,
      '--radius-sm': `${customization.borderRadius.sm}px`,
      '--radius-md': `${customization.borderRadius.md}px`,
      '--radius-lg': `${customization.borderRadius.lg}px`,
      '--shadow-sm': customization.shadows.sm,
      '--shadow-md': customization.shadows.md,
      '--shadow-lg': customization.shadows.lg,
      '--animation-duration': `${customization.animations.duration}ms`,
      '--animation-easing': customization.animations.easing,
    } as React.CSSProperties
  }, [customization])

  const layoutVariants = {
    split: { width: '50%' },
    preview: { width: '100%' },
    customize: { width: '0%' },
  }

  const panelVariants = {
    open: { width: '400px', opacity: 1 },
    closed: { width: '0px', opacity: 0 },
  }

  return (
    <div
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}
      style={customStyles}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Enhanced Component Playground
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Controls */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
            <Button
              variant={layout === 'customize' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('customize')}
            >
              <Settings className="h-4 w-4" />
              Customize
            </Button>
            <Button
              variant={layout === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('split')}
            >
              <PanelLeftOpen className="h-4 w-4" />
              Split
            </Button>
            <Button
              variant={layout === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('preview')}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          {/* Panel Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            {isPanelOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
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

          {/* Export */}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Preview */}
        <motion.div
          className="flex-1 min-w-0"
          animate={layoutVariants[layout]}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {layout !== 'customize' && designSystem && (
            <ComponentPlayground
              designSystem={designSystem.designSystem}
              components={designSystem.components}
              className="h-full"
            />
          )}
        </motion.div>

        {/* Customization Panel */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              className="border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="w-[400px] h-full">
                <AdvancedCustomizationPanel
                  value={customization}
                  onChange={handleCustomizationChange}
                  onReset={handleReset}
                  onExport={handleExport}
                  className="h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-none" />
      )}
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
