import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const WEBHOOK_URL = 'http://host.docker.internal:3040/update'

export async function POST() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
  }

  const secret = process.env.WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'WEBHOOK_SECRET nicht konfiguriert' }, { status: 500 })
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'X-Webhook-Secret': secret },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Webhook Fehler: ${res.status}` }, { status: 502 })
    }
    return NextResponse.json({ status: 'Update gestartet' }, { status: 202 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Webhook nicht erreichbar: ${msg}` }, { status: 502 })
  }
}
