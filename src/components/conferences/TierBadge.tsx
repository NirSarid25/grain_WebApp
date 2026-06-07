import { cn } from '@/lib/utils'

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide',
      tier === 'A' && 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm',
      tier === 'B' && 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm',
      tier === 'C' && 'bg-gray-100 text-gray-500',
    )}>
      {tier === 'A' && '★'} {tier === 'B' && '◆'} Tier {tier}
    </span>
  )
}
