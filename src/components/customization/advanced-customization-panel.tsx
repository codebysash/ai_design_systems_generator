'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColorPicker } from './color-picker'
import { TypographyControls } from './typography-controls'
import { SpacingControls } from './spacing-controls'
import { ShadowControls } from './shadow-controls'
import { AnimationControls } from './animation-controls'
import {
  Palette,
  Type,
  Move,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CustomizationValue {
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
    success: string
    warning: string
    error: string
    background: string
    foreground: string
  }
  typography: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    letterSpacing: number
    fontWeight: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  animations: {
    duration: number
    easing: string
    enabled: boolean
  }
}

interface AdvancedCustomizationPanelProps {
  value: CustomizationValue
  onChange: (value: CustomizationValue) => void
  onReset: () => void
  onExport: () => void
  className?: string
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => (
  <Card className="mb-4">
    <CardHeader className="cursor-pointer select-none pb-3" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </div>
    </CardHeader>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
        >
          <CardContent className="pt-0">{children}</CardContent>
        </motion.div>
      )}
    </AnimatePresence>
  </Card>
)

export const AdvancedCustomizationPanel: React.FC<
  AdvancedCustomizationPanelProps
> = ({ value, onChange, onReset, onExport, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    colors: true,
    typography: false,
    spacing: false,
    shadows: false,
    animations: false,
  })

  const [previewMode, setPreviewMode] = useState<'live' | 'static'>('live')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  const updateColors = useCallback(
    (colorKey: keyof CustomizationValue['colors'], color: string) => {
      onChange({
        ...value,
        colors: {
          ...value.colors,
          [colorKey]: color,
        },
      })
    },
    [value, onChange]
  )

  const updateTypography = useCallback(
    (updates: Partial<CustomizationValue['typography']>) => {
      onChange({
        ...value,
        typography: {
          ...value.typography,
          ...updates,
        },
      })
    },
    [value, onChange]
  )

  const updateSpacing = useCallback(
    (spacingKey: keyof CustomizationValue['spacing'], size: number) => {
      onChange({
        ...value,
        spacing: {
          ...value.spacing,
          [spacingKey]: size,
        },
      })
    },
    [value, onChange]
  )

  const updateBorderRadius = useCallback(
    (radiusKey: keyof CustomizationValue['borderRadius'], radius: number) => {
      onChange({
        ...value,
        borderRadius: {
          ...value.borderRadius,
          [radiusKey]: radius,
        },
      })
    },
    [value, onChange]
  )

  const updateShadows = useCallback(
    (shadowKey: keyof CustomizationValue['shadows'], shadow: string) => {
      onChange({
        ...value,
        shadows: {
          ...value.shadows,
          [shadowKey]: shadow,
        },
      })
    },
    [value, onChange]
  )

  const updateAnimations = useCallback(
    (updates: Partial<CustomizationValue['animations']>) => {
      onChange({
        ...value,
        animations: {
          ...value.animations,
          ...updates,
        },
      })
    },
    [value, onChange]
  )

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(`${label} copied!`)
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [])

  const generateCSS = useMemo(() => {
    return `
:root {
  /* Colors */
  --color-primary: ${value.colors.primary};
  --color-secondary: ${value.colors.secondary};
  --color-accent: ${value.colors.accent};
  --color-neutral: ${value.colors.neutral};
  --color-success: ${value.colors.success};
  --color-warning: ${value.colors.warning};
  --color-error: ${value.colors.error};
  --color-background: ${value.colors.background};
  --color-foreground: ${value.colors.foreground};
  
  /* Typography */
  --font-family: ${value.typography.fontFamily};
  --font-size: ${value.typography.fontSize}px;
  --line-height: ${value.typography.lineHeight};
  --letter-spacing: ${value.typography.letterSpacing}px;
  --font-weight: ${value.typography.fontWeight};
  
  /* Spacing */
  --spacing-xs: ${value.spacing.xs}px;
  --spacing-sm: ${value.spacing.sm}px;
  --spacing-md: ${value.spacing.md}px;
  --spacing-lg: ${value.spacing.lg}px;
  --spacing-xl: ${value.spacing.xl}px;
  
  /* Border Radius */
  --radius-sm: ${value.borderRadius.sm}px;
  --radius-md: ${value.borderRadius.md}px;
  --radius-lg: ${value.borderRadius.lg}px;
  
  /* Shadows */
  --shadow-sm: ${value.shadows.sm};
  --shadow-md: ${value.shadows.md};
  --shadow-lg: ${value.shadows.lg};
  
  /* Animations */
  --animation-duration: ${value.animations.duration}ms;
  --animation-easing: ${value.animations.easing};
}`.trim()
  }, [value])

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Advanced Customization</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPreviewMode(prev => (prev === 'live' ? 'static' : 'live'))
            }
          >
            {previewMode === 'live' ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {previewMode === 'live' ? 'Live' : 'Static'}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual Controls</TabsTrigger>
            <TabsTrigger value="code">Code Output</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4 mt-4">
            {/* Colors Section */}
            <CollapsibleSection
              title="Colors"
              icon={<Palette className="h-4 w-4" />}
              isExpanded={expandedSections.colors}
              onToggle={() => toggleSection('colors')}
            >
              <div className="grid gap-4">
                {Object.entries(value.colors).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="capitalize min-w-[80px] text-sm">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <ColorPicker
                      value={color}
                      onChange={newColor =>
                        updateColors(
                          key as keyof CustomizationValue['colors'],
                          newColor
                        )
                      }
                    />
                    <Input
                      value={color}
                      onChange={e =>
                        updateColors(
                          key as keyof CustomizationValue['colors'],
                          e.target.value
                        )
                      }
                      className="font-mono text-xs"
                      placeholder="#000000"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Typography Section */}
            <CollapsibleSection
              title="Typography"
              icon={<Type className="h-4 w-4" />}
              isExpanded={expandedSections.typography}
              onToggle={() => toggleSection('typography')}
            >
              <TypographyControls
                value={value.typography}
                onChange={updateTypography}
              />
            </CollapsibleSection>

            {/* Spacing Section */}
            <CollapsibleSection
              title="Spacing & Layout"
              icon={<Move className="h-4 w-4" />}
              isExpanded={expandedSections.spacing}
              onToggle={() => toggleSection('spacing')}
            >
              <SpacingControls
                spacing={value.spacing}
                borderRadius={value.borderRadius}
                onSpacingChange={updateSpacing}
                onBorderRadiusChange={updateBorderRadius}
              />
            </CollapsibleSection>

            {/* Shadows Section */}
            <CollapsibleSection
              title="Shadows & Effects"
              icon={<Sparkles className="h-4 w-4" />}
              isExpanded={expandedSections.shadows}
              onToggle={() => toggleSection('shadows')}
            >
              <ShadowControls value={value.shadows} onChange={updateShadows} />
            </CollapsibleSection>

            {/* Animations Section */}
            <CollapsibleSection
              title="Animations"
              icon={<Zap className="h-4 w-4" />}
              isExpanded={expandedSections.animations}
              onToggle={() => toggleSection('animations')}
            >
              <AnimationControls
                value={value.animations}
                onChange={updateAnimations}
              />
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">
                  Generated CSS Variables
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateCSS, 'CSS Variables')}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96 font-mono">
                  {generateCSS}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Copy Feedback */}
      <AnimatePresence>
        {copyFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium shadow-lg"
          >
            {copyFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
