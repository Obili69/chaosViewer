'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProjectCard } from './ProjectCard'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AreaFormular } from '@/components/bereiche/AreaFormular'

interface AreaSectionProps {
  areaId: string
  name: string
  color: string
  projects: Parameters<typeof ProjectCard>[0]['project'][]
  canManage?: boolean
}

export function AreaSection({ areaId, name, color, projects, canManage }: AreaSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentName, setCurrentName] = useState(name)
  const [currentColor, setCurrentColor] = useState(color)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/areas/${areaId}`, { method: 'DELETE' })
    setConfirmOpen(false)
    setDeleting(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 group">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentColor }} />
          <h2 className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
            {currentName}
            <span className="text-text-muted font-normal ml-1.5">({projects.length})</span>
          </h2>
          {collapsed
            ? <ChevronRight className="w-4 h-4 text-text-muted" />
            : <ChevronDown className="w-4 h-4 text-text-muted" />
          }
        </button>
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 active:bg-accent/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Bereich löschen"
        message={`Bereich "${currentName}" löschen? Die enthaltenen Projekte werden nicht gelöscht, nur aus dem Bereich entfernt.`}
      />
      <AreaFormular
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editArea={{ id: areaId, name: currentName, color: currentColor }}
        onSuccess={(area) => {
          setCurrentName(area.name)
          setCurrentColor(area.color)
          setEditOpen(false)
        }}
      />
    </div>
  )
}
