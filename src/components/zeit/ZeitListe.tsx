'use client'

import { useState } from 'react'
import { Clock, Pencil, Trash2, Plus, CheckSquare, AlertCircle } from 'lucide-react'
import { useTime } from '@/hooks/useTime'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { Stoppuhr } from './Stoppuhr'
import { ZeitFormular } from './ZeitFormular'
import { formatDate } from '@/lib/utils'

interface TimeEntry {
  id: string
  description?: string | null
  startTime: string
  endTime?: string | null
  duration: number
  task?:  { id: string; title: string } | null
  issue?: { id: string; title: string } | null
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function ZeitListe({ projectId }: { projectId: string }) {
  const { entries, totalSeconds, tasks, issues, isLoading, mutate } = useTime(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<TimeEntry | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/time/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  return (
    <>
      <Stoppuhr projectId={projectId} onSave={mutate} tasks={tasks} issues={issues} />

      {/* Total summary */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span>Gesamt: <span className="text-text-primary font-semibold">{formatDuration(totalSeconds)}</span></span>
          </div>
          <Button onClick={() => { setEditEntry(undefined); setFormOpen(true) }} size="sm">
            <Plus className="w-4 h-4" /> Eintrag
          </Button>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Keine Zeiteinträge"
          description="Starte die Stoppuhr oder füge einen Eintrag manuell hinzu."
          action={{ label: '+ Eintrag hinzufügen', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry: TimeEntry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {entry.description ?? <span className="text-text-muted italic">Kein Titel</span>}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-text-muted">{formatDate(entry.startTime)}</span>
                  {entry.task && (
                    <span className="inline-flex items-center gap-1 text-xs text-highlight bg-highlight/10 px-1.5 py-0.5 rounded-md">
                      <CheckSquare className="w-3 h-3" />{entry.task.title}
                    </span>
                  )}
                  {entry.issue && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3" />{entry.issue.title}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-accent flex-shrink-0">
                {formatDuration(entry.duration)}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditEntry(entry); setFormOpen(true) }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(entry.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEntry(undefined) }}
        title={editEntry ? 'Eintrag bearbeiten' : 'Zeiteintrag'}
      >
        <ZeitFormular
          projectId={projectId}
          entry={editEntry}
          onSuccess={() => { setFormOpen(false); setEditEntry(undefined); mutate() }}
          onCancel={() => { setFormOpen(false); setEditEntry(undefined) }}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eintrag löschen"
        message="Dieser Zeiteintrag wird dauerhaft gelöscht."
        loading={deleting}
      />
    </>
  )
}
