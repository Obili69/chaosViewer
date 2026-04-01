'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Shield, User, Briefcase, Database } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, STATUS_LABELS } from '@/lib/utils'

interface UserItem {
  id: string
  username: string
  email?: string | null
  role: string
  createdAt: string
}

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Benutzer' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'ADMIN', label: 'Administrator' },
]

function RoleIcon({ role }: { role: string }) {
  if (role === 'ADMIN') return <Shield className="w-4 h-4 text-accent" />
  if (role === 'MANAGEMENT') return <Briefcase className="w-4 h-4 text-yellow-400" />
  return <User className="w-4 h-4 text-text-muted" />
}

export default function BenutzerPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('USER')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [backupRunning, setBackupRunning] = useState(false)
  const [backupResult, setBackupResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  async function handleBackup() {
    setBackupRunning(true)
    setBackupResult(null)
    const res = await fetch('/api/admin/backup', { method: 'POST' })
    const data = await res.json()
    setBackupResult(res.ok ? { ok: true } : { error: data.error })
    setBackupRunning(false)
  }

  useEffect(() => { loadPage() }, [])

  async function loadPage() {
    const [meRes, usersRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/admin/users'),
    ])
    if (meRes.ok) {
      const me = await meRes.json()
      setCurrentUserRole(me.user?.role ?? null)
    }
    if (usersRes.ok) {
      const d = await usersRes.json()
      setUsers(d.users ?? [])
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email: email || null, role }),
    })

    if (res.ok) {
      setUsername(''); setPassword(''); setEmail(''); setRole('USER')
      setFormOpen(false)
      loadPage()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Fehler')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' })
    loadPage()
    setDeleteId(null)
    setDeleting(false)
  }

  if (loading) return (
    <>
      <TopBar title="Benutzer" showBack backHref="/" />
      <BottomNav />
      <div className="pt-14 md:pt-0"><PageSpinner /></div>
    </>
  )

  if (currentUserRole !== 'ADMIN') {
    return (
      <>
        <TopBar title="Benutzer" showBack backHref="/" />
        <BottomNav />
        <div className="pt-14 md:pt-0 pb-20 md:pb-0 px-4 md:px-6 max-w-2xl mx-auto">
          <div className="py-16 text-center">
            <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">Keine Berechtigung</h2>
            <p className="text-sm text-text-muted">Nur Administratoren können Benutzer verwalten.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Benutzer" showBack backHref="/" />
      <BottomNav />

      <div className="pt-14 md:pt-0 pb-20 md:pb-0 px-4 md:px-6 max-w-2xl mx-auto">
        <div className="py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-text-primary hidden md:block">Benutzerverwaltung</h1>
            <Button onClick={() => setFormOpen(!formOpen)} size="sm">
              <Plus className="w-4 h-4" /> Neuer Benutzer
            </Button>
          </div>

          {/* Create form */}
          {formOpen && (
            <form onSubmit={handleCreate} className="bg-surface border border-border rounded-2xl p-5 space-y-4 mb-5">
              <h2 className="font-semibold text-text-primary">Neuen Benutzer erstellen</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Benutzername *" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                <Input label="Passwort *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="E-Mail (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Select label="Rolle" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setFormOpen(false)} className="flex-1">Abbrechen</Button>
                <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Erstellen...' : 'Erstellen'}</Button>
              </div>
            </form>
          )}

          {/* User list */}
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl group">
                <div className="w-9 h-9 rounded-xl bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                  <RoleIcon role={user.role} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{user.username}</p>
                  <p className="text-xs text-text-muted">
                    {STATUS_LABELS[user.role] ?? user.role}
                    {user.email && ` • ${user.email}`}
                    {` • Erstellt ${formatDate(user.createdAt)}`}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteId(user.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Backup */}
          <div className="mt-8 pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-text-muted" />
              Datenbank-Backup
            </h2>
            <div className="flex items-center gap-3">
              <Button onClick={handleBackup} disabled={backupRunning} variant="secondary" size="sm">
                {backupRunning ? 'Backup läuft...' : 'Backup jetzt starten'}
              </Button>
              {backupResult?.ok && <span className="text-sm text-emerald-400">Backup erfolgreich</span>}
              {backupResult?.error && <span className="text-sm text-red-400 truncate max-w-xs">{backupResult.error}</span>}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Benutzer löschen"
        message="Dieser Benutzer wird dauerhaft gelöscht und kann sich nicht mehr anmelden."
        confirmLabel="Benutzer löschen"
        loading={deleting}
      />
    </>
  )
}
