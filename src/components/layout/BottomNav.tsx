'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, AlertCircle, Paperclip, MoreHorizontal, Home, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  projectId?: string
}

export function BottomNav({ projectId }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  const tab = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href || (pathname.startsWith(href) && href !== '/')
    return (
      <Link
        href={href}
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 flex-1',
          active ? 'text-accent' : 'text-text-muted'
        )}
      >
        {icon}
        <span className="text-[10px] font-medium truncate">{label}</span>
      </Link>
    )
  }

  if (projectId) {
    // Inside a project: show project-specific tabs
    const base = `/projekte/${projectId}`
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border safe-bottom">
          <div className="flex items-center px-1 h-14">
            {tab('/', <Home className="w-5 h-5" />, 'Start')}
            {tab(`${base}/aufgaben`, <CheckSquare className="w-5 h-5" />, 'Aufgaben')}
            {tab(`${base}/probleme`, <AlertCircle className="w-5 h-5" />, 'Probleme')}
            {tab(`${base}/zeit`, <Timer className="w-5 h-5" />, 'Zeit')}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-text-muted flex-1"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">Mehr</span>
            </button>
          </div>
        </nav>

        <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Mehr">
          <div className="space-y-2">
            {[
              { href: `${base}/links`, label: 'Links' },
              { href: `${base}/dateien`, label: 'Dateien' },
              { href: `${base}/versionen`, label: 'Versionen' },
              { href: `${base}/budget`, label: 'Budget' },
              { href: `${base}/einstellungen`, label: 'Einstellungen' },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => { setMoreOpen(false); router.push(item.href) }}
                className="w-full text-left px-4 py-3 rounded-xl bg-surface hover:bg-border text-text-primary text-sm transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </Sheet>
      </>
    )
  }

  // Dashboard / global nav
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border safe-bottom">
      <div className="flex items-center px-1 h-14">
        {tab('/', <LayoutDashboard className="w-5 h-5" />, 'Übersicht')}
        {tab('/projekte/neu', <span className="w-5 h-5 flex items-center justify-center text-lg font-bold">+</span>, 'Neu')}
      </div>
    </nav>
  )
}
