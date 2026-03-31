import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const issues = await prisma.issue.findMany({
    where: { projectId: params.id },
    orderBy: [{ createdAt: 'desc' }],
  })
  return NextResponse.json({ issues })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Titel erforderlich' }, { status: 400 })
  }

  const issue = await prisma.issue.create({
    data: {
      title: body.title.trim(),
      description: body.description,
      status: body.status ?? 'OFFEN',
      severity: body.severity ?? 'MITTEL',
      projectId: params.id,
    },
  })
  return NextResponse.json({ issue }, { status: 201 })
}
