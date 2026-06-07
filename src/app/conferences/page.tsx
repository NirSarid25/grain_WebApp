import { prisma } from '@/lib/prisma'
import { TierBadge } from '@/components/conferences/TierBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ vertical?: string; tier?: string; q?: string }>
}) {
  const params = await searchParams
  const { vertical, tier, q } = params

  const conferences = await prisma.conference.findMany({
    where: {
      ...(vertical ? { vertical } : {}),
      ...(tier ? { tier } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    orderBy: { date: 'asc' },
  })

  const verticals = ['fintech', 'payments', 'fx', 'travel', 'treasury']

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conferences</h1>
          <p className="text-gray-500 text-sm">{conferences.length} events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3 w-full" method="GET">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search conferences…"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
          />
          <select name="vertical" defaultValue={vertical ?? ''} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All verticals</option>
            {verticals.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select name="tier" defaultValue={tier ?? ''} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All tiers</option>
            <option value="A">Tier A</option>
            <option value="B">Tier B</option>
            <option value="C">Tier C</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700">Filter</button>
          <Link href="/conferences" className="text-sm text-gray-500 hover:text-gray-700 py-1.5">Clear</Link>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Conference</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Vertical</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Audience</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">ICP Score</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conferences.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                      {c.name}
                    </a>
                  ) : c.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.city}, {c.country}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-gray-600">{c.vertical}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.audienceSize.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${c.icpScore >= 80 ? 'bg-green-500' : c.icpScore >= 60 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                        style={{ width: `${c.icpScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(c.icpScore)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={c.tier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {conferences.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No conferences found</div>
        )}
      </div>
    </div>
  )
}
