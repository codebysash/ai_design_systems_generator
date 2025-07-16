'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomizationValue } from './advanced-customization-panel'
import { RotateCcw } from 'lucide-react'

interface SpacingControlsProps {
  spacing: CustomizationValue['spacing']
  borderRadius: CustomizationValue['borderRadius']
  onSpacingChange: (
    key: keyof CustomizationValue['spacing'],
    value: number
  ) => void
  onBorderRadiusChange: (
    key: keyof CustomizationValue['borderRadius'],
    value: number
  ) => void
}

const SPACING_PRESETS = {
  tight: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
  normal: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  relaxed: { xs: 6, sm: 12, md: 24, lg: 36, xl: 48 },
  loose: { xs: 8, sm: 16, md: 32, lg: 48, xl: 64 },
}

const RADIUS_PRESETS = {
  sharp: { sm: 0, md: 0, lg: 0 },
  subtle: { sm: 2, md: 4, lg: 6 },
  normal: { sm: 4, md: 8, lg: 12 },
  rounded: { sm: 6, md: 12, lg: 16 },
  pill: { sm: 12, md: 24, lg: 32 },
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  spacing,
  borderRadius,
  onSpacingChange,
  onBorderRadiusChange,
}) => {
  const applySpacingPreset = (preset: keyof typeof SPACING_PRESETS) => {
    const values = SPACING_PRESETS[preset]
    Object.entries(values).forEach(([key, value]) => {
      onSpacingChange(key as keyof CustomizationValue['spacing'], value)
    })
  }

  const applyRadiusPreset = (preset: keyof typeof RADIUS_PRESETS) => {
    const values = RADIUS_PRESETS[preset]
    Object.entries(values).forEach(([key, value]) => {
      onBorderRadiusChange(
        key as keyof CustomizationValue['borderRadius'],
        value
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Spacing Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Spacing Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(SPACING_PRESETS).map(preset => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() =>
                applySpacingPreset(preset as keyof typeof SPACING_PRESETS)
              }
              className="capitalize"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Individual Spacing Controls */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Spacing Scale</Label>
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm capitalize">{key}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value}
                  onChange={e =>
                    onSpacingChange(
                      key as keyof CustomizationValue['spacing'],
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-16 h-8 text-xs"
                  min={0}
                  max={128}
                />
                <span className="text-xs text-muted-foreground w-6">px</span>
              </div>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) =>
                onSpacingChange(
                  key as keyof CustomizationValue['spacing'],
                  newValue
                )
              }
              min={0}
              max={128}
              step={2}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Spacing Visual Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Spacing Preview</Label>
        <div className="p-4 border rounded-md bg-card">
          <div className="space-y-1">
            {Object.entries(spacing).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-6 capitalize">{key}:</span>
                <div
                  className="bg-primary/20 border border-primary/30 flex items-center justify-center text-xs"
                  style={{
                    width: `${Math.max(value, 16)}px`,
                    height: '16px',
                    minWidth: '16px',
                  }}
                >
                  {value}px
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Border Radius Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Border Radius Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(RADIUS_PRESETS).map(preset => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() =>
                applyRadiusPreset(preset as keyof typeof RADIUS_PRESETS)
              }
              className="capitalize"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Individual Border Radius Controls */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Border Radius Scale</Label>
        {Object.entries(borderRadius).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm capitalize">{key}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value}
                  onChange={e =>
                    onBorderRadiusChange(
                      key as keyof CustomizationValue['borderRadius'],
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-16 h-8 text-xs"
                  min={0}
                  max={50}
                />
                <span className="text-xs text-muted-foreground w-6">px</span>
              </div>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) =>
                onBorderRadiusChange(
                  key as keyof CustomizationValue['borderRadius'],
                  newValue
                )
              }
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Border Radius Visual Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Border Radius Preview</Label>
        <div className="p-4 border rounded-md bg-card">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(borderRadius).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-16 h-16 bg-primary/20 border border-primary/30 mx-auto mb-2 flex items-center justify-center text-xs"
                  style={{ borderRadius: `${value}px` }}
                >
                  {value}px
                </div>
                <span className="text-xs capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Layout Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Layout Example</Label>
        <div className="p-4 border rounded-md bg-card">
          <div
            className="bg-muted p-4 rounded-md"
            style={{
              padding: `${spacing.md}px`,
              borderRadius: `${borderRadius.md}px`,
            }}
          >
            <div
              className="bg-background border rounded p-3 mb-3"
              style={{
                padding: `${spacing.sm}px`,
                borderRadius: `${borderRadius.sm}px`,
                marginBottom: `${spacing.sm}px`,
              }}
            >
              <h4 className="font-medium mb-2">Card Header</h4>
              <p className="text-sm text-muted-foreground">
                This demonstrates your spacing and border radius settings.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium"
                style={{
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  borderRadius: `${borderRadius.sm}px`,
                }}
              >
                Button
              </button>
              <button
                className="bg-secondary text-secondary-foreground px-3 py-1 text-sm"
                style={{
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  borderRadius: `${borderRadius.sm}px`,
                }}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
