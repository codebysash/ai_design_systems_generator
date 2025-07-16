'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  disabled?: boolean
}

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#808080',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ffa500',
  '#800080',
  '#008000',
  '#000080',
  '#800000',
  '#808000',
  '#c0c0c0',
  '#f0f0f0',
  '#404040',
]

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleColorChange = (color: string) => {
    setInputValue(color)
    onChange(color)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Validate hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    // Reset to valid value if invalid
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)) {
      setInputValue(value)
    }
  }

  const triggerNativeColorPicker = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click()
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Color Swatch Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-8 p-0 border-2"
            style={{ backgroundColor: value }}
            disabled={disabled}
            aria-label="Open color picker"
          >
            <span className="sr-only">Current color: {value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" side="bottom" align="start">
          <div className="space-y-3">
            {/* Preset Colors */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Preset Colors
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                      value === color
                        ? 'border-primary ring-2 ring-primary/50'
                        : 'border-border'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Native Color Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Custom Color
              </label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={triggerNativeColorPicker}
              >
                Open Color Picker
              </Button>
              <input
                ref={colorInputRef}
                type="color"
                value={value}
                onChange={e => handleColorChange(e.target.value)}
                className="sr-only"
                disabled={disabled}
              />
            </div>

            {/* Hex Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Hex Value
              </label>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="font-mono"
                disabled={disabled}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden native color input for accessibility */}
      <input
        type="color"
        value={value}
        onChange={e => handleColorChange(e.target.value)}
        className="sr-only"
        disabled={disabled}
        aria-label="Color picker"
      />
    </div>
  )
}
