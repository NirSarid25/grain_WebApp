import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Users, UserCheck, TrendingUp } from 'lucide-react'
import AgentChat from '@/components/agent/AgentChat'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [confCount, leadCount, contactCount, tierA] = await Promise.all([
    prisma.conference.count(),
    prisma.lead.count(),
    prisma.contact.count(),
    prisma.conference.count({ where: { tier: 'A' } }),
  ])

  const upcoming = await prisma.conference.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take: 5,
  })

  const stats = [
    { label: 'Conferences', value: confCount, icon: Calendar, href: '/conferences', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Tier A Events', value: tierA, icon: TrendingUp, href: '/conferences', color: 'text-green-600 bg-green-50' },
    { label: 'Leads Captured', value: leadCount, icon: Users, href: '/leads', color: 'text-blue-600 bg-blue-50' },
    { label: 'Contacts', value: contactCount, icon: UserCheck, href: '/contacts', color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conference Intelligence</h1>
        <p className="text-gray-500 mt-1">Your sales team's FX/fintech conference hub</p>
      </div>

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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Upcoming Conferences</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming conferences</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.city}, {c.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.tier === 'A' ? 'bg-green-100 text-green-800' : c.tier === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                      {c.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/conferences" className="text-xs text-indigo-600 hover:underline mt-4 block">View all →</Link>
        </div>

        <AgentChat />
      </div>
    </div>
  )
}
