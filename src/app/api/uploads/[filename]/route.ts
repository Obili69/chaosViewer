import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { filename: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  const filePath = join(uploadDir, params.filename)

  try {
    const buffer = await readFile(filePath)
    const file = await prisma.file.findFirst({ where: { storedName: params.filename } })
    const contentType = file?.mimeType ?? 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${file?.originalName ?? params.filename}"`,
        'Cache-Control': 'private, max-age=604800',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Datei nicht gefunden' }, { status: 404 })
  }
}
