import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { anthropicApiKey, hubspotAccessToken } = await req.json()

    await prisma.settings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', anthropicApiKey, hubspotAccessToken },
      update: { anthropicApiKey, hubspotAccessToken },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Settings error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
