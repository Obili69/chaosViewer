import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const item = await prisma.budgetItem.update({
    where: { id: params.id },
    data: {
      label: body.label,
      amount: body.amount != null ? parseFloat(body.amount) : undefined,
      type: body.type,
      category: body.category,
      date: body.date ? new Date(body.date) : undefined,
    },
  })
  return NextResponse.json({ item })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await prisma.budgetItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
