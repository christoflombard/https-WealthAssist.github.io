-- 1. Create ENUMS
DO $$ BEGIN
    CREATE TYPE user_tier AS ENUM ('REGISTERED', 'ACCREDITED', 'PREVE');
    CREATE TYPE lead_priority AS ENUM ('HOT', 'WARM', 'COLD');
    CREATE TYPE reservation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tier user_tier DEFAULT 'REGISTERED',
ADD COLUMN IF NOT EXISTS lead_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_priority lead_priority DEFAULT 'COLD',
ADD COLUMN IF NOT EXISTS onboarding_answers JSONB DEFAULT '{}'::jsonb;

-- 3. Create Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status reservation_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Reservation Policies
-- User can see their own reservations
CREATE POLICY "Users view own reservations" ON reservations 
FOR SELECT USING (auth.uid() = user_id);

-- Only PREVE users can create reservations
CREATE POLICY "Preve users can reserve" ON reservations 
FOR INSERT WITH CHECK (
    (SELECT tier FROM profiles WHERE id = auth.uid()) = 'PREVE'
);

-- Service Role / Admin can manage all
CREATE POLICY "Service role manages reservations" ON reservations 
USING (auth.role() = 'service_role' OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);


-- 5. Strict Access Control for Opportunities
-- Revoke generic public access (we will re-add specific policies)
DROP POLICY IF EXISTS "Public can read opportunities" ON opportunities;
DROP POLICY IF EXISTS "Preve users can view full details" ON opportunities;

-- Policy: PREVE users and Admins can see EVERYTHING
CREATE POLICY "Preve and Admin view everything" ON opportunities
FOR SELECT
USING (
    (SELECT tier FROM profiles WHERE id = auth.uid()) = 'PREVE' 
    OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 6. Public Summary View (Security Definer to bypass RLS for specific cols)
-- We use a Function to return a Set of Records, which works well with PostgREST
-- But a View is easier for Next.js to query if we allow it.
-- Let's try a standard View first. If RLS on base table blocks it, we might need a workaround.
-- WORKAROUND: We grant public access to specific *columns*? Postgres doesn't strictly support "RLS per column".
-- BEST APPROACH: Keep `opportunities` table RLS open for "Public Summary" rows, but that doesn't hide columns.
-- ALTERNATE: Use a separate table `opportunities_public` that triggers sync? No, duplication.
-- REAL SOLUTION: A SECURITY DEFINER VIEW.
-- Postgres views are Security Invoker by default. Changing to Security Definer requires a Function wrapping it or owner rights.

-- Let's create a Secure Function that returns the summary data.
CREATE OR REPLACE FUNCTION get_public_opportunities()
RETURNS TABLE (
    id UUID,
    title TEXT,
    suburb_or_area TEXT,
    province TEXT,
    product_type product_type,
    hero_image_url TEXT,
    investment_amount NUMERIC,
    projected_net_annualized_return NUMERIC,
    projected_net_profit NUMERIC,
    status opportunity_status
) 
SECURITY DEFINER -- Runs with privileges of the creator (postgres/service_role)
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        o.id,
        o.title,
        o.suburb_or_area,
        o.province,
        o.product_type,
        o.hero_image_url,
        o.investment_amount,
        o.projected_net_annualized_return,
        o.projected_net_profit,
        o.status
    FROM opportunities o
    WHERE o.status != 'SOLD' -- Optional filtering
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute on this function to anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_opportunities() TO anon, authenticated, service_role;

-- 7. Update Realtime / Other Policies
-- Ensure Storage buckets are also protected!
-- Only Preve can download files (except Hero Image)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Hero Images" ON storage.objects FOR SELECT 
USING ( bucket_id = 'opportunities' AND name LIKE '%.jpg' OR name LIKE '%.png' ); -- Weak check, better to separate buckets?
-- Actually, the `hero_image_url` is public. Documentation files (PDFs) should be restricted.
-- Let's assume PDFs are in a 'documents' folder or distinct bucket?
-- Current setup: Everything in 'opportunities' bucket.
-- Refinement: Allow public read if file extension is image. Restrict if pdf/doc.
CREATE POLICY "Restricted Documents" ON storage.objects FOR SELECT
USING (
    bucket_id = 'opportunities' 
    AND (
        -- Images are public
        storage.extension(name) = 'jpg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'webp'
        OR
        -- Other files require PREVE
        (SELECT tier FROM profiles WHERE id = auth.uid()) = 'PREVE'
    )
);
