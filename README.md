<p align="center">
  <img src="frontend/public/logo.svg" alt="Aya Shield Logo" width="120" />
</p>

<h1 align="center">Aya Shield</h1>

<p align="center">
  <strong>AI-Powered Transaction Firewall & Smart Receipt System</strong><br/>
  Protecting crypto users from scams, one transaction at a time.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/python-3.12-blue" alt="Python" />
  <img src="https://img.shields.io/badge/next.js-15-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/gemini-2.0_flash-orange" alt="Gemini" />
</p>

---

## The Problem

Crypto users lose **$5.6 billion every year** to scams and malicious transactions. The problem is real:

- **68% of wallet drains** happen through malicious token approvals that users sign without understanding
- **4 out of 10 tokens** on DEXes are honeypots — you can buy but can't sell
- **The average victim recovers $0** because blockchain transactions are irreversible

Current wallets show raw transaction data that nobody can read. Users click "Confirm" and hope for the best. Aya Shield changes that.

## The Solution

Aya Shield is an **AI-powered security layer** that sits between you and your transactions. Before you sign anything, Aya Shield:

1. **Decodes the transaction** into plain English ("This will approve UNLIMITED USDC spending to an unknown contract")
2. **Scores the risk** (0-100) using on-chain analysis, scam databases, and contract behavior patterns
3. **Explains what will happen** in simple words using Google Gemini AI
4. **Warns you** if something looks suspicious — before your funds are at risk

It also generates **visual receipts** for completed transactions and can **scan your wallet** for risky approvals that should be revoked.

## Features

### Transaction Guard
Paste any pending transaction to get a full risk analysis before signing. The AI decodes calldata, identifies the function being called, checks if the target has been flagged, and rates the risk.

### Contract Analyzer
Deep-dive into any smart contract. Aya Shield checks source code verification status, bytecode patterns (honeypot indicators, proxy patterns, self-destruct), and cross-references against known scam databases.

### Smart Receipts
Beautiful, shareable SVG receipt cards for completed transactions. Shows what happened, what it cost, and what events were emitted — all in a visual format you can save or share.

### Emergency Revoke
One-click scan of all your token approvals across chains. Flags unlimited or risky approvals and generates the revoke transactions you need to submit to clean up.

### AI Chat Assistant
Ask security questions in plain English. "Is this contract safe?" "What does this approval mean?" The Gemini-powered assistant answers using your transaction context.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│                  │     │                      │     │                 │
│   Next.js 15     │────▶│   FastAPI Backend     │────▶│   Blockchain    │
│   Frontend       │     │                      │     │   (EVM RPCs)    │
│                  │◀────│   - Shield Service    │◀────│                 │
│  - Dashboard     │     │   - AI (Gemini)       │     │  - Ethereum     │
│  - Analyze       │     │   - Risk Scoring      │     │  - Polygon      │
│  - Receipts      │     │   - Contract Analysis │     │  - Arbitrum     │
│  - Emergency     │     │   - Receipt Gen       │     │  - Base         │
│                  │     │   - Approval Scanner  │     │  - Optimism     │
└────────┬─────────┘     └──────────┬───────────┘     └─────────────────┘
         │                          │
         │                          │
         ▼                          ▼
┌─────────────────┐     ┌──────────────────────┐
│                  │     │                      │
│   Supabase       │     │   External APIs      │
│   - Auth (JWT)   │     │   - Etherscan        │
│   - PostgreSQL   │     │   - Google Gemini    │
│   - RLS Policies │     │   - Infura/Alchemy   │
│                  │     │                      │
└─────────────────┘     └──────────────────────┘
```

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **AI** | Google Gemini 2.0 Flash | Fast, accurate intent parsing and natural language explanations |
| **Backend** | Python + FastAPI | Async, type-safe, auto-documented API |
| **Frontend** | Next.js 15 + React 19 | Server components, middleware auth guards, fast navigation |
| **Database** | Supabase (PostgreSQL) | Auth, RLS, real-time — no custom auth server needed |
| **Styling** | Tailwind CSS | Consistent dark theme with custom design tokens |
| **Blockchain** | httpx + eth-abi | Lightweight async RPC calls without full node dependencies |
| **Cache** | Redis | Rate limiting and response caching |
| **Deploy** | Docker Compose | One command to run everything |

## Quick Start

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key
- An [Infura](https://infura.io) or [Alchemy](https://alchemy.com) API key

### 1. Clone and Install

```bash
git clone https://github.com/your-username/aya-shield.git
cd aya-shield

