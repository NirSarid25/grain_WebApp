import { NextResponse } from 'next/server'
import { discoverConferences } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { vertical, geography, timeWindow } = await req.json()

    const existing = await prisma.conference.findMany({ select: { name: true } })
    const existingNames = existing.map(c => c.name)

    const suggestions = await discoverConferences({
      vertical: vertical ?? 'fintech',
      geography: geography ?? 'global',
      timeWindow: timeWindow ?? '2025',
      existingConferenceNames: existingNames,
    })

    return NextResponse.json({ suggestions })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Pre-conference agent error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
