# Nova Platform — Full Architecture & Implementation Plan

> **Purpose:** Reference document for future Claude Code sessions building the Nova Platform.
> **Created:** 2026-02-19
> **Status:** Approved architecture — ready for implementation

## Context

The current "Nova Cosmic UI" is a static Three.js visualization that fetches agent data from n8n webhooks. The n8n orchestration is slow and limited — agents can't actually work on files, iterate, or collaborate in a shared workspace. The goal is to replace this with a **full custom platform** powered by the Claude Agent SDK, hosted on EC2, with a clean dark-mode dashboard, live logs, and MCP accessibility.

**What this enables:** Open Claude on your phone, say "tell my agents to deploy a pricing calculator on Vercel," and they code it, test it, push to GitHub, and deploy — all visible in real-time via the dashboard.

---

## Architecture Overview

Everything runs on a single EC2 instance:

```
EC2 Instance (Ubuntu 24.04, t3.medium or larger)
├── Caddy (reverse proxy, auto-HTTPS via Let's Encrypt)
├── Next.js 15 App (via PM2 process manager)
│   ├── Dashboard UI (dark mode, shadcn/ui)
│   ├── API Routes (auth, agents, tasks, MCP)
│   └── Agent Runtime (Claude Agent SDK)
├── PostgreSQL 16 (local, or Neon serverless)
├── Agent Workspaces: /var/nova/workspaces/{userId}/{taskId}/
└── Systemd timer (heartbeat cron every 6 hours)
```

**Why EC2 over Lambda/Vercel:**
- Persistent filesystem — agents work directly on files, no sync overhead
- No execution time limits — complex tasks can run as long as needed
- Single machine to learn and manage — relevant to company DevOps learning
- Frontend + backend + agent compute all in one place
- Predictable cost (~$30-50/mo for t3.medium)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Full-stack, TypeScript, API routes |
| Agent Engine | Claude Agent SDK (TypeScript) | Anthropic's official SDK — tools, subagents, MCP |
| Primary Model | Claude Opus 4 | Complex reasoning and code generation |
| Fast Model | Claude Sonnet 4 | Advisory agents, quick queries |
| Auth | NextAuth.js v5 + Google OAuth | Simple, battle-tested |
| Database | PostgreSQL 16 (Drizzle ORM) | Relational, type-safe, single source of truth |
| UI Components | shadcn/ui + Tailwind CSS | Dark mode built-in, clean, configurable |
| Real-time | Server-Sent Events (SSE) | Stream agent logs to dashboard |
| MCP Protocol | Streamable HTTP endpoint | Claude/chatbots can trigger Nova |
| Process Manager | PM2 | Keep Next.js running, auto-restart |
| Reverse Proxy | Caddy | Auto-HTTPS, simple config |
| Deployment | GitHub Actions → EC2 | Push to main → auto-deploy |

---

## Repository Structure

New repo: `nova-platform`