# Backend
cd backend
uv sync
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Set Up the Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migration file: `database/migrations/001_initial.sql`

This creates 5 tables with Row Level Security:

| Table | Purpose |
|---|---|
| `profiles` | User profiles (extends Supabase auth.users) |
| `shield_events` | Audit log for every analysis, receipt, and revoke |
| `approvals` | Cached token approvals per wallet |
| `scam_reports` | Aggregated scam report data |
| `receipts` | Generated receipt card records |

### 3. Configure Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
INFURA_KEY=your-infura-key
ETHERSCAN_API_KEY=your-etherscan-key
```

**Frontend** — copy `frontend/.env.local.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run

**Option A — Local development (two terminals):**

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

**Option B — Docker (everything in one command):**

```bash
npm run docker:up
```

Open [http://localhost:3000](http://localhost:3000) and create an account to start.

## API Reference

All endpoints are at `http://localhost:8000/api/v1`. Interactive docs at `/api/docs` when `DEBUG=true`.

### Shield

| Endpoint | Method | Description |
|---|---|---|
| `/shield/analyze-transaction` | POST | Decode + risk-score a transaction before signing |
| `/shield/analyze-contract` | POST | Deep analysis of a smart contract |
| `/shield/generate-receipt` | POST | Generate visual SVG receipt for a completed tx |
| `/shield/emergency-revoke` | POST | Scan wallet for risky approvals + build revoke txs |
| `/shield/status` | POST | Shield status for a specific wallet |
| `/shield/status/me` | GET | Dashboard stats for the authenticated user |
| `/shield/chat` | POST | AI security assistant |

### Auth

| Endpoint | Method | Description |
|---|---|---|
| `/auth/signup` | POST | Create account (email + password) |
| `/auth/login` | POST | Sign in, receive JWT tokens |
| `/auth/refresh` | POST | Refresh an expired access token |

### Health

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | `{ "status": "healthy" }` |

## Project Structure

```
aya-shield/
├── backend/                    # Python FastAPI API
│   ├── app/
│   │   ├── main.py             # App entry point
│   │   ├── config.py           # Environment settings
│   │   ├── api/routes/         # HTTP route handlers
│   │   ├── db/                 # Supabase client
│   │   ├── middleware/         # Auth + rate limiting
│   │   ├── models/             # Pydantic schemas
│   │   └── services/           # Business logic
│   │       ├── ai/             # Gemini AI integration
│   │       ├── chains/         # Blockchain RPC providers
│   │       ├── security/       # Risk scoring + scam detection
│   │       ├── receipt/        # SVG receipt generation
│   │       └── revoke/         # Approval scanning
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
│
├── frontend/                   # Next.js 15 web app
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── auth/           # Login + Signup
│   │   │   └── dashboard/      # Protected dashboard pages
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client + Supabase
│   │   └── types/              # TypeScript interfaces
│   ├── middleware.ts            # Auth route protection
│   ├── public/                 # Logo, favicon, poster
│   ├── Dockerfile
│   └── .env.local.example
│
├── database/                   # Supabase SQL migrations
│   └── migrations/
│       └── 001_initial.sql     # Tables, RLS, indexes, triggers
│
├── docker-compose.yml          # Backend + Frontend + Redis
├── package.json                # Root scripts (dev, docker)
└── .env.example                # Root env template
```

## Security

- **No wallet access**: Aya Shield never asks for your private key or seed phrase. It only reads public on-chain data.
- **JWT authentication**: All API endpoints require a valid Supabase JWT token.
- **Row Level Security**: Every database table has RLS — users can only access their own data.
- **Rate limiting**: SlowAPI protects against abuse (configurable per-minute limit).
- **CORS**: Configured to only allow requests from the frontend origin.
- **Input validation**: All requests validated through Pydantic v2 models.

## Supported Chains

| Chain | Status |
|---|---|
| Ethereum | Supported |
| Polygon | Supported |
| Arbitrum | Supported |
| Base | Supported |
| Optimism | Supported |
| BSC | Supported |
| Avalanche | Supported |

## Development

```bash
# Backend lint + format
cd backend
uv run ruff check app/
uv run ruff format app/

# Frontend lint
cd frontend
npm run lint

# Run everything with Docker
docker compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by <strong>Suyash Kumar Singh</strong><br/>
  <em>Because your crypto should be safe by default.</em>
</p>
