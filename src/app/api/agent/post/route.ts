import { NextResponse } from 'next/server'
import { generateRelationshipArc, draftFollowUpEmail } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const contactId = searchParams.get('contactId')
    const body = await req.json().catch(() => ({}))

    // Draft email action
    if (body.action === 'draft-email') {
      const email = await draftFollowUpEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company,
        title: body.title,
        conferenceName: body.conferenceName,
        repNotes: body.notes,
      })
      return NextResponse.json({ email })
    }

    // Default: generate relationship arc for a contact
    if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 })

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        leads: {
          include: { conference: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    const result = await generateRelationshipArc({
      contactName: contact.canonicalName,
      leads: contact.leads.map(l => ({
        conference: l.conference.name,
        date: new Date(l.conference.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        title: l.title,
        notes: l.notes,
      })),
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Post-conference agent error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
