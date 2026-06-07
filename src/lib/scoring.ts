export interface ScoringInput {
  vertical: string
  audienceSize: number
  country: string
  city: string
}

const TIER1_HUBS = new Set([
  'New York', 'London', 'Singapore', 'Hong Kong', 'Frankfurt', 'Zurich',
  'Amsterdam', 'Dubai', 'Tokyo', 'Paris', 'Chicago', 'Sydney',
])

const TIER1_COUNTRIES = new Set([
  'USA', 'UK', 'Singapore', 'Germany', 'Netherlands', 'UAE', 'Switzerland',
])

const HIGH_DENSITY_VERTICALS = new Set(['fintech', 'payments', 'fx'])
const MEDIUM_DENSITY_VERTICALS = new Set(['treasury', 'saas'])

export function computeScore(input: ScoringInput): number {
  let score = 0

  // Vertical alignment (max 40)
  const v = input.vertical.toLowerCase()
  if (v === 'fintech' || v === 'payments' || v === 'fx') score += 40
  else if (v === 'travel') score += 30
  else if (v === 'treasury' || v === 'saas') score += 20
  else score += 5

  // Audience size (max 20)
  if (input.audienceSize > 10000) score += 20
  else if (input.audienceSize >= 5000) score += 15
  else if (input.audienceSize >= 1000) score += 10
  else score += 5

  // Geographic tier (max 20)
  if (TIER1_HUBS.has(input.city) || TIER1_COUNTRIES.has(input.country)) score += 20
  else if (input.country === 'EU' || ['Poland', 'Austria', 'Denmark', 'Cyprus', 'Thailand', 'Spain'].includes(input.country)) score += 12
  else score += 5

  // Industry density (max 20)
  const vert = input.vertical.toLowerCase()
  if (HIGH_DENSITY_VERTICALS.has(vert)) score += 20
  else if (MEDIUM_DENSITY_VERTICALS.has(vert)) score += 12
  else score += 5

  return Math.min(100, score)
}

export function scoreTier(score: number): 'A' | 'B' | 'C' {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  return 'C'
}
