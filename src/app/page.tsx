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
    { label: 'Conferences', value: confCount, icon: Calendar, href: '/conferences', accent: 'from-indigo-500 to-violet-600' },
    { label: 'Tier A Events', value: tierA, icon: TrendingUp, href: '/conferences?tier=A', accent: 'from-amber-400 to-orange-500' },
    { label: 'Leads Captured', value: leadCount, icon: Users, href: '/leads', accent: 'from-sky-400 to-blue-600' },
    { label: 'Unique Contacts', value: contactCount, icon: UserCheck, href: '/contacts', accent: 'from-violet-500 to-purple-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-2">Grain Sales Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight">Conference Command Center</h1>
          <p className="text-indigo-200 mt-2 text-sm max-w-lg">
            ICP-scored conferences, relationship tracking across events, and AI-powered follow-up — all in one place for your fintech and payments pipeline.
          </p>
          <div className="flex gap-3 mt-5">
            <Link href="/conferences" className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
              Browse Conferences
            </Link>
            <Link href="/leads/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 border border-indigo-500 transition-colors">
              + Capture Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, accent }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${accent} mb-3 mt-1`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
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
