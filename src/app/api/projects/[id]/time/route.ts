import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isAdminOrManagement } from '@/lib/utils'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  if (session.role === 'USER') {
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: session.userId, projectId: params.id } },
    })
    if (!member?.canViewProject) return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  const entries = await prisma.timeEntry.findMany({
    where: { projectId: params.id },
    orderBy: { startTime: 'desc' },
  })

  const totalSeconds = entries.reduce((sum, e) => sum + e.duration, 0)

  return NextResponse.json({ entries, totalSeconds })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  if (session.role === 'USER') {
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: session.userId, projectId: params.id } },
    })
    if (!member?.canViewProject) return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  const body = await request.json()
  const { description, startTime, endTime, duration } = body

  if (!startTime) return NextResponse.json({ error: 'Startzeit erforderlich' }, { status: 400 })
  if (duration == null || duration <= 0) return NextResponse.json({ error: 'Dauer erforderlich' }, { status: 400 })

  const entry = await prisma.timeEntry.create({
    data: {
      projectId: params.id,
      description: description?.trim() || null,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: Math.round(duration),
    },
  })

  return NextResponse.json({ entry }, { status: 201 })
}
