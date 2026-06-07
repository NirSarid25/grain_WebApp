import { cn } from '@/lib/utils'

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold',
      tier === 'A' && 'bg-green-100 text-green-800',
      tier === 'B' && 'bg-yellow-100 text-yellow-800',
      tier === 'C' && 'bg-gray-100 text-gray-600',
    )}>
      {tier}
    </span>
  )
}
