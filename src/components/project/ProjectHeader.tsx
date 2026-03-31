'use client'

import { Settings } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressRing } from './ProgressRing'

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    description?: string | null
    color: string
    status: string
    _count?: { tasks: number }
    tasksDone?: number
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const total = project._count?.tasks ?? 0
  const done = project.tasksDone ?? 0

  return (
    <div className="flex items-start justify-between gap-3 py-4 md:py-6">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg md:text-2xl font-bold text-text-primary leading-tight">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {total > 0 && <ProgressRing total={total} done={done} color={project.color} size={44} />}
        <Link
          href={`/projekte/${project.id}/einstellungen`}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
