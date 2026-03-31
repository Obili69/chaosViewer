'use client'

import { useState } from 'react'
import { CheckSquare, Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { useAufgaben } from '@/hooks/useAufgaben'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { AufgabeFormular } from './AufgabeFormular'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
}

const STATUS_ORDER = ['OFFEN', 'IN_BEARBEITUNG', 'BLOCKIERT', 'ERLEDIGT']
const STATUS_LABELS: Record<string, string> = {
  OFFEN: 'Offen',
  IN_BEARBEITUNG: 'In Bearbeitung',
  BLOCKIERT: 'Blockiert',
  ERLEDIGT: 'Erledigt',
}

export function AufgabenListe({ projectId }: { projectId: string }) {
  const { tasks, isLoading, mutate } = useAufgaben(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter((t: Task) => t.status === status)
    return acc
  }, {} as Record<string, Task[]>)

  async function toggleDone(task: Task) {
    const newStatus = task.status === 'ERLEDIGT' ? 'OFFEN' : 'ERLEDIGT'
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    mutate()
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/tasks/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          icon={CheckSquare}
          title="Keine Aufgaben"
          description="Erstelle die erste Aufgabe für dieses Projekt."
          action={{ label: '+ Aufgabe hinzufügen', onClick: () => setFormOpen(true) }}
        />
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Neue Aufgabe">
          <AufgabeFormular projectId={projectId} onSuccess={() => { setFormOpen(false); mutate() }} onCancel={() => setFormOpen(false)} />
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditTask(undefined); setFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4" /> Aufgabe
        </Button>
      </div>

      {STATUS_ORDER.map((status) => {
        const group = grouped[status]
        if (group.length === 0) return null
        return (
          <div key={status} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{STATUS_LABELS[status]}</span>
              <span className="text-xs text-text-muted bg-border px-1.5 py-0.5 rounded">{group.length}</span>
            </div>
            <div className="space-y-1.5">
              {group.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group"
                >
                  <button
                    onClick={() => toggleDone(task)}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-border hover:border-accent transition-colors flex items-center justify-center"
                    style={task.status === 'ERLEDIGT' ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
                  >
                    {task.status === 'ERLEDIGT' && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'ERLEDIGT' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => { setEditTask(task); setFormOpen(true) }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(task.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <Sheet open={formOpen} onClose={() => { setFormOpen(false); setEditTask(undefined) }} title={editTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}>
        <AufgabeFormular
          projectId={projectId}
          task={editTask}
          onSuccess={() => { setFormOpen(false); setEditTask(undefined); mutate() }}
          onCancel={() => { setFormOpen(false); setEditTask(undefined) }}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Aufgabe löschen"
        message="Diese Aufgabe wird dauerhaft gelöscht."
        loading={deleting}
      />
    </>
  )
}
