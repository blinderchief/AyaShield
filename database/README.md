# Aya Shield - Database

Supabase (PostgreSQL) database schema and migrations.

## Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Run `migrations/001_initial.sql` to create all tables, indexes, RLS policies, and triggers

## Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends `auth.users`) |
| `shield_events` | Audit log for every analysis/receipt/revoke |
| `approvals` | Cached token approvals per wallet |
| `scam_reports` | Aggregated scam reports from various sources |
| `receipts` | Generated social card receipts |

## Row Level Security

All tables have RLS enabled. Users can only access their own data (except `scam_reports` which is publicly readable).
