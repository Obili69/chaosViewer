'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Square, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  projectId: string
  onSave: () => void
  tasks:  { id: string; title: string }[]
  issues: { id: string; title: string }[]
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const selectClass = 'w-full px-3 py-2 bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors'

export function Stoppuhr({ projectId, onSave, tasks, issues }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [taskId, setTaskId] = useState('')
  const [issueId, setIssueId] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const startedAtRef = useRef<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function handleStart() {
    startedAtRef.current = new Date()
    setElapsed(0)
    setShowSave(false)
    setRunning(true)
  }

  function handleStop() {
    setRunning(false)
    setShowSave(true)
  }

  async function handleSave() {
    if (!startedAtRef.current || elapsed <= 0) return
    setSaving(true)
    const endTime = new Date()
    await fetch(`/api/projects/${projectId}/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description.trim() || null,
        startTime: startedAtRef.current.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsed,
        taskId:  taskId  || null,
        issueId: issueId || null,
      }),
    })
    setSaving(false)
    setShowSave(false)
    setElapsed(0)
    setDescription('')
    setTaskId('')
    setIssueId('')
    startedAtRef.current = null
    onSave()
  }

  function handleDiscard() {
    setShowSave(false)
    setElapsed(0)
    setDescription('')
    setTaskId('')
    setIssueId('')
    startedAtRef.current = null
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 mb-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-text-muted mb-1">Stoppuhr</p>
          <p className={`text-3xl font-mono font-bold tabular-nums ${running ? 'text-accent' : 'text-text-primary'}`}>
            {formatElapsed(elapsed)}
          </p>
        </div>
        <div className="flex gap-2">
          {!running && !showSave && (
            <Button onClick={handleStart} size="sm">
              <Play className="w-4 h-4" /> Start
            </Button>
          )}
          {running && (
            <Button onClick={handleStop} size="sm" variant="secondary">
              <Square className="w-4 h-4" /> Stop
            </Button>
          )}
        </div>
      </div>

      {showSave && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <input
            type="text"
            placeholder="Beschreibung (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {tasks.length > 0 && (
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className={selectClass}>
              <option value="">— Aufgabe verknüpfen (optional)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
          {issues.length > 0 && (
            <select value={issueId} onChange={(e) => setIssueId(e.target.value)} className={selectClass}>
              <option value="">— Problem verknüpfen (optional)</option>
              {issues.map((i) => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDiscard}
              className="flex-1 px-3 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-xl transition-colors"
            >
              Verwerfen
            </button>
            <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1">
              <Save className="w-4 h-4" />
              {saving ? 'Speichern...' : `Speichern (${formatElapsed(elapsed)})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
