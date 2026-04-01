import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const WEBHOOK_URL = 'http://host.docker.internal:3040'

function readVersionFiles() {
  const versionFile = path.join(process.cwd(), 'data', '.version')
  const updateFile = path.join(process.cwd(), 'data', '.update-available')
  const version = fs.existsSync(versionFile) ? fs.readFileSync(versionFile, 'utf8').trim() : null
  const updateCount = fs.existsSync(updateFile) && fs.statSync(updateFile).isFile()
    ? parseInt(fs.readFileSync(updateFile, 'utf8').trim(), 10) || 1
    : 0
  return { version, updateAvailable: updateCount > 0, updateCount }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  return NextResponse.json(readVersionFiles())
}

// POST — triggers real git fetch via webhook, returns result directly from webhook response
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return NextResponse.json(readVersionFiles())

  const { version } = readVersionFiles()

  try {
    const res = await fetch(`${WEBHOOK_URL}/check`, {
      method: 'POST',
      headers: { 'X-Webhook-Secret': secret },
      signal: AbortSignal.timeout(20000),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ version, ...data })
    }
  } catch {
    // Webhook unreachable — fall back to cached files
  }

  return NextResponse.json(readVersionFiles())
}
