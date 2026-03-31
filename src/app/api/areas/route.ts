import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const withProjects = searchParams.get('withProjects') === 'true'

  const areas = await prisma.area.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: withProjects ? {
      projects: {
        where: { status: { not: 'ARCHIVIERT' } },
        select: { id: true, name: true, color: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      },
    } : undefined,
  })

  let ungrouped: { id: string; name: string; color: string }[] = []
  if (withProjects) {
    ungrouped = await prisma.project.findMany({
      where: { areaId: null, status: { not: 'ARCHIVIERT' } },
      select: { id: true, name: true, color: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
  }

  return NextResponse.json({ areas, ungrouped })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const { name, description, color, icon } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name erforderlich' }, { status: 400 })
  }

  const area = await prisma.area.create({
    data: { name: name.trim(), description, color: color ?? '#06b6d4', icon: icon ?? 'layers' },
  })

  return NextResponse.json({ area }, { status: 201 })
}
