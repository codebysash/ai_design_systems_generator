import { Button } from './button'
import { cn } from '@/lib/utils'

interface CTACardProps {
  title: string
  description: string
  primaryAction: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
}

export function CTACard({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  variant = 'default',
}: CTACardProps) {
  const variantClasses = {
    default: 'bg-card border',
    primary: 'bg-primary/5 border-primary/20',
    secondary: 'bg-secondary/5 border-secondary/20',
  }

  const renderButton = (
    action: CTACardProps['primaryAction'],
    isPrimary: boolean = true
  ) => {
    const buttonProps = {
      variant: isPrimary ? ('default' as const) : ('outline' as const),
      onClick: action.onClick,
      children: action.label,
    }

    if (action.href) {
      return (
        <Button asChild {...buttonProps}>
          <a href={action.href}>{action.label}</a>
        </Button>
      )
    }

    return <Button {...buttonProps} />
  }

  return (
    <div
      className={cn(
        'rounded-xl p-6 text-center',
        variantClasses[variant],
        className
      )}
    >
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {renderButton(primaryAction, true)}
        {secondaryAction && renderButton(secondaryAction, false)}
      </div>
    </div>
  )
}
