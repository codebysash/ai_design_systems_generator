import { z } from 'zod'

export const designSystemSchema = z.object({
  name: z.string().min(1, 'Design system name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  style: z.enum(['modern', 'classic', 'playful', 'minimal', 'bold']),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  industry: z.string().optional(),
  components: z.array(z.string()).optional(),
})

export const promptSchema = z.object({
  prompt: z.string().min(20, 'Prompt must be at least 20 characters'),
  style: z.enum(['modern', 'classic', 'playful', 'minimal', 'bold']),
  colors: z.object({
    primary: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    secondary: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
      .optional(),
  }),
  industry: z.string().optional(),
})

export type DesignSystemFormData = z.infer<typeof designSystemSchema>
export type PromptFormData = z.infer<typeof promptSchema>
