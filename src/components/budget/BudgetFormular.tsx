'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface BudgetItem {
  id: string
  label: string
  amount: number
  type: string
  category?: string | null
  date: string
}

interface Props {
  projectId: string
  item?: BudgetItem
  restrictToAusgabe?: boolean
  onSuccess: () => void
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'AUSGABE', label: 'Ausgabe' },
  { value: 'EINNAHME', label: 'Einnahme' },
]

export function BudgetFormular({ projectId, item, restrictToAusgabe = false, onSuccess, onCancel }: Props) {
  const [label, setLabel] = useState(item?.label ?? '')
  const [amount, setAmount] = useState(item?.amount?.toString() ?? '')
  const [type, setType] = useState(item?.type ?? 'AUSGABE')
  const [category, setCategory] = useState(item?.category ?? '')
  const [date, setDate] = useState(
    item?.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) { setError('Bezeichnung erforderlich'); return }
    if (!amount || isNaN(parseFloat(amount))) { setError('Betrag ungültig'); return }
    setLoading(true)
    setError('')

    const effectiveType = restrictToAusgabe ? 'AUSGABE' : type
    const url = item ? `/api/budget/${item.id}` : `/api/projects/${projectId}/budget`
    const res = await fetch(url, {
      method: item ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, amount: parseFloat(amount), type: effectiveType, category: category || null, date }),
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
      <Input label="Bezeichnung *" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="z. B. Bauteile, Platine, Gehäuse..." autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Betrag (€) *" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        {restrictToAusgabe ? (
          <div>
            <label className="text-xs text-text-muted block mb-1">Typ</label>
            <div className="px-3 py-2 bg-elevated border border-border rounded-xl text-sm text-text-muted">Ausgabe</div>
          </div>
        ) : (
          <Select label="Typ" value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Kategorie" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="z. B. Hardware" />
        <Input label="Datum" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : item ? 'Aktualisieren' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
