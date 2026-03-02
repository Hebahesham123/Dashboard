-- Run this in Supabase SQL Editor to log who changed what and when

CREATE TABLE IF NOT EXISTS submission_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_inquiry_id uuid NOT NULL REFERENCES sample_inquiries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_activity_inquiry
  ON submission_activity(sample_inquiry_id);
CREATE INDEX IF NOT EXISTS idx_submission_activity_created
  ON submission_activity(created_at DESC);

ALTER TABLE submission_activity ENABLE ROW LEVEL SECURITY;

-- Dashboard users can insert their own activity when they make edits
CREATE POLICY "Dashboard users can insert activity"
  ON submission_activity FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
  );

-- Dashboard users can read activity for any submission (they can view submissions)
CREATE POLICY "Dashboard users can read activity"
  ON submission_activity FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
  );
