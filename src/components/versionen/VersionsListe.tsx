'use client'

import { useState } from 'react'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { useVersionen } from '@/hooks/useVersionen'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'

interface Version {
  id: string
  label: string
  type: string
  number: string
  notes?: string | null
  releasedAt?: string | null
}

const TYPE_OPTIONS = [
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'FIRMWARE', label: 'Firmware' },
  { value: 'SONSTIGES', label: 'Sonstiges' },
]

const TYPE_COLORS: Record<string, string> = {
  SOFTWARE: 'bg-accent/10 text-accent',
  HARDWARE: 'bg-amber-500/10 text-amber-400',
  FIRMWARE: 'bg-purple-500/10 text-purple-400',
  SONSTIGES: 'bg-border text-text-muted',
}

const TYPE_LABELS: Record<string, string> = {
  SOFTWARE: 'SW',
  HARDWARE: 'HW',
  FIRMWARE: 'FW',
  SONSTIGES: 'Sonst.',
}

function VersionFormular({ projectId, version, onSuccess, onCancel }: { projectId: string; version?: Version; onSuccess: () => void; onCancel: () => void }) {
  const [label, setLabel] = useState(version?.label ?? '')
  const [type, setType] = useState(version?.type ?? 'SOFTWARE')
  const [number, setNumber] = useState(version?.number ?? '')
  const [notes, setNotes] = useState(version?.notes ?? '')
  const [releasedAt, setReleasedAt] = useState(version?.releasedAt ? new Date(version.releasedAt).toISOString().split('T')[0] : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) { setError('Bezeichnung erforderlich'); return }
    if (!number.trim()) { setError('Versionsnummer erforderlich'); return }
    setLoading(true)
    setError('')

    const url = version ? `/api/versions/${version.id}` : `/api/projects/${projectId}/versions`
    const res = await fetch(url, {
      method: version ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, type, number, notes: notes || null, releasedAt: releasedAt || null }),
    })

    if (res.ok) { onSuccess() } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Bezeichnung *" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="z. B. Firmware MCU, PCB Rev, App-Version..." autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Typ" value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} />
        <Input label="Versionsnummer *" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="z. B. v2.1.0, Rev. C" />
      </div>
      <Input label="Veröffentlichungsdatum" type="date" value={releasedAt} onChange={(e) => setReleasedAt(e.target.value)} />
      <Textarea label="Notizen" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Änderungen, Kompatibilität..." rows={3} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Speichern...' : version ? 'Aktualisieren' : 'Hinzufügen'}</Button>
      </div>
    </form>
  )
}

export function VersionsListe({ projectId }: { projectId: string }) {
  const { versions, isLoading, mutate } = useVersionen(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editVersion, setEditVersion] = useState<Version | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/versions/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (versions.length === 0) {
    return (
      <>
        <EmptyState icon={Tag} title="Keine Versionen" description="Verfolge SW- und HW-Versionen." action={{ label: '+ Version hinzufügen', onClick: () => setFormOpen(true) }} />
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Neue Version">
          <VersionFormular projectId={projectId} onSuccess={() => { setFormOpen(false); mutate() }} onCancel={() => setFormOpen(false)} />
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditVersion(undefined); setFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4" /> Version
        </Button>
      </div>

      <div className="space-y-1.5">
        {versions.map((v: Version) => (
          <div key={v.id} className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 mt-0.5 ${TYPE_COLORS[v.type] ?? 'bg-border text-text-muted'}`}>
              {TYPE_LABELS[v.type] ?? v.type}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-text-primary">{v.label}</p>
                <code className="text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded font-mono">{v.number}</code>
              </div>
              {v.notes && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{v.notes}</p>}
              {v.releasedAt && <p className="text-xs text-text-muted mt-0.5">Veröffentlicht: {formatDate(v.releasedAt)}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => { setEditVersion(v); setFormOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteId(v.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={formOpen} onClose={() => { setFormOpen(false); setEditVersion(undefined) }} title={editVersion ? 'Version bearbeiten' : 'Neue Version'}>
        <VersionFormular projectId={projectId} version={editVersion} onSuccess={() => { setFormOpen(false); setEditVersion(undefined); mutate() }} onCancel={() => { setFormOpen(false); setEditVersion(undefined) }} />
      </Sheet>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Version löschen" message="Diese Version wird dauerhaft gelöscht." loading={deleting} />
    </>
  )
}
