import { cn, ACCENT_COLORS } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-text-secondary">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'w-7 h-7 rounded-full transition-all flex items-center justify-center',
              value === color && 'ring-2 ring-offset-2 ring-offset-elevated ring-white/50'
            )}
            style={{ backgroundColor: color }}
            title={color}
          >
            {value === color && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  )
}
