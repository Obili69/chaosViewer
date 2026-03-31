import type { User, Area, Project, Task, Issue, BudgetItem, Link, File, Version } from '@prisma/client'

export type SafeUser = Omit<User, 'passwordHash'>

export type ProjectWithCounts = Project & {
  area: Area | null
  _count: {
    tasks: number
    issues: number
    files: number
  }
  tasksDone: number
}

export type AreaWithProjects = Area & {
  projects: ProjectWithCounts[]
}

export interface ApiError {
  error: string
}

export type { User, Area, Project, Task, Issue, BudgetItem, Link, File, Version }
