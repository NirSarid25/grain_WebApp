import { prisma } from '@/lib/prisma'
import { classifyRelationship } from '@/lib/matching'
import { RelationshipBadge } from '@/components/contacts/RelationshipBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      leads: {
        include: { conference: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-500 text-sm">{contacts.length} unique contacts across all conferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Appearances</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Last seen</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Relationship</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map(c => {
              const rel = classifyRelationship(c.leads)
              const lastLead = c.leads[c.leads.length - 1]
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/contacts/${c.id}`} className="text-gray-900 hover:text-indigo-600 hover:underline">
                      {c.canonicalName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900 font-medium">{c.leads.length}</span>
                    <span className="text-gray-400 text-xs ml-1">conf{c.leads.length !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lastLead ? lastLead.conference.name : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <RelationshipBadge label={rel} />
                  </td>
                </tr>
              )
            })}
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
