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
import { isAdminOrManagement, STATUS_LABELS } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'AKTIV', label: 'Aktiv' },
  { value: 'PAUSIERT', label: 'Pausiert' },
  { value: 'ARCHIVIERT', label: 'Archiviert' },
]

interface UserEntry {
  id: string
  username: string
  role: string
}

interface MemberEntry {
  userId: string
  canViewProject: boolean
  canViewBudget: boolean
  user: { id: string; username: string; role: string }
}

function BerechtigungenPanel({ projectId }: { projectId: string }) {
  const [users, setUsers] = useState<UserEntry[]>([])
  const [members, setMembers] = useState<MemberEntry[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch(`/api/projects/${projectId}/permissions`).then((r) => r.json()),
    ]).then(([ud, md]) => {
      setUsers((ud.users ?? []).filter((u: UserEntry) => u.role === 'USER'))
      setMembers(md.members ?? [])
    })
  }, [projectId])

  function getMember(userId: string): MemberEntry | undefined {
    return members.find((m) => m.userId === userId)
  }

  async function handleSave(userId: string, canViewProject: boolean, canViewBudget: boolean) {
    setSaving(userId)
    await fetch(`/api/projects/${projectId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, canViewProject, canViewBudget }),
    })
    const md = await fetch(`/api/projects/${projectId}/permissions`).then((r) => r.json())
    setMembers(md.members ?? [])
    setSaving(null)
  }

  if (users.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-text-primary mb-3">Zugriffsberechtigungen</h2>
        <p className="text-sm text-text-muted">Keine Benutzer vorhanden.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-5">
      <h2 className="font-semibold text-text-primary mb-4">Zugriffsberechtigungen</h2>
      <div className="space-y-3">
        {users.map((user) => {
          const member = getMember(user.id)
          const canViewProject = member?.canViewProject ?? false
          const canViewBudget = member?.canViewBudget ?? false

          return (
            <div key={user.id} className="flex flex-col gap-2 p-3 bg-elevated border border-border rounded-xl">
              <p className="text-sm font-medium text-text-primary">{user.username}</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={canViewProject}
                    onChange={(e) => handleSave(user.id, e.target.checked, canViewBudget)}
                    disabled={saving === user.id}
                  />
                  Projekt sichtbar
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={canViewBudget}
                    onChange={(e) => handleSave(user.id, canViewProject, e.target.checked)}
                    disabled={saving === user.id}
                  />
                  Budget-Übersicht sichtbar
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function EinstellungenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#06b6d4')
  const [status, setStatus] = useState('AKTIV')
  const [areaId, setAreaId] = useState('')
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState('')

  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [projectOwnerId, setProjectOwnerId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${params.id}`).then((r) => r.json()),
      fetch('/api/areas').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([pd, ad, me]) => {
      const p = pd.project
      setName(p.name ?? '')
      setDescription(p.description ?? '')
      setColor(p.color ?? '#06b6d4')
      setStatus(p.status ?? 'AKTIV')
      setAreaId(p.areaId ?? '')
      setAreas(ad.areas ?? [])
      setCurrentUserRole(me.user?.role ?? '')
      setCurrentUserId(me.user?.id ?? '')
      setProjectOwnerId(p.ownerId ?? null)
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

      {/* Permissions — visible to ADMIN, MANAGEMENT, and project owner */}
      {(isAdminOrManagement(currentUserRole) || currentUserId === projectOwnerId) && (
        <BerechtigungenPanel projectId={params.id} />
      )}

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
