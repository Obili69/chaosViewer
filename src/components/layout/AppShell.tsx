import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './Sidebar'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface AppShellProps {
  children: ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession()
  let currentUser: { role: string; username: string } | undefined

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, username: true },
    })
    if (user) currentUser = { role: user.role, username: user.username }
  }

  return (
    <>
      <Sidebar currentUser={currentUser} />
      <MobileSidebar currentUser={currentUser} />
      <main className="md:pl-64 min-h-screen">
        {children}
      </main>
    </>
  )
}
