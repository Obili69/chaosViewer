'use client'

import { useState } from 'react'
import { AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { useProbleme } from '@/hooks/useProbleme'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProblemFormular } from './ProblemFormular'
import { formatRelative } from '@/lib/utils'

interface Issue {
  id: string
  title: string
  description?: string | null
  status: string
  severity: string
  createdAt: string
}

const SEVERITY_COLORS: Record<string, string> = {
  KRITISCH: '#f43f5e',
  HOCH: '#f97316',
  MITTEL: '#f59e0b',
  NIEDRIG: '#475569',
}

export function ProblemeListe({ projectId }: { projectId: string }) {
  const { issues, isLoading, mutate } = useProbleme(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editIssue, setEditIssue] = useState<Issue | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/issues/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (issues.length === 0) {
    return (
      <>
        <EmptyState
          icon={AlertCircle}
          title="Keine Probleme"
          description="Noch keine Probleme gemeldet."
          action={{ label: '+ Problem hinzufügen', onClick: () => setFormOpen(true) }}
        />
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Neues Problem">
          <ProblemFormular projectId={projectId} onSuccess={() => { setFormOpen(false); mutate() }} onCancel={() => setFormOpen(false)} />
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditIssue(undefined); setFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4" /> Problem
        </Button>
      </div>

      <div className="space-y-2">
        {issues.map((issue: Issue) => (
          <div
            key={issue.id}
            className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group"
          >
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: SEVERITY_COLORS[issue.severity] ?? '#475569' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{issue.title}</p>
              {issue.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{issue.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={issue.status} />
                <SeverityBadge severity={issue.severity} />
                <span className="text-xs text-text-muted">{formatRelative(issue.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => { setEditIssue(issue); setFormOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteId(issue.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={formOpen} onClose={() => { setFormOpen(false); setEditIssue(undefined) }} title={editIssue ? 'Problem bearbeiten' : 'Neues Problem'}>
        <ProblemFormular
          projectId={projectId}
          issue={editIssue}
          onSuccess={() => { setFormOpen(false); setEditIssue(undefined); mutate() }}
          onCancel={() => { setFormOpen(false); setEditIssue(undefined) }}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Problem löschen"
        message="Dieses Problem wird dauerhaft gelöscht."
        loading={deleting}
      />
    </>
  )
}
