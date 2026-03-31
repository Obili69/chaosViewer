'use client'

import { useState } from 'react'
import { Wallet, Plus, Pencil, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useBudget } from '@/hooks/useBudget'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { BudgetFormular } from './BudgetFormular'
import { formatDate, formatCurrency } from '@/lib/utils'

interface BudgetItem {
  id: string
  label: string
  amount: number
  type: string
  category?: string | null
  date: string
}

export function BudgetListe({ projectId }: { projectId: string }) {
  const { items, canViewBudget, isLoading, mutate } = useBudget(projectId)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<BudgetItem | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <PageSpinner />

  const ausgaben = items.filter((i: BudgetItem) => i.type === 'AUSGABE')
  const einnahmen = items.filter((i: BudgetItem) => i.type === 'EINNAHME')
  const totalAusgaben = ausgaben.reduce((s: number, i: BudgetItem) => s + i.amount, 0)
  const totalEinnahmen = einnahmen.reduce((s: number, i: BudgetItem) => s + i.amount, 0)
  const balance = totalEinnahmen - totalAusgaben

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/budget/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          icon={Wallet}
          title="Kein Budget"
          description="Füge Ausgaben hinzu."
          action={{ label: '+ Eintrag hinzufügen', onClick: () => setFormOpen(true) }}
        />
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Budget-Eintrag">
          <BudgetFormular
            projectId={projectId}
            restrictToAusgabe={!canViewBudget}
            onSuccess={() => { setFormOpen(false); mutate() }}
            onCancel={() => setFormOpen(false)}
          />
        </Sheet>
      </>
    )
  }

  return (
    <>
      {/* Summary cards — only visible to users with budget view permission */}
      {canViewBudget && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-xs text-text-muted mb-0.5">Ausgaben</p>
            <p className="text-base font-bold text-red-400">{formatCurrency(totalAusgaben)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-xs text-text-muted mb-0.5">Einnahmen</p>
            <p className="text-base font-bold text-highlight">{formatCurrency(totalEinnahmen)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3">
            <p className="text-xs text-text-muted mb-0.5">Saldo</p>
            <p className={`text-base font-bold ${balance >= 0 ? 'text-highlight' : 'text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditItem(undefined); setFormOpen(true) }} size="sm">
          <Plus className="w-4 h-4" /> Eintrag
        </Button>
      </div>

      <div className="space-y-1.5">
        {items.map((item: BudgetItem) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'AUSGABE' ? 'bg-red-500/10 text-red-400' : 'bg-highlight/10 text-highlight'}`}>
              {item.type === 'AUSGABE' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{item.label}</p>
              <p className="text-xs text-text-muted">{item.category ?? item.type === 'AUSGABE' ? 'Ausgabe' : 'Einnahme'} • {formatDate(item.date)}</p>
            </div>
            <span className={`text-sm font-semibold flex-shrink-0 ${item.type === 'AUSGABE' ? 'text-red-400' : 'text-highlight'}`}>
              {item.type === 'AUSGABE' ? '-' : '+'}{formatCurrency(item.amount)}
            </span>
            {canViewBudget && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditItem(item); setFormOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Sheet open={formOpen} onClose={() => { setFormOpen(false); setEditItem(undefined) }} title={editItem ? 'Eintrag bearbeiten' : 'Budget-Eintrag'}>
        <BudgetFormular
          projectId={projectId}
          item={editItem}
          restrictToAusgabe={!canViewBudget}
          onSuccess={() => { setFormOpen(false); setEditItem(undefined); mutate() }}
          onCancel={() => { setFormOpen(false); setEditItem(undefined) }}
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eintrag löschen"
        message="Dieser Budget-Eintrag wird dauerhaft gelöscht."
        loading={deleting}
      />
    </>
  )
}
