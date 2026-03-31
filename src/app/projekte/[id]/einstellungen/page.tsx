'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageSpinner } from '@/components/ui/Spinner'

const STATUS_OPTIONS = [
  { value: 'AKTIV', label: 'Aktiv' },
  { value: 'PAUSIERT', label: 'Pausiert' },
  { value: 'ARCHIVIERT', label: 'Archiviert' },
]

export default function EinstellungenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#06b6d4')
  const [status, setStatus] = useState('AKTIV')
  const [areaId, setAreaId] = useState('')
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${params.id}`).then((r) => r.json()),
      fetch('/api/areas').then((r) => r.json()),
    ]).then(([pd, ad]) => {
      const p = pd.project
      setName(p.name ?? '')
      setDescription(p.description ?? '')
      setColor(p.color ?? '#06b6d4')
      setStatus(p.status ?? 'AKTIV')
      setAreaId(p.areaId ?? '')
      setAreas(ad.areas ?? [])
      setLoading(false)
    })
  }, [params.id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name erforderlich'); return }
    setSaving(true)
    setError('')

    const res = await fetch(`/api/projects/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color, status, areaId: areaId || null }),
    })

    if (res.ok) {
      router.refresh()
      router.push(`/projekte/${params.id}/aufgaben`)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/projects/${params.id}`, { method: 'DELETE' })
    router.push('/')
  }

  if (loading) return <PageSpinner />

  const areaOptions = [
    { value: '', label: 'Kein Bereich' },
    ...areas.map((a) => ({ value: a.id, label: a.name })),
  ]

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSave} className="bg-surface border border-border rounded-2xl p-5 space-y-4 mb-5">
        <h2 className="font-semibold text-text-primary">Projektdetails</h2>
        <Input label="Name *" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
          <Select label="Bereich" value={areaId} onChange={(e) => setAreaId(e.target.value)} options={areaOptions} />
        </div>
        <ColorPicker label="Farbe" value={color} onChange={setColor} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Speichern...' : 'Änderungen speichern'}
        </Button>
      </form>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <h2 className="font-semibold text-red-400 mb-2">Gefahrenzone</h2>
        <p className="text-sm text-text-muted mb-4">
          Das Projekt und alle zugehörigen Daten (Aufgaben, Probleme, Dateien, Budget, etc.) werden dauerhaft gelöscht.
        </p>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Projekt löschen
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Projekt löschen"
        message="Alle Daten dieses Projekts werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Projekt löschen"
        loading={deleting}
      />
    </div>
  )
}
