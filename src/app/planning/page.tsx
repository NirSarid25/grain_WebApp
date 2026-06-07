import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function PlanningPage() {
  const year = new Date().getFullYear()
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

  // Detect gaps (months with no Tier A)
  const tierAMonths = new Set(
    conferences.filter(c => c.tier === 'A').map(c => new Date(c.date).getMonth())
  )

  // Detect clusters (3+ conferences in same month)
  const clusterMonths = new Set(
    Object.entries(byMonth)
      .filter(([, confs]) => confs.length >= 3)
      .map(([m]) => parseInt(m))
  )

  const tierACount = conferences.filter(c => c.tier === 'A').length
  const tierBCount = conferences.filter(c => c.tier === 'B').length
  const gapMonths = MONTHS.filter((_, i) => !tierAMonths.has(i) && byMonth[i].length === 0).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coverage Planning — {year}</h1>
        <p className="text-gray-500 text-sm">{conferences.length} conferences · {tierACount} Tier A · {tierBCount} Tier B</p>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Tier A</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Tier B</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Tier C</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Coverage gap</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-100 border border-purple-300 inline-block" /> Cluster (3+)</div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {MONTHS.map((month, i) => {
          const confs = byMonth[i]
          const isGap = confs.length === 0
          const isCluster = clusterMonths.has(i)
          const hasA = tierAMonths.has(i)

          return (
            <div
              key={month}
              className={`rounded-xl border p-3 min-h-[120px] ${
                isGap
                  ? 'bg-red-50 border-red-200'
                  : isCluster
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{month}</span>
                <div className="flex gap-1">
                  {isGap && <span className="text-xs text-red-500">gap</span>}
                  {isCluster && <span className="text-xs text-purple-500">cluster</span>}
                  {hasA && !isGap && <span className="text-xs text-green-600">✓ A</span>}
                </div>
              </div>
              <div className="space-y-1">
                {confs.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.tier === 'A' ? 'bg-green-500' : c.tier === 'B' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-700 truncate">{c.name}</span>
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

      {gapMonths > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">⚠ {gapMonths} month{gapMonths !== 1 ? 's' : ''} with no conferences detected</p>
          <p className="text-xs text-red-500 mt-1">Consider using the AI agent to discover missing events for these periods.</p>
        </div>
      )}
    </div>
  )
}
