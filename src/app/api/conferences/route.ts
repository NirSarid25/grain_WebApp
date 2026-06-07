import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeScore, scoreTier } from '@/lib/scoring'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const vertical = searchParams.get('vertical')
  const tier = searchParams.get('tier')

  const conferences = await prisma.conference.findMany({
    where: {
      ...(vertical ? { vertical } : {}),
      ...(tier ? { tier } : {}),
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(conferences)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, date, endDate, city, country, vertical, audienceSize, website } = body

  if (!name || !date || !city || !country || !vertical || !audienceSize) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const icpScore = computeScore({ vertical, audienceSize: Number(audienceSize), country, city })
  const tier = scoreTier(icpScore)

  const conference = await prisma.conference.create({
    data: {
      name,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      city,
      country,
      vertical,
      audienceSize: Number(audienceSize),
      website: website ?? null,
      icpScore,
      tier,
    },
  })

  return NextResponse.json(conference, { status: 201 })
}
