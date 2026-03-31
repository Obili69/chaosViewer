import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isAdminOrManagement } from '@/lib/utils'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  if (!isAdminOrManagement(session.role)) {
    return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true },
    orderBy: { username: 'asc' },
  })

  return NextResponse.json({ users })
}
