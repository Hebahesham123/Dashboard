-- New statuses: reached, done, cancelled, not_reached
-- Plus tracking for "not reached" count and 30-minute cooldown

-- 1. Add columns for not_reached tracking
ALTER TABLE sample_inquiries
  ADD COLUMN IF NOT EXISTS not_reached_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS not_reached_last_at timestamptz;

-- 2. Update status constraint to new values (optional: run after migrating existing data)
-- First drop old constraint if it exists:
ALTER TABLE sample_inquiries DROP CONSTRAINT IF EXISTS sample_inquiries_status_check;
-- Allow both old and new during transition (so existing rows still valid):
ALTER TABLE sample_inquiries
  ADD CONSTRAINT sample_inquiries_status_check
  CHECK (status IS NULL OR status IN (
    'new', 'contacted', 'in_progress', 'completed', 'cancelled',
    'reached', 'done', 'not_reached'
  ));


-- Optional: use only the new 4 statuses (run after updating existing rows):
-- UPDATE sample_inquiries SET status = 'reached' WHERE status IS NULL OR status NOT IN ('reached', 'done', 'cancelled', 'not_reached');
-- ALTER TABLE sample_inquiries DROP CONSTRAINT sample_inquiries_status_check;
-- ALTER TABLE sample_inquiries ADD CONSTRAINT sample_inquiries_status_check
--   CHECK (status IS NULL OR status IN ('reached', 'done', 'cancelled', 'not_reached'));
-- Default status for new form submissions (before any dashboard edit):
ALTER TABLE sample_inquiries ALTER COLUMN status SET DEFAULT 'new';
