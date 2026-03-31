import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md',
        {
          'bg-border text-text-secondary': variant === 'default',
          'bg-accent/15 text-accent': variant === 'accent',
          'bg-highlight/15 text-highlight': variant === 'success',
          'bg-amber-500/15 text-amber-400': variant === 'warning',
          'bg-red-500/15 text-red-400': variant === 'danger',
          'bg-surface text-text-muted': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    OFFEN:          { label: 'Offen',          variant: 'default' },
    IN_BEARBEITUNG: { label: 'In Bearbeitung', variant: 'accent' },
    ERLEDIGT:       { label: 'Erledigt',       variant: 'success' },
    BLOCKIERT:      { label: 'Blockiert',      variant: 'danger' },
    BEHOBEN:        { label: 'Behoben',        variant: 'success' },
    GESCHLOSSEN:    { label: 'Geschlossen',    variant: 'muted' },
    AKTIV:          { label: 'Aktiv',          variant: 'accent' },
    ARCHIVIERT:     { label: 'Archiviert',     variant: 'muted' },
    PAUSIERT:       { label: 'Pausiert',       variant: 'warning' },
  }
  const config = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    NIEDRIG:  { label: 'Niedrig',  className: 'bg-slate-500/15 text-slate-400' },
    MITTEL:   { label: 'Mittel',   className: 'bg-amber-500/15 text-amber-400' },
    HOCH:     { label: 'Hoch',     className: 'bg-orange-500/15 text-orange-400' },
    KRITISCH: { label: 'Kritisch', className: 'bg-red-500/15 text-red-400' },
  }
  const config = map[priority] ?? { label: priority, className: 'bg-border text-text-muted' }
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md', config.className)}>
      {config.label}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <PriorityBadge priority={severity} />
}
