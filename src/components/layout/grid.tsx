import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Grid({
  children,
  className,
  cols = { default: 1 },
  gap = 'md',
}: GridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  }

  const getResponsiveClasses = () => {
    const classes = []

    if (cols.default)
      classes.push(colClasses[cols.default as keyof typeof colClasses])
    if (cols.sm)
      classes.push(`sm:${colClasses[cols.sm as keyof typeof colClasses]}`)
    if (cols.md)
      classes.push(`md:${colClasses[cols.md as keyof typeof colClasses]}`)
    if (cols.lg)
      classes.push(`lg:${colClasses[cols.lg as keyof typeof colClasses]}`)
    if (cols.xl)
      classes.push(`xl:${colClasses[cols.xl as keyof typeof colClasses]}`)

    return classes.join(' ')
  }

  return (
    <div
      className={cn('grid', gapClasses[gap], getResponsiveClasses(), className)}
    >
      {children}
    </div>
  )
}

interface StackProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export function Stack({
  children,
  className,
  direction = 'col',
  gap = 'md',
  align,
  justify,
}: StackProps) {
  const gapClasses = {
    sm: direction === 'row' ? 'gap-x-2' : 'gap-y-2',
    md: direction === 'row' ? 'gap-x-4' : 'gap-y-4',
    lg: direction === 'row' ? 'gap-x-6' : 'gap-y-6',
    xl: direction === 'row' ? 'gap-x-8' : 'gap-y-8',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  )
}
