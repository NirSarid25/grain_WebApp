import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchOrCreateContact } from '@/lib/matching'

export async function GET() {
  const leads = await prisma.lead.findMany({
    include: { conference: true, contact: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { conferenceId, firstName, lastName, company, title, email, phone, notes } = body

  if (!conferenceId || !firstName || !lastName || !company) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const contactId = await matchOrCreateContact({ firstName, lastName, company, email: email || null })

  const existingLeadCount = contactId
    ? await prisma.lead.count({ where: { contactId } })
    : 0

  const lead = await prisma.lead.create({
    data: {
      conferenceId,
      firstName,
      lastName,
      company,
      title: title || null,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      contactId,
    },
    include: { conference: true, contact: true },
  })

  return NextResponse.json(
    { ...lead, isKnownContact: existingLeadCount > 0 },
    { status: 201 }
  )
}
