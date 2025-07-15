import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DesignSystemFormData } from '@/lib/validations'

interface IndustrySelectionProps {
  form: UseFormReturn<DesignSystemFormData>
  errors: FieldErrors<DesignSystemFormData>
}

const industries = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'ecommerce', label: 'E-commerce & Retail' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'entertainment', label: 'Entertainment & Media' },
  { value: 'nonprofit', label: 'Non-profit & Social Good' },
  { value: 'real-estate', label: 'Real Estate & Property' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'automotive', label: 'Automotive & Transportation' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'manufacturing', label: 'Manufacturing & Industrial' },
  { value: 'other', label: 'Other' },
]

const componentTypes = [
  {
    value: 'basic',
    label: 'Basic Components',
    description: 'Buttons, inputs, cards, etc.',
  },
  {
    value: 'navigation',
    label: 'Navigation',
    description: 'Headers, menus, breadcrumbs',
  },
  {
    value: 'forms',
    label: 'Forms & Data Entry',
    description: 'Form controls, validation, steps',
  },
  {
    value: 'data',
    label: 'Data Display',
    description: 'Tables, lists, charts, badges',
  },
  {
    value: 'feedback',
    label: 'Feedback',
    description: 'Alerts, modals, tooltips, loading states',
  },
  {
    value: 'layout',
    label: 'Layout',
    description: 'Grids, containers, spacing utilities',
  },
]

export function IndustrySelection({ form, errors }: IndustrySelectionProps) {
  const { watch, setValue } = form
  const selectedIndustry = watch('industry')
  const selectedComponents = watch('components') || []

  const handleComponentToggle = (componentValue: string) => {
    const current = selectedComponents || []
    const updated = current.includes(componentValue)
      ? current.filter(c => c !== componentValue)
      : [...current, componentValue]
    setValue('components', updated)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="industry">Industry & Domain (Optional)</Label>
        <Select
          value={selectedIndustry}
          onValueChange={value => setValue('industry', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your industry or domain" />
          </SelectTrigger>
          <SelectContent>
            {industries.map(industry => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-destructive">{errors.industry.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          This helps us tailor the design system to your industry&apos;s
          conventions and user expectations.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Component Types (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Select the types of components you need. We&apos;ll prioritize these
          in your design system.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {componentTypes.map(component => (
            <div
              key={component.value}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                selectedComponents.includes(component.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-accent'
              }`}
              onClick={() => handleComponentToggle(component.value)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(component.value)}
                  onChange={() => handleComponentToggle(component.value)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">{component.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {component.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <h4 className="font-medium mb-2">Summary</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Industry:{' '}
            {selectedIndustry
              ? industries.find(i => i.value === selectedIndustry)?.label
              : 'Not specified'}
          </p>
          <p>
            Component types:{' '}
            {selectedComponents.length > 0
              ? selectedComponents.length + ' selected'
              : 'All types included'}
          </p>
        </div>
      </div>
    </div>
  )
}