```
nova-platform/
├── package.json
├── next.config.ts
├── drizzle.config.ts
├── .env.example
├── .mcp.json                          # MCP server configs for Agent SDK
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (dark mode, auth provider)
│   │   ├── page.tsx                   # Redirect to /dashboard or /login
│   │   ├── login/page.tsx             # Google OAuth login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Dashboard shell (sidebar, header)
│   │   │   ├── page.tsx               # Main dashboard (agent overview)
│   │   │   ├── agents/page.tsx        # Agent configuration
│   │   │   ├── tasks/page.tsx         # Task history
│   │   │   ├── tasks/[id]/page.tsx    # Task detail + live logs
│   │   │   ├── workspace/page.tsx     # File browser
│   │   │   └── settings/page.tsx      # User settings, API keys
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── agents/
│   │       │   ├── route.ts           # GET all agents, POST create agent
│   │       │   ├── [id]/route.ts      # GET/PUT/DELETE single agent
│   │       │   └── heartbeat/route.ts # POST trigger heartbeat
│   │       ├── tasks/
│   │       │   ├── route.ts           # GET all tasks, POST new task
│   │       │   ├── [id]/route.ts      # GET task detail
│   │       │   └── [id]/stream/route.ts  # SSE live log stream
│   │       └── mcp/route.ts           # MCP server endpoint
│   │
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── orchestrator.ts        # Main orchestration: decompose → delegate → synthesize
│   │   │   ├── agent-runtime.ts       # Single agent execution via Claude Agent SDK
│   │   │   ├── default-agents.ts      # Default agent personality definitions
│   │   │   ├── heartbeat.ts           # 6-hour autonomous cycle logic
│   │   │   └── tools.ts              # Custom MCP tools (deploy, git push, etc.)
│   │   ├── mcp/
│   │   │   └── nova-server.ts         # Nova exposed as MCP server
│   │   ├── db/
│   │   │   ├── schema.ts             # Drizzle schema (all tables)
│   │   │   ├── client.ts             # Database connection
│   │   │   └── seed.ts               # Default agent data seeding
│   │   ├── workspace/
│   │   │   └── manager.ts            # Create/list/read workspace files
│   │   └── auth.ts                   # NextAuth.js v5 config
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── agent-card.tsx         # Agent status card (mood, focus, thought)
│   │   │   ├── agent-grid.tsx         # Grid of all agent cards
│   │   │   ├── task-panel.tsx         # Submit new task + task list
│   │   │   ├── live-log.tsx           # Terminal-style streaming log
│   │   │   ├── workspace-explorer.tsx # File tree browser
│   │   │   ├── agent-config-form.tsx  # Edit agent personality/tools/model
│   │   │   └── stats-bar.tsx          # Token usage, task counts, uptime
│   │   └── layout/
│   │       ├── sidebar.tsx            # Navigation sidebar
│   │       └── header.tsx             # Top bar with user menu
│   │
│   └── types/
│       └── index.ts                   # Shared TypeScript types
│
├── scripts/
│   ├── setup-ec2.sh                  # EC2 initial setup script
│   └── deploy.sh                     # Deployment script
│
└── docker-compose.yml                # Optional: PostgreSQL + app in containers
```

---

## Core Components — How They Work

### 1. Agent Definitions (Configurable per User)

Each agent is stored in the `agent_configs` database table. Users configure them via the dashboard UI. The system ships with 5 defaults (Atlas, Nova, Cipher, Pulse, Echo) that are seeded on first login.

**Database fields per agent:**
- `name`, `description` — identity
- `systemPrompt` — full personality prompt (the "soul" of the agent)
- `tools` — JSON array of allowed tools (`["Bash", "Read", "Write", "Edit", "Glob", "Grep"]`)
- `model` — which Claude model (`opus`, `sonnet`, `haiku`)
- `color` — hex color for UI
- `isActive` — toggle on/off
- `mood`, `focus`, `coreBeliefs` — display state
- `bottleneck`, `proposedAction`, `casualThought`, `proposedDeliverable` — runtime state

When the orchestrator runs an agent, it builds a Claude Agent SDK query with that agent's `systemPrompt` as the system message, restricted to that agent's `tools`, using that agent's `model`.

### 2. Orchestrator — The Brain

The orchestrator is a single function (`executeTask`) that:

1. Receives a user prompt (e.g., "deploy a pricing calculator on Vercel")
2. Creates a workspace directory at `/var/nova/workspaces/{userId}/{taskId}/`
3. Loads the user's active agent configs from the database
4. Calls Claude Agent SDK `query()` with an orchestrator prompt that says:
   - "You are the Nova orchestrator. Here is the user's request. Here are your available agents and their specialties. Decompose this task and delegate to the right agents using the Task tool."
