-- Unique reference ID for each submission (RR-00001, RR-00002, ...)
-- Run once in Supabase → SQL Editor

-- 1. Sequence for generating numbers
CREATE SEQUENCE IF NOT EXISTS sample_inquiry_ref_seq;

-- 2. Add column (nullable first so we can backfill)
ALTER TABLE sample_inquiries
  ADD COLUMN IF NOT EXISTS reference_id text UNIQUE;

-- 3. Trigger to set reference_id on new rows
CREATE OR REPLACE FUNCTION set_sample_inquiry_reference_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_id IS NULL OR NEW.reference_id = '' THEN
    NEW.reference_id := 'RR-' || LPAD(nextval('sample_inquiry_ref_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reference_id_trigger ON sample_inquiries;
CREATE TRIGGER set_reference_id_trigger
  BEFORE INSERT ON sample_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_sample_inquiry_reference_id();

-- 4. Backfill existing rows (by created_at order) so they get RR-00001, RR-00002, ...
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM sample_inquiries
  WHERE reference_id IS NULL OR reference_id = ''
)
UPDATE sample_inquiries s
SET reference_id = 'RR-' || LPAD(n.rn::text, 5, '0')
FROM numbered n
WHERE s.id = n.id;

-- 5. Set sequence to max used + 1 so new rows get the next number
SELECT setval(
  'sample_inquiry_ref_seq',
  COALESCE((SELECT max(substring(reference_id from 4)::int) FROM sample_inquiries WHERE reference_id ~ '^RR-[0-9]+$'), 0) + 1
);
