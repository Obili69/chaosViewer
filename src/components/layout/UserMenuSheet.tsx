'use client'

import { useState, useEffect } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Database, Users, LogOut, RefreshCw, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

interface Props {
  open: boolean
  onClose: () => void
  currentUser: { role: string; username: string }
}

interface VersionInfo {
  version?: string
  updateAvailable?: boolean
  updateCount?: number
}

type UpdateState = 'idle' | 'confirming' | 'updating' | 'done' | 'error'

export function UserMenuSheet({ open, onClose, currentUser }: Props) {
  const isAdmin = currentUser.role === 'ADMIN'
  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGEMENT'

  const [backupRunning, setBackupRunning] = useState(false)
  const [backupResult, setBackupResult] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [checking, setChecking] = useState(false)
  const [updateState, setUpdateState] = useState<UpdateState>('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => { if (open) fetchVersion() }, [open])
  useEffect(() => { if (!open) { setUpdateState('idle'); setUpdateError(null) } }, [open])

  async function fetchVersion() {
    setChecking(true)
    try {
      const r = await fetch('/api/admin/version')
      setVersionInfo(await r.json())
    } catch { /* ignore */ } finally {
      setChecking(false)
    }
  }

  async function handleUpdate() {
    setUpdateState('updating')
    setUpdateError(null)
    try {
      const res = await fetch('/api/admin/update', { method: 'POST' })
      if (res.ok || res.status === 202) {
        setUpdateState('done')
        setTimeout(() => window.location.reload(), 30_000)
      } else {
        const data = await res.json().catch(() => ({}))
        setUpdateError(data.error ?? `Fehler ${res.status}`)
        setUpdateState('error')
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : String(err))
      setUpdateState('error')
    }
  }

  async function handleBackup() {
    setBackupRunning(true)
    setBackupResult(null)
    const res = await fetch('/api/admin/backup', { method: 'POST' })
    const data = await res.json()
    setBackupResult(res.ok ? { ok: true } : { error: data.error })
    setBackupRunning(false)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  function renderUpdateBlock() {
    if (!canManage || !versionInfo?.updateAvailable) return null

    if (updateState === 'done') return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
        <p className="text-xs text-amber-400">
          Update gestartet — Container wird neu gebaut (~1-2 Min). Seite lädt automatisch neu.
        </p>
      </div>
    )

    if (updateState === 'error') return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 space-y-2">
        <p className="text-xs text-red-400 break-words">{updateError}</p>
        <Button onClick={() => setUpdateState('idle')} variant="secondary" className="w-full justify-center">
          Zurück
        </Button>
      </div>
    )

    if (updateState === 'confirming') return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 space-y-2">
        <p className="text-xs text-amber-400">
          App ist ~1-2 Min nicht erreichbar während des Builds. Fortfahren?
        </p>
        <div className="flex gap-2">
          <Button onClick={handleUpdate} variant="secondary" className="flex-1 justify-center border-amber-500/30">
            Ja, starten
          </Button>
          <Button onClick={() => setUpdateState('idle')} variant="secondary" className="flex-1 justify-center">
            Abbrechen
          </Button>
        </div>
      </div>
    )

    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{versionInfo.updateCount} neue Commit{versionInfo.updateCount !== 1 ? 's' : ''} verfügbar</span>
        </div>
        <Button
          onClick={() => setUpdateState('confirming')}
          variant="secondary"
          className="w-full justify-start gap-3 border-amber-500/30"
        >
          <Download className="w-4 h-4" />
          Update durchführen
        </Button>
      </div>
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title={currentUser.username}>
      <div className="space-y-2">
        <p className="text-xs text-text-muted -mt-2 mb-3">{currentUser.role}</p>

        {isAdmin && (
          <Link href="/einstellungen/benutzer" onClick={onClose}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-elevated border border-border text-sm text-text-primary hover:bg-border transition-colors">
            <Users className="w-4 h-4 text-text-muted" />
            Benutzer verwalten
          </Link>
        )}

        {canManage && (
          <Button onClick={fetchVersion} disabled={checking} variant="secondary" className="w-full justify-start gap-3">
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Suche...' : 'Nach Updates suchen'}
          </Button>
        )}

        {canManage && versionInfo && !versionInfo.updateAvailable && (
          <div className="flex items-center gap-2 px-3 py-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Aktuell{versionInfo.version ? ` (${versionInfo.version})` : ''}</span>
          </div>
        )}

        {renderUpdateBlock()}

        {canManage && (
          <div className="space-y-1.5">
            <Button onClick={handleBackup} disabled={backupRunning} variant="secondary" className="w-full justify-start gap-3">
              <Database className="w-4 h-4" />
              {backupRunning ? 'Backup läuft...' : 'Backup starten'}
            </Button>
            {backupResult?.ok && <p className="text-xs text-emerald-400 px-1">Backup erfolgreich</p>}
            {backupResult?.error && <p className="text-xs text-red-400 px-1 break-words">{backupResult.error}</p>}
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </div>
    </Sheet>
  )
}
