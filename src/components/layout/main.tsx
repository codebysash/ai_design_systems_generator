import { cn } from '@/lib/utils'

interface MainProps {
  children: React.ReactNode
  className?: string
}

export function Main({ children, className }: MainProps) {
  return (
    <main
      className={cn(
        'flex-1 container max-w-screen-2xl px-4 md:px-8',
        className
      )}
    >
      {children}
    </main>
  )
}
