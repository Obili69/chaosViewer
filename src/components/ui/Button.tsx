import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none',
          {
            'bg-accent hover:bg-accent-dim text-base': variant === 'primary',
            'bg-surface hover:bg-elevated text-text-primary border border-border': variant === 'secondary',
            'hover:bg-elevated text-text-secondary hover:text-text-primary': variant === 'ghost',
            'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20': variant === 'destructive',
            'border border-border hover:border-accent text-text-primary hover:text-accent': variant === 'outline',
          },
          {
            'text-xs px-2.5 py-1.5 rounded-lg gap-1.5': size === 'sm',
            'text-sm px-4 py-2.5 rounded-xl gap-2': size === 'md',
            'text-base px-5 py-3 rounded-xl gap-2': size === 'lg',
            'p-2 rounded-lg': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export { Button }
