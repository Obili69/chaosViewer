import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const versionFile = path.join(process.cwd(), 'data', '.version')
  const updateFile = path.join(process.cwd(), 'data', '.update-available')

  const version = fs.existsSync(versionFile)
    ? fs.readFileSync(versionFile, 'utf8').trim()
    : null

  const updateCount = fs.existsSync(updateFile)
    ? parseInt(fs.readFileSync(updateFile, 'utf8').trim(), 10) || 1
    : 0

  return NextResponse.json({
    version,
    updateAvailable: updateCount > 0,
    updateCount,
  })
}
