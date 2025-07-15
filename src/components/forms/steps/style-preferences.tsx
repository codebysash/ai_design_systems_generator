import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DesignSystemFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface StylePreferencesProps {
  form: UseFormReturn<DesignSystemFormData>
  errors: FieldErrors<DesignSystemFormData>
}

const styleOptions = [
  {
    value: 'modern',
    label: 'Modern',
    description: 'Clean, contemporary design with subtle shadows and rounded corners',
    preview: 'bg-gradient-to-br from-blue-500 to-purple-600',
  },
  {
    value: 'classic',
    label: 'Classic',
    description: 'Timeless design with traditional elements and balanced typography',
    preview: 'bg-gradient-to-br from-slate-700 to-slate-900',
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Vibrant colors, creative shapes, and engaging interactive elements',
    preview: 'bg-gradient-to-br from-pink-500 to-orange-400',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Simple, clean design focused on content with plenty of whitespace',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-200',
  },
  {
    value: 'bold',
    label: 'Bold',
    description: 'Strong contrasts, dynamic layouts, and attention-grabbing elements',
    preview: 'bg-gradient-to-br from-red-600 to-black',
  },
] as const

export function StylePreferences({ form, errors }: StylePreferencesProps) {
  const { watch, setValue } = form
  const selectedStyle = watch('style')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Choose a design style that matches your project</Label>
        {errors.style && (
          <p className="text-sm text-destructive">{errors.style.message}</p>
        )}
      </div>

      <RadioGroup
        value={selectedStyle}
        onValueChange={(value: string) => setValue('style', value as any)}
        className="grid gap-4 md:grid-cols-2"
      >
        {styleOptions.map((option) => (
          <div key={option.value} className="relative">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={option.value}
              className={cn(
                'flex cursor-pointer flex-col rounded-lg border-2 border-muted p-4 hover:border-accent',
                'peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    'h-12 w-12 rounded-lg',
                    option.preview
                  )}
                />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}