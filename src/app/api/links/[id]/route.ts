import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const link = await prisma.link.update({
    where: { id: params.id },
    data: { label: body.label, url: body.url },
  })
  return NextResponse.json({ link })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await prisma.link.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
