-- Run this ONCE in Supabase → SQL Editor after supabase-auth-and-roles.sql
-- Creates a profile for every user in Authentication so login → dashboard works without "One-time setup"

INSERT INTO profiles (user_id, email, role)
SELECT id, email, 'call_center'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
