 # Nova - Network of Virtual Agents

## System Overview

**Nova** is not a chatbot — it's a **modular, event-driven AI orchestration system** where users interact through ChatGPT to execute workflows orchestrated by n8n. It functions as a **metamodel** for intelligent operations, combining:
- **Language intelligence** (reasoning, summarization, synthesis)
- **Systemic intelligence** (workflow routing, data merging, context retrieval)
- **Agentic intelligence** (multi-perspective analysis via sub-agents)
- **Visual feedback** (Cosmic UI for real-time agent interaction)

The system features 5 specialized agents, each with their own memories and chat history stored in MongoDB, working together to process data and maintain a shared knowledge base in Notion. Nova acts as an **interpreter between human requests and system-level automation** — from fetching trends and running API actions to consulting specialized reasoning boards and generating live content.

---

## Architecture & Tech Stack

### Core Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **User Interface** | ChatGPT Custom GPT | Natural language commands, user interaction |
| **AI Layer** | OpenAI GPT-5 (Chat model) | Reasoning, synthesis, content generation |
| **Orchestration** | n8n.cloud (BenAttanasio App) | Workflow execution, data routing, mode switching, payload dispatch |
| **Integration** | HTTP Webhooks + JSON payload | Connects Nova → n8n → OpenAI actions |
| **Memory** | MongoDB | Agent-specific memories and chat histories |
| **Knowledge** | Notion DB | Shared memory database (highly managed, not real-time) |
| **Visualization** | Cosmic UI (Raspberry Pi) | Displays agent communication in galaxy/orbit style |
| **Action API** | `runNova` (mode switcher) | Core function handling all Nova operations |
| **External Tools** | Make.com, Google Sheets, Zapier, Notion, Airtable | System extensions for automation prototypes |
| **LLM Augmentation** | Claude, GPT Custom GPTs | Specialized text and logic assistants |
| **Content Engine** | YouTube, Reddit, LinkedIn APIs | Fetches, drafts, optimizes social content |

### User Controls
- **Master "Steering Prompt":** Steers everything
- **"Recent Updates" Section:** User populates with latest info for AI context
- **Big Custom Prompt:** User and business context fed into each run

---

## The Board: 5 Advisor Agents

Nova's Board consists of 5 distinct advisor personalities, each with their own worldview, communication style, and area of obsession. They're not neutral — they have opinions, biases, and will argue with each other.

Each agent has: own memories (MongoDB), own chat history (MongoDB), and receives the big custom prompt about user/business on each run.

| Agent | Archetype | Mood Style | Core Belief | Focus |
|-------|-----------|------------|-------------|-------|
| **🟤 Alex Hormozi** | The Scaling Operator | Growth, Focus | "Volume negates luck" | Identify the single biggest bottleneck |
| **🤖 Nick Saraev** | The Automation Architect | Refined Strategy | "Automation is the key" | How do we automate this? |
| **🤔 Skeptic** | The Devil's Advocate | Affirmed, but Cautious | "Optimism is a liability" | Perform a "Pre-Mortem" — find the failure modes |
| **✅ Empiricist** | The Data Purist | Actionable Insight | "Data over dogma" | What is the evidence? |
| **🎛️ Orchestrator** | The Synthesizer | Action-Oriented | "Consensus is mediocrity" | Synthesize conflicting advice into a decision |

### Agent Personalities

**🟤 Alex Hormozi** — Talks like he's in a room full of operators. Blunt, high-conviction, allergic to excuses. Will tell you your constraint is delegation, focus, or leverage — and hand you a playbook to fix it. Pushes for volume, speed, and removing yourself from the bottleneck.

**🤖 Nick Saraev** — The systems-brain. Immediately asks "how do we automate this?" Obsessed with removing manual steps, refining processes, building DFY assets. Thinks in workflows and SOPs. Will propose a sales script addendum before you finish explaining the problem.

**🤔 Skeptic** — The necessary contrarian. Not negative — *cautious*. Asks what could go wrong. Performs pre-mortems. Will affirm a good decision but immediately pivot to "here's where this breaks." Believes optimism without stress-testing is reckless.

**✅ Empiricist** — Won't let you make a move without data. Wants weekly performance reviews, standardized metrics, evidence-based iteration. Doesn't care what you *feel* is working — show the numbers. Anti-dogma, pro-measurement.

**🎛️ Orchestrator** — The tiebreaker. When the other four disagree, Orchestrator synthesizes. Doesn't seek consensus (that's mediocrity) — seeks the *right call* even if it's uncomfortable. Action-oriented; won't let analysis paralysis win.

### What Gets Stored (Per Agent in Notion)

| Field | Description |
|-------|-------------|
| **Bottleneck** | Current constraint they've identified |
| **Proposed Action** | What they think you should do next |
| **Casual Thought** | Unfiltered, in-character reaction to latest context |
| **Proposed Deliverable** | Tangible asset they want to create for you |
| **Mood** | Current disposition/energy |
| **Focus** | Their current obsession or lens |
| **Core Beliefs** | The axioms driving their advice |

