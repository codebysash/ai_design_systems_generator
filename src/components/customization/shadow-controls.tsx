'use client'

import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CustomizationValue } from './advanced-customization-panel'

interface ShadowControlsProps {
  value: CustomizationValue['shadows']
  onChange: (key: keyof CustomizationValue['shadows'], shadow: string) => void
}

const SHADOW_PRESETS = {
  none: {
    sm: 'none',
    md: 'none',
    lg: 'none',
  },
  subtle: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  normal: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  dramatic: {
    sm: '0 2px 4px 0 rgb(0 0 0 / 0.2)',
    md: '0 8px 16px 0 rgb(0 0 0 / 0.15)',
    lg: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  colored: {
    sm: '0 1px 3px 0 rgb(59 130 246 / 0.1)',
    md: '0 4px 12px 0 rgb(59 130 246 / 0.15)',
    lg: '0 20px 25px -5px rgb(59 130 246 / 0.1), 0 8px 10px -6px rgb(59 130 246 / 0.1)',
  },
}

const EXAMPLE_ELEMENTS = [
  { name: 'Card', shadow: 'md' },
  { name: 'Button', shadow: 'sm' },
  { name: 'Modal', shadow: 'lg' },
  { name: 'Dropdown', shadow: 'md' },
  { name: 'Tooltip', shadow: 'sm' },
]

export const ShadowControls: React.FC<ShadowControlsProps> = ({
  value,
  onChange,
}) => {
  const [activeEdit, setActiveEdit] = useState<
    keyof CustomizationValue['shadows'] | null
  >(null)

  const applyPreset = (preset: keyof typeof SHADOW_PRESETS) => {
    const shadows = SHADOW_PRESETS[preset]
    Object.entries(shadows).forEach(([key, shadow]) => {
      onChange(key as keyof CustomizationValue['shadows'], shadow)
    })
  }

  const handleShadowEdit = (
    key: keyof CustomizationValue['shadows'],
    shadow: string
  ) => {
    onChange(key, shadow)
  }

  return (
    <div className="space-y-6">
      {/* Shadow Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Shadow Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(SHADOW_PRESETS).map(preset => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset as keyof typeof SHADOW_PRESETS)}
              className="capitalize"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Individual Shadow Controls */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Shadow Settings</Label>
        {Object.entries(value).map(([key, shadow]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm capitalize font-medium">{key}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActiveEdit(
                    activeEdit === key
                      ? null
                      : (key as keyof CustomizationValue['shadows'])
                  )
                }
              >
                {activeEdit === key ? 'Done' : 'Edit'}
              </Button>
            </div>

            {activeEdit === key ? (
              <Textarea
                value={shadow}
                onChange={e =>
                  handleShadowEdit(
                    key as keyof CustomizationValue['shadows'],
                    e.target.value
                  )
                }
                placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                className="font-mono text-xs"
                rows={2}
              />
            ) : (
              <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                {shadow || 'none'}
              </div>
            )}

            {/* Preview Box */}
            <div className="flex justify-center py-4">
              <div
                className="w-24 h-16 bg-background border rounded-md flex items-center justify-center text-xs font-medium"
                style={{ boxShadow: shadow }}
              >
                {key.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shadow Comparison */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Shadow Comparison</Label>
        <div className="p-6 bg-muted/30 rounded-lg">
          <div className="flex justify-center gap-8">
            {Object.entries(value).map(([key, shadow]) => (
              <div key={key} className="text-center">
                <div
                  className="w-20 h-20 bg-background border rounded-md mb-2 flex items-center justify-center text-xs font-medium"
                  style={{ boxShadow: shadow }}
                >
                  {key.toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-world Examples */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Component Examples</Label>
        <div className="space-y-3">
          {EXAMPLE_ELEMENTS.map(element => {
            const shadowKey =
              element.shadow as keyof CustomizationValue['shadows']
            const shadowValue = value[shadowKey]

            return (
              <div
                key={element.name}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
              >
                <span className="text-sm font-medium">{element.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {element.shadow} shadow
                  </span>
                  <div
                    className="w-12 h-8 bg-background border rounded flex items-center justify-center text-xs"
                    style={{ boxShadow: shadowValue }}
                  >
                    {element.name[0]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CSS Output */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">CSS Variables</Label>
        <div className="p-3 bg-muted rounded-md">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {Object.entries(value)
              .map(([key, shadow]) => `--shadow-${key}: ${shadow};`)
              .join('\n')}
          </pre>
        </div>
      </div>
    </div>
  )
}
