import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

function readVersionFile(): string | null {
  const versionFile = path.join(process.cwd(), 'data', '.version')
  return fs.existsSync(versionFile) ? fs.readFileSync(versionFile, 'utf8').trim() : null
}

async function checkGitUpdates(): Promise<{ updateAvailable: boolean; updateCount: number }> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['rev-list', 'HEAD..origin/main', '--count'],
      { cwd: process.cwd(), timeout: 5000 }
    )
    const count = parseInt(stdout.trim(), 10) || 0
    return { updateAvailable: count > 0, updateCount: count }
  } catch {
    return { updateAvailable: false, updateCount: 0 }
  }
}

// GET — fast, reads cached file (used on sheet open)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const version = readVersionFile()
  const updateFile = path.join(process.cwd(), 'data', '.update-available')
  const updateCount =
    fs.existsSync(updateFile) && fs.statSync(updateFile).isFile()
      ? parseInt(fs.readFileSync(updateFile, 'utf8').trim(), 10) || 1
      : 0
  return NextResponse.json({ version, updateAvailable: updateCount > 0, updateCount })
}

// POST — live git check via mounted .git directory (used by "Nach Updates suchen" button)
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const version = readVersionFile()
  const { updateAvailable, updateCount } = await checkGitUpdates()
  return NextResponse.json({ version, updateAvailable, updateCount })
}
