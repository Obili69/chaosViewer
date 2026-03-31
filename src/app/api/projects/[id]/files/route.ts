import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { existsSync, mkdirSync } from 'fs'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const files = await prisma.file.findMany({
    where: { projectId: params.id },
    orderBy: { uploadedAt: 'desc' },
  })
  return NextResponse.json({ files })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }

  const formData = await request.formData()
  const uploadedFiles = []

  for (const [, value] of formData.entries()) {
    if (!(value instanceof File)) continue

    const bytes = await value.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = value.name.includes('.') ? '.' + value.name.split('.').pop() : ''
    const storedName = `${randomUUID()}${ext}`
    const filePath = join(uploadDir, storedName)

    await writeFile(filePath, buffer)

    const file = await prisma.file.create({
      data: {
        originalName: value.name,
        storedName,
        mimeType: value.type || 'application/octet-stream',
        size: value.size,
        projectId: params.id,
      },
    })
    uploadedFiles.push(file)
  }

  return NextResponse.json({ files: uploadedFiles }, { status: 201 })
}
