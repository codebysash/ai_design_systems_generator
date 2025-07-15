'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GeneratedComponent } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface PreviewControlsProps {
  component: GeneratedComponent
  variant: string
  size: string
  theme: 'light' | 'dark'
  state: Record<string, any>
  props: Record<string, any>
  onVariantChange: (variant: string) => void
  onSizeChange: (size: string) => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onStateChange: (state: Record<string, any>) => void
  onPropsChange: (props: Record<string, any>) => void
  onReset: () => void
  className?: string
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  component,
  variant,
  size,
  theme,
  state,
  props,
  onVariantChange,
  onSizeChange,
  onThemeChange,
  onStateChange,
  onPropsChange,
  onReset,
  className
}) => {
  const [activeTab, setActiveTab] = useState('appearance')

  const handleStateChange = (key: string, value: any) => {
    onStateChange({ ...state, [key]: value })
  }

  const handlePropChange = (key: string, value: any) => {
    onPropsChange({ ...props, [key]: value })
  }

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {component.name} Controls
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {component.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {component.variants.length} variants
          </Badge>
          <Badge variant="outline" className="text-xs">
            {component.sizes.length} sizes
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Style</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="props">Props</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <AppearanceControls
              component={component}
              variant={variant}
              size={size}
              theme={theme}
              onVariantChange={onVariantChange}
              onSizeChange={onSizeChange}
              onThemeChange={onThemeChange}
            />
          </TabsContent>

          <TabsContent value="state" className="space-y-4 mt-4">
            <StateControls
              component={component}
              state={state}
              onStateChange={handleStateChange}
            />
          </TabsContent>

          <TabsContent value="props" className="space-y-4 mt-4">
            <PropsControls
              component={component}
              props={props}
              onPropChange={handlePropChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface AppearanceControlsProps {
  component: GeneratedComponent
  variant: string
  size: string
  theme: 'light' | 'dark'
  onVariantChange: (variant: string) => void
  onSizeChange: (size: string) => void
  onThemeChange: (theme: 'light' | 'dark') => void
}

const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  component,
  variant,
  size,
  theme,
  onVariantChange,
  onSizeChange,
  onThemeChange
}) => {
  return (
    <div className="space-y-4">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="theme-toggle">Theme</Label>
        <div className="flex items-center space-x-2">
          <span className={cn('text-sm', theme === 'light' ? 'font-medium' : 'text-gray-500')}>
            Light
          </span>
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          />
          <span className={cn('text-sm', theme === 'dark' ? 'font-medium' : 'text-gray-500')}>
            Dark
          </span>
        </div>
      </div>

      {/* Variant Selection */}
      {component.variants.length > 0 && (
        <div className="space-y-2">
          <Label>Variant</Label>
          <Select value={variant} onValueChange={onVariantChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {component.variants.map((v) => (
                <SelectItem key={v.name} value={v.name}>
                  <div className="flex items-center justify-between w-full">
                    <span className="capitalize">{v.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {v.name}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {component.variants.find(v => v.name === variant)?.description || 'Select a variant'}
          </p>
        </div>
      )}

      {/* Size Selection */}
      {component.sizes.length > 0 && (
        <div className="space-y-2">
          <Label>Size</Label>
          <Select value={size} onValueChange={onSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {component.sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  <div className="flex items-center justify-between w-full">
                    <span className="capitalize">{s}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {s}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

interface StateControlsProps {
  component: GeneratedComponent
  state: Record<string, any>
  onStateChange: (key: string, value: any) => void
}

const StateControls: React.FC<StateControlsProps> = ({
  component,
  state,
  onStateChange
}) => {
  const availableStates = ['loading', 'disabled', 'error', 'success', 'active', 'focus', 'hover']

  const componentStates = availableStates.filter(s => 
    component.states.includes(s) || ['loading', 'disabled', 'error'].includes(s)
  )

  if (componentStates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No state controls available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {componentStates.map((stateName) => (
        <div key={stateName} className="flex items-center justify-between">
          <Label htmlFor={`state-${stateName}`} className="capitalize">
            {stateName}
          </Label>
          <Switch
            id={`state-${stateName}`}
            checked={!!state[stateName]}
            onCheckedChange={(checked) => onStateChange(stateName, checked)}
          />
        </div>
      ))}

      {/* Error message input */}
      {state.error && (
        <div className="space-y-2">
          <Label htmlFor="error-message">Error Message</Label>
          <Input
            id="error-message"
            placeholder="Enter error message"
            value={state.errorMessage || ''}
            onChange={(e) => onStateChange('errorMessage', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

interface PropsControlsProps {
  component: GeneratedComponent
  props: Record<string, any>
  onPropChange: (key: string, value: any) => void
}

const PropsControls: React.FC<PropsControlsProps> = ({
  component,
  props,
  onPropChange
}) => {
  if (component.props.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No props available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {component.props.map((prop) => (
        <PropControl
          key={prop.name}
          prop={prop}
          value={props[prop.name]}
          onChange={(value) => onPropChange(prop.name, value)}
        />
      ))}
    </div>
  )
}

interface PropControlProps {
  prop: any
  value: any
  onChange: (value: any) => void
}

const PropControl: React.FC<PropControlProps> = ({ prop, value, onChange }) => {
  const renderControl = () => {
    switch (prop.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={onChange}
          />
        )

      case 'string':
        if (prop.name === 'placeholder' || prop.name === 'label' || prop.name === 'title') {
          return (
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${prop.name}`}
            />
          )
        }
        if (prop.name === 'description' || prop.name === 'content') {
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${prop.name}`}
              rows={3}
            />
          )
        }
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${prop.name}`}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={`Enter ${prop.name}`}
          />
        )

      default:
        if (prop.type.includes('|')) {
          // Union type - create select
          const options = prop.type.split('|').map((option: string) => option.trim().replace(/'/g, ''))
          return (
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${prop.name}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${prop.name}`}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={prop.name} className="capitalize">
          {prop.name}
          {prop.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {prop.default && (
          <Badge variant="outline" className="text-xs">
            {String(prop.default)}
          </Badge>
        )}
      </div>
      {renderControl()}
      {prop.description && (
        <p className="text-xs text-gray-500">{prop.description}</p>
      )}
    </div>
  )
}

export default PreviewControls