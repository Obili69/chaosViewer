import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const area = await prisma.area.findUnique({
    where: { id: params.id },
    include: { projects: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
  })
  if (!area) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  return NextResponse.json({ area })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const area = await prisma.area.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      sortOrder: body.sortOrder,
    },
  })
  return NextResponse.json({ area })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  // Unlink projects from this area before deleting
  await prisma.project.updateMany({
    where: { areaId: params.id },
    data: { areaId: null },
  })
  await prisma.area.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
