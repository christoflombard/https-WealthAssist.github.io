-- Update Product Types and Add Fields
-- Run this in Supabase SQL Editor

-- 1. Add new values to the enum (Postgres doesn't allow removing easily, so we add the new specific ones)
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_BREATHER'; -- Property Flips
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_INSTALMENT'; -- Instalment Sale Breather
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'FLIP_JV'; -- Joint Venture Flip
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_LEASEBACK'; -- Buy & Leasebacks
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_INSTALMENT'; -- Instalment Sale Recovery
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'RECOVERY_BOND'; -- Recovery Bond
ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'ASSIST_TO_OWN'; -- Rent to Buy

-- 2. Add missing financial columns
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS projected_net_annualized_return NUMERIC(5,2), -- Percentage
ADD COLUMN IF NOT EXISTS projected_net_profit NUMERIC(15,2); -- Rand Value

-- 3. Comment on columns for clarity
COMMENT ON COLUMN opportunities.product_type IS 'Specific Wealth Assist Investment Type';
COMMENT ON COLUMN opportunities.projected_net_annualized_return IS 'Expected ROI per year (as percentage)';
