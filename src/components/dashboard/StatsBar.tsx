interface StatsBarProps {
  totalProjects: number
  totalTasks: number
  totalIssues: number
}

export function StatsBar({ totalProjects, totalTasks, totalIssues }: StatsBarProps) {
  const stats = [
    { label: 'Projekte', value: totalProjects },
    { label: 'Aufgaben', value: totalTasks },
    { label: 'Probleme', value: totalIssues },
  ]

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-accent">{s.value}</span>
          <span className="text-sm text-text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
