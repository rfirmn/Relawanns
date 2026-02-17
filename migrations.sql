-- Migration: Add new columns for multi-step form fields

-- 1. Riwayat Partisipasi (Sudah-- MIGRATION: Switch to 'events' table system
-- Run this in Supabase SQL Editor

-- 1. Create 'events' table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    max_quota INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT false
);

-- 2. Add 'event_id' to registrations (optional link for now, can be null for old data)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);

-- 3. Disable RLS for 'events' (since we use client-side admin)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 4. Create proper policies if you decide to enable RLS later
-- (Public can view active events)
CREATE POLICY "Public can view active events" 
ON events FOR SELECT 
TO anon 
USING (is_active = true);

-- (Admin can do everything - represented by anon in this simple app or service_role)
-- Note: Since we DISABLED RLS, these policies are just for future reference.

-- 5. Insert Dummy Event (optional) if table is empty
INSERT INTO events (name, date, location, description, max_quota, is_active)
SELECT 'Event Perdana Relawanns', '2026-06-01', 'Gelora Bung Karno', 'Event relawan terbesar tahun ini.', 200, true
WHERE NOT EXISTS (SELECT 1 FROM events);
ram (Wajib @...)
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS instagram_username TEXT;

-- 4. URL Bukti Follow TikTok
ALTER TABLE registrations 

-- 5. URL Bukti Follow Instagram
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS instagram_proof_url TEXT;
