import { cn } from '@/lib/utils'

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function VisuallyHidden({
  children,
  className,
  asChild = false,
}: VisuallyHiddenProps) {
  const Component = asChild ? 'span' : 'span'

  return <Component className={cn('sr-only', className)}>{children}</Component>
}
