import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export function useForm<T extends z.ZodType<any, any>>(schema: T) {
  return useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema) as any,
    mode: 'onChange',
  })
}
