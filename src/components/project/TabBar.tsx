'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Aufgaben', slug: 'aufgaben' },
  { label: 'Probleme', slug: 'probleme' },
  { label: 'Budget', slug: 'budget' },
  { label: 'Dateien', slug: 'dateien' },
  { label: 'Versionen', slug: 'versionen' },
  { label: 'Links', slug: 'links' },
  { label: 'Zeit', slug: 'zeit' },
]

export function TabBar({ projectId }: { projectId: string }) {
  const pathname = usePathname()

  return (
    <div className="border-b border-border">
      <div className="flex overflow-x-auto no-scrollbar gap-0.5">
        {TABS.map((tab) => {
          const href = `/projekte/${projectId}/${tab.slug}`
          const active = pathname.startsWith(href)
          return (
            <Link
              key={tab.slug}
              href={href}
              className={cn(
                'flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
