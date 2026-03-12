-- Reason for "Lost" (cancelled) status
-- Run once in Supabase → SQL Editor

ALTER TABLE sample_inquiries
  ADD COLUMN IF NOT EXISTS cancelled_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_reason_other text;
