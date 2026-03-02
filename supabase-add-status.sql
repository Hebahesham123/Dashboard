-- Run this in Supabase SQL Editor to add status to sample_inquiries

-- Add status column (default 'new' for new submissions)
ALTER TABLE sample_inquiries
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- Optional: restrict to allowed values
ALTER TABLE sample_inquiries
  DROP CONSTRAINT IF EXISTS sample_inquiries_status_check;
ALTER TABLE sample_inquiries
  ADD CONSTRAINT sample_inquiries_status_check
  CHECK (status IS NULL OR status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled'));

-- Allow updates so the dashboard can change status (anon can update any row for simplicity)
DROP POLICY IF EXISTS "Allow anonymous update for dashboard" ON sample_inquiries;
CREATE POLICY "Allow anonymous update for dashboard"
  ON sample_inquiries FOR UPDATE
  USING (true)
  WITH CHECK (true);
