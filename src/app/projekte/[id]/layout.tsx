import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { TabBar } from '@/components/project/TabBar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { _count: { select: { tasks: true } } },
  })

  if (!project) notFound()

  if (session.role === 'USER') {
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: session.userId, projectId: params.id } },
    })
    if (!member?.canViewProject) redirect('/')
  }

  const tasksDone = await prisma.task.count({
    where: { projectId: params.id, status: 'ERLEDIGT' },
  })

  return (
    <>
      <TopBar title={project.name} showBack backHref="/" />
      <BottomNav projectId={params.id} />

      <div className="pt-14 md:pt-0 pb-24 md:pb-0 px-4 md:px-6 max-w-6xl mx-auto">
        <ProjectHeader project={{ ...project, tasksDone }} />
        <div className="hidden md:block">
          <TabBar projectId={params.id} />
        </div>
        <div className="py-4">
          {children}
        </div>
      </div>
    </>
  )
}
