import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// In-conference agent: fast contact lookup by name / email
export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 })

    const q = query.trim().toLowerCase()

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { email: { contains: q } },
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { company: { contains: q } },
        ],
      },
      include: { conference: true, contact: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    if (leads.length === 0) {
      return NextResponse.json({ found: false, message: 'No prior contact found — this may be a new lead.' })
    }

    const contact = leads[0].contact
    const appearances = leads.map(l => ({
      conference: l.conference.name,
      date: new Date(l.conference.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      title: l.title,
      company: l.company,
      notes: l.notes,
    }))

    return NextResponse.json({
      found: true,
      contactName: contact?.canonicalName ?? `${leads[0].firstName} ${leads[0].lastName}`,
      email: leads[0].email,
      appearances,
      tip: `Met ${appearances.length} time${appearances.length !== 1 ? 's' : ''}. Last seen: ${appearances[0].conference}.`,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'In-conference agent error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
