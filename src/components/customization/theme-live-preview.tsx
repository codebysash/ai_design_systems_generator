'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Heart,
  Star,
  MessageCircle,
  Share,
  MoreHorizontal,
  Check,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemeDefinition } from './advanced-theme-editor'

interface ThemeLivePreviewProps {
  theme: ThemeDefinition
  showControls?: boolean
  previewMode?: 'components' | 'layout' | 'forms' | 'cards'
  className?: string
}

export const ThemeLivePreview: React.FC<ThemeLivePreviewProps> = ({
  theme,
  showControls = true,
  previewMode = 'components',
  className = '',
}) => {
  const [activeMode, setActiveMode] = useState(previewMode)
  const [interactionState, setInteractionState] = useState({
    buttonHover: false,
    cardHover: false,
    switchValue: false,
    sliderValue: [50],
    inputValue: '',
  })

  // Apply theme styles as CSS variables
  const themeStyles = useMemo(() => {
    const { customization } = theme
    return {
      '--preview-color-primary': customization.colors.primary,
      '--preview-color-secondary': customization.colors.secondary,
      '--preview-color-accent': customization.colors.accent,
      '--preview-color-neutral': customization.colors.neutral,
      '--preview-color-success': customization.colors.success,
      '--preview-color-warning': customization.colors.warning,
      '--preview-color-error': customization.colors.error,
      '--preview-color-background': customization.colors.background,
      '--preview-color-foreground': customization.colors.foreground,
      '--preview-font-family': customization.typography.fontFamily,
      '--preview-font-size': `${customization.typography.fontSize}px`,
      '--preview-line-height': customization.typography.lineHeight,
      '--preview-letter-spacing': `${customization.typography.letterSpacing}px`,
      '--preview-font-weight': customization.typography.fontWeight,
      '--preview-spacing-xs': `${customization.spacing.xs}px`,
      '--preview-spacing-sm': `${customization.spacing.sm}px`,
      '--preview-spacing-md': `${customization.spacing.md}px`,
      '--preview-spacing-lg': `${customization.spacing.lg}px`,
      '--preview-spacing-xl': `${customization.spacing.xl}px`,
      '--preview-radius-sm': `${customization.borderRadius.sm}px`,
      '--preview-radius-md': `${customization.borderRadius.md}px`,
      '--preview-radius-lg': `${customization.borderRadius.lg}px`,
      '--preview-shadow-sm': customization.shadows.sm,
      '--preview-shadow-md': customization.shadows.md,
      '--preview-shadow-lg': customization.shadows.lg,
      '--preview-animation-duration': `${customization.animations.duration}ms`,
      '--preview-animation-easing': customization.animations.easing,
    } as React.CSSProperties
  }, [theme])

  const ComponentsPreview = () => (
    <div className="space-y-6">
      {/* Buttons */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-4 py-2 rounded-md font-medium transition-all"
            style={{
              backgroundColor: 'var(--preview-color-primary)',
              color: 'var(--preview-color-background)',
              borderRadius: 'var(--preview-radius-sm)',
              fontFamily: 'var(--preview-font-family)',
              fontSize: 'var(--preview-font-size)',
              fontWeight: 'var(--preview-font-weight)',
              transitionDuration: 'var(--preview-animation-duration)',
              transitionTimingFunction: 'var(--preview-animation-easing)',
              boxShadow: 'var(--preview-shadow-sm)',
            }}
          >
            Primary
          </button>
          <button
            className="px-4 py-2 rounded-md font-medium border transition-all"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--preview-color-primary)',
              borderColor: 'var(--preview-color-primary)',
              borderRadius: 'var(--preview-radius-sm)',
              fontFamily: 'var(--preview-font-family)',
              fontSize: 'var(--preview-font-size)',
              fontWeight: 'var(--preview-font-weight)',
              transitionDuration: 'var(--preview-animation-duration)',
              transitionTimingFunction: 'var(--preview-animation-easing)',
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded-md font-medium transition-all"
            style={{
              backgroundColor: 'var(--preview-color-accent)',
              color: 'var(--preview-color-background)',
              borderRadius: 'var(--preview-radius-sm)',
              fontFamily: 'var(--preview-font-family)',
              fontSize: 'var(--preview-font-size)',
              fontWeight: 'var(--preview-font-weight)',
              transitionDuration: 'var(--preview-animation-duration)',
              transitionTimingFunction: 'var(--preview-animation-easing)',
              boxShadow: 'var(--preview-shadow-sm)',
            }}
          >
            Accent
          </button>
        </div>
      </div>

      {/* Status Messages */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Status Messages</h3>
        <div className="space-y-2">
          {[
            {
              type: 'success',
              icon: Check,
              message: 'Operation completed successfully',
            },
            {
              type: 'warning',
              icon: AlertTriangle,
              message: 'Please review your input',
            },
            {
              type: 'error',
              icon: X,
              message: 'An error occurred during processing',
            },
            {
              type: 'info',
              icon: Info,
              message: 'Additional information available',
            },
          ].map(({ type, icon: Icon, message }) => (
            <div
              key={type}
              className="flex items-center gap-2 p-3 rounded-md"
              style={{
                backgroundColor: `var(--preview-color-${type})`,
                color: 'var(--preview-color-background)',
                borderRadius: 'var(--preview-radius-sm)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
                opacity: 0.9,
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Elements */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Form Elements</h3>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
                fontWeight: 'var(--preview-font-weight)',
              }}
            >
              Input Field
            </label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full p-2 border rounded-md transition-all focus:outline-none focus:ring-2"
              style={{
                borderColor: 'var(--preview-color-neutral)',
                borderRadius: 'var(--preview-radius-sm)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
                backgroundColor: 'var(--preview-color-background)',
                color: 'var(--preview-color-foreground)',
                transitionDuration: 'var(--preview-animation-duration)',
              }}
              onFocus={e => {
                e.target.style.outline = `2px solid var(--preview-color-primary)`
                e.target.style.outlineOffset = '2px'
              }}
              onBlur={e => {
                e.target.style.outline = 'none'
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded transition-all"
              style={{
                accentColor: 'var(--preview-color-primary)',
                borderRadius: 'var(--preview-radius-sm)',
                transitionDuration: 'var(--preview-animation-duration)',
              }}
            />
            <label
              className="text-sm"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
              }}
            >
              Checkbox option
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const LayoutPreview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="p-4 rounded-md"
        style={{
          backgroundColor: 'var(--preview-color-primary)',
          color: 'var(--preview-color-background)',
          borderRadius: 'var(--preview-radius-md)',
          boxShadow: 'var(--preview-shadow-md)',
        }}
      >
        <h2
          className="text-lg font-bold"
          style={{
            fontFamily: 'var(--preview-font-family)',
            fontWeight: 'calc(var(--preview-font-weight) + 300)',
          }}
        >
          Application Header
        </h2>
        <p
          className="text-sm opacity-90"
          style={{
            fontFamily: 'var(--preview-font-family)',
            fontSize: 'calc(var(--preview-font-size) * 0.875)',
          }}
        >
          Welcome to your dashboard
        </p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1">
        {['Dashboard', 'Projects', 'Settings', 'Help'].map((item, index) => (
          <button
            key={item}
            className="px-3 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor:
                index === 0 ? 'var(--preview-color-accent)' : 'transparent',
              color:
                index === 0
                  ? 'var(--preview-color-background)'
                  : 'var(--preview-color-foreground)',
              borderRadius: 'var(--preview-radius-sm)',
              fontFamily: 'var(--preview-font-family)',
              fontSize: 'calc(var(--preview-font-size) * 0.875)',
              transitionDuration: 'var(--preview-animation-duration)',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(item => (
          <div
            key={item}
            className="p-4 rounded-md border transition-all hover:shadow-lg"
            style={{
              backgroundColor: 'var(--preview-color-background)',
              borderColor: 'var(--preview-color-neutral)',
              borderRadius: 'var(--preview-radius-md)',
              boxShadow: 'var(--preview-shadow-sm)',
              transitionDuration: 'var(--preview-animation-duration)',
            }}
          >
            <h3
              className="font-medium mb-2"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
                fontWeight: 'calc(var(--preview-font-weight) + 100)',
              }}
            >
              Card {item}
            </h3>
            <p
              className="text-sm opacity-75"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'calc(var(--preview-font-size) * 0.875)',
              }}
            >
              Sample content for card {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const CardsPreview = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Profile Card */}
      <div
        className="p-6 rounded-lg border transition-all"
        style={{
          backgroundColor: 'var(--preview-color-background)',
          borderColor: 'var(--preview-color-neutral)',
          borderRadius: 'var(--preview-radius-lg)',
          boxShadow: 'var(--preview-shadow-md)',
          transitionDuration: 'var(--preview-animation-duration)',
        }}
      >
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-12 h-12 rounded-full"
            style={{
              backgroundColor: 'var(--preview-color-primary)',
              borderRadius: 'var(--preview-radius-lg)',
            }}
          />
          <div>
            <h3
              className="font-medium"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'var(--preview-font-size)',
                fontWeight: 'calc(var(--preview-font-weight) + 100)',
              }}
            >
              John Doe
            </h3>
            <p
              className="text-sm opacity-75"
              style={{
                color: 'var(--preview-color-foreground)',
                fontFamily: 'var(--preview-font-family)',
                fontSize: 'calc(var(--preview-font-size) * 0.875)',
              }}
            >
              Product Designer
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {[Heart, MessageCircle, Share].map((Icon, index) => (
            <button
              key={index}
              className="p-2 rounded-md transition-all hover:scale-110"
              style={{
                backgroundColor: 'var(--preview-color-secondary)',
                color: 'var(--preview-color-background)',
                borderRadius: 'var(--preview-radius-sm)',
                transitionDuration: 'var(--preview-animation-duration)',
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: 'var(--preview-color-accent)',
          color: 'var(--preview-color-background)',
          borderRadius: 'var(--preview-radius-lg)',
          boxShadow: 'var(--preview-shadow-lg)',
        }}
      >
        <h3
          className="text-sm font-medium mb-2 opacity-90"
          style={{
            fontFamily: 'var(--preview-font-family)',
            fontSize: 'calc(var(--preview-font-size) * 0.875)',
          }}
        >
          Total Revenue
        </h3>
        <p
          className="text-2xl font-bold mb-1"
          style={{
            fontFamily: 'var(--preview-font-family)',
            fontWeight: 'calc(var(--preview-font-weight) + 400)',
          }}
        >
          $12,345
        </p>
        <p
          className="text-sm opacity-75"
          style={{
            fontFamily: 'var(--preview-font-family)',
            fontSize: 'calc(var(--preview-font-size) * 0.875)',
          }}
        >
          +12% from last month
        </p>
      </div>
    </div>
  )

  const renderPreview = () => {
    switch (activeMode) {
      case 'components':
        return <ComponentsPreview />
      case 'layout':
        return <LayoutPreview />
      case 'cards':
        return <CardsPreview />
      default:
        return <ComponentsPreview />
    }
  }

  return (
    <div className={`h-full ${className}`} style={themeStyles}>
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{theme.name}</Badge>
            <span className="text-sm text-muted-foreground">Live Preview</span>
          </div>
          <Tabs
            value={activeMode}
            onValueChange={value => setActiveMode(value as typeof activeMode)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div
        className="p-6 min-h-[400px]"
        style={{
          backgroundColor: 'var(--preview-color-background)',
          color: 'var(--preview-color-foreground)',
          fontFamily: 'var(--preview-font-family)',
        }}
      >
        {renderPreview()}
      </div>
    </div>
  )
}
