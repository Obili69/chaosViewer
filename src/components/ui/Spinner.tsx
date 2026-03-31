import { cn } from '@/lib/utils'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={cn(
        'border-2 border-border border-t-accent rounded-full animate-spin',
        { 'w-4 h-4': size === 'sm', 'w-6 h-6': size === 'md', 'w-8 h-8': size === 'lg' },
        className
      )}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-32">
      <Spinner size="lg" />
    </div>
  )
}
