'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Menu, Zap } from 'lucide-react'
import { useNav } from './NavProvider'

interface TopBarProps {
  title?: string
  showBack?: boolean
  backHref?: string
  action?: React.ReactNode
}

export function TopBar({ title, showBack, backHref, action }: TopBarProps) {
  const router = useRouter()
  const { setSidebarOpen } = useNav()

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-border safe-top">
      <div className="flex items-center gap-2 h-14 px-3">
        {showBack ? (
          <button
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 flex items-center gap-2 min-w-0">
          {!showBack && <Zap className="w-4 h-4 text-accent flex-shrink-0" />}
          <h1 className="font-semibold text-text-primary truncate text-sm">
            {title ?? 'ChaosTracker'}
          </h1>
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
