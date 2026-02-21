# Aya Shield — Frontend

Modern web dashboard for Aya Shield, built with Next.js 15, React 19, and Tailwind CSS.

## Overview

The frontend is a responsive single-page application that gives users a clean interface to analyze transactions, inspect smart contracts, generate visual receipts, and manage token approvals — all powered by the Aya Shield backend API and Supabase Auth.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router, SSR, middleware |
| **React 19** | UI rendering with hooks and Server Components |
| **TypeScript 5.7** | Type safety across the entire codebase |
| **Tailwind CSS 3.4** | Utility-first styling with custom design tokens |
| **Supabase SSR** | Auth session management with cookie-based tokens |
| **Framer Motion** | Smooth animations and page transitions |
| **Lucide React** | Consistent icon library |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, OG tags)
│   │   ├── globals.css             # Tailwind base + custom design tokens
│   │   ├── page.tsx                # Landing page (9 strategic sections)
│   │   ├── auth/
│   │   │   ├── layout.tsx          # Auth layout (split-screen, branding)
│   │   │   ├── login/page.tsx      # Login form
│   │   │   └── signup/page.tsx     # Signup form
│   │   └── dashboard/
│   │       ├── layout.tsx          # Dashboard layout (sidebar + mobile drawer)
│   │       ├── page.tsx            # Dashboard overview with stats
│   │       ├── analyze/page.tsx    # Transaction & contract analysis
│   │       ├── receipts/page.tsx   # Smart receipt generator
│   │       └── panic/page.tsx      # Emergency approval revoke
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Landing page navbar
│   │   │   └── footer.tsx          # Landing page footer
│   │   ├── shield/
│   │   │   ├── panic-button.tsx    # Emergency revoke button component
│   │   │   ├── receipt-card.tsx    # Receipt display card
│   │   │   ├── risk-gauge.tsx      # Visual risk score gauge
│   │   │   └── transaction-card.tsx # Transaction analysis result card
│   │   └── ui/
│   │       ├── badge.tsx           # Status badge component
│   │       ├── button.tsx          # Button with variants
│   │       ├── card.tsx            # Glass-card wrapper
│   │       └── input.tsx           # Form input component
│   ├── hooks/
│   │   └── use-auth.ts            # Supabase auth hook (user, signOut)
│   ├── lib/
│   │   ├── api.ts                 # API client (fetch wrapper with auth headers)
│   │   ├── utils.ts               # Utility functions (cn, formatAddress, etc.)
│   │   └── supabase/
│   │       ├── client.ts          # Browser Supabase client
│   │       └── server.ts          # Server-side Supabase client
│   └── types/
│       └── index.ts               # Shared TypeScript interfaces
├── middleware.ts                   # Auth guard (redirect unauthed from dashboard)
├── public/
│   ├── logo.svg                   # Full 512x512 brand logo
│   ├── favicon.svg                # Compact 64x64 favicon
│   └── poster.svg                 # 1200x630 social/OG image
├── Dockerfile                     # Multi-stage build (standalone output)
├── tailwind.config.ts             # Custom colors, fonts, animations
├── next.config.ts                 # Next.js configuration
├── tsconfig.json
└── package.json
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, problem/solution, features, how it works, tech stack, use cases |
| `/auth/login` | Email/password login form |
| `/auth/signup` | Account registration form |
| `/dashboard` | Overview with shield score, stats, recent events |
| `/dashboard/analyze` | Analyze transactions and smart contracts |
| `/dashboard/receipts` | Generate and download visual transaction receipts |
| `/dashboard/panic` | Scan wallet for risky approvals and revoke them |

## Design System

The app uses a dark theme with custom Tailwind tokens defined in `globals.css`:

| Token | Color | Usage |
|---|---|---|
| `background` | `#050A14` | Page background |
| `surface` | `#0C1222` | Card backgrounds |
| `primary` | `#3B82F6` | Interactive elements, links |
| `accent` | `#06B6D4` | Secondary highlights |
| `success` | `#22C55E` | Safe/positive states |
| `warning` | `#F59E0B` | Medium risk |
| `danger` | `#EF4444` | High risk, errors |

Key patterns: `glass-card` (frosted glass cards), `gradient-brand` (primary→accent gradient), `animate-in` (fade-up entrance).

## Setup

### Prerequisites

- Node.js 20+
- npm
- Supabase project (for auth)
- Running Aya Shield backend API

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |
| `API_URL` | Server-side API URL (same as above for local dev) |

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t aya-shield-frontend .
docker run -p 3000:3000 aya-shield-frontend
```

The Dockerfile uses a multi-stage build with Next.js standalone output for a minimal production image.

## Auth Flow

1. User signs up/logs in → Supabase Auth issues JWT tokens
2. Tokens stored in HTTP-only cookies via `@supabase/ssr`
3. `middleware.ts` checks auth on every `/dashboard/*` request:
   - No session → redirect to `/auth/login`
   - Has session on `/auth/*` → redirect to `/dashboard`
4. `use-auth` hook provides `user` and `signOut` to dashboard components
5. `api.ts` attaches the access token to every backend API call

## Responsive Design

- **Desktop**: Full sidebar navigation in dashboard, multi-column grids
- **Tablet**: Collapsible elements, 2-column grids
- **Mobile**: Hamburger menu with slide-out drawer, single-column layouts, adjusted padding and font sizes

All breakpoints use Tailwind's `sm:`, `md:`, `lg:` prefixes consistently.

## License

MIT
