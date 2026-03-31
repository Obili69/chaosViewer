'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Mobile: bottom sheet */}
      <div
        className={cn(
          'relative z-10 bg-elevated border border-border w-full animate-slide-up',
          'rounded-t-2xl max-h-[92dvh] overflow-y-auto',
          'md:rounded-2xl md:max-w-md md:animate-fade-in',
          className
        )}
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-border transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-5 pb-safe-bottom">{children}</div>
      </div>
    </div>
  )
}
