import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AreaSection } from '@/components/dashboard/AreaSection'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [areas, ungroupedRaw, totalTasks, totalIssues] = await Promise.all([
    prisma.area.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        projects: {
          where: { status: { not: 'ARCHIVIERT' } },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { _count: { select: { tasks: true, issues: true, files: true } } },
        },
      },
    }),
    prisma.project.findMany({
      where: { areaId: null, status: { not: 'ARCHIVIERT' } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { tasks: true, issues: true, files: true } } },
    }),
    prisma.task.count({ where: { status: { not: 'ERLEDIGT' } } }),
    prisma.issue.count({ where: { status: 'OFFEN' } }),
  ])

  // Add tasksDone to each project
  const enrichProject = async (p: typeof ungroupedRaw[0]) => ({
    ...p,
    tasksDone: await prisma.task.count({ where: { projectId: p.id, status: 'ERLEDIGT' } }),
  })

  const ungrouped = await Promise.all(ungroupedRaw.map(enrichProject))
  const enrichedAreas = await Promise.all(
    areas.map(async (area) => ({
      ...area,
      projects: await Promise.all(area.projects.map(enrichProject)),
    }))
  )

  const totalProjects = areas.reduce((s, a) => s + a.projects.length, 0) + ungrouped.length

  return (
    <>
      <TopBar
        action={
          <Link href="/projekte/neu" className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
            <Plus className="w-5 h-5" />
          </Link>
        }
      />
      <BottomNav />

      <div className="pt-14 md:pt-0 pb-20 md:pb-0 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="py-6 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Übersicht</h1>
              <StatsBar totalProjects={totalProjects} totalTasks={totalTasks} totalIssues={totalIssues} />
            </div>
            <Link
              href="/projekte/neu"
              className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-dim text-base text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Neues Projekt
            </Link>
          </div>

          {/* Areas */}
          {enrichedAreas.map((area) => (
            area.projects.length > 0 && (
              <AreaSection
                key={area.id}
                name={area.name}
                color={area.color}
                projects={area.projects}
              />
            )
          ))}

          {/* Ungrouped */}
          {ungrouped.length > 0 && (
            <div>
              {enrichedAreas.some((a) => a.projects.length > 0) && (
                <h2 className="text-sm font-semibold text-text-secondary mb-3">
                  Kein Bereich
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ungrouped.map((p) => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalProjects === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm mb-4">Noch keine Projekte vorhanden.</p>
              <Link
                href="/projekte/neu"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dim text-base text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Erstes Projekt erstellen
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
