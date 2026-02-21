# Aya Shield — Backend API

AI-Powered Transaction Firewall & Smart Receipt API built with FastAPI and Google Gemini.

## Overview

The backend is a Python FastAPI service that powers all of Aya Shield's security features. It analyzes blockchain transactions and smart contracts in real-time using AI, generates visual receipts, scans for risky token approvals, and provides a conversational security assistant.

## Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Async web framework with auto-generated OpenAPI docs |
| **Google Gemini 2.0 Flash** | AI-powered intent parsing, risk explanation, chat |
| **Supabase** | PostgreSQL database + Auth (JWT) + Row Level Security |
| **httpx** | Async HTTP client for blockchain RPC & external APIs |
| **Web3.py / eth-abi** | Ethereum ABI decoding and transaction data parsing |
| **Redis** | Caching layer for rate limiting via SlowAPI |
| **Pydantic v2** | Request/response validation and settings management |
| **uv** | Fast Python package manager and runner |

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, lifespan, middleware, routes
│   ├── config.py               # Pydantic Settings (all env vars)
│   ├── api/
│   │   ├── deps.py             # Dependency injection (CurrentUser auth)
│   │   └── routes/
│   │       ├── auth.py         # Signup, login, refresh
│   │       ├── health.py       # Health check endpoint
│   │       └── shield.py       # All shield endpoints (8 routes)
│   ├── db/
│   │   └── supabase.py         # Supabase client init + event logging
│   ├── middleware/
│   │   ├── auth.py             # JWT verification middleware
│   │   └── rate_limit.py       # SlowAPI rate limiter
│   ├── models/
│   │   └── schemas.py          # All Pydantic request/response models
│   └── services/
│       ├── shield.py           # ShieldOrchestrator (main service)
│       ├── ai/
│       │   └── gemini.py       # Gemini AI service for intent/explanation
│       ├── chains/
│       │   ├── base.py         # Abstract BaseChainProvider
│       │   ├── evm.py          # EVMProvider (JSON-RPC + Etherscan)
│       │   └── abi_database.py # Known selectors, contracts, labels
│       ├── security/
│       │   ├── contract_analyzer.py  # Contract + Transaction analysis
│       │   ├── risk_scoring.py       # Risk/trust score calculation
│       │   └── scam_database.py      # Known scam addresses + bytecode
│       ├── receipt/
│       │   ├── generator.py    # Receipt data assembly
│       │   └── svg_template.py # SVG visual receipt card template
│       └── revoke/
│           └── scanner.py      # Approval scanner + batch revoke builder
├── Dockerfile
├── pyproject.toml
├── .env.example
└── .python-version             # Python 3.12
```

## API Endpoints

All routes are prefixed with `/api/v1`.

### Shield Endpoints (`/api/v1/shield`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/analyze-transaction` | Decode and risk-score a transaction before signing | Yes |
| `POST` | `/analyze-contract` | Deep analysis of a smart contract's trustworthiness | Yes |
| `POST` | `/generate-receipt` | Generate a visual SVG receipt for a completed transaction | Yes |
| `POST` | `/emergency-revoke` | Scan a wallet for risky token approvals and build revoke txs | Yes |
| `POST` | `/status` | Shield status check for a specific wallet/chain | Yes |
| `GET`  | `/status/me` | Dashboard overview — user's analysis history and stats | Yes |
| `POST` | `/chat` | Conversational AI assistant for security questions | Yes |

### Auth Endpoints (`/api/v1/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/signup` | Create account with email/password via Supabase Auth | No |
| `POST` | `/login` | Sign in and receive access + refresh tokens | No |
| `POST` | `/refresh` | Refresh an expired access token | No |

### Health (`/api/v1`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "healthy" }` |

## Setup

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- Supabase project (for database and auth)
- Google Gemini API key
- Redis (optional, for rate limiting)

### Install Dependencies

```bash
cd backend
uv sync
```

### Configure Environment

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `SUPABASE_JWT_SECRET` | No | JWT secret for token verification (falls back to anon key) |
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `INFURA_KEY` or `ALCHEMY_KEY` | Yes* | Ethereum RPC provider (at least one needed) |
| `ETHERSCAN_API_KEY` | No | Enables contract source code + ABI lookup |
| `REDIS_URL` | No | Defaults to `redis://localhost:6379/0` |

### Run the Database Migration

Go to your Supabase Dashboard → SQL Editor and run `database/migrations/001_initial.sql`.

### Start the Server

```bash
# Development (with auto-reload)
uv run uvicorn app.main:app --reload --port 8000

# Production
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API docs available at `http://localhost:8000/api/docs` when `DEBUG=true`.

### Docker

```bash
docker build -t aya-shield-backend .
docker run -p 8000:8000 --env-file .env aya-shield-backend
```

## How It Works

1. **Request comes in** → JWT verified via `CurrentUser` dependency
2. **ShieldOrchestrator** routes to the appropriate service
3. **EVMProvider** fetches on-chain data via JSON-RPC (Infura/Alchemy)
4. **ContractAnalyzer** decodes calldata, checks scam databases, analyzes bytecode patterns
5. **RiskScoring** calculates a 0-100 risk score based on multiple signals
6. **Gemini AI** generates human-readable explanations and intent summaries
7. **Result logged** to Supabase `shield_events` table for audit trail
8. **Response returned** with risk score, flags, explanation, and actionable data

## Development

```bash
# Lint
uv run ruff check app/

# Format
uv run ruff format app/

# Run tests
uv run pytest
```

## License

MIT
