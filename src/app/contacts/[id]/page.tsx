import { prisma } from '@/lib/prisma'
import { classifyRelationship } from '@/lib/matching'
import { RelationshipBadge } from '@/components/contacts/RelationshipBadge'
import ArcSummary from '@/components/contacts/ArcSummary'
import MatchBanner from '@/components/contacts/MatchBanner'
import { notFound } from 'next/navigation'

// Inline client component for follow-up drafter
import FollowUpDrafter from '@/components/contacts/FollowUpDrafter'

export const dynamic = 'force-dynamic'

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ matched?: string }>
}) {
  const { id } = await params
  const { matched } = await searchParams

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      leads: {
        include: { conference: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!contact) notFound()

  const rel = classifyRelationship(contact.leads)
  const companies = [...new Set(contact.leads.map(l => l.company))]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {matched === '1' && contact.leads.length > 1 && (
        <MatchBanner name={contact.canonicalName} previousConference={contact.leads[contact.leads.length - 2].conference.name} />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contact.canonicalName}</h1>
          <p className="text-gray-500 text-sm">{companies.join(' → ')}</p>
          {contact.email && <p className="text-sm text-indigo-600 mt-0.5">{contact.email}</p>}
          <p className="text-xs text-gray-400 mt-1">{contact.leads.length} conference appearance{contact.leads.length !== 1 ? 's' : ''}</p>
        </div>
        <RelationshipBadge label={rel} />
      </div>

      {/* Conference timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Conference History</h2>
        <div className="space-y-4">
          {contact.leads.map((lead, i) => (
            <div key={lead.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1 ${i === contact.leads.length - 1 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                {i < contact.leads.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900">{lead.conference.name}</p>
                  <p className="text-xs text-gray-500">{new Date(lead.conference.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {lead.title && <p className="text-xs text-gray-500">{lead.title} at {lead.company}</p>}
                {lead.notes && <p className="text-sm text-gray-600 mt-1 italic">"{lead.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Arc Summary */}
      <ArcSummary contactId={contact.id} contactName={contact.canonicalName} leads={contact.leads.map(l => ({
        conference: l.conference.name,
        date: new Date(l.conference.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        title: l.title,
        notes: l.notes,
      }))} />

      {/* Follow-up drafts per lead */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Draft Follow-up Emails</h2>
        <div className="space-y-3">
          {contact.leads.slice().reverse().map(lead => (
            <div key={lead.id} className="border border-gray-100 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">{lead.conference.name}</p>
              <FollowUpDrafter
                leadId={lead.id}
                firstName={contact.canonicalName.split(' ')[0]}
                lastName={contact.canonicalName.split(' ').slice(1).join(' ')}
                company={lead.company}
                title={lead.title}
                conferenceName={lead.conference.name}
                notes={lead.notes}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