5. The SDK handles the agentic loop — the orchestrator Claude decides which agents to invoke as subagents
6. Each subagent works in the shared workspace directory (can read each other's files)
7. Results stream via SSE to the dashboard
8. Final result is saved to the database

**Key design principle:** The orchestrator is NOT a complex state machine. It's Claude itself deciding how to decompose and delegate. This follows Anthropic's "building effective agents" guidance — simple loops, let the model reason.

### 3. Heartbeat System

A systemd timer (or cron) hits `POST /api/agents/heartbeat` every 6 hours. This triggers a special orchestrator run where:

- Each agent reflects on their current state
- Reviews what other agents have been working on
- Updates their mood, thoughts, bottlenecks
- Proposes next actions
- Results are persisted and visible on the dashboard

### 4. MCP Server — How Claude Talks to Nova

The `/api/mcp` endpoint implements the MCP Streamable HTTP transport. It exposes these tools:

| MCP Tool | What it Does |
|----------|-------------|
| `nova_run_task` | Submit a task for agents (returns task ID) |
| `nova_task_status` | Check status of a running/completed task |
| `nova_agent_status` | Get current state of all agents |
| `nova_consult` | Ask the advisory board a question |
| `nova_list_workspace` | Browse workspace files |
| `nova_read_file` | Read a specific workspace file |

**User setup:** Add Nova as an MCP server in Claude Desktop/mobile:
```json
{
  "mcpServers": {
    "nova": {
      "type": "http",
      "url": "https://nova.yourdomain.com/api/mcp",
      "headers": { "Authorization": "Bearer {api-key}" }
    }
  }
}
```

Then just talk to Claude: "Tell my agents to..." → Claude calls `nova_run_task` → agents work → results stream back.

### 5. Custom Agent Tools

Beyond the built-in SDK tools (Bash, Read, Write, etc.), agents get custom tools via in-process MCP:

| Tool | Purpose |
|------|---------|
| `update_my_state` | Agent updates its mood/thought/bottleneck in the database |
| `read_team_state` | Read what other agents are currently thinking |
| `push_to_github` | Commit and push workspace to a GitHub repo |
| `deploy_to_vercel` | Deploy workspace to Vercel via API |
| `request_human_approval` | Pause and ask the user before destructive actions |
| `store_memory` | Save something to long-term agent memory |
| `recall_memories` | Search agent memory by relevance |

### 6. Dashboard UI

Clean, dark-mode dashboard built with shadcn/ui:

**Main Dashboard (`/dashboard`):**
- **Agent Grid** — Cards for each agent showing: name, mood icon, current focus, latest casual thought, status indicator (idle/working/thinking). Click to expand full detail.
- **Quick Task Input** — Text input at the top: "What should your agents do?" with submit button
- **Active Tasks** — List of running/recent tasks with status badges
- **Stats Bar** — Total tasks completed, tokens used today, next heartbeat countdown, system uptime

**Task Detail (`/dashboard/tasks/[id]`):**
- **Live Log** — Terminal-style scrolling log showing every agent message in real-time (via SSE). Color-coded by agent. Shows tool calls, file operations, reasoning.
- **Agents Involved** — Which agents are working on this task and their current subtask
- **Workspace Files** — Tree view of files created/modified during this task
- **Result** — Final output/summary when task completes

**Agent Config (`/dashboard/agents`):**
- List of all agents with toggle (active/inactive)
- Click to edit: name, personality prompt (textarea), allowed tools (checkboxes), model selection (dropdown), color picker
- "Add Agent" button to create new custom agents
- "Reset to Defaults" to restore the original 5

**Workspace Explorer (`/dashboard/workspace`):**
- File tree for `/var/nova/workspaces/{userId}/`
- Click file to view contents (syntax highlighted)
- Download files/folders

**Settings (`/dashboard/settings`):**
- API keys management (Anthropic, GitHub, Vercel, etc.)
- Heartbeat interval configuration
- MCP API key generation
- User profile

---

## Database Schema

PostgreSQL with Drizzle ORM. Key tables:

**`users`** — NextAuth managed (id, email, name, google_id, created_at)

**`agent_configs`** — Per-user agent definitions
- userId, name, description, systemPrompt, tools (JSON), model, color, isActive
- mood, focus, coreBeliefs (editable personality state)

**`agent_states`** — Runtime state (updated by agents during execution)
- agentConfigId, bottleneck, proposedAction, casualThought, proposedDeliverable, updatedAt

**`tasks`** — Task records
- userId, prompt, status (pending/running/completed/failed), result, workspacePath, createdAt, completedAt

**`task_messages`** — Streaming log entries
- taskId, agentId, role (assistant/tool/system), content, toolName, createdAt

**`agent_memories`** — Long-term agent memory
- agentConfigId, content, memoryType (episodic/semantic/procedural), importance, embedding (for search), createdAt

**`user_settings`** — Per-user configuration
- userId, anthropicApiKey (encrypted), githubToken (encrypted), vercelToken (encrypted), heartbeatInterval, etc.

---

## Task Execution Flow — Concrete Example

**User says (via Claude on phone):** "Tell my agents to deploy a public pricing calculator on Vercel"

1. Claude calls MCP tool `nova_run_task({ prompt: "Build and deploy a public pricing calculator on Vercel" })`
2. Nova API creates task record (status: `pending`), creates workspace at `/var/nova/workspaces/{userId}/{taskId}/`
3. Orchestrator agent is invoked. Its prompt includes the request + all agent profiles + instructions to decompose
4. Orchestrator (Claude Opus) reasons and decides:
   - **Atlas** (infrastructure): "Set up Next.js project, configure for Vercel deployment"
   - **Nova** (UX): "Design and build the pricing calculator UI"
   - **Pulse** (operations): "Test the build, verify deployment works"
5. Atlas subagent runs first: `npm init`, installs dependencies, creates `next.config.ts`, `vercel.json`
6. Nova subagent runs: creates React components for the calculator, styles them
7. Pulse subagent runs: `npm run build`, fixes any errors, runs the `deploy_to_vercel` tool
8. Orchestrator synthesizes: "Pricing calculator deployed to https://pricing-calc.vercel.app"
9. All agents update their state via `update_my_state` tool
10. Task marked `completed`, result stored
11. MCP returns result to Claude → user sees the answer on their phone
12. Dashboard shows the entire flow in the live log, agent cards reflect updated states

---

## EC2 Setup

**Instance:** Ubuntu 24.04 LTS on t3.medium (2 vCPU, 4GB RAM, ~$30/mo)
- Upgrade to t3.large if running multiple concurrent agent tasks

**Software stack on EC2:**
- Node.js 22 LTS (via nvm)
- PostgreSQL 16
- Caddy (auto-HTTPS reverse proxy)
- PM2 (process manager for Next.js)
- Git, npm, Docker (for agent tasks that need containers)

**Domain:** Point a domain (e.g., `nova.yourdomain.com`) to the EC2 elastic IP. Caddy auto-provisions Let's Encrypt HTTPS.

**Caddy config:**
```
nova.yourdomain.com {
    reverse_proxy localhost:3000
}
```

**PM2 config:**
```
pm2 start npm --name "nova" -- start
pm2 save
pm2 startup
```

**Deployment:** GitHub Actions workflow:
1. Push to `main`
2. SSH into EC2
3. `git pull && npm install && npm run build && pm2 restart nova`

---

## Implementation Phases

### Phase 1: Project Scaffold + Auth (Days 1-2)
**Files to create:**
- Initialize Next.js 15 project with TypeScript, Tailwind, shadcn/ui
- `src/lib/auth.ts` — NextAuth.js v5 with Google OAuth
- `src/lib/db/schema.ts` — Full Drizzle schema
- `src/lib/db/client.ts` — PostgreSQL connection
- `src/app/layout.tsx` — Root layout with dark mode + auth provider
- `src/app/login/page.tsx` — Login page
- `src/app/api/auth/[...nextauth]/route.ts` — Auth API route
- Database migrations

**Verify:** Can log in with Google, session persists, database tables created.

### Phase 2: Agent Core + Orchestrator (Days 3-5)
**Files to create:**
- `src/lib/agents/default-agents.ts` — 5 default agent definitions (ported from Nova Context Master.md)
- `src/lib/agents/agent-runtime.ts` — Single agent execution wrapper using Claude Agent SDK
- `src/lib/agents/orchestrator.ts` — Orchestrator function (decompose → delegate → synthesize)
- `src/lib/agents/tools.ts` — Custom MCP tools (update_my_state, read_team_state, etc.)
- `src/lib/db/seed.ts` — Seed default agents for new users
- `src/app/api/agents/route.ts` — Agent CRUD endpoints
- `src/app/api/tasks/route.ts` — Task creation + listing
- `src/app/api/tasks/[id]/stream/route.ts` — SSE streaming endpoint

**Verify:** POST a task via API, see Claude Agent SDK execute it, stream logs via SSE.

### Phase 3: Dashboard UI (Days 6-8)
**Files to create:**
- `src/components/dashboard/agent-card.tsx` — Agent status card
- `src/components/dashboard/agent-grid.tsx` — Grid layout
- `src/components/dashboard/task-panel.tsx` — Task input + list
- `src/components/dashboard/live-log.tsx` — Terminal-style streaming log
- `src/components/dashboard/workspace-explorer.tsx` — File tree
- `src/components/dashboard/agent-config-form.tsx` — Agent editor
- `src/components/dashboard/stats-bar.tsx` — System stats
- `src/components/layout/sidebar.tsx` — Navigation
- `src/app/dashboard/` — All dashboard pages

**Verify:** Full dashboard working — submit a task, watch live logs, see agent cards update.

### Phase 4: MCP Server + Heartbeat (Days 9-10)
**Files to create:**
- `src/lib/mcp/nova-server.ts` — MCP tool definitions
- `src/app/api/mcp/route.ts` — MCP Streamable HTTP endpoint
- `src/lib/agents/heartbeat.ts` — Heartbeat cycle logic
- `src/app/api/agents/heartbeat/route.ts` — Heartbeat API endpoint
- Systemd timer config for 6-hour heartbeat

**Verify:** Configure Nova as MCP server in Claude Desktop, trigger a task via natural language through Claude.

### Phase 5: EC2 Deployment (Days 11-12)
**Files to create:**
- `scripts/setup-ec2.sh` — Full EC2 provisioning script
- `scripts/deploy.sh` — Deployment script
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD
- Caddy config, PM2 config, systemd timer

**Verify:** App running on `https://nova.yourdomain.com`, auto-deploys on git push, heartbeat fires on schedule, MCP accessible from Claude on phone.

---

## What This Replaces

| Old (n8n) | New (Nova Platform) |
|-----------|-------------------|
| n8n webhook trigger | Next.js API routes + MCP server |
| n8n workflow routing | Claude Agent SDK orchestrator |
| n8n Network of Agents node | Claude subagents with custom personalities |
| Notion database | PostgreSQL (Drizzle ORM) |
| MongoDB agent memories | PostgreSQL agent_memories table |
| ChatGPT Custom GPT entry | MCP server (any Claude client) |
| Static HTML + Three.js | Next.js dashboard with shadcn/ui |
| No shared workspace | `/var/nova/workspaces/` filesystem |
| 6-hour n8n schedule | Systemd timer → API endpoint |

---

## Key Existing Files to Reference

- `ai_context/Nova Context Master.md` — Agent personalities, coordination model, workflow modes. Port agent definitions from here.
- `index.html` (lines 515-571) — Agent data structure (TEST_AGENTS). The new API should return compatible shape.
- `config.js` — Current webhook URL pattern and agent data format.
- `ai_context/user-context-and-preferences.md` — User's vision, preferences, and requirements for this project.

---

## Verification Plan

1. **Auth:** Log in with Google → redirected to dashboard → session persists on refresh
2. **Agent CRUD:** Create/edit/delete agents via dashboard UI → changes persist in database
3. **Task execution:** Submit "create a hello world index.html file" → watch live log → file appears in workspace explorer
4. **Multi-agent:** Submit "build a pricing calculator" → see orchestrator delegate to multiple agents → files created in workspace
5. **MCP:** Add Nova as MCP server in Claude Desktop → say "tell my agents to create a landing page" → task executes → result returns
6. **Heartbeat:** Manually trigger heartbeat → agents update their states → dashboard reflects changes
7. **Deployment:** Push to GitHub → GitHub Actions deploys to EC2 → changes live on domain

---

## Research Sources (February 2026)

- [Claude Agent SDK (TypeScript)](https://github.com/anthropics/claude-agent-sdk-typescript) — Anthropic's official agent SDK
- [Claude Agent SDK (Python)](https://github.com/anthropics/claude-agent-sdk-python) — Python alternative
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless) — Non-interactive CLI execution
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — Anthropic's agent design guidance
- [Anthropic Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) — How Anthropic builds multi-agent systems
- [MCP Protocol](https://platform.claude.com/docs/en/agent-sdk/mcp) — Model Context Protocol for tool integration
- [Claude Code as MCP Server](https://www.ksred.com/claude-code-as-an-mcp-server-an-interesting-capability-worth-understanding/) — Exposing Claude Code tools via MCP
- [Filesystems as AI Agent Substrate](https://blog.duvo.ai/why-filesystems-are-the-natural-execution-substrate-for-ai-agents) — Why agents work best with real files
- [NextAuth.js v5 + Vercel Deployment](https://next-auth.js.org/deployment) — Auth setup guide
