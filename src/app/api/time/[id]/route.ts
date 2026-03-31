import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const { description, startTime, endTime, duration } = body

  const entry = await prisma.timeEntry.update({
    where: { id: params.id },
    data: {
      description: description?.trim() || null,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : null,
      duration: duration != null ? Math.round(duration) : undefined,
    },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await prisma.timeEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
