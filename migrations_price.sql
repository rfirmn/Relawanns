-- Migration: Add price column to events table

-- 1. Add 'price' column (using BIGINT for simple numeric storage, or NUMERIC. Let's use NUMERIC for flexibility, or BIGINT if strict rupiah)
-- We will use BIGINT. 0 means "Gratis".
ALTER TABLE events ADD COLUMN IF NOT EXISTS price BIGINT DEFAULT 0;

-- 2. Update existing events (optional)
-- UPDATE events SET price = 0 WHERE price IS NULL;
