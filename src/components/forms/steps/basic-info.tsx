import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DesignSystemFormData } from '@/lib/validations'

interface BasicInfoProps {
  form: UseFormReturn<DesignSystemFormData>
  errors: FieldErrors<DesignSystemFormData>
}

export function BasicInfo({ form, errors }: BasicInfoProps) {
  const { register } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Design System Name</Label>
        <Input
          id="name"
          placeholder="e.g., Aurora Design System"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your project, target audience, and design goals. Include any specific requirements or constraints."
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Provide as much detail as possible to help the AI generate a design system that fits your needs.
        </p>
      </div>
    </div>
  )
}