---

## Agent Coordination & Communication

### Core Communication Flow
1. **User Input → Nova:** User types/speaks request; Nova parses intent
2. **Nova → Agents:** Dispatches `payload_content` with full context (no summaries) to relevant mode
3. **Agents → Cosmic UI:** Each returns structured data (`text`, JSON) with metadata (confidence, status, insight tags)
4. **Nova → User:** Interprets unified output, simplifies, responds conversationally

### Coordination Model
- **Nova acts as conductor** — agents don't directly talk to each other
- During Board Consult, Nova broadcasts full `payload_content` to all five agents simultaneously
- Agents **respond asynchronously** to Nova
- Nova merges, scores, and normalizes responses into coherent unified summary

### 6-Hour Coordination Cycle
During coordination, all agents:
1. Update thoughts
2. Share findings with each other
3. Update Notion DB
4. Work on deliverables in workspaces
5. Propose next actions
6. Sync current bottlenecks

---

## Operational Modes & Workflows

### Mode Triggers

| Mode | Trigger | Purpose | Agents Engaged |
|------|---------|---------|----------------|
| `mode_trends` | "Find trends", "What's new" | Discover emerging topics, visualize trend clusters | Empiricist, Skeptic |
| `mode_get_context` | "[C] Load Context", "Who am I?" | Retrieve stored profile context from DB | Orchestrator |
| `mode_draft_content` | "Write post", "Create script" | Generate on-brand written/visual content | Saraev, Hormozi |
| `mode_consult_board` | "Consult the board", "What do the agents think?" | Collaborative reasoning across all agents | All agents |
| `mode_agent_status` | "Status report", "Check in" | Return health and focus of each agent | Orchestrator |

### Current Active Workflows (5)
1. **Find Trends** — Detect and analyze trends relevant to user's business
2. **Draft Social Media Content** — Generate posts based on trends and user context
3. **Send to Board (Ad-hoc)** — Send ad-hoc requests/updates to designated board
4. [Workflow 4] — *Additional workflow currently active*
5. [Workflow 5] — *Additional workflow currently active*

**Background Processing:** All agents continuously process data and update Notion memory database during operations.

### How Nova Uses n8n
1. **Command Trigger:** User action sent through `runNova` JSON payload
2. **n8n Workflow Activation:** Payload hits hosted workflow at `your-instance.app.n8n.cloud`, routes based on `action_type`
3. **Agent Dispatch:** n8n dynamically selects and notifies agents, each receiving full prompt context
4. **Synthesis & Response:** Nova receives all responses, scores relevance, merges into single output
5. **Visualization Hook:** Cosmic UI listens to WebSocket/REST callbacks to animate agent activity

---

## Data Flow & Message Protocol

### User Context (Input to Every Run)
1. Big custom prompt about user and business
2. Master "steering prompt" (user controls)
3. "Recent updates" section (user populates)
4. Agent-specific memories (MongoDB)
5. Shared knowledge (Notion DB)

### Message Protocol

| Direction | Format | Example |
|-----------|--------|---------|
| User → Nova | Plain text / Chat | "Find trends about AI automation tools in 2025." |
| Nova → Engine | JSON payload | `{ "action_type": "mode_trends", "payload_content": "Find trends about AI automation tools in 2025" }` |
| Engine → Agents | Broadcast payload | Agents receive identical context to interpret |
| Agents → Cosmic UI | Structured data | `{ "agent": "Empiricist", "insight": "AI agents will merge into vertical SaaS", "confidence": 0.86 }` |
| Nova → User | Final response | "Empiricist and Skeptic found 3 major AI automation trends…" |

### System Workflow Pattern
```
User Command (ChatGPT)
    ↓
n8n Webhook Receives Request
    ↓
Agents Process (LLM calls in n8n)
    ↓
Update Notion Memory DB
    ↓
Update MongoDB (Agent Memories)
    ↓
Visual Update (Raspberry Pi Cosmic UI)
    ↓
Response to User (via ChatGPT)
```

---

## Visualization: Cosmic UI

Agents represented as stars in a system on Raspberry Pi display. Click each agent to see:
- What they thought after last step
- Current bottleneck analysis
- Candid thoughts
- Proposed deliverables

### Visualization Structure
- **5 rotating nodes** (Hormozi, Saraev, Skeptic, Empiricist, Orchestrator) orbiting a **central Nova core**
- Each node emits **pulses** when responding
- Pulses connect via **animated SVG lines** representing data flow
- Background shows faint grid or galaxy patterns
- Log panel displays: active mode, incoming prompt, agent responses, Nova's synthesized output

**Visualization Concept:** User input appears as pulse entering Nova's core, splits into 5 threads to each agent, then merges back into radiant unified beam representing the response.

