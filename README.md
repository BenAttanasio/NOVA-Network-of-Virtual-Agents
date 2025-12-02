# Agent Constellation

A beautiful 3D visualization of your AI agents as stars orbiting a central point. Click on any agent star to zoom in and view their current status, thoughts, and focus areas.

![Agent Constellation Preview](preview.png)

## Features

- 🌟 5 agent stars with distinct colors orbiting in 3D space
- 👁️ Toggle agent name labels
- 🔍 Smooth zoom animation when selecting an agent
- 📱 Mobile-friendly detail panel
- 🔄 Webhook integration with n8n + Notion
- ✨ Beautiful bloom effects and particle system

## Quick Start

### Local Development

1. Clone the repo
2. Copy `config.template.js` to `config.js`
3. Open `index.html` in a browser (or use a local server)

The app works with test data out of the box.

### With Live Data (n8n + Notion)

1. Set up your Notion database with these properties:
   - Name (title)
   - Bottleneck (text)
   - Proposed Action (text)
   - Casual Thought (text)
   - Proposed Deliverable (text)
   - Mood (select: focused, curious, cautious, optimistic, determined)
   - Focus (text)
   - Core Beliefs (text)

2. Create an n8n workflow:
   ```
   Webhook (POST) → Notion Query → Respond to Webhook
   ```

3. Update `config.js` with your webhook URL

## Deployment to Vercel

### Option 1: Static Deployment (Simplest)

Since this is a static HTML/JS app, you can deploy directly:

```bash
npm i -g vercel
vercel
```

### Option 2: With Environment Variables (Recommended)

For production, use environment variables instead of hardcoded URLs:

1. Create `vercel.json`:
```json
{
  "buildCommand": "node build.js",
  "outputDirectory": "dist"
}
```

2. Create `build.js`:
```javascript
const fs = require('fs');

// Read template
let html = fs.readFileSync('index.html', 'utf8');
let config = fs.readFileSync('config.template.js', 'utf8');

// Replace placeholders with env vars
config = config.replace(
  'YOUR_N8N_WEBHOOK_URL_HERE',
  process.env.WEBHOOK_FETCH_URL || 'YOUR_N8N_WEBHOOK_URL_HERE'
);

// Create dist folder
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
fs.writeFileSync('dist/config.js', config);
```

3. Set environment variables in Vercel dashboard:
   - `WEBHOOK_FETCH_URL`: Your n8n webhook URL

## n8n Webhook Setup

### Fetch Agents Workflow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Webhook   │───▶│ Notion Query │───▶│ Respond to      │
│   (POST)    │    │ Database     │    │ Webhook (JSON)  │
└─────────────┘    └──────────────┘    └─────────────────┘
```

**Webhook Node Settings:**
- HTTP Method: POST
- Response Mode: Last Node

**Notion Node Settings:**
- Operation: Get Many
- Database: Your agents database

**Respond to Webhook Node:**
- Response Body: 
```json
{
  "agents": {{ $json }}
}
```

### Expected Response Format

```json
{
  "agents": [
    {
      "id": 1,
      "name": "Atlas",
      "bottleneck": "Waiting on API rate limits",
      "proposedAction": "Implement request queuing",
      "casualThought": "I wonder if we could batch these...",
      "proposedDeliverable": "Optimized API module",
      "mood": "focused",
      "focus": "Backend Infrastructure",
      "coreBeliefs": "Reliability over speed."
    }
  ]
}
```

## Customization

### Colors

Edit the `agentColors` array in `index.html`:

```javascript
const agentColors = [
    [0.6, 0.85, 1.0],   // Cyan
    [1.0, 0.8, 0.9],    // Pink
    [0.8, 1.0, 0.85],   // Mint
    [1.0, 0.9, 0.7],    // Warm
    [0.85, 0.75, 1.0],  // Lavender
];
```

### Mood Emojis

Edit the `MOOD_EMOJIS` object:

```javascript
const MOOD_EMOJIS = {
    focused: "🎯",
    curious: "🔮",
    cautious: "🛡️",
    optimistic: "✨",
    determined: "💫",
    default: "🌟"
};
```

### Particle Count

Adjust `TOTAL_PARTICLES` for performance:

```javascript
const TOTAL_PARTICLES = 2000; // Lower for mobile
```

## File Structure

```
agent-constellation/
├── index.html          # Main app
├── config.js           # Your webhook URLs (gitignored)
├── config.template.js  # Template for config
├── .gitignore
└── README.md
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires WebGL support.

## License

MIT