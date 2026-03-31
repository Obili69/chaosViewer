'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProjectCard } from './ProjectCard'

interface AreaSectionProps {
  name: string
  color: string
  projects: Parameters<typeof ProjectCard>[0]['project'][]
}

export function AreaSection({ name, color, projects }: AreaSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full text-left mb-3 group"
      >
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors flex-1">
          {name}
          <span className="text-text-muted font-normal ml-1.5">({projects.length})</span>
        </h2>
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-text-muted" />
          : <ChevronDown className="w-4 h-4 text-text-muted" />
        }
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
