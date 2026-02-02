-- MASTER SETUP SCRIPT for Wealth Assist (Updated V2)
-- Run this in your Supabase SQL Editor to set up all tables, enums, and policies.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Safe creation including V2 types)
DO $$ BEGIN
    CREATE TYPE product_type AS ENUM (
        'JV_FLIP', 'INSTALMENT_SALE_RECOVERY', 'RECOVERY', 'RENTAL_INCOME', 'DEVELOPMENT',
        'FLIP_BREATHER', 'FLIP_INSTALMENT', 'FLIP_JV', 'RECOVERY_LEASEBACK', 
        'RECOVERY_INSTALMENT', 'RECOVERY_BOND', 'ASSIST_TO_OWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
    -- If enum exists but missing values, we can't easily alter inside this block in Postgres blocks, 
    -- but specific ALTER statements below handle updates.
END $$;

-- Ensure all V2 types exist if type was already created
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_BREATHER';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_INSTALMENT';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_JV';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_LEASEBACK';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_INSTALMENT';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_BOND';
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'ASSIST_TO_OWN';


DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE term_type AS ENUM ('MONTHS', 'YEAR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_type AS ENUM ('FULL_REPORT', 'VALUATION', 'TPN', 'LIGHTSTONE', 'COC', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES (Create if not exists)

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    suburb_or_area TEXT,
    province TEXT,
    product_type product_type NOT NULL DEFAULT 'JV_FLIP',
    deal_code TEXT UNIQUE,
    status opportunity_status NOT NULL DEFAULT 'AVAILABLE',
    hero_image_url TEXT,
    investment_amount NUMERIC(15,2) NOT NULL,
    market_value NUMERIC(15,2),
    exposure_to_market_value_pct NUMERIC(5,2),
    
    -- New V2 Columns
    projected_net_annualized_return NUMERIC(5,2),
    projected_net_profit NUMERIC(15,2),

    -- Detailed Financials (V3)
    net_rental_income NUMERIC(15,2),
    capital_growth NUMERIC(15,2),
    gross_return NUMERIC(15,2),
    external_fees NUMERIC(15,2),
    contract_duration_months INT,

    units_total INT,
    units_available INT,
    highlight_badge_text TEXT,
    description TEXT,
    address TEXT,
    property_type TEXT,
    bedrooms INT,
    bathrooms NUMERIC,
    parking INT,
    erf_size NUMERIC(10,2),
    floor_size NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS projected_net_annualized_return NUMERIC(5,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS projected_net_profit NUMERIC(15,2);
-- V3 Columns
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS net_rental_income NUMERIC(15,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS capital_growth NUMERIC(15,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS gross_return NUMERIC(15,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS external_fees NUMERIC(15,2);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS contract_duration_months INT;

-- Opportunity Return Rows
CREATE TABLE IF NOT EXISTS opportunity_return_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    row_key TEXT NOT NULL,
    label TEXT NOT NULL,
    term_type term_type NOT NULL DEFAULT 'MONTHS',
    term_value NUMERIC NOT NULL,
    amount NUMERIC(15,2),
    pct NUMERIC(8,4),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunity Files
CREATE TABLE IF NOT EXISTS opportunity_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    file_type file_type NOT NULL DEFAULT 'OTHER',
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    requires_auth BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- leads Table (For Contact Form)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    interest TEXT,
    ghl_contact_id TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RLS (Enable)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_return_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (Drop existing first to allow re-run)

-- Opportunities
DROP POLICY IF EXISTS "Public can read opportunities" ON opportunities;
CREATE POLICY "Public can read opportunities" ON opportunities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage opportunities" ON opportunities;
CREATE POLICY "Service role can manage opportunities" ON opportunities USING (auth.role() = 'service_role');

-- Return Rows
DROP POLICY IF EXISTS "Public can read return rows" ON opportunity_return_rows;
CREATE POLICY "Public can read return rows" ON opportunity_return_rows FOR SELECT USING (true);

-- Files
DROP POLICY IF EXISTS "Public files are viewable by everyone" ON opportunity_files;
CREATE POLICY "Public files are viewable by everyone" ON opportunity_files FOR SELECT USING (true);

-- Leads
DROP POLICY IF EXISTS "Service role has full access to leads" ON leads;
CREATE POLICY "Service role has full access to leads" ON leads USING (auth.role() = 'service_role');

-- 6. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('opportunities', 'opportunities', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'opportunities' );

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'opportunities' );
