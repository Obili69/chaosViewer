'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TimeEntry {
  id: string
  description?: string | null
  startTime: string
  endTime?: string | null
  duration: number
}

interface Props {
  projectId: string
  entry?: TimeEntry
  onSuccess: () => void
  onCancel: () => void
}

function toDatetimeLocal(iso: string) {
  // Convert ISO to "YYYY-MM-DDTHH:MM" for datetime-local input
  return iso.slice(0, 16)
}

function calcDurationSeconds(start: string, end: string): number {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return Math.max(0, Math.round((e - s) / 1000))
}

function parseDurationInput(value: string): number {
  // Accepts "HH:MM" or "H:MM" or just minutes as a number
  const parts = value.split(':')
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10) || 0
    const m = parseInt(parts[1], 10) || 0
    return h * 3600 + m * 60
  }
  const mins = parseInt(value, 10)
  return isNaN(mins) ? 0 : mins * 60
}

function formatDurationInput(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export function ZeitFormular({ projectId, entry, onSuccess, onCancel }: Props) {
  const now = new Date()
  const defaultStart = toDatetimeLocal(entry?.startTime ?? now.toISOString())
  const defaultEnd = entry?.endTime ? toDatetimeLocal(entry.endTime) : ''
  const defaultDuration = entry ? formatDurationInput(entry.duration) : ''

  const [description, setDescription] = useState(entry?.description ?? '')
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [durationInput, setDurationInput] = useState(defaultDuration)
  const [mode, setMode] = useState<'times' | 'manual'>(entry?.endTime ? 'times' : 'manual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-calc duration from start/end when in times mode
  function handleEndTimeChange(val: string) {
    setEndTime(val)
    if (startTime && val) {
      const secs = calcDurationSeconds(startTime, val)
      setDurationInput(formatDurationInput(secs))
    }
  }

  function handleStartTimeChange(val: string) {
    setStartTime(val)
    if (endTime && val) {
      const secs = calcDurationSeconds(val, endTime)
      setDurationInput(formatDurationInput(secs))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!startTime) { setError('Startzeit erforderlich'); return }

    let duration: number
    let finalEndTime: string | null = null

    if (mode === 'times') {
      if (!endTime) { setError('Endzeit erforderlich'); return }
      duration = calcDurationSeconds(startTime, endTime)
      finalEndTime = new Date(endTime).toISOString()
    } else {
      duration = parseDurationInput(durationInput)
    }

    if (duration <= 0) { setError('Dauer muss größer als 0 sein'); return }

    setLoading(true)
    const url = entry ? `/api/time/${entry.id}` : `/api/projects/${projectId}/time`
    const method = entry ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description.trim() || null,
        startTime: new Date(startTime).toISOString(),
        endTime: finalEndTime,
        duration,
      }),
    })

    if (res.ok) {
      onSuccess()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler beim Speichern')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Beschreibung"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Woran wurde gearbeitet?"
        autoFocus
      />

      <Input
        label="Startzeit"
        type="datetime-local"
        value={startTime}
        onChange={(e) => handleStartTimeChange(e.target.value)}
      />

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('times')}
          className={`flex-1 px-3 py-2 text-sm rounded-xl border transition-colors ${mode === 'times' ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:border-accent/40'}`}
        >
          Endzeit eingeben
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 px-3 py-2 text-sm rounded-xl border transition-colors ${mode === 'manual' ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:border-accent/40'}`}
        >
          Dauer eingeben
        </button>
      </div>

      {mode === 'times' ? (
        <Input
          label="Endzeit"
          type="datetime-local"
          value={endTime}
          onChange={(e) => handleEndTimeChange(e.target.value)}
        />
      ) : (
        <Input
          label="Dauer (H:MM)"
          value={durationInput}
          onChange={(e) => setDurationInput(e.target.value)}
          placeholder="z. B. 1:30"
        />
      )}

      {durationInput && mode === 'times' && (
        <p className="text-xs text-text-muted -mt-2">Berechnete Dauer: {durationInput}</p>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : entry ? 'Aktualisieren' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
