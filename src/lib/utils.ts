import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatRelative(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 7) return `vor ${days} Tagen`
  return formatDate(d)
}

export const ACCENT_COLORS = [
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // rose
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
]

export const STATUS_LABELS: Record<string, string> = {
  AKTIV: 'Aktiv',
  ARCHIVIERT: 'Archiviert',
  PAUSIERT: 'Pausiert',
  OFFEN: 'Offen',
  IN_BEARBEITUNG: 'In Bearbeitung',
  ERLEDIGT: 'Erledigt',
  BLOCKIERT: 'Blockiert',
  BEHOBEN: 'Behoben',
  GESCHLOSSEN: 'Geschlossen',
  NIEDRIG: 'Niedrig',
  MITTEL: 'Mittel',
  HOCH: 'Hoch',
  KRITISCH: 'Kritisch',
  AUSGABE: 'Ausgabe',
  EINNAHME: 'Einnahme',
  SOFTWARE: 'Software',
  HARDWARE: 'Hardware',
  FIRMWARE: 'Firmware',
  SONSTIGES: 'Sonstiges',
  ADMIN: 'Administrator',
  MANAGEMENT: 'Management',
  USER: 'Benutzer',
}

export function isAdminOrManagement(role: string): boolean {
  return role === 'ADMIN' || role === 'MANAGEMENT'
}
