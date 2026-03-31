import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  const body = await request.json()
  const updateData: Record<string, unknown> = {}
  if (body.username) updateData.username = body.username.trim()
  if (body.email !== undefined) updateData.email = body.email || null
  if (body.role) updateData.role = body.role
  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 })
    }
    updateData.passwordHash = await hashPassword(body.password)
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json({ user })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  if (session.userId === params.id) {
    return NextResponse.json({ error: 'Eigenen Account kann nicht gelöscht werden' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
