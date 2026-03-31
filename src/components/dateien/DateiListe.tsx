'use client'

import { useState, useRef } from 'react'
import { Paperclip, Upload, Trash2, Download, FileText, Image, Film } from 'lucide-react'
import { useDateien } from '@/hooks/useDateien'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatBytes, formatDate } from '@/lib/utils'

interface FileItem {
  id: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
  uploadedAt: string
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-accent" />
  if (mimeType.startsWith('video/')) return <Film className="w-4 h-4 text-purple-400" />
  return <FileText className="w-4 h-4 text-text-muted" />
}

export function DateiListe({ projectId }: { projectId: string }) {
  const { files, isLoading, mutate } = useDateien(projectId)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) return <PageSpinner />

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected || selected.length === 0) return

    setUploading(true)
    const formData = new FormData()
    for (const file of selected) {
      formData.append('file', file)
    }

    await fetch(`/api/projects/${projectId}/files`, { method: 'POST', body: formData })
    mutate()
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/files/${deleteId}`, { method: 'DELETE' })
    mutate()
    setDeleteId(null)
    setDeleting(false)
  }

  if (files.length === 0) {
    return (
      <>
        <div
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-accent/40 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary">Dateien hochladen</p>
          <p className="text-xs text-text-muted mt-1">Klicken oder Dateien hier ablegen</p>
          {uploading && <p className="text-xs text-accent mt-2">Wird hochgeladen...</p>}
        </div>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => fileInputRef.current?.click()} size="sm" disabled={uploading}>
          <Upload className="w-4 h-4" />
          {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />

      <div className="space-y-1.5">
        {files.map((file: FileItem) => (
          <div key={file.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center flex-shrink-0">
              <FileIcon mimeType={file.mimeType} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{file.originalName}</p>
              <p className="text-xs text-text-muted">{formatBytes(file.size)} • {formatDate(file.uploadedAt)}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <a
                href={`/api/uploads/${file.storedName}`}
                download={file.originalName}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setDeleteId(file.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Datei löschen"
        message="Diese Datei wird dauerhaft gelöscht."
        loading={deleting}
      />
    </>
  )
}
