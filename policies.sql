-- ==========================================================
-- KEBIJAKAN KEAMANAN (RLS POLICIES) - RELAWANNS
-- ==========================================================
-- Jalankan script ini di Supabase SQL Editor untuk mengatur izin akses.
-- Note: Karena aplikasi ini menggunakan "Admin Login" di sisi frontend (tanpa Supabase Auth),
-- kita harus memberikan izin akses ke role 'anon' (publik) agar Admin Dashboard bisa berfungsi.

-- 1. Reset / Pastikan RLS Aktif
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- TABEL: event_settings
-- (Menyimpan kuota, status buka/tutup, judul event)
-- ==========================================================

-- Izin BACA (SELECT): Semua orang bisa melihat status event (Formulir butuh ini)
CREATE POLICY "Public can view event settings" 
ON event_settings FOR SELECT 
TO anon 
USING (true);

-- Izin UPDATE: Semua orang bisa mengupdate (Diperlukan oleh Admin Dashboard)
-- Warning: Secara teknis, siapapun dengan Anon Key bisa update jika tau caranya, 
-- tapi ini resiko yang diambil karena tidak pakai Supabase Auth.
CREATE POLICY "Public can update event settings" 
ON event_settings FOR UPDATE 
TO anon 
USING (true);


-- ==========================================================
-- TABEL: registrations
-- (Menyimpan data pendaftar)
-- ==========================================================

-- Izin INSERT: Semua orang bisa mendaftar
CREATE POLICY "Public can register" 
ON registrations FOR INSERT 
TO anon 
WITH CHECK (true);

-- Izin BACA (SELECT): Diperlukan oleh Admin Dashboard untuk lihat list pendaftar
CREATE POLICY "Public can view registrations" 
ON registrations FOR SELECT 
TO anon 
USING (true);

-- Izin HAPUS (DELETE): Diperlukan oleh Admin Dashboard untuk hapus pendaftar invalid
CREATE POLICY "Public can delete registrations" 
ON registrations FOR DELETE 
TO anon 
USING (true);


-- ==========================================================
-- STORAGE: registrations (Bucket)
-- ==========================================================
-- Anda harus memastikan Bucket 'registrations' sudah dibuat dan diset Public.

-- Izin UPLOAD: User perlu upload bukti pembayaran/sosmed
CREATE POLICY "Public can upload files" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK ( bucket_id = 'registrations' );

-- Izin BACA (SELECT): Admin perlu lihat file bukti
CREATE POLICY "Public can view files" 
ON storage.objects FOR SELECT 
TO anon 
USING ( bucket_id = 'registrations' );

-- Izin HAPUS (DELETE): Backend worker perlu hapus file setelah diproses
-- (Sebenarnya Backend pake Service Key yang bypass RLS, tapi Admin mungkin butuh hapus manual)
CREATE POLICY "Public can delete files" 
ON storage.objects FOR DELETE 
TO anon 
USING ( bucket_id = 'registrations' );
