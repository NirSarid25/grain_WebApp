# Grain Conference Intelligence Tool

A full-stack web app that helps Grain's sales team decide which conferences to attend, plan year-round coverage, capture leads in the field, track cross-conference relationships, and sync everything to HubSpot, all powered by Claude AI.

**Live Web Application:** https://grainwebapp-production.up.railway.app

**Video Walkthrough:** [Insert your Video Link Here]

**GitHub:** https://github.com/NirSarid25/grain_WebApp

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

## Table of Contents

1. [For Grain Reviewers: Start Here](#for-grain-reviewers-start-here)
2. [What the App Does](#what-the-app-does)
3. [Pages and Features](#pages-and-features)
4. [ICP Scoring System](#icp-scoring-system)
5. [Cross-Conference Contact Tracking](#cross-conference-contact-tracking)
6. [AI Agent Architecture](#ai-agent-architecture)
7. [How I Built This With AI](#how-i-built-this-with-ai)
8. [What I'd Build Next](#what-id-build-next)
9. [Tech Stack](#tech-stack)

---

## For Grain Reviewers: Start Here

The app is live and fully deployed. Before exploring, do these two things so the AI features and HubSpot sync actually work:

### Step 1: Enable AI features

1. Open the live app: https://grainwebapp-production.up.railway.app
2. Click **Settings** in the left sidebar
3. Paste your Anthropic API key (starts with `sk-ant-...`) in the **Anthropic API Key** field
4. Click **Save**

That's it. All AI features activate immediately: relationship arc summaries, follow-up email drafts, conference discovery chat. No restart needed.

### Step 2: Enable HubSpot sync (optional)

1. In HubSpot, go to **Settings → Integrations → Private Apps** and create a private app with `crm.objects.contacts.write` scope
2. Copy the access token
3. Back in the app, go to **Settings** and paste it in the **HubSpot Access Token** field
4. Click **Save**

Once saved, every lead on the Leads page gets a "Push to HubSpot" button, and a bulk push button appears at the top.

> If you prefer to use an environment variable instead of the Settings page, add `ANTHROPIC_API_KEY=sk-ant-...` in Railway → grain_WebApp → Variables tab and redeploy. The app falls back to that if no key is saved in Settings.

---

## What the App Does

Grain's sales team attends 20-30 fintech and payments conferences per year. Today, decisions about which events to attend, who covers what, and how leads are followed up are scattered across spreadsheets and Slack threads.

This tool centralizes everything:

| Problem | Solution |
|---------|----------|
| Which conferences should we attend? | ICP scoring ranks all 30 events A/B/C automatically |
| Are we missing months with no coverage? | Planning view flags gaps and under-invested months |
| Multiple events close together, one trip? | Geographic cluster detection highlights trip efficiency |
| Capturing leads quickly on a busy show floor | Mobile-first lead capture, pre-selected conference, minimal taps to save |
| Met this person before, who are they to us? | Cross-conference deduplication with automatic relationship classification |
| What do I say in the follow-up email? | AI drafts a personalized email based on your field notes |
| Push contacts into HubSpot | One-click or bulk push with custom field mapping |

---

## Pages and Features

### Dashboard

The main command center. When you land here you see:

- **4 stats at the top:** total conferences, Tier A events, leads captured, unique contacts
- **Next 30 Days:** upcoming conferences with tier badges and quick-capture links, so nothing sneaks up on the team
- **Contacts to Act On:** Hot and Warming contacts sorted by urgency, so you always know who needs a follow-up right now
- **Recent Captures:** last 5 leads added
- **AI Chat:** ask anything in plain English about your conference pipeline (more on this below)

### Conferences

Full list of 30 pre-seeded real-world fintech, payments, FX, travel, and treasury conferences.

**Filters:**
- Search by name
- Filter by vertical (fintech, payments, fx, travel, treasury)
- Filter by tier (A, B, C)
- Filter by country

**Each row shows:**
- Conference name linked to its official website
- Date range
- City and country
- Vertical
- Audience size
- ICP score: a gradient bar with the numeric score and the 4-component breakdown underneath (hover the bar for a full tooltip explaining each factor)
- Tier badge: ★ Tier A, ◆ Tier B, Tier C
- **"+ Lead"** quick-capture button, opens the lead form pre-filled with that conference

**Live badge:** Conferences happening today show a pulsing green "Live" indicator.
**Past events:** Dimmed automatically so the list stays clean.

### Planning

A year-view calendar showing all 12 months of conference coverage at a glance.

**Color coding:**
- ⬜ White: good coverage, at least one Tier A event this month
- 🟠 Orange: events exist but no Tier A present (under-invested month)
- 🔴 Red: nothing booked at all (gap month)
- 🟣 Purple: cluster month (3 or more conferences)
- 🔵 Blue: trip-efficient month (2+ conferences in the same country, one trip covers both)

**Summary panels** at the bottom of the page name the specific months with gaps and the specific conference pairs worth combining into a single trip.

Conference names inside each month cell are clickable and go straight to the lead capture form for that event.

### Leads

Full list of all captured leads: name, company, title, conference, email, and HubSpot sync status.

- **Individual push:** "Push to HubSpot" button on every row
- **Bulk push:** "Push all to HubSpot (N pending)" button at the top syncs everything unsynced in one click
- Lead names link directly to the contact's full profile page

**Fields mapped to HubSpot:** first name, last name, email, phone, job title, company, plus two custom Grain properties: `grain_conference` (which event they were met at) and `grain_notes` (field notes from the rep).

### Capture Lead

A mobile-optimized form designed for one-handed use on a busy conference floor.

- **Upcoming conferences appear first** in the dropdown, grouped separately from past events
- **Conference is pre-selected** when you arrive here via a "+ Lead" button from the Conferences or Planning page
- Required fields: first name, last name, company, conference
- Optional: title, email, phone, notes

**Smart deduplication on save:** When you hit Save, the app checks whether this person already exists in the system. If it finds a match (by email, or by fuzzy name matching when there's no email), instead of creating a duplicate you're automatically redirected to the existing contact's profile with a **"Match found!"** banner telling you which conference you first met them at. The rep on the floor never has to think about duplicates.

### Contacts

All unique contacts discovered across conferences, sorted by urgency so the most important people are always at the top.

**Sort order:** Hot → Warming → New → Stalled → Tire-kicker

**What you see for each contact:**
- Name and email
- Company history: if they switched employers between events, you see `Company A → Company B` with a **↺ job change** flag. That's a buying signal, a new company usually means they're re-evaluating vendors.
- How many times you've seen them and at which conference last
- **Signal:** a plain-English sentence explaining why they got their status, like *"Senior contact with email · last seen 2 months ago → follow up now"*
- Relationship status badge

A **Hot contacts alert banner** appears at the top of the page when there are any Hot contacts that need attention.

### Contact Detail

The full relationship profile for a single contact.

- **"Match found!" banner** at the top if you were redirected here after the system recognized a returning contact
- Name, company history, email, appearance count, and relationship badge
- **Conference timeline:** every event where this person was seen, in chronological order, with the notes your rep took, their title at the time, and which company they were with
- **AI Relationship Arc:** Claude reads all the field notes across all appearances and synthesizes them into 2-3 sentences, then gives a concrete recommendation: *Ready to close*, *Nurture*, or *Deprioritize*. What would take a rep 10 minutes of digging takes 3 seconds here.
- **Draft Follow-up Emails:** one AI-drafted personalized email per conference appearance, using the person's title, the event name, and the rep's actual field notes. Fully editable before you copy it.

### Settings

Where Grain's team configures the two integrations. No code changes or redeployment ever needed.

| Field | What it unlocks |
|-------|----------------|
| Anthropic API Key | All AI features: arc summaries, email drafts, conference discovery chat |
| HubSpot Access Token | Lead push to HubSpot CRM, individual and bulk |

Keys are saved in the database and take effect immediately after clicking Save.

---

## ICP Scoring System

Every conference is scored 0-100 across 4 factors, then assigned a tier automatically.

| Factor | Max Points | Breakdown |
|--------|-----------|-----------|
| Vertical alignment | 40 | fintech / payments / fx = 40 · travel = 30 · treasury / saas = 20 · other = 5 |
| Audience size | 20 | >10,000 = 20 · 5,000-10,000 = 15 · 1,000-5,000 = 10 · <1,000 = 5 |
| Geographic tier | 20 | Tier 1 hub city or country = 20 · regional = 12 · local = 5 |
| Industry density | 20 | High-density vertical (fintech/payments/fx) = 20 · medium = 12 · low = 5 |

**Tier thresholds:**
- **Tier A** (★): score 80 and above, must-attend events
- **Tier B** (◆): score 60-79, selective attendance
- **Tier C**: score below 60, monitor only

The score breakdown (e.g. `40+20+20+20`) is shown under every conference row. Hover the score bar for the full breakdown tooltip.

---

## Cross-Conference Contact Tracking

When a lead is saved, the app automatically tries to match them to an existing contact using a two-step algorithm:

**Step 1: Email match**
If the email matches an existing contact exactly, link to that contact.

**Step 2: Fuzzy name match**
If there's no email, use Levenshtein distance (2 character edits or fewer) on the full name, confirmed by company similarity, then link to that contact. This handles typos, middle names, and shortened first names.

**If no match is found**, a new contact is created.

### Relationship Classification

Once contacts are linked across events, each one gets a status based on real engagement signals:

| Status | What it means |
|--------|--------------|
| 🔥 Hot | Has email + senior title (VP/Director/C-level) + seen in the last 3 months |
| 📈 Warming | Seen at 2+ events, last appearance within 6 months |
| ⏸️ Stalled | Seen at 2+ events, but last appearance was more than 6 months ago |
| 👀 Tire-kicker | Seen at 3+ events but never gave an email |
| ✨ New | First encounter |

**Job change detection:** If the same contact appears with a different company at a later event, their profile shows `Company A → Company B` with an explicit ↺ flag. A job change is a buying signal. New company usually means a fresh vendor evaluation.

---

## AI Agent Architecture

The app uses a 4-skill lifecycle model built on Claude (`claude-sonnet-4-6`). It's not just a chatbot. There's an orchestrator that reads every question and decides which specialized agent should handle it.

```
┌─────────────────────────────────┐
│         ORCHESTRATOR            │
│   Reads your question,          │
│   classifies the phase,         │
│   routes to the right agent     │
└────────┬────────────────────────┘
         │
   ┌─────┼──────────┐
   ▼     ▼          ▼
 PRE    IN        POST
Agent  Agent     Agent
```

| Agent | When it activates | What it does |
|-------|------------------|--------------|
| **Orchestrator** | Every AI chat message | Classifies whether the question is pre/in/post conference and routes it |
| **Pre-conference** | Planning questions | Discovers conferences the team doesn't know about yet, based on ICP criteria and geography |
| **In-conference** | Show floor questions | Real-time contact lookup |
| **Post-conference** | Follow-up questions | Generates relationship arc summaries and drafts personalized follow-up emails |

### Why use AI for these specific jobs?

- **Relationship arc summary:** A rep might have 3-4 sparse field notes spread across 18 months of events. Turning those into a coherent story with a close/nurture/drop recommendation takes 10 minutes manually. Claude does it in 3 seconds.
- **Follow-up email draft:** Writing a personalized email that references the specific conference, the person's title, and the rep's exact notes is exactly what AI is good at. It's not generic, it uses the real data.
- **Conference discovery:** Claude's training data includes hundreds of industry events that aren't in the seed database. Asking it to suggest conferences by vertical, geography, and time window gives you genuinely useful results that a Google search would take 30 minutes to replicate.

---

## How I Built This With AI

This entire app was built using Claude Code, Anthropic's AI coding tool. It helped me move fast: scaffolding the full Next.js app, writing the database schema, implementing the Levenshtein matching algorithm, and drafting the AI prompts that power the relationship arc and email features.

Where it helped most was speed. What would normally take a developer a few weeks, I built in days.

Where I had to stay sharp was direction. AI writes what you ask for. If your thinking isn't clear, neither is the output. The tool amplifies your decisions, it doesn't replace them. Every product decision in this app (the ICP scoring weights, the deduplication threshold, the relationship classification criteria, the agent architecture) was a deliberate choice that I had to think through and communicate clearly before the code could reflect it.

---

## What I'd Build Next

If I had another week, three things:

1. **Team coverage view:** a way for managers to see which rep is covering which conference and avoid overlap. Right now the planning page shows the calendar but not who owns each event.
2. **HubSpot two-way sync:** before pushing a lead, check if they already exist in HubSpot by email and update instead of creating a duplicate. The current version always creates a new contact.
3. **Voice capture on the floor:** right now you tap to fill the form. The real zero-friction experience is speaking the person's name and company out loud and having the app log it. That's the natural evolution of the field capture feature.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, server components, API routes) |
| Database | SQLite via Prisma + libsql adapter |
| Styling | Tailwind CSS v4 |
| AI | Anthropic SDK - Claude claude-sonnet-4-6 |
| Deployment | Railway (auto-deploy from GitHub) |
| Language | TypeScript |
