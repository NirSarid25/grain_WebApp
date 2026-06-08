# Grain Conference Intelligence Tool

A full-stack web app that helps Grain's sales team decide which conferences to attend, plan year-round coverage, capture leads in the field, track cross-conference relationships, and sync to HubSpot — all powered by Claude AI.

**Live Web Application:** https://grainwebapp-production.up.railway.app       

**Video Walkthrough (5-10 Mins):** [Insert your Video Link Here]

**GitHub:** https://github.com/NirSarid25/grain_WebApp

---

## Table of Contents

1. [What the App Does](#what-the-app-does)
2. [Pages & Features](#pages--features)
3. [Enabling AI Features (for Grain)](#enabling-ai-features-for-grain)
4. [Enabling HubSpot Sync (for Grain)](#enabling-hubspot-sync-for-grain)
5. [ICP Scoring System](#icp-scoring-system)
6. [Cross-Conference Contact Tracking](#cross-conference-contact-tracking)
7. [AI Agent Architecture](#ai-agent-architecture)
8. [Running Locally](#running-locally)
9. [Tech Stack](#tech-stack)

---

## What the App Does

Grain's sales team attends 20–30 fintech and payments conferences per year. Today, decisions about which events to attend, who covers what, and how leads are followed up are fragmented across spreadsheets and Slack threads.

This tool centralizes everything:

| Problem | Solution |
|---------|----------|
| Which conferences should we attend? | ICP scoring ranks all 30 events A/B/C automatically |
| Are we missing months with no coverage? | Planning view flags gaps and under-invested months |
| Multiple events close together — one trip? | Geographic cluster detection highlights trip efficiency |
| Capturing leads quickly on a busy show floor | Mobile-first lead capture, pre-selected conference, 5 taps to save |
| Met this person before — who are they to us? | Cross-conference contact deduplication with relationship classification |
| What do I say in the follow-up email? | AI drafts a personalized email based on your field notes |
| Push contacts into HubSpot | One-click or bulk push with field mapping |

---

## Pages & Features

### Dashboard
The main command center. Shows:
- **Stats**: total conferences, Tier A events, leads captured, unique contacts
- **Next 30 Days**: upcoming conferences with tier badges and quick-capture links
- **Contacts to Act On**: Hot and Warming contacts sorted by urgency
- **Recent Captures**: last 5 leads added
- **AI Chat**: ask natural-language questions about your conference pipeline

### Conferences
Full list of 30 pre-seeded real-world fintech, payments, FX, travel, and treasury conferences.

**Filters:**
- Search by name
- Filter by vertical (fintech, payments, fx, travel, treasury)
- Filter by tier (A, B, C)
- Filter by country

**Each row shows:**
- Conference name (linked to website)
- Date range
- City and country
- Vertical
- Audience size
- ICP score with gradient bar and 4-component breakdown (hover for full tooltip)
- Tier badge (★ Tier A, ◆ Tier B, Tier C)
- **"+ Lead"** quick-capture button → opens lead form pre-filled with that conference

**Live badge:** Conferences happening today show a pulsing "Live" indicator.  
**Past events:** Dimmed automatically.

### Planning
Year-view calendar showing all 12 months of conference coverage.

**Color coding:**
- ⬜ White — good coverage with Tier A present
- 🟠 Orange — events exist but no Tier A (under-invested)
- 🔴 Red — no events at all (gap)
- 🟣 Purple — cluster month (3+ conferences)
- 🔵 Blue — trip-efficient month (2+ conferences in same country → one trip covers multiple events)

**Summary panels** at the bottom name specific months with gaps and trip opportunities.  
**Conference names are clickable** → goes directly to lead capture for that event.

### Leads
Full list of all captured leads with company, title, conference, email, and HubSpot sync status.

- **Individual push**: "Push to HubSpot" button per lead
- **Bulk push**: "Push all to HubSpot (N pending)" button at the top — syncs all unsynced leads at once
- Lead names link to the contact's profile page

### Capture Lead
Mobile-optimized lead capture form — designed for one-handed use on a conference floor.

- **Upcoming conferences appear first** in the dropdown (grouped separately from past events)
- **Pre-selected** when arriving via a "+" button from the conferences or planning page
- Required fields: first name, last name, company, conference
- Optional: title, email, phone, notes
- On save: if the person is already in the system (matched by email or name), you are automatically redirected to their contact profile with a "Match found!" banner

### Contacts
All unique contacts discovered across conferences, sorted by urgency.

**Sort order:** Hot → Warming → New → Stalled → Tire-kicker  

**Columns:**
- Name + email
- Company (shows `Company A → Company B` with **↺ job change** flag if they switched employers between events)
- Times seen + last conference
- **Signal** — plain-English explanation of why they got their status (e.g. *"Senior contact with email · last seen 2 months ago → follow up now"*)
- Relationship status badge

**Hot contacts alert banner** appears at the top when any Hot contacts exist.

### Contact Detail
Full relationship profile for a single contact.

- **"Match found!" banner** if you were redirected here after recognizing a known contact
- Appearance count + company history
- Relationship badge (Hot / Warming / Stalled / Tire-kicker / New)
- **Conference timeline** — every event where this person was encountered, with their notes, title, and company at the time
- **AI Relationship Arc** — Claude summarizes the entire cross-conference history into 2–3 sentences and gives a recommendation: *Ready to close / Nurture / Deprioritize*
- **Draft Follow-up Emails** — one AI-drafted email per conference appearance, editable before copying

### Settings
Configure API keys — no code changes or redeployment needed.

| Field | Purpose |
|-------|---------|
| Anthropic API Key | Enables all AI features (arc summaries, email drafts, conference discovery, AI chat) |
| HubSpot Access Token | Enables lead push to HubSpot CRM |

Keys are stored in the database and take effect immediately after saving.

---

## Enabling AI Features (for Grain)

The app has a Settings page that accepts an Anthropic API key at runtime — no code changes or redeployment needed.

### Option A — Settings page (recommended)

1. Open the live app at https://grainwebapp-production.up.railway.app
2. Click **Settings** in the left sidebar
3. Paste your `ANTHROPIC_API_KEY` (starts with `sk-ant-...`)
4. Click **Save**
5. AI features activate immediately — no restart needed

### Option B — Environment variable

In Railway → grain_WebApp service → Variables tab, add:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Save and Railway will redeploy automatically. The app reads this variable if no key is stored via the Settings page.

---

## Enabling HubSpot Sync (for Grain)

1. In HubSpot, go to **Settings → Integrations → Private Apps** and create a private app with `crm.objects.contacts.write` scope
2. Copy the access token
3. In the app, go to **Settings** and paste it in the **HubSpot Access Token** field
4. Click **Save**
5. Go to **Leads** — each row now has a "Push to HubSpot" button, or use "Push all to HubSpot" to sync everything at once

**Fields mapped to HubSpot:**
- First name, last name, email, phone, job title, company
- Custom properties: `grain_conference` (which event they were met at), `grain_notes` (field notes)

---

## ICP Scoring System

Every conference is scored 0–100 across 4 factors, then assigned a tier:

| Factor | Max Points | Breakdown |
|--------|-----------|-----------|
| Vertical alignment | 40 | fintech / payments / fx = 40 · travel = 30 · treasury / saas = 20 · other = 5 |
| Audience size | 20 | >10,000 = 20 · 5,000–10,000 = 15 · 1,000–5,000 = 10 · <1,000 = 5 |
| Geographic tier | 20 | Tier 1 hub city or country = 20 · regional = 12 · local = 5 |
| Industry density | 20 | High-density vertical (fintech/payments/fx) = 20 · medium = 12 · low = 5 |

**Tier thresholds:**
- **Tier A** (★) — score ≥ 80 — must-attend events
- **Tier B** (◆) — score 60–79 — selective attendance
- **Tier C** — score < 60 — monitor only

The score breakdown (e.g. `40+20+20+20`) is visible on every conference row. Hover the score bar for the full breakdown tooltip.

---

## Cross-Conference Contact Tracking

When a lead is saved, the app automatically tries to match them to an existing contact using a two-step algorithm:

**Step 1 — Email match (primary key)**  
If the email matches an existing contact exactly → link to that contact.

**Step 2 — Fuzzy name + company match**  
If no email, use Levenshtein distance (≤2 edits) on the full name, confirmed by company similarity → link to that contact.

**If no match** → create a new contact.

### Relationship Classification

| Status | Criteria |
|--------|----------|
| 🔥 Hot | Has email + senior title (VP/Director/C-level) + seen in last 3 months |
| 📈 Warming | 2+ appearances, seen within 6 months |
| ⏸️ Stalled | 2+ appearances, last seen >6 months ago |
| 👀 Tire-kicker | 3+ appearances, no email ever collected |
| ✨ New | First encounter |

**Edge cases handled:**
- **Name variations**: Levenshtein allows up to 2 character differences (typos, middle names, shortened names)
- **Job changes**: If the same contact appears with a different company across events, the company history is shown as `Company A → Company B` with an explicit `↺ job change` flag — a buying signal (new company = re-evaluating vendors)
- **Match notification**: When a lead save matches an existing contact, the rep is automatically redirected to the contact profile with a "Match found!" banner showing which conference they first met this person at

---

## AI Agent Architecture

The app uses a 4-skill lifecycle model built on Claude (`claude-sonnet-4-6`):

```
┌─────────────────────────────────┐
│         ORCHESTRATOR            │
│   Natural-language router       │
│   Classifies query phase        │
└────────┬────────────────────────┘
         │
   ┌─────┼──────────┐
   ▼     ▼          ▼
 PRE    IN        POST
Agent  Agent     Agent
```

| Skill | When | What it does |
|-------|------|--------------|
| **Orchestrator** | AI chat on dashboard | Receives free-text questions, detects whether they're pre/in/post conference, routes to the right agent |
| **Pre-conference** | Before an event | Discovers conferences the team doesn't know about yet, based on ICP criteria |
| **In-conference** | On the show floor | (API available — real-time contact lookup) |
| **Post-conference** | After an event | Generates relationship arc summaries + drafts personalized follow-up emails |

### Why AI for these specific jobs?

- **Relationship arc summary**: A rep might have 3–4 sparse field notes from different events spread over 18 months. Synthesizing those into a coherent narrative + close/nurture/drop recommendation takes 10 minutes manually. Claude does it in 3 seconds.
- **Follow-up email draft**: Personalizing an email to reference the specific conference, the person's title, and the rep's notes is the job AI is best suited for — it's pattern-completion with personal context.
- **Conference discovery**: Claude's training data includes hundreds of industry events the seed database doesn't cover. Asking it to suggest conferences by vertical + geography + time window produces genuinely useful results a Google search would take 30 minutes to replicate.

---

## Running Locally

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
ANTHROPIC_API_KEY="sk-ant-..."
```

Initialize the database and seed 30 conferences:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:seed` | Seed 30 conferences into the database |
| `npm run db:migrate` | Run database migrations |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, server components, API routes) |
| Database | SQLite via Prisma 7 + libsql adapter |
| Styling | Tailwind CSS v4 |
| AI | Anthropic SDK — Claude claude-sonnet-4-6 |
| Deployment | Railway (auto-deploy from GitHub) |
| Language | TypeScript |
