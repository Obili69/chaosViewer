import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const tasks = await prisma.task.findMany({
    where: { projectId: params.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ tasks })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Titel erforderlich' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title: body.title.trim(),
      description: body.description,
      status: body.status ?? 'OFFEN',
      priority: body.priority ?? 'MITTEL',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: params.id,
    },
  })
  return NextResponse.json({ task }, { status: 201 })
}
