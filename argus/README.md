# ARGUS - Autonomous Business Intelligence Assistant

ARGUS is a multi-agent autonomous system that operates as a **Chief-of-Staff digital**. It researches business opportunities, analyzes markets, automates operational tasks, monitors finances, and coordinates specialized AI agents — all running locally with Ollama.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  INTERFACE LAYER                     │
│   REST API (Express)  │  Telegram Bot  │  Dashboard  │
├─────────────────────────────────────────────────────┤
│                 AUTOMATION LAYER                     │
│   BullMQ Queue  │  Workers  │  Scheduler (cron)     │
├─────────────────────────────────────────────────────┤
│                INTELLIGENCE LAYER                    │
│   Orchestrator  │  Planner  │  PolicyGuard           │
│   ResearchAgent │ SupplierAgent │ SalesAgent         │
│   FinanceAgent  │ CryptoAgent   │ StrategyAgent      │
├─────────────────────────────────────────────────────┤
│                    DATA LAYER                        │
│   PostgreSQL  │  Redis  │  ChromaDB (vector memory)  │
└─────────────────────────────────────────────────────┘
```

## Agents

| Agent | Description |
|-------|-------------|
| **ResearchAgent** | Market research, competitor analysis, opportunity scanning |
| **SupplierAgent** | Supplier search, vendor evaluation, price comparison |
| **SalesAgent** | Sales analysis, lead scoring, forecasting, pricing |
| **FinanceAgent** | Financial analysis, cash flow, budgets, profitability |
| **CryptoAgent** | Crypto market monitoring, token analysis, DeFi scanning |
| **StrategyAgent** | Executive reports, SWOT analysis, strategic planning |

## Autonomy Loop

ARGUS runs an autonomous cycle: **Observe → Think → Plan → Act → Evaluate → Learn**

Scheduled tasks:
- **Every 30 min** — Market monitoring
- **Every 4 hours** — Trend & competition analysis
- **Daily at 8 AM** — Executive reports & briefings
- **Every 2 hours** — Full autonomy loop

## Quick Start with Docker

```bash
# 1. Clone and enter the project
cd argus

# 2. Copy environment file
cp .env.example .env
# Edit .env with your settings (Telegram token, etc.)

# 3. Start all services
docker compose up -d

# 4. Pull AI models (run once)
docker exec argus-ollama ollama pull llama3.1
docker exec argus-ollama ollama pull nomic-embed-text

# 5. Verify
curl http://localhost:4000/health
```

Services will be available at:
- **API**: http://localhost:4000
- **Dashboard**: http://localhost:4001
- **Ollama**: http://localhost:11434

## Local Development (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7
- Ollama (with llama3.1 model)
- ChromaDB (optional, for vector memory)

```bash
# 1. Install dependencies
cd argus && npm install
cd dashboard && npm install && cd ..

# 2. Start infrastructure
# Make sure PostgreSQL, Redis, and Ollama are running

# 3. Pull models
ollama pull llama3.1
ollama pull nomic-embed-text

# 4. Run setup
npm run setup

# 5. Start the API server
npm run dev

# 6. (In another terminal) Start workers
npm run workers

# 7. (In another terminal) Start dashboard
npm run dashboard
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List all registered agents |
| `GET` | `/api/tasks` | List recent tasks |
| `GET` | `/api/opportunities` | List business opportunities |
| `POST` | `/api/task` | Submit a new task |
| `POST` | `/api/agents/:name/execute` | Execute an agent directly |
| `POST` | `/api/autonomy` | Trigger autonomy loop |
| `GET` | `/api/insights` | Get recent insights |
| `GET` | `/api/search?q=query` | Semantic search across memory |
| `GET` | `/health` | Health check |

## Usage Examples

### Research a market
```bash
curl -X POST http://localhost:4000/api/agents/research/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "market_research",
    "params": { "type": "market_research", "topic": "AI SaaS in Latin America" }
  }'
```

### Get crypto market overview
```bash
curl -X POST http://localhost:4000/api/agents/crypto/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "market_monitor",
    "params": { "type": "monitor", "tokens": "BTC, ETH, SOL" }
  }'
```

### Submit a task to the queue
```bash
curl -X POST http://localhost:4000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "type": "research",
    "action": "Find emerging e-commerce trends",
    "params": { "type": "opportunity_scan", "domain": "e-commerce" }
  }'
```

### Generate a daily report
```bash
curl -X POST http://localhost:4000/api/agents/strategy/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "daily_briefing",
    "params": { "type": "daily_briefing" }
  }'
```

### Trigger the full autonomy loop
```bash
curl -X POST http://localhost:4000/api/autonomy
```

## Telegram Bot

Set `TELEGRAM_BOT_TOKEN` in `.env` and start the bot:

```bash
npm run bot
```

Commands:
- `/agents` — List active agents
- `/tasks` — View recent tasks
- `/opportunities` — View opportunities
- `/research <topic>` — Start research on a topic
- `/crypto` — Crypto market status
- `/report` — Generate daily report
- `/status` — System status

## Security

- **PolicyGuard** blocks dangerous shell commands (`rm`, `sudo`, `shutdown`, `reboot`)
- Shell commands run inside a sandboxed Docker container (when `SHELL_SANDBOX=true`)
- Input sanitization removes shell metacharacters
- All operations are logged and auditable

## Project Structure

```
argus/
├── index.js                 # Entry point
├── core/
│   ├── orchestrator.js      # Agent coordinator & autonomy loop
│   ├── planner.js           # AI-powered task planner
│   ├── policy-guard.js      # Security policy enforcement
│   ├── llm-client.js        # Ollama LLM interface
│   └── logger.js            # Winston logger
├── agents/
│   ├── base-agent.js        # Base class for all agents
│   ├── research-agent.js    # Business research
│   ├── supplier-agent.js    # Supplier management
│   ├── sales-agent.js       # Sales intelligence
│   ├── finance-agent.js     # Financial analysis
│   ├── crypto-agent.js      # Crypto markets
│   └── strategy-agent.js    # Strategic planning
├── queue/
│   ├── queue.js             # BullMQ task queue
│   ├── browser-worker.js    # Web scraping worker
│   ├── shell-worker.js      # Shell command worker
│   └── api-worker.js        # External API worker
├── memory/
│   ├── memory-manager.js    # Unified memory (PG + Redis + Chroma)
│   └── vector-store.js      # ChromaDB vector storage
├── scheduler/
│   └── scheduler.js         # Cron-based task scheduler
├── tools/
│   ├── browser.js           # Puppeteer web scraper
│   ├── shell.js             # Sandboxed shell execution
│   └── search.js            # Web search tool
├── api/
│   └── routes.js            # Express REST API
├── bot/
│   └── telegram-bot.js      # Telegram notifications bot
├── dashboard/               # Next.js web dashboard
├── scripts/
│   └── setup.js             # Initial setup script
├── docker-compose.yml       # Full stack Docker setup
├── Dockerfile
├── .env.example
└── package.json
```

## License

MIT
