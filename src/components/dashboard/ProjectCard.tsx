'use client'

import { useRouter } from 'next/navigation'
import { CheckSquare, AlertCircle, Paperclip } from 'lucide-react'
import { ProgressRing } from '@/components/project/ProgressRing'
import { StatusBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    color: string
    status: string
    _count: { tasks: number; issues: number; files: number }
    tasksDone: number
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/projekte/${project.id}`)}
      className="bg-surface border border-border hover:border-accent/30 rounded-2xl p-4 cursor-pointer transition-all hover:bg-elevated group"
    >
      {/* Color accent bar */}
      <div className="h-1 rounded-full mb-3" style={{ backgroundColor: project.color }} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-text-primary truncate text-sm group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
        <ProgressRing
          total={project._count.tasks}
          done={project.tasksDone}
          color={project.color}
          size={40}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <CheckSquare className="w-3.5 h-3.5" />
          {project._count.tasks}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {project._count.issues}
        </span>
        <span className="flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5" />
          {project._count.files}
        </span>
        <div className="ml-auto">
          <StatusBadge status={project.status} />
        </div>
      </div>
    </div>
  )
}
