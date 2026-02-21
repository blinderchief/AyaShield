-- Aya Shield Database Schema
-- Run via Supabase SQL Editor or migration tool

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    wallet_address TEXT,
    display_name TEXT,
    avatar_url TEXT,
    shield_tier TEXT DEFAULT 'free' CHECK (shield_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shield Events (audit log for every analysis)
CREATE TABLE IF NOT EXISTS public.shield_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('tx_analysis', 'contract_analysis', 'receipt', 'revoke', 'status')),
    chain TEXT NOT NULL,
    target_address TEXT,
    tx_hash TEXT,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    trust_score INTEGER CHECK (trust_score BETWEEN 0 AND 100),
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cached Approvals per wallet
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    chain TEXT NOT NULL,
    token_address TEXT NOT NULL,
    spender_address TEXT NOT NULL,
    amount TEXT,
    is_unlimited BOOLEAN DEFAULT false,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    last_scanned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, chain, token_address, spender_address)
);

-- Scam Reports (aggregated from feeds + community)
CREATE TABLE IF NOT EXISTS public.scam_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL,
    chain TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('goplus', 'forta', 'community', 'internal')),
    report_type TEXT NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 0 AND 100),
    details JSONB,
    reported_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (address, chain, source)
);

-- Receipts (generated social cards)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL,
    chain TEXT NOT NULL,
    action_summary TEXT,
    svg_data TEXT,
    share_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shield_events_user ON public.shield_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shield_events_type ON public.shield_events(event_type);
CREATE INDEX IF NOT EXISTS idx_approvals_user ON public.approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_address ON public.scam_reports(address, chain);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shield_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Shield Events: users can read/insert their own
CREATE POLICY "events_select_own" ON public.shield_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON public.shield_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Approvals: users manage their own
CREATE POLICY "approvals_all_own" ON public.approvals FOR ALL USING (auth.uid() = user_id);

-- Receipts: users manage their own
CREATE POLICY "receipts_select_own" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert_own" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scam Reports: anyone can read
CREATE POLICY "scam_reports_select_all" ON public.scam_reports FOR SELECT USING (true);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
