import Anthropic from '@anthropic-ai/sdk'
import { prisma } from './prisma'

async function getClient(): Promise<Anthropic> {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  const key = settings?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? ''
  if (!key) throw new Error('Anthropic API key not configured')
  return new Anthropic({ apiKey: key })
}

export async function generateRelationshipArc(params: {
  contactName: string
  leads: { conference: string; date: string; title?: string | null; notes?: string | null }[]
}): Promise<{ narrative: string; recommendation: 'Ready to close' | 'Nurture' | 'Deprioritize' }> {
  const client = await getClient()

  const appearances = params.leads
    .map(l => `- ${l.conference} (${l.date}): ${l.title ?? 'no title'} — "${l.notes ?? 'no notes'}"`)
    .join('\n')

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are a B2B sales relationship analyst for a fintech company that sells FX/currency risk tools.

Analyze the contact history for ${params.contactName} across conferences:
${appearances}

Write a 2–3 sentence relationship narrative summarizing how the relationship has developed, what the person's role/company signals, and how engaged they seem.

Then on a new line, output exactly one of: "Ready to close", "Nurture", or "Deprioritize"

Format:
<narrative>
<recommendation>`
    }],
  })

  const text = (msg.content[0] as { text: string }).text.trim()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const narrative = lines.slice(0, -1).join(' ')
  const rawRec = lines[lines.length - 1]
  const recommendation = (rawRec === 'Ready to close' || rawRec === 'Nurture' || rawRec === 'Deprioritize')
    ? rawRec
    : 'Nurture'

  return { narrative, recommendation }
}

export async function draftFollowUpEmail(params: {
  firstName: string
  lastName: string
  company: string
  title?: string | null
  conferenceName: string
  repNotes?: string | null
}): Promise<string> {
  const client = await getClient()

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Draft a short, personalized follow-up email from a Grain sales rep to ${params.firstName} ${params.lastName}, ${params.title ?? 'a contact'} at ${params.company}, met at ${params.conferenceName}.

Rep's notes from the meeting: "${params.repNotes ?? 'No notes'}"

Grain helps fintechs, PSPs, travel companies, and treasury teams manage FX and currency risk.

Write only the email body (no subject line). Keep it under 150 words. Be warm but direct, reference the specific meeting, and propose a next step.`
    }],
  })

  return (msg.content[0] as { text: string }).text.trim()
}

export async function discoverConferences(params: {
  vertical: string
  geography: string
  timeWindow: string
  existingConferenceNames: string[]
}): Promise<{ name: string; rationale: string; estimatedDate: string }[]> {
  const client = await getClient()

  const existing = params.existingConferenceNames.slice(0, 15).join(', ')

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a conference research assistant for a fintech company selling FX/currency risk tools to ${params.vertical} companies.

Known conferences (don't suggest these): ${existing}

Suggest 5 conferences the team may not have considered, focused on ${params.vertical} in ${params.geography} during ${params.timeWindow}.

For each, output exactly this JSON array format:
[{"name":"...","rationale":"...","estimatedDate":"..."}]

Keep rationale to 1 sentence. estimatedDate is approximate month/year.`
    }],
  })

  const raw = (msg.content[0] as { text: string }).text.trim()
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) return []
  try {
    return JSON.parse(match[0])
  } catch {
    return []
  }
}

export async function orchestrateQuery(params: {
  query: string
  phase?: 'pre' | 'in' | 'post' | null
}): Promise<{ phase: 'pre' | 'in' | 'post'; response: string }> {
  const client = await getClient()

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are a sales intelligence assistant for Grain, a fintech selling FX/currency risk tools.

User query: "${params.query}"

First, classify which conference phase this query belongs to:
- "pre" = planning, which conferences to attend, ICP scoring, coverage gaps, upcoming briefings
- "in" = currently at a conference, lead capture, looking someone up, quick context
- "post" = follow-up, relationship analysis, email drafting, HubSpot sync

Then answer the query helpfully and concisely.

Format your response as:
PHASE: <pre|in|post>
---
<your answer>`
    }],
  })

  const text = (msg.content[0] as { text: string }).text.trim()
  const phaseMatch = text.match(/PHASE:\s*(pre|in|post)/i)
  const phase = (phaseMatch?.[1]?.toLowerCase() as 'pre' | 'in' | 'post') ?? params.phase ?? 'pre'
  const response = text.replace(/PHASE:\s*(pre|in|post)\s*---\s*/i, '').trim()

  return { phase, response }
}
