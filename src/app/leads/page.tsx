import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { HubSpotPushButton } from '@/components/leads/HubSpotPushButton'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { conference: true, contact: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm">{leads.length} captured</p>
        </div>
        <Link
          href="/leads/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Capture Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Conference</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">HubSpot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {l.contact ? (
                    <Link href={`/contacts/${l.contact.id}`} className="hover:text-indigo-600 hover:underline">
                      {l.firstName} {l.lastName}
                    </Link>
                  ) : `${l.firstName} ${l.lastName}`}
                </td>
                <td className="px-4 py-3 text-gray-600">{l.company}</td>
                <td className="px-4 py-3 text-gray-600">{l.title ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{l.conference.name}</td>
                <td className="px-4 py-3 text-gray-600">{l.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <HubSpotPushButton leadId={l.id} synced={!!l.hubspotId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No leads yet. <Link href="/leads/new" className="text-indigo-600 hover:underline">Capture your first lead →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
