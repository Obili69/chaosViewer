import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  if (session.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  const body = await request.json()
  const { username, password, email, role } = body

  if (!username?.trim()) return NextResponse.json({ error: 'Benutzername erforderlich' }, { status: 400 })
  if (!password || password.length < 6) return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return NextResponse.json({ error: 'Benutzername bereits vergeben' }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { username: username.trim(), email: email || null, passwordHash, role: role ?? 'USER' },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json({ user }, { status: 201 })
}
