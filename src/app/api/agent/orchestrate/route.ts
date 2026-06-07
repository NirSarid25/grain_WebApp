import { NextResponse } from 'next/server'
import { orchestrateQuery } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { query, phase } = await req.json()
    if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 })

    const result = await orchestrateQuery({ query, phase: phase ?? null })
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Agent error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
