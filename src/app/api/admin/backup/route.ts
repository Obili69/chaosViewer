import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { execFile } from 'child_process'
import path from 'path'

export async function POST() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const scriptPath = path.join(process.cwd(), 'scripts', 'backup.sh')

  return new Promise<NextResponse>((resolve) => {
    execFile('bash', [scriptPath], { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        const output = (stderr || stdout || err.message).trim()
        resolve(NextResponse.json({ error: output }, { status: 500 }))
      } else {
        resolve(NextResponse.json({ ok: true, output: stdout.trim() }))
      }
    })
  })
}
