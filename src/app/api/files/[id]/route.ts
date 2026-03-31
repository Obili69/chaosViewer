import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const file = await prisma.file.findUnique({ where: { id: params.id } })
  if (!file) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  await unlink(join(uploadDir, file.storedName)).catch(() => {})
  await prisma.file.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
