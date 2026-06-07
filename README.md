# Grain Conference Intelligence Tool

A full-stack AI agent that helps Grain's sales team manage conference strategy — scoring events by ICP fit, tracking leads across conferences, deduplicating contacts, and drafting follow-up emails.

**Live demo:** https://grainwebapp-production.up.railway.app

---

## What it does

- **Dashboard** — 30 pre-seeded fintech/payments conferences scored by ICP tier (A/B/C)
- **Filter & search** — filter by vertical, tier, date range, country
- **Planning calendar** — 12-month view showing coverage gaps
- **Lead capture** — add leads per conference, auto-deduplicates contacts across events
- **Contact timeline** — full history of a contact across all conferences with relationship badge (Hot / Warming / Stalled)
- **AI features** (require API key) — relationship arc summaries, follow-up email drafts, conference discovery, natural-language queries

---

## For Grain: enabling AI features

The app has a Settings page that accepts an Anthropic API key at runtime — no code changes or redeployment needed.

### Option A — Settings page (recommended)

1. Open the live app
2. Go to **Settings** (link in the nav)
3. Paste your `ANTHROPIC_API_KEY` and click Save
4. AI features activate immediately

### Option B — Environment variable

In Railway → grain_WebApp → Variables tab, add:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then redeploy. The app reads this automatically if no key is stored in Settings.

---

## Running locally

### Prerequisites
- Node.js 20+
- Git

### Setup

```bash
git clone https://github.com/NirSarid25/grain_WebApp.git
cd grain_WebApp
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-..."   # optional — add later via Settings page
```

Initialize the database and seed 30 conferences:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Agent architecture

The app uses a 4-skill lifecycle model built on Claude (claude-sonnet-4-6):

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **Pre-conference** | Before event | Relationship arc summary for known contacts |
| **In-conference** | During event | Drafts personalized follow-up emails per lead |
| **Post-conference** | After event | Surfaces stalled contacts, suggests re-engagement |
| **Orchestrator** | Natural language query | Routes free-text questions to the right skill |

---

## ICP scoring

Each conference is scored 0–100:

| Factor | Weight |
|--------|--------|
| Vertical match (fintech, payments, fx, treasury, travel) | 40 pts |
| Audience size | 20 pts |
| Geographic tier (Tier 1 hub city) | 20 pts |
| Industry density | 20 pts |

- **Tier A** ≥ 80 — must-attend
- **Tier B** 60–79 — selective attendance
- **Tier C** < 60 — monitor only

---

## Tech stack

- Next.js 16 (App Router)
- Prisma 7 + libsql (SQLite)
- Tailwind CSS v4
- Anthropic SDK (Claude claude-sonnet-4-6)
- Railway (deployment)
