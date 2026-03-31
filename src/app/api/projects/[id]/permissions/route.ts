import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isAdminOrManagement } from '@/lib/utils'

async function requireManagement() {
  const session = await getSession()
  if (!session) return null
  if (!isAdminOrManagement(session.role)) return null
  return session
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireManagement()
  if (!session) return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.id },
    include: { user: { select: { id: true, username: true, role: true } } },
  })

  return NextResponse.json({ members })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireManagement()
  if (!session) return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })

  const body = await request.json()
  const { userId, canViewProject, canViewBudget } = body

  if (!userId) return NextResponse.json({ error: 'userId erforderlich' }, { status: 400 })

  const member = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId, projectId: params.id } },
    create: {
      userId,
      projectId: params.id,
      canViewProject: canViewProject ?? true,
      canViewBudget: canViewBudget ?? false,
    },
    update: {
      canViewProject: canViewProject ?? true,
      canViewBudget: canViewBudget ?? false,
    },
  })

  return NextResponse.json({ member })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireManagement()
  if (!session) return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'userId erforderlich' }, { status: 400 })

  await prisma.projectMember.deleteMany({
    where: { userId, projectId: params.id },
  })

  return NextResponse.json({ ok: true })
}
