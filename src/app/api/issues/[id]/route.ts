import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const task = await prisma.issue.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      severity: body.severity,
      resolvedAt: body.status === 'BEHOBEN' || body.status === 'GESCHLOSSEN' ? new Date() : (body.status ? null : undefined),
    },
  })
  return NextResponse.json({ issue: task })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await prisma.issue.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
