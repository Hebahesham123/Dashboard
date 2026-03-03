-- Ensure a profile exists for a user by email (fixes "Could not load your profile").
-- Run in Supabase → SQL Editor. Replace 'heba1@gmail.com' with your sign-in email.

INSERT INTO profiles (user_id, email, role)
SELECT id, email, 'call_center'
FROM auth.users
WHERE email = 'heba1@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, role = 'call_center';
