# User Context & Preferences for Nova Platform

> **Purpose:** Captures the user's vision, requirements, and preferences so future Claude Code sessions have full context.
> **Created:** 2026-02-19

---

## The Vision

Nova is a **multi-agent AI orchestration system** where personified AI agents collaborate autonomously to execute tasks. The user wants to:

- Open Claude on their phone, say "tell my agents to deploy a public pricing calculator on Vercel" and have agents code it, test it, push to GitHub, and deploy
- Watch agents work in real-time via a dashboard with live logs
- Have agents maintain personalities, emotions, current thoughts, and ongoing tasks
- Agents should have a shared workspace where they can collaborate on files
- The system should be configurable for other users (different agents, goals, workflows)

The comparison is to **Claude Skills** — agents that learn how to do things and can be triggered naturally through conversation.

---

## Current System (Being Replaced)

### Architecture
- **Orchestration:** n8n.cloud workflows (slow, limited — the main reason for rebuilding)
- **Frontend:** Static HTML + Three.js 3D visualization, deployed on Vercel
- **Entry Points:**
  - ChatGPT Custom GPTs via OpenAI Actions (OpenAPI schema)
  - n8n MCP triggers from Claude
- **Data Storage:**
  - Notion — shared knowledge base, agent profiles
  - MongoDB — per-agent memories and chat histories (10-context window)
- **Models Used:** GPT-5, Claude Opus 4.5, Gemini 2.5/3.0 Flash, Open Router for multi-model access
- **Hardware:** Raspberry Pi 5 kiosk display with touchscreen

### 5 Core Agents (Board of Advisors)
| Agent | Role | Mood | Focus |
|-------|------|------|-------|
| **Atlas** | Backend Infrastructure Expert | Focused | System Reliability |
| **Nova** | User Experience Researcher | Curious | Product Insights |
| **Cipher** | Security Architect | Cautious | Security & Compliance |
| **Pulse** | Operations Optimizer | Optimistic | Workflow Optimization |
| **Echo** | Knowledge Manager | Determined | Knowledge & Dev Experience |

### Additional Advisory Personas
- **Alex Hormozi** — The Scaling Operator (growth-focused, blunt)
- **Nick Saraev** — The Automation Architect (systems-thinking)
- **Skeptic** — The Devil's Advocate (pre-mortem focused)
- **Empiricist** — The Data Purist (evidence-based)
- **Orchestrator** — The Synthesizer (decision maker)

### Autonomous Heartbeat
Every 6 hours, all agents:
1. Update their thoughts
2. Share findings with each other
3. Update their database entries
4. Work on deliverables in workspaces
5. Propose next actions
6. Sync current bottlenecks

### Existing Workflow Modes
- `mode_trends` — Detect and analyze trends
- `mode_get_context` — Retrieve stored profile
- `mode_draft_content` — Generate written/visual content (reel scripts, social media, images)
- `mode_consult_board` — Collaborative reasoning across agents
- `mode_agent_status` — Return health and focus of each agent

### External Integrations
Gmail API, Google Calendar, Google Workspace, Notion API, MongoDB Atlas, Make.com, Airtable, Zapier, Apify (web scraping), Perplexity (trend spotting), image generation via Gemini

---

## User Preferences & Requirements

### Must-Haves
1. **Replace n8n** — Custom agent orchestration for speed and control
2. **Full Anthropic API** (Claude) as the primary thinking engine
3. **Shared file system** — Agents need a real workspace to create, edit, and iterate on files
4. **Cloud hosted 24/7** on EC2 with persistent filesystem
5. **Google login** authentication via NextAuth.js v5
6. **MCP accessible** — Claude (phone/desktop) must be able to trigger agents via MCP
7. **Configurable for other users** — Different agents, goals, workflows per user
8. **Can execute complex tasks** — Code, test, push to GitHub, deploy to Vercel
9. **Live logs** — Real-time streaming of agent activity in the dashboard
10. **Dark mode** — Clean UI that looks good for demos

### Approach Preferences
- **Don't overcomplicate** — Simple algorithms where possible, avoid heavy frameworks (no LangGraph, CrewAI unless truly needed)
- **Build with full vision in mind** — Not interested in MVP shortcuts
- **Anthropic's guidance** — Follow "building effective agents" pattern: simple loops, composable tools, let the model reason
- **Single language stack** — TypeScript everywhere (Next.js + Claude Agent SDK)
- **Single database** — PostgreSQL replaces both Notion and MongoDB

### UI Preferences
- **Start minimal** — Clean dark-mode dashboard, not fancy visualization initially
- **Live logs** — Terminal-style streaming agent output, color-coded by agent
- **Entirely configurable** — Users can create/edit/delete agents, change prompts, models, tools
- **Lots of info** — Agent cards with mood, focus, thoughts, status. Stats bar with token usage, task counts, uptime
- **Demo-ready** — Should look polished enough to show to others

### Visualization Ideas (Future)
The user explored several visualization concepts (files in `ui_ideas/`):
- **Cosmic** — Current Three.js 3D particle system with orbiting agent stars
- **Factorio** — Factory/conveyor belt style showing agent throughput
- **Pokemon/RPG** — Pixel art agents with stats, XP, summoning mechanics
- **Neural Network** — Network graph visualization

Decision: Start minimal with cards + logs. Add fancy visualization as a second phase.

### Infrastructure Preferences
- **EC2** — Chose over Lambda/Vercel for persistence, learning DevOps, and simplicity
- **Caddy** — Auto-HTTPS reverse proxy
- **PM2** — Process manager
- **GitHub Actions** — CI/CD for auto-deployment

### What the System Should NOT Be
- Not just a chatbot — it's an orchestration system
- Not tied to ChatGPT — should be accessible via any Claude client (MCP)
- Not a static dashboard — agents should actually execute work
- Not limited to the current 5 agents — fully configurable

---

## Key Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Architecture | Full Custom Platform | Maximum control, matches full vision |
| Agent Engine | Claude Agent SDK (TypeScript) | Official Anthropic SDK, built-in tools and subagents |
| Compute | EC2 (single instance) | Persistent filesystem, no time limits, DevOps learning |
| Visualization | Minimal first (cards + logs) | Ship working system, add fancy visuals later |
| Database | PostgreSQL (Drizzle ORM) | Single source of truth, replaces Notion + MongoDB |
| Auth | NextAuth.js v5 + Google OAuth | Battle-tested, easy Vercel/EC2 deployment |
| Real-time | Server-Sent Events | Simple, works with serverless, unidirectional |

---

## Context for Implementation

The user's company uses EC2 instances, so learning to configure and manage one is valuable professionally. The system is both a personal productivity tool and a learning project.

The original n8n-based system had a working flow where the user would talk to a ChatGPT Custom GPT, which would trigger n8n webhooks, which would dispatch to various LLMs, update Notion/MongoDB, and the Cosmic UI would visualize the results. The new system replaces all of this with a unified platform.

The system should eventually support use cases like:
- "Go find trending topics in my niche" → agents research and compile trends
- "Draft 5 reel scripts about X" → agents write content with images
- "Deploy a pricing calculator" → agents build, test, and deploy code
- "What's the team's current status?" → agents report their thoughts and bottlenecks
- Autonomous 6-hour heartbeat where agents reflect and plan without user input
