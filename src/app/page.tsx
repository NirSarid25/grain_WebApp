import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Users, UserCheck, TrendingUp } from 'lucide-react'
import AgentChat from '@/components/agent/AgentChat'
import { classifyRelationship } from '@/lib/matching'
import { TierBadge } from '@/components/conferences/TierBadge'
import { RelationshipBadge } from '@/components/contacts/RelationshipBadge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [confCount, leadCount, contactCount, tierA] = await Promise.all([
    prisma.conference.count(),
    prisma.lead.count(),
    prisma.contact.count(),
    prisma.conference.count({ where: { tier: 'A' } }),
  ])

  // Next 30 days conferences, Tier A first
  const upcoming30 = await prisma.conference.findMany({
    where: { date: { gte: now, lte: in30 } },
    orderBy: [{ tier: 'asc' }, { date: 'asc' }],
    take: 6,
  })

  // Hot contacts (need follow-up)
  const allContacts = await prisma.contact.findMany({
    include: { leads: { include: { conference: true }, orderBy: { createdAt: 'asc' } } },
    take: 50,
  })
  const hotContacts = allContacts
    .map(c => ({ ...c, rel: classifyRelationship(c.leads) }))
    .filter(c => c.rel === 'Hot' || c.rel === 'Warming')
    .sort((a, b) => (a.rel === 'Hot' ? -1 : 1))
    .slice(0, 5)

  // Recent leads
  const recentLeads = await prisma.lead.findMany({
    include: { conference: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const stats = [
    { label: 'Conferences', value: confCount, icon: Calendar, href: '/conferences', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Tier A Events', value: tierA, icon: TrendingUp, href: '/conferences?tier=A', color: 'text-green-600 bg-green-50' },
    { label: 'Leads Captured', value: leadCount, icon: Users, href: '/leads', color: 'text-blue-600 bg-blue-50' },
    { label: 'Unique Contacts', value: contactCount, icon: UserCheck, href: '/contacts', color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conference Intelligence</h1>
        <p className="text-gray-500 mt-1">Grain sales team · FX/fintech conference hub</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next 30 days */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Next 30 Days</h2>
            <Link href="/planning" className="text-xs text-indigo-600 hover:underline">Year view →</Link>
          </div>
          {upcoming30.length === 0 ? (
            <p className="text-sm text-gray-400">No conferences in the next 30 days</p>
          ) : (
            <div className="space-y-2">
              {upcoming30.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.city} · {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <TierBadge tier={c.tier} />
                    <Link href={`/leads/new?conferenceId=${c.id}`} className="text-xs text-indigo-500 hover:underline">+ Lead</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hot & Warming contacts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Contacts to Act On</h2>
            <Link href="/contacts" className="text-xs text-indigo-600 hover:underline">All contacts →</Link>
          </div>
          {hotContacts.length === 0 ? (
            <p className="text-sm text-gray-400">No warm contacts yet. Start capturing leads at conferences.</p>
          ) : (
            <div className="space-y-2">
              {hotContacts.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 hover:underline truncate block">
                      {c.canonicalName}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {c.leads[c.leads.length - 1]?.conference.name ?? '—'} · {c.leads.length} event{c.leads.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <RelationshipBadge label={c.rel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Captures</h2>
            <Link href="/leads" className="text-xs text-indigo-600 hover:underline">All leads →</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-gray-400">No leads captured yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLeads.map(l => (
                <div key={l.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{l.firstName} {l.lastName}</p>
                    <p className="text-xs text-gray-400">{l.company} · {l.conference.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI agent */}
        <AgentChat />
      </div>
    </div>
  )
}
