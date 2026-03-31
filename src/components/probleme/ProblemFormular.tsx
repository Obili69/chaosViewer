'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface Issue {
  id: string
  title: string
  description?: string | null
  status: string
  severity: string
}

interface Props {
  projectId: string
  issue?: Issue
  onSuccess: () => void
  onCancel: () => void
}

const STATUS_OPTIONS = [
  { value: 'OFFEN', label: 'Offen' },
  { value: 'IN_BEARBEITUNG', label: 'In Bearbeitung' },
  { value: 'BEHOBEN', label: 'Behoben' },
  { value: 'GESCHLOSSEN', label: 'Geschlossen' },
]

const SEVERITY_OPTIONS = [
  { value: 'NIEDRIG', label: 'Niedrig' },
  { value: 'MITTEL', label: 'Mittel' },
  { value: 'HOCH', label: 'Hoch' },
  { value: 'KRITISCH', label: 'Kritisch' },
]

export function ProblemFormular({ projectId, issue, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState(issue?.title ?? '')
  const [description, setDescription] = useState(issue?.description ?? '')
  const [status, setStatus] = useState(issue?.status ?? 'OFFEN')
  const [severity, setSeverity] = useState(issue?.severity ?? 'MITTEL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Titel erforderlich'); return }
    setLoading(true)
    setError('')

    const url = issue ? `/api/issues/${issue.id}` : `/api/projects/${projectId}/issues`
    const res = await fetch(url, {
      method: issue ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status, severity }),
    })

    if (res.ok) {
      onSuccess()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titel *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Problem beschreiben..." autoFocus />
      <Textarea label="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details, Schritte zur Reproduktion..." rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        <Select label="Schweregrad" value={severity} onChange={(e) => setSeverity(e.target.value)} options={SEVERITY_OPTIONS} />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : issue ? 'Aktualisieren' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