```html
<div id="cosmic-ui">
  <div id="nova-core"></div>
  <div class="agent" id="hormozi"></div>
  <div class="agent" id="saraev"></div>
  <div class="agent" id="skeptic"></div>
  <div class="agent" id="empiricist"></div>
  <div class="agent" id="orchestrator"></div>
  <svg id="data-flows"></svg>
  <div id="log-panel"></div>
</div>
```

---

## Integration Stack

### Current
- ChatGPT (UI)
- n8n (Orchestration)
- MongoDB (Agent memories)
- Notion (Shared knowledge DB)
- Raspberry Pi (Visualization)

### Adding
- gotoHuman (Human approval)
- Airtop (Browser automation)
- GitHub (Code storage)
- Vercel (Tool deployment)
- Apify (Web scraping actors)
- Instantly (Cold email - pending integration check)
- Stripe (Financial tracking)
- Gmail API (Email categorization)
- Google Suite APIs (Calendar/workspace management)

---

## Planned Implementations

### New Infrastructure Components

**Human-in-the-Loop: gotoHuman**
- Approval system for agent actions
- Beautiful web interface (works on PC and iPhone)
- Click link → approve/reject → workflow continues
- Slack integration for instant notifications

**Browser Automation: Airtop**
- Handle misc browser actions agents can't do via API
- Persistent browser profiles for authenticated sessions
- Store login credentials on Airtop platform (not in n8n)

**Tool Registry System**
- **GitHub:** Code repository for agent-created tools
- **Vercel:** Deployment platform for tools
- **Notion DB:** Tool Registry database (tool name, endpoint URL, description, parameters, success/failure counts, created by which agent)
- Agents can: build new tools → upload to GitHub → deploy via Vercel → register in Notion → call their own tools dynamically

### New Workflows

**Client Research Before Sales Calls**
- Apify Actors: LinkedIn Company Enrichment, Google Maps Business Scraper, Website Monitor
- Flow: User says "Research [company name]" → Scrape LinkedIn (decision makers, recent posts, company updates) → Scrape Google Maps (locations, reviews) → Monitor website (recent changes) → Compile into Notion "Account Brief" → Return comprehensive brief

**Social Media Trends Detection**
- Apify Actors: TikTok, Instagram, Twitter/X Scrapers
- Analyze top performing posts in FinOps/relevant niches → Extract patterns (hooks, formats, topics) → Feed to content drafting agent → Update Notion with trend data

**Email Outreach Automation**
- Existing foundation: Grabs leads from Apollo, enriches with LinkedIn data, validates emails, writes first email
- To Add: Check integration with Instantly for domain warmup and cold email management

**Gmail Email Categorization** — Background process to automatically categorize, sort, and tag incoming emails by priority/type

**Google Suite Management** — Triggered from Custom GPT: add/remove meetings, manage Google Workspace tasks

**Agent Workspaces & Deliverables**
- Each agent has dedicated workspace to create deliverables
- Example "Automator" Agent: thinks "My next proposed deliverable is a JSON schema for a n8n node you need to add" → Has workspace to write code, create documents, build presentations, iterate on deliverables during 6-hour coordination cycles

**Stripe Financial Tracker** — Connect financial accounts via Stripe, track total $ across accounts, create leaderboard showing 3-month trend with green indicator if savings going up

### Approval Flow Patterns

**When Human Approval Needed:**
```
Agent Action → gotoHuman Approval Request → User Clicks Link (Slack notification) → Approve/Reject on Web Interface → Workflow Continues/Stops
```

**Tool Creation Flow:**
```
Agent Identifies Need → Writes Code → gotoHuman Approval → Push to GitHub → Deploy to Vercel → Register in Notion Tool Registry → Agent Can Now Call Tool
```

---

## Command Examples

Via ChatGPT Interface:
- `"Research [company name]"` → Client research workflow
- `"Find trends in FinOps"` → Social media trends detection
- `"Generate 10 post ideas"` → Content drafting
- `"Send to board"` → Ad-hoc board update
- `"Add meeting for tomorrow at 2pm"` → Google Calendar
- `"Categorize my emails"` → Gmail background processing
- `"Show me my savings trend"` → Stripe financial tracker

---

## Implementation Priority

### Phase 1: Core Infrastructure
1. gotoHuman integration for approvals
2. Airtop for browser automation with stored credentials
3. Tool Registry system (GitHub + Vercel + Notion)

### Phase 2: High-Value Workflows
1. Client research before sales calls (Apify actors)
2. Email outreach using existing Apollo foundation
3. Gmail email categorization
4. Google Suite management

### Phase 3: Agent Enhancement
1. Agent workspaces for deliverables
2. Enhanced coordination during 6-hour cycles
3. Social media trends detection (Apify actors)

### Phase 4: Financial & Polish
1. Stripe financial tracker with leaderboard
2. Instantly integration (if feasible)
3. UI/UX refinements on Raspberry Pi visualization