import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const items = await prisma.budgetItem.findMany({
    where: { projectId: params.id },
    orderBy: [{ date: 'desc' }],
  })
  return NextResponse.json({ items })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.label?.trim()) return NextResponse.json({ error: 'Bezeichnung erforderlich' }, { status: 400 })
  if (body.amount == null) return NextResponse.json({ error: 'Betrag erforderlich' }, { status: 400 })

  const item = await prisma.budgetItem.create({
    data: {
      label: body.label.trim(),
      amount: parseFloat(body.amount),
      type: body.type ?? 'AUSGABE',
      category: body.category,
      date: body.date ? new Date(body.date) : new Date(),
      projectId: params.id,
    },
  })
  return NextResponse.json({ item }, { status: 201 })
}
