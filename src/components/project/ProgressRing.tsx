interface ProgressRingProps {
  total: number
  done: number
  color?: string
  size?: number
}

export function ProgressRing({ total, done, color = '#06b6d4', size = 44 }: ProgressRingProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2d42" strokeWidth={3} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-text-primary">
        {pct}%
      </span>
    </div>
  )
}
