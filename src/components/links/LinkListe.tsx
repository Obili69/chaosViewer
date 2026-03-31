'use client'

import { useState } from 'react'
import { Link2, Plus, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useLinks } from '@/hooks/useLinks'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'

interface LinkItem {
  id: string
  label: string
  url: string
}

function LinkFormular({ projectId, link, onSuccess, onCancel }: { projectId: string; link?: LinkItem; onSuccess: () => void; onCancel: () => void }) {
  const [label, setLabel] = useState(link?.label ?? '')
  const [url, setUrl] = useState(link?.url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) { setError('Bezeichnung erforderlich'); return }
    if (!url.trim()) { setError('URL erforderlich'); return }
    setLoading(true)
    setError('')

    const apiUrl = link ? `/api/links/${link.id}` : `/api/projects/${projectId}/links`
    const res = await fetch(apiUrl, {
      method: link ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, url }),
    })

    if (res.ok) { onSuccess() } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Bezeichnung *" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="z. B. Datenblatt, GitHub, Dokumentation..." autoFocus />
      <Input label="URL *" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Speichern...' : link ? 'Aktualisieren' : 'Hinzufügen'}</Button>
      </div>
    </form>
  )
}

export function LinkListe({ projectId }: { projectId: string }) {
  const { links, isLoading, mutate } = useLinks(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editLink, setEditLink] = useState<LinkItem | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/links/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (links.length === 0) {
    return (
      <>
        <EmptyState icon={Link2} title="Keine Links" description="Füge nützliche Links hinzu." action={{ label: '+ Link hinzufügen', onClick: () => setFormOpen(true) }} />
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Neuer Link">
          <LinkFormular projectId={projectId} onSuccess={() => { setFormOpen(false); mutate() }} onCancel={() => setFormOpen(false)} />
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditLink(undefined); setFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4" /> Link
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map((link: LinkItem) => (
          <div key={link.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{link.label}</p>
              <p className="text-xs text-text-muted truncate">{link.url}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button onClick={() => { setEditLink(link); setFormOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteId(link.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={formOpen} onClose={() => { setFormOpen(false); setEditLink(undefined) }} title={editLink ? 'Link bearbeiten' : 'Neuer Link'}>
        <LinkFormular projectId={projectId} link={editLink} onSuccess={() => { setFormOpen(false); setEditLink(undefined); mutate() }} onCancel={() => { setFormOpen(false); setEditLink(undefined) }} />
      </Sheet>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Link löschen" message="Dieser Link wird dauerhaft gelöscht." loading={deleting} />
    </>
  )
}
