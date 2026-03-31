import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isAdminOrManagement } from '@/lib/utils'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const items = await prisma.budgetItem.findMany({
    where: { projectId: params.id },
    orderBy: [{ date: 'desc' }],
  })

  let canViewBudget = isAdminOrManagement(session.role)
  if (!canViewBudget) {
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: session.userId, projectId: params.id } },
    })
    canViewBudget = member?.canViewBudget ?? false
  }

  return NextResponse.json({ items, canViewBudget })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.label?.trim()) return NextResponse.json({ error: 'Bezeichnung erforderlich' }, { status: 400 })
  if (body.amount == null) return NextResponse.json({ error: 'Betrag erforderlich' }, { status: 400 })

  const type = body.type ?? 'AUSGABE'
  if (type === 'EINNAHME' && !isAdminOrManagement(session.role)) {
    return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  const item = await prisma.budgetItem.create({
    data: {
      label: body.label.trim(),
      amount: parseFloat(body.amount),
      type,
      category: body.category,
      date: body.date ? new Date(body.date) : new Date(),
      projectId: params.id,
    },
  })
  return NextResponse.json({ item }, { status: 201 })
}
