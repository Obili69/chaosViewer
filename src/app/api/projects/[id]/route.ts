import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      area: true,
      _count: { select: { tasks: true, issues: true, files: true, links: true, versions: true, budgetItems: true } },
    },
  })
  if (!project) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  const tasksDone = await prisma.task.count({ where: { projectId: params.id, status: 'ERLEDIGT' } })
  const openIssues = await prisma.issue.count({ where: { projectId: params.id, status: 'OFFEN' } })

  return NextResponse.json({ project: { ...project, tasksDone, openIssues } })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      status: body.status,
      areaId: body.areaId ?? undefined,
      sortOrder: body.sortOrder,
    },
    include: { area: true },
  })
  return NextResponse.json({ project })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  // Delete all uploaded files from disk
  const files = await prisma.file.findMany({ where: { projectId: params.id } })
  const fs = await import('fs/promises')
  const path = await import('path')
  const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
  await Promise.all(
    files.map((f) => fs.unlink(path.join(uploadDir, f.storedName)).catch(() => {}))
  )

  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
