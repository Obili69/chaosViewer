import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const versions = await prisma.version.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ versions })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await request.json()
  if (!body.label?.trim()) return NextResponse.json({ error: 'Bezeichnung erforderlich' }, { status: 400 })
  if (!body.number?.trim()) return NextResponse.json({ error: 'Versionsnummer erforderlich' }, { status: 400 })

  const version = await prisma.version.create({
    data: {
      label: body.label.trim(),
      type: body.type ?? 'SOFTWARE',
      number: body.number.trim(),
      notes: body.notes,
      releasedAt: body.releasedAt ? new Date(body.releasedAt) : null,
      projectId: params.id,
    },
  })
  return NextResponse.json({ version }, { status: 201 })
}
