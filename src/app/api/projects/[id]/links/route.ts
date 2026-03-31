import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const links = await prisma.link.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ links })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.label?.trim()) return NextResponse.json({ error: 'Bezeichnung erforderlich' }, { status: 400 })
  if (!body.url?.trim()) return NextResponse.json({ error: 'URL erforderlich' }, { status: 400 })

  const link = await prisma.link.create({
    data: { label: body.label.trim(), url: body.url.trim(), projectId: params.id },
  })
  return NextResponse.json({ link }, { status: 201 })
}
