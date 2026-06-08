import { prisma } from '@/lib/prisma'
import { classifyRelationship, explainRelationship } from '@/lib/matching'
import { RelationshipBadge } from '@/components/contacts/RelationshipBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const REL_PRIORITY: Record<string, number> = { Hot: 0, Warming: 1, New: 2, Stalled: 3, 'Tire-kicker': 4 }

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      leads: {
        include: { conference: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const enriched = contacts
    .map(c => ({
      ...c,
      rel: classifyRelationship(c.leads),
      signal: explainRelationship(c.leads),
      lastLead: c.leads[c.leads.length - 1],
      companies: [...new Set(c.leads.map(l => l.company))],
      jobChanged: new Set(c.leads.map(l => l.company)).size > 1,
    }))
    .sort((a, b) => (REL_PRIORITY[a.rel] ?? 5) - (REL_PRIORITY[b.rel] ?? 5))

  const hotCount = enriched.filter(c => c.rel === 'Hot').length
  const warmingCount = enriched.filter(c => c.rel === 'Warming').length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm">{contacts.length} unique contacts · {hotCount} hot · {warmingCount} warming</p>
        </div>
      </div>

      {hotCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-800">🔥 {hotCount} hot contact{hotCount !== 1 ? 's' : ''} ready for follow-up</p>
          <p className="text-xs text-red-600 mt-0.5">Senior decision-makers with email, seen in the last 3 months. Act now before the window closes.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Seen at</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Signal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enriched.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/contacts/${c.id}`} className="text-gray-900 hover:text-indigo-600 hover:underline">
                    {c.canonicalName}
                  </Link>
                  {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.jobChanged ? (
                    <span title="Changed companies between conferences">
                      {c.companies.join(' → ')}
                      <span className="ml-1 text-xs text-amber-600 font-medium">↺ job change</span>
                    </span>
                  ) : c.companies[0]}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <span className="font-medium text-gray-800">{c.leads.length}×</span>
                  {c.lastLead && (
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.lastLead.conference.name}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[220px]">
                  {c.signal}
                </td>
                <td className="px-4 py-3">
                  <RelationshipBadge label={c.rel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No contacts yet. Contacts are created automatically when you capture leads.
          </div>
        )}
      </div>
    </div>
  )
}
