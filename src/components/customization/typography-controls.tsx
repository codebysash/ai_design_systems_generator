'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomizationValue } from './advanced-customization-panel'

interface TypographyControlsProps {
  value: CustomizationValue['typography']
  onChange: (updates: Partial<CustomizationValue['typography']>) => void
}

const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'Nunito, sans-serif', label: 'Nunito' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  { value: 'Fira Code, monospace', label: 'Fira Code' },
  { value: 'Source Code Pro, monospace', label: 'Source Code Pro' },
]

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin (100)' },
  { value: 200, label: 'Extra Light (200)' },
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' },
]

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Font Family */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font Family</Label>
        <Select
          value={value.fontFamily}
          onValueChange={fontFamily => onChange({ fontFamily })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map(font => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div
          className="text-sm text-muted-foreground p-2 border rounded"
          style={{ fontFamily: value.fontFamily }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Font Size</Label>
          <span className="text-sm text-muted-foreground">
            {value.fontSize}px
          </span>
        </div>
        <Slider
          value={[value.fontSize]}
          onValueChange={([fontSize]) => onChange({ fontSize })}
          min={10}
          max={24}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font Weight</Label>
        <Select
          value={value.fontWeight.toString()}
          onValueChange={weight => onChange({ fontWeight: parseInt(weight) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map(weight => (
              <SelectItem key={weight.value} value={weight.value.toString()}>
                <span style={{ fontWeight: weight.value }}>{weight.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Line Height</Label>
          <span className="text-sm text-muted-foreground">
            {value.lineHeight}
          </span>
        </div>
        <Slider
          value={[value.lineHeight]}
          onValueChange={([lineHeight]) => onChange({ lineHeight })}
          min={1}
          max={2.5}
          step={0.1}
          className="w-full"
        />
        <div
          className="text-sm text-muted-foreground p-2 border rounded leading-none"
          style={{
            fontFamily: value.fontFamily,
            fontSize: `${value.fontSize}px`,
            lineHeight: value.lineHeight,
            fontWeight: value.fontWeight,
          }}
        >
          This is sample text to demonstrate the line height setting. Multiple
          lines help you see how the spacing affects readability.
        </div>
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Letter Spacing</Label>
          <span className="text-sm text-muted-foreground">
            {value.letterSpacing}px
          </span>
        </div>
        <Slider
          value={[value.letterSpacing]}
          onValueChange={([letterSpacing]) => onChange({ letterSpacing })}
          min={-2}
          max={3}
          step={0.1}
          className="w-full"
        />
        <div
          className="text-sm text-muted-foreground p-2 border rounded"
          style={{
            fontFamily: value.fontFamily,
            fontSize: `${value.fontSize}px`,
            letterSpacing: `${value.letterSpacing}px`,
            fontWeight: value.fontWeight,
          }}
        >
          Letter spacing example text
        </div>
      </div>

      {/* Typography Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preview</Label>
        <div className="p-4 border rounded-md bg-card">
          <div
            className="space-y-2"
            style={{
              fontFamily: value.fontFamily,
              fontWeight: value.fontWeight,
            }}
          >
            <h1
              className="text-2xl font-bold"
              style={{
                fontSize: `${value.fontSize * 2}px`,
                lineHeight: value.lineHeight,
                letterSpacing: `${value.letterSpacing}px`,
              }}
            >
              Heading 1
            </h1>
            <h2
              className="text-xl font-semibold"
              style={{
                fontSize: `${value.fontSize * 1.5}px`,
                lineHeight: value.lineHeight,
                letterSpacing: `${value.letterSpacing}px`,
              }}
            >
              Heading 2
            </h2>
            <p
              style={{
                fontSize: `${value.fontSize}px`,
                lineHeight: value.lineHeight,
                letterSpacing: `${value.letterSpacing}px`,
              }}
            >
              This is body text that demonstrates how your typography settings
              will look in practice. It shows the font family, size, weight,
              line height, and letter spacing all working together.
            </p>
            <p
              className="text-sm text-muted-foreground"
              style={{
                fontSize: `${value.fontSize * 0.875}px`,
                lineHeight: value.lineHeight,
                letterSpacing: `${value.letterSpacing}px`,
              }}
            >
              This is smaller text, like captions or secondary information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
