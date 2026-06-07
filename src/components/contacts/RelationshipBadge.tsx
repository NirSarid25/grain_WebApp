import { cn } from '@/lib/utils'
import type { RelationshipClass } from '@/lib/matching'

const CONFIG: Record<RelationshipClass, { emoji: string; classes: string }> = {
  Hot:          { emoji: '🔥', classes: 'bg-red-600 text-white' },
  Warming:      { emoji: '📈', classes: 'bg-orange-500 text-white' },
  Stalled:      { emoji: '⏸️', classes: 'bg-slate-200 text-slate-600' },
  'Tire-kicker':{ emoji: '👀', classes: 'bg-gray-100 text-gray-500' },
  New:          { emoji: '✨', classes: 'bg-violet-600 text-white' },
}

export function RelationshipBadge({ label }: { label: RelationshipClass }) {
  const { emoji, classes } = CONFIG[label] ?? { emoji: '', classes: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
      classes,
    )}>
      {emoji} {label}
    </span>
  )
}
