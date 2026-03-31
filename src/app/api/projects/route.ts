import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  let projectWhere: object

  if (session.role === 'ADMIN' || session.role === 'MANAGEMENT') {
    // See all non-personal projects + personal ones they own or are members of
    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.userId, canViewProject: true },
      select: { projectId: true },
    })
    const memberIds = memberships.map((m) => m.projectId)
    projectWhere = {
      AND: [
        { status: { not: 'ARCHIVIERT' } },
        { OR: [{ isPersonal: false }, { ownerId: session.userId }, { id: { in: memberIds } }] },
      ],
    }
  } else {
    // USER: personal projects they own + any project they're a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.userId, canViewProject: true },
      select: { projectId: true },
    })
    const memberIds = memberships.map((m) => m.projectId)
    projectWhere = {
      AND: [
        { status: { not: 'ARCHIVIERT' } },
        { OR: [{ ownerId: session.userId }, { id: { in: memberIds } }] },
      ],
    }
  }

  const projects = await prisma.project.findMany({
    where: projectWhere,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      area: { select: { id: true, name: true, color: true } },
      _count: { select: { tasks: true, issues: true, files: true } },
    },
  })

  const projectsWithProgress = await Promise.all(
    projects.map(async (p) => {
      const tasksDone = await prisma.task.count({
        where: { projectId: p.id, status: 'ERLEDIGT' },
      })
      return { ...p, tasksDone }
    })
  )

  return NextResponse.json({ projects: projectsWithProgress })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  const { name, description, color, icon, areaId } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name erforderlich' }, { status: 400 })
  }

  const isPersonal = session.role === 'USER'

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description,
      color: color ?? '#06b6d4',
      icon: icon ?? 'folder',
      areaId: isPersonal ? null : (areaId || null),
      isPersonal,
      ownerId: isPersonal ? session.userId : null,
    },
    include: { area: true },
  })

  return NextResponse.json({ project }, { status: 201 })
}
