import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function PlanningPage() {
  const year = new Date().getFullYear()
  const now = new Date()
  const currentMonth = now.getMonth()

  const conferences = await prisma.conference.findMany({
    where: {
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    orderBy: { date: 'asc' },
  })

  // Group by month
  const byMonth: Record<number, typeof conferences> = {}
  for (let m = 0; m < 12; m++) byMonth[m] = []
  for (const c of conferences) {
    const m = new Date(c.date).getMonth()
    byMonth[m].push(c)
  }

  // Tier A months
  const tierAMonths = new Set(
    conferences.filter(c => c.tier === 'A').map(c => new Date(c.date).getMonth())
  )

  // Cluster months: 3+ conferences in same month
  const clusterMonths = new Set(
    Object.entries(byMonth)
      .filter(([, confs]) => confs.length >= 3)
      .map(([m]) => parseInt(m))
  )

  // Geographic cluster: 2+ conferences in same country in same month → "trip efficient"
  const geoClusterMonths = new Set(
    Object.entries(byMonth)
      .filter(([, confs]) => {
        const countryCounts: Record<string, number> = {}
        for (const c of confs) countryCounts[c.country] = (countryCounts[c.country] ?? 0) + 1
        return Object.values(countryCounts).some(n => n >= 2)
      })
      .map(([m]) => parseInt(m))
  )

  const tierACount = conferences.filter(c => c.tier === 'A').length
  const tierBCount = conferences.filter(c => c.tier === 'B').length
  const gapCount = MONTHS.filter((_, i) => i >= currentMonth && byMonth[i].length === 0).length
  const upcomingGaps = MONTHS.filter((_, i) => i >= currentMonth && byMonth[i].length === 0)
  // Under-invested = has events but no Tier A presence
  const underInvestedMonths = new Set(
    Object.entries(byMonth)
      .filter(([m, confs]) => confs.length > 0 && !tierAMonths.has(parseInt(m)) && parseInt(m) >= currentMonth)
      .map(([m]) => parseInt(m))
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coverage Planning {year}</h1>
        <p className="text-gray-500 text-sm">{conferences.length} conferences · {tierACount} Tier A · {tierBCount} Tier B</p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Tier A</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Tier B</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Tier C</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> No events (gap)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-300 inline-block" /> Under-invested (no Tier A)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-100 border border-purple-300 inline-block" /> Cluster (3+)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Trip efficient ✈</div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {MONTHS.map((month, i) => {
          const confs = byMonth[i]
          const isGap = confs.length === 0
          const isCluster = clusterMonths.has(i)
          const hasA = tierAMonths.has(i)
          const isPast = i < currentMonth
          const isCurrent = i === currentMonth
          const isGeoCluster = geoClusterMonths.has(i)
          const isUnderInvested = underInvestedMonths.has(i)

          // Country groupings for geo cluster tooltip
          const countryCounts: Record<string, number> = {}
          for (const c of confs) countryCounts[c.country] = (countryCounts[c.country] ?? 0) + 1
          const tripOpportunities = Object.entries(countryCounts)
            .filter(([, n]) => n >= 2)
            .map(([country, n]) => `${n}x ${country}`)

          return (
            <div
              key={month}
              className={`rounded-xl border p-3 min-h-[130px] transition-opacity ${
                isPast
                  ? 'opacity-40 bg-gray-50 border-gray-100'
                  : isGap
                  ? 'bg-red-50 border-red-200'
                  : isUnderInvested
                  ? 'bg-orange-50 border-orange-200'
                  : isGeoCluster && !isCluster
                  ? 'bg-blue-50 border-blue-200'
                  : isCluster
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${isCurrent ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {month}{isCurrent && ' ●'}
                </span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {isGap && !isPast && <span className="text-xs text-red-500">gap</span>}
                  {isUnderInvested && <span className="text-xs text-orange-500">no Tier A</span>}
                  {isCluster && <span className="text-xs text-purple-500">cluster</span>}
                  {isGeoCluster && <span className="text-xs text-blue-500" title={`Trip opportunities: ${tripOpportunities.join(', ')}`}>✈ {tripOpportunities.join(', ')}</span>}
                  {hasA && !isGap && <span className="text-xs text-green-600">✓ A</span>}
                </div>
              </div>
              <div className="space-y-1">
                {confs.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.tier === 'A' ? 'bg-green-500' : c.tier === 'B' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                    <Link href={`/leads/new?conferenceId=${c.id}`} className="text-xs text-gray-700 truncate hover:text-indigo-600" title={c.name}>
                      {c.name}
                    </Link>
                  </div>
                ))}
                {confs.length > 3 && (
                  <span className="text-xs text-gray-400">+{confs.length - 3} more</span>
                )}
                {confs.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No events</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {gapCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">⚠ {gapCount} upcoming month{gapCount !== 1 ? 's' : ''} with no conferences: {upcomingGaps.join(', ')}</p>
          <p className="text-xs text-red-500 mt-1">Use the AI agent on the dashboard to discover conferences for these gaps.</p>
        </div>
      )}

      {underInvestedMonths.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-700 font-medium">⚡ {underInvestedMonths.size} upcoming month{underInvestedMonths.size !== 1 ? 's' : ''} under-invested: events exist but no Tier A presence: {Array.from(underInvestedMonths).map(m => MONTHS[m]).join(', ')}</p>
          <p className="text-xs text-orange-600 mt-1">Consider whether these months warrant a Tier A event or can be de-prioritized.</p>
        </div>
      )}

      {geoClusterMonths.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">✈ Trip efficiency opportunities detected</p>
          <p className="text-xs text-blue-600 mt-1">
            Months marked ✈ have multiple conferences in the same country. One trip can cover multiple events.
            {Array.from(geoClusterMonths).map(m => {
              const confs = byMonth[m]
              const countryCounts: Record<string, string[]> = {}
              for (const c of confs) {
                if (!countryCounts[c.country]) countryCounts[c.country] = []
                countryCounts[c.country].push(c.name)
              }
              const opportunities = Object.entries(countryCounts).filter(([, names]) => names.length >= 2)
              return opportunities.map(([country, names]) => (
                <span key={`${m}-${country}`} className="block mt-1">
                  <strong>{MONTHS[m]}</strong> · {country}: {names.join(' + ')}
                </span>
              ))
            })}
          </p>
        </div>
      )}
    </div>
  )
}
