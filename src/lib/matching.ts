import { prisma } from './prisma'

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function companySimilar(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalize(a) === normalize(b) || levenshtein(normalize(a), normalize(b)) <= 2
}

export async function matchOrCreateContact(lead: {
  firstName: string
  lastName: string
  company: string
  email?: string | null
}): Promise<string | null> {
  const fullName = `${lead.firstName} ${lead.lastName}`.trim()

  // 1. Email match (primary key)
  if (lead.email) {
    const byEmail = await prisma.contact.findUnique({ where: { email: lead.email } })
    if (byEmail) return byEmail.id

    // Create new contact with email
    const created = await prisma.contact.create({
      data: { canonicalName: fullName, email: lead.email },
    })
    return created.id
  }

  // 2. Fuzzy name match across all leads
  const candidates = await prisma.contact.findMany({ where: { email: null } })
  for (const c of candidates) {
    const dist = levenshtein(c.canonicalName.toLowerCase(), fullName.toLowerCase())
    if (dist <= 2) {
      // Check company against their leads
      const theirLeads = await prisma.lead.findMany({ where: { contactId: c.id } })
      const sameCompany = theirLeads.some(l => companySimilar(l.company, lead.company))
      if (sameCompany) return c.id
    }
  }

  // 3. No match → create new contact
  const created = await prisma.contact.create({
    data: { canonicalName: fullName, email: null },
  })
  return created.id
}

export type RelationshipClass = 'Hot' | 'Warming' | 'Stalled' | 'Tire-kicker' | 'New'

const SENIOR_TITLES = /\b(VP|Vice President|Director|Head|C-level|CEO|CFO|CTO|COO|CPO|SVP|EVP|President|Managing Director|MD|Partner)\b/i

export function classifyRelationship(leads: {
  title?: string | null
  email?: string | null
  createdAt: Date
  notes?: string | null
}[]): RelationshipClass {
  if (leads.length === 0) return 'New'

  const sorted = [...leads].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const lastSeen = sorted[sorted.length - 1].createdAt
  const monthsSinceLast = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 30)
  const hasEmail = leads.some(l => l.email)
  const isSenior = leads.some(l => l.title && SENIOR_TITLES.test(l.title))

  if (hasEmail && isSenior && monthsSinceLast < 3) return 'Hot'
  if (leads.length >= 3 && !hasEmail && monthsSinceLast > 0) return 'Tire-kicker'
  if (leads.length >= 2 && monthsSinceLast > 6) return 'Stalled'
  if (leads.length >= 2) return 'Warming'
  return 'New'
}

export function explainRelationship(leads: {
  title?: string | null
  email?: string | null
  createdAt: Date
}[]): string {
  if (leads.length === 0) return 'First encounter'

  const sorted = [...leads].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const lastSeen = sorted[sorted.length - 1].createdAt
  const months = Math.round((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const hasEmail = leads.some(l => l.email)
  const isSenior = leads.some(l => l.title && SENIOR_TITLES.test(l.title))
  const timeAgo = months === 0 ? 'this month' : months === 1 ? '1 month ago' : `${months} months ago`

  if (hasEmail && isSenior && months < 3) return `Senior contact with email · last seen ${timeAgo} → follow up now`
  if (leads.length >= 3 && !hasEmail) return `${leads.length} events, no email collected → likely not a buyer`
  if (leads.length >= 2 && months > 6) return `${leads.length} events · last seen ${timeAgo} → re-engage or drop`
  if (leads.length >= 2) return `${leads.length} events · last seen ${timeAgo} · relationship building`
  return `First captured ${timeAgo}`
}
