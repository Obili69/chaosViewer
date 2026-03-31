'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AreaFormular } from '@/components/bereiche/AreaFormular'

export default function NeuesProjektPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#06b6d4')
  const [areaId, setAreaId] = useState('')
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [areaFormOpen, setAreaFormOpen] = useState(false)

  useEffect(() => {
    fetch('/api/areas').then((r) => r.json()).then((d) => setAreas(d.areas ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name erforderlich'); return }
    setLoading(true)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color, areaId: areaId || null }),
    })

    if (res.ok) {
      const { project } = await res.json()
      router.push(`/projekte/${project.id}/aufgaben`)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler beim Erstellen')
      setLoading(false)
    }
  }

  const areaOptions = [
    { value: '', label: 'Kein Bereich' },
    ...areas.map((a) => ({ value: a.id, label: a.name })),
  ]

  return (
    <>
      <TopBar title="Neues Projekt" showBack backHref="/" />
      <BottomNav />
      <div className="pt-14 md:pt-0 pb-20 md:pb-0 px-4 md:px-6 max-w-2xl mx-auto">
        <div className="py-6 md:py-8">
          <h1 className="text-xl font-bold text-text-primary mb-6 hidden md:block">
            Neues Projekt
          </h1>

          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <Input
              label="Projektname *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Arduino Wetterstation"
              autoFocus
            />
            <Textarea
              label="Beschreibung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Projektbeschreibung..."
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Bereich</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    options={areaOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAreaFormOpen(true)}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-elevated text-text-muted hover:text-accent hover:border-accent/50 transition-colors"
                  title="Neuer Bereich"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ColorPicker label="Farbe" value={color} onChange={setColor} />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Wird erstellt...' : 'Projekt erstellen'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AreaFormular
        open={areaFormOpen}
        onClose={() => setAreaFormOpen(false)}
        onSuccess={(area) => {
          setAreas((prev) => [...prev, area])
          setAreaId(area.id)
          setAreaFormOpen(false)
        }}
      />
    </>
  )
}
