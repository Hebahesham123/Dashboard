-- Run this in Supabase SQL Editor to add comment column to sample_inquiries

ALTER TABLE sample_inquiries
  ADD COLUMN IF NOT EXISTS comment text;
