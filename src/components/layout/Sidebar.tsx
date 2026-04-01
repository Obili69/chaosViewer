'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Zap, LayoutDashboard, Plus, ChevronDown, ChevronRight, Trash2, Pencil } from 'lucide-react'
import { cn, isAdminOrManagement } from '@/lib/utils'
import { useNav } from './NavProvider'
import { AreaFormular } from '@/components/bereiche/AreaFormular'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { UserMenuSheet } from './UserMenuSheet'

interface AreaData {
  id: string
  name: string
  color: string
  projects: { id: string; name: string; color: string }[]
}

interface SidebarInnerProps {
  onLinkClick?: () => void
  currentUser?: { role: string; username: string }
}

function SidebarInner({ onLinkClick, currentUser }: SidebarInnerProps) {
  const pathname = usePathname()
  const [areas, setAreas] = useState<AreaData[]>([])
  const [ungrouped, setUngrouped] = useState<{ id: string; name: string; color: string }[]>([])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [areaFormOpen, setAreaFormOpen] = useState(false)
  const [editArea, setEditArea] = useState<AreaData | null>(null)
  const [deleteAreaId, setDeleteAreaId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/areas?withProjects=true')
      .then((r) => r.json())
      .then((data) => {
        setAreas(data.areas ?? [])
        setUngrouped(data.ungrouped ?? [])
      })
      .catch(() => {})
  }, [pathname])

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  async function handleDeleteArea() {
    if (!deleteAreaId) return
    setDeleting(true)
    await fetch(`/api/areas/${deleteAreaId}`, { method: 'DELETE' })
    setAreas((prev) => prev.filter((a) => a.id !== deleteAreaId))
    setDeleteAreaId(null)
    setDeleting(false)
  }

  const navLink = (href: string, label: string, icon: React.ReactNode, color?: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        onClick={onLinkClick}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors group',
          active
            ? 'bg-accent/10 text-accent'
            : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
        )}
      >
        {color ? (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        ) : (
          <span className={cn('flex-shrink-0', active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary')}>
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <span className="font-bold text-text-primary">ChaosTracker</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {navLink('/', 'Übersicht', <LayoutDashboard className="w-4 h-4" />)}

        {/* Areas header */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-0.5">
          <span className="flex-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Bereiche</span>
          <button
            onClick={() => setAreaFormOpen(true)}
            className="p-0.5 rounded text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
            title="Neuer Bereich"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Areas */}
        {areas.map((area) => (
          <div key={area.id} className="group/area">
            <div className="flex items-center">
              <button
                onClick={() => toggle(area.id)}
                className="flex-1 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-secondary uppercase tracking-wider transition-colors min-w-0"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: area.color }} />
                <span className="flex-1 text-left truncate">{area.name}</span>
                {collapsed[area.id] ? <ChevronRight className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />}
              </button>
              {isAdminOrManagement(currentUser?.role ?? '') && (
                <div className="flex items-center opacity-0 group-hover/area:opacity-100">
                  <button
                    onClick={() => setEditArea(area)}
                    className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-accent hover:bg-accent/10 active:bg-accent/20 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteAreaId(area.id)}
                    className="w-6 h-6 mr-1 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {!collapsed[area.id] && area.projects.map((p) => (
              <div key={p.id} className="ml-2">
                {navLink(`/projekte/${p.id}`, p.name, null, p.color)}
              </div>
            ))}
          </div>
        ))}

        {/* Ungrouped */}
        {ungrouped.length > 0 && (
          <div>
            <p className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Kein Bereich
            </p>
            {ungrouped.map((p) => (
              <div key={p.id} className="ml-2">
                {navLink(`/projekte/${p.id}`, p.name, null, p.color)}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-1 border-t border-border pt-3">
        {navLink('/projekte/neu', 'Neues Projekt', <Plus className="w-4 h-4" />)}
        {currentUser && (
          <button
            onClick={() => setUserMenuOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-elevated transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-accent">{currentUser.username[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium text-text-primary truncate">{currentUser.username}</p>
              <p className="text-[10px] text-text-muted truncate">{currentUser.role}</p>
            </div>
          </button>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteAreaId}
        onClose={() => setDeleteAreaId(null)}
        onConfirm={handleDeleteArea}
        loading={deleting}
        title="Bereich löschen"
        message={`Bereich "${areas.find(a => a.id === deleteAreaId)?.name}" löschen? Projekte werden nicht gelöscht, nur aus dem Bereich entfernt.`}
      />
      {currentUser && (
        <UserMenuSheet
          open={userMenuOpen}
          onClose={() => setUserMenuOpen(false)}
          currentUser={currentUser}
        />
      )}
      <AreaFormular
        open={areaFormOpen || !!editArea}
        onClose={() => { setAreaFormOpen(false); setEditArea(null) }}
        editArea={editArea ?? undefined}
        onSuccess={(area) => {
          if (editArea) {
            setAreas((prev) => prev.map((a) => a.id === area.id ? { ...a, ...area } : a))
          } else {
            setAreas((prev) => [...prev, { ...area, projects: [] }])
          }
          setAreaFormOpen(false)
          setEditArea(null)
        }}
      />
    </div>
  )
}

export function Sidebar({ currentUser }: { currentUser?: { role: string; username: string } }) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex-col z-40">
      <SidebarInner currentUser={currentUser} />
    </aside>
  )
}

export function MobileSidebar({ currentUser }: { currentUser?: { role: string; username: string } }) {
  const { sidebarOpen, setSidebarOpen } = useNav()

  if (!sidebarOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border">
        <SidebarInner onLinkClick={() => setSidebarOpen(false)} currentUser={currentUser} />
      </aside>
    </div>
  )
}
