-- Create Enums
CREATE TYPE product_type AS ENUM ('JV_FLIP', 'INSTALMENT_SALE_RECOVERY', 'RECOVERY', 'RENTAL_INCOME', 'DEVELOPMENT');
CREATE TYPE opportunity_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');
CREATE TYPE term_type AS ENUM ('MONTHS', 'YEAR');
CREATE TYPE file_type AS ENUM ('FULL_REPORT', 'VALUATION', 'TPN', 'LIGHTSTONE', 'COC', 'OTHER');

-- Create Opportunities Table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    suburb_or_area TEXT,
    province TEXT,
    product_type product_type NOT NULL,
    deal_code TEXT,
    status opportunity_status NOT NULL DEFAULT 'AVAILABLE',
    hero_image_url TEXT,
    investment_amount NUMERIC NOT NULL,
    market_value NUMERIC,
    exposure_to_market_value_pct NUMERIC,
    units_total INTEGER,
    units_available INTEGER,
    highlight_badge_text TEXT,
    description TEXT,
    address TEXT,
    property_type TEXT,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    parking INTEGER,
    erf_size NUMERIC,
    floor_size NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Opportunity Return Rows Table
CREATE TABLE opportunity_return_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    row_key TEXT NOT NULL,
    label TEXT NOT NULL,
    term_type term_type NOT NULL,
    term_value NUMERIC NOT NULL,
    amount NUMERIC,
    pct NUMERIC,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Opportunity Files Table
CREATE TABLE opportunity_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    file_type file_type NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    requires_auth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_return_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_files ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Admin Write - simplified for now to allow all service role/authenticated actions or public read)
CREATE POLICY "Public opportunities are viewable by everyone" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Service role can manage opportunities" ON opportunities USING (auth.role() = 'service_role');

CREATE POLICY "Public return rows are viewable by everyone" ON opportunity_return_rows FOR SELECT USING (true);
CREATE POLICY "Service role can manage return rows" ON opportunity_return_rows USING (auth.role() = 'service_role');

CREATE POLICY "Public files are viewable by everyone" ON opportunity_files FOR SELECT USING (true);
CREATE POLICY "Service role can manage files" ON opportunity_files USING (auth.role() = 'service_role');

-- Create Storage Bucket for Opportunities
INSERT INTO storage.buckets (id, name, public)
VALUES ('opportunities', 'opportunities', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'opportunities' );
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'opportunities' );

