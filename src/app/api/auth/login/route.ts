import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Benutzername und Passwort erforderlich' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, username: user.username, role: user.role })

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, role: user.role },
    })
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return response
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
