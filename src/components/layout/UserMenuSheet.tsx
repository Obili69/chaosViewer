'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Database, Users, LogOut, RefreshCw, AlertTriangle } from 'lucide-react'
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

export function UserMenuSheet({ open, onClose, currentUser }: Props) {
  const router = useRouter()
  const isAdmin = currentUser.role === 'ADMIN'
  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGEMENT'

  const [backupRunning, setBackupRunning] = useState(false)
  const [backupResult, setBackupResult] = useState<{ ok?: boolean; error?: string } | null>(null)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    if (open) {
      fetch('/api/admin/version')
        .then((r) => r.json())
        .then(setVersionInfo)
        .catch(() => {})
    }
  }, [open])

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

  return (
    <Sheet open={open} onClose={onClose} title={currentUser.username}>
      <div className="space-y-3">
        {/* Role badge */}
        <p className="text-xs text-text-muted -mt-2 mb-4">{currentUser.role}</p>

        {/* Update available banner */}
        {versionInfo?.updateAvailable && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{versionInfo.updateCount} neue Version{versionInfo.updateCount !== 1 ? 'en' : ''} verfügbar</span>
          </div>
        )}

        {/* Backup */}
        {canManage && (
          <div className="space-y-2">
            <Button
              onClick={handleBackup}
              disabled={backupRunning}
              variant="secondary"
              className="w-full justify-start gap-2"
            >
              <Database className="w-4 h-4" />
              {backupRunning ? 'Backup läuft...' : 'Backup jetzt starten'}
            </Button>
            {backupResult?.ok && (
              <p className="text-xs text-emerald-400 px-1">Backup erfolgreich</p>
            )}
            {backupResult?.error && (
              <p className="text-xs text-red-400 px-1 break-words">{backupResult.error}</p>
            )}
          </div>
        )}

        {/* Benutzer verwalten */}
        {isAdmin && (
          <Link
            href="/einstellungen/benutzer"
            onClick={onClose}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-elevated border border-border text-sm text-text-primary hover:bg-border transition-colors"
          >
            <Users className="w-4 h-4 text-text-muted" />
            Benutzer verwalten
          </Link>
        )}

        {/* Version */}
        {versionInfo?.version && (
          <p className="text-[10px] text-text-muted px-1 pt-1">
            Version {versionInfo.version}
          </p>
        )}

        {/* Logout */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </div>
    </Sheet>
  )
}
