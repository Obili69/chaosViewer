'use client'

import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Löschen', loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-text-secondary mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? 'Wird gelöscht...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
