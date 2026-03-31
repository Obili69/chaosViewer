import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const version = await prisma.version.update({
    where: { id: params.id },
    data: {
      label: body.label,
      type: body.type,
      number: body.number,
      notes: body.notes,
      releasedAt: body.releasedAt ? new Date(body.releasedAt) : undefined,
    },
  })
  return NextResponse.json({ version })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await prisma.version.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
