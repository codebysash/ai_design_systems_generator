import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DesignSystemFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface ColorSelectionProps {
  form: UseFormReturn<DesignSystemFormData>
  errors: FieldErrors<DesignSystemFormData>
}

const colorPresets = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
]

export function ColorSelection({ form, errors }: ColorSelectionProps) {
  const { register, watch, setValue } = form
  const primaryColor = watch('primaryColor')

  const handleColorPreset = (color: string) => {
    setValue('primaryColor', color)
  }

  const isValidHex = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary Brand Color</Label>
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              'h-12 w-12 rounded-lg border-2 border-muted',
              isValidHex(primaryColor) ? '' : 'bg-muted'
            )}
            style={{
              backgroundColor: isValidHex(primaryColor) ? primaryColor : undefined,
            }}
          />
          <div className="flex-1">
            <Input
              id="primaryColor"
              placeholder="#3b82f6"
              {...register('primaryColor')}
              className={errors.primaryColor ? 'border-destructive' : ''}
            />
          </div>
          <input
            type="color"
            value={isValidHex(primaryColor) ? primaryColor : '#3b82f6'}
            onChange={(e) => setValue('primaryColor', e.target.value)}
            className="h-12 w-12 rounded-lg border-2 border-muted bg-transparent cursor-pointer"
          />
        </div>
        {errors.primaryColor && (
          <p className="text-sm text-destructive">{errors.primaryColor.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Enter a hex color code or use the color picker. This will be your primary brand color.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Color Presets</Label>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {colorPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleColorPreset(preset.value)}
              className={cn(
                'h-12 w-full p-1',
                primaryColor === preset.value && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <div
                className="h-full w-full rounded"
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <h4 className="font-medium mb-2">Color Preview</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: isValidHex(primaryColor) ? primaryColor : '#3b82f6' }}
            />
            <span className="text-sm">Primary</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="h-8 w-8 rounded border"
              style={{ 
                backgroundColor: isValidHex(primaryColor) 
                  ? `${primaryColor}20` 
                  : '#3b82f620'
              }}
            />
            <span className="text-sm">Light variant</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="h-8 w-8 rounded"
              style={{ 
                backgroundColor: isValidHex(primaryColor)
                  ? adjustBrightness(primaryColor, -40)
                  : '#1e40af'
              }}
            />
            <span className="text-sm">Dark variant</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}