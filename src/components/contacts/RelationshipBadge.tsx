import { cn } from '@/lib/utils'
import type { RelationshipClass } from '@/lib/matching'

export function RelationshipBadge({ label }: { label: RelationshipClass }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
      label === 'Hot' && 'bg-red-100 text-red-700',
      label === 'Warming' && 'bg-orange-100 text-orange-700',
      label === 'Stalled' && 'bg-blue-100 text-blue-700',
      label === 'Tire-kicker' && 'bg-gray-100 text-gray-600',
      label === 'New' && 'bg-purple-100 text-purple-700',
    )}>
      {label}
    </span>
  )
}
