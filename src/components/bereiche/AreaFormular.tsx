'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Sheet } from '@/components/ui/Sheet'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (area: { id: string; name: string; color: string }) => void
}

export function AreaFormular({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#06b6d4')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setName(''); setDescription(''); setColor('#06b6d4'); setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name erforderlich'); return }
    setLoading(true); setError('')

    const res = await fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description, color }),
    })

    if (res.ok) {
      const { area } = await res.json()
      onSuccess(area)
      reset()
      onClose()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
    }
    setLoading(false)
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="Neuer Bereich">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Elektronik, Fahrzeuge, Software..."
          autoFocus
        />
        <Textarea
          label="Beschreibung"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional..."
          rows={2}
        />
        <ColorPicker label="Farbe" value={color} onChange={setColor} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose() }} className="flex-1">
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Erstellen...' : 'Bereich erstellen'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
