'use client'

import React, { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { CustomizationValue } from './advanced-customization-panel'
import { Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'

interface AnimationControlsProps {
  value: CustomizationValue['animations']
  onChange: (updates: Partial<CustomizationValue['animations']>) => void
}

const EASING_FUNCTIONS = [
  { value: 'linear', label: 'Linear', description: 'Constant speed' },
  { value: 'ease', label: 'Ease', description: 'Default browser easing' },
  { value: 'ease-in', label: 'Ease In', description: 'Slow start, fast end' },
  { value: 'ease-out', label: 'Ease Out', description: 'Fast start, slow end' },
  {
    value: 'ease-in-out',
    label: 'Ease In Out',
    description: 'Slow start and end',
  },
  {
    value: 'cubic-bezier(0.4, 0, 0.2, 1)',
    label: 'Material',
    description: 'Material Design curve',
  },
  {
    value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    label: 'Smooth',
    description: 'Very smooth transition',
  },
  {
    value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    label: 'Bounce',
    description: 'Bounce effect',
  },
  {
    value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    label: 'Back',
    description: 'Back and forth motion',
  },
]

const ANIMATION_PRESETS = [
  {
    name: 'None',
    values: { duration: 0, easing: 'linear', enabled: false },
  },
  {
    name: 'Subtle',
    values: { duration: 150, easing: 'ease-out', enabled: true },
  },
  {
    name: 'Normal',
    values: { duration: 200, easing: 'ease-in-out', enabled: true },
  },
  {
    name: 'Smooth',
    values: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      enabled: true,
    },
  },
  {
    name: 'Bouncy',
    values: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
  },
]

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  value,
  onChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeDemo, setActiveDemo] = useState<'button' | 'card' | 'modal'>(
    'button'
  )

  const applyPreset = (preset: (typeof ANIMATION_PRESETS)[0]) => {
    onChange(preset.values)
  }

  const playDemo = () => {
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), value.duration * 2)
  }

  const getDemoVariants = (type: 'button' | 'card' | 'modal') => {
    if (!value.enabled) return {}

    const baseTransition = {
      duration: value.duration / 1000,
      ease: value.easing as any,
    }

    switch (type) {
      case 'button':
        return {
          initial: { scale: 1 },
          animate: isPlaying ? { scale: 1.05 } : { scale: 1 },
          transition: baseTransition,
        }
      case 'card':
        return {
          initial: { y: 0, opacity: 1 },
          animate: isPlaying ? { y: -4, opacity: 0.9 } : { y: 0, opacity: 1 },
          transition: baseTransition,
        }
      case 'modal':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: isPlaying
            ? { scale: 1, opacity: 1 }
            : { scale: 0.95, opacity: 0 },
          transition: baseTransition,
        }
      default:
        return {}
    }
  }

  return (
    <div className="space-y-6">
      {/* Animation Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Animations Enabled</Label>
          <p className="text-xs text-muted-foreground">
            Enable or disable all animations
          </p>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={enabled => onChange({ enabled })}
        />
      </div>

      {/* Animation Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Animation Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {ANIMATION_PRESETS.map(preset => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              disabled={!value.enabled && preset.name !== 'None'}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Duration Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Duration</Label>
          <span className="text-sm text-muted-foreground">
            {value.duration}ms
          </span>
        </div>
        <Slider
          value={[value.duration]}
          onValueChange={([duration]) => onChange({ duration })}
          min={0}
          max={1000}
          step={25}
          disabled={!value.enabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Instant</span>
          <span>Fast</span>
          <span>Normal</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Easing Function */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Easing Function</Label>
        <Select
          value={value.easing}
          onValueChange={easing => onChange({ easing })}
          disabled={!value.enabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EASING_FUNCTIONS.map(func => (
              <SelectItem key={func.value} value={func.value}>
                <div>
                  <div className="font-medium">{func.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {func.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animation Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Animation Preview</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={playDemo}
            disabled={!value.enabled}
          >
            <Play className="h-3 w-3 mr-1" />
            Play Demo
          </Button>
        </div>

        {/* Demo Type Selector */}
        <div className="flex gap-1 p-1 bg-muted rounded-md">
          {(['button', 'card', 'modal'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveDemo(type)}
              className={`flex-1 px-3 py-1 text-xs rounded capitalize transition-colors ${
                activeDemo === type
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Demo Area */}
        <div className="p-6 bg-muted/30 rounded-lg min-h-[120px] flex items-center justify-center">
          {activeDemo === 'button' && (
            <motion.button
              {...getDemoVariants('button')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              style={{
                transition: value.enabled
                  ? `all ${value.duration}ms ${value.easing}`
                  : 'none',
              }}
            >
              Click me
            </motion.button>
          )}

          {activeDemo === 'card' && (
            <motion.div
              {...getDemoVariants('card')}
              className="w-48 p-4 bg-background border rounded-lg shadow-sm"
              style={{
                transition: value.enabled
                  ? `all ${value.duration}ms ${value.easing}`
                  : 'none',
              }}
            >
              <div className="h-3 bg-muted rounded mb-2" />
              <div className="h-2 bg-muted rounded w-3/4 mb-1" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </motion.div>
          )}

          {activeDemo === 'modal' && (
            <motion.div
              {...getDemoVariants('modal')}
              className="w-56 p-6 bg-background border rounded-lg shadow-lg"
              style={{
                transition: value.enabled
                  ? `all ${value.duration}ms ${value.easing}`
                  : 'none',
              }}
            >
              <h3 className="font-medium mb-2">Modal Dialog</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is a sample modal with animation.
              </p>
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1 text-sm border rounded">
                  Cancel
                </button>
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">
                  OK
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Easing Visualization */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Easing Curve</Label>
        <div className="p-4 bg-muted/30 rounded-lg">
          <svg width="100%" height="80" className="overflow-visible">
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Easing curve visualization would go here */}
            <path
              d="M 10 70 Q 30 70 50 40 T 90 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />

            <text
              x="10"
              y="90"
              className="text-xs fill-current text-muted-foreground"
            >
              0ms
            </text>
            <text
              x="85"
              y="90"
              className="text-xs fill-current text-muted-foreground"
            >
              {value.duration}ms
            </text>
          </svg>
        </div>
      </div>

      {/* CSS Output */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">CSS Output</Label>
        <div className="p-3 bg-muted rounded-md">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {`--animation-duration: ${value.duration}ms;
--animation-easing: ${value.easing};

.animated {
  transition: all var(--animation-duration) var(--animation-easing);
}

.animate-fade-in {
  animation: fadeIn var(--animation-duration) var(--animation-easing);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
