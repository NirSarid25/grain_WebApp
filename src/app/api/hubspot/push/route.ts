import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId is required' }, { status: 400 })

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const token = settings?.hubspotAccessToken ?? process.env.HUBSPOT_ACCESS_TOKEN

    if (!token) return NextResponse.json({ error: 'HubSpot token not configured. Set it in Settings.' }, { status: 400 })

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { conference: true },
    })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        properties: {
          firstname: lead.firstName,
          lastname: lead.lastName,
          email: lead.email ?? '',
          phone: lead.phone ?? '',
          jobtitle: lead.title ?? '',
          company: lead.company,
          grain_conference: lead.conference.name,
          grain_notes: lead.notes ?? '',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      const msg = err?.message ?? 'HubSpot API error'
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const data = await res.json()
    await prisma.lead.update({ where: { id: leadId }, data: { hubspotId: data.id } })

    return NextResponse.json({ success: true, hubspotId: data.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'HubSpot push error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
