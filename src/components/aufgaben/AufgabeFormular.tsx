'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
}

interface Props {
  projectId: string
  task?: Task
  onSuccess: () => void
  onCancel: () => void
}

const STATUS_OPTIONS = [
  { value: 'OFFEN', label: 'Offen' },
  { value: 'IN_BEARBEITUNG', label: 'In Bearbeitung' },
  { value: 'ERLEDIGT', label: 'Erledigt' },
  { value: 'BLOCKIERT', label: 'Blockiert' },
]

const PRIORITY_OPTIONS = [
  { value: 'NIEDRIG', label: 'Niedrig' },
  { value: 'MITTEL', label: 'Mittel' },
  { value: 'HOCH', label: 'Hoch' },
  { value: 'KRITISCH', label: 'Kritisch' },
]

export function AufgabeFormular({ projectId, task, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState(task?.status ?? 'OFFEN')
  const [priority, setPriority] = useState(task?.priority ?? 'MITTEL')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Titel erforderlich'); return }
    setLoading(true)
    setError('')

    const url = task ? `/api/tasks/${task.id}` : `/api/projects/${projectId}/tasks`
    const method = task ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status, priority, dueDate: dueDate || null }),
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
      <Input label="Titel *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aufgabe beschreiben..." autoFocus />
      <Textarea label="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
        <Select label="Priorität" value={priority} onChange={(e) => setPriority(e.target.value)} options={PRIORITY_OPTIONS} />
      </div>
      <Input label="Fälligkeitsdatum" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : task ? 'Aktualisieren' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
