-- Set Mahmoud as admin and Heba as call center
-- Replace the emails below with the exact emails they use to sign in.
--
-- 1. Create both users first: Supabase → Authentication → Users → Add user
--    - Add Mahmoud: email + password 123
--    - Add Heba: email + password 123
-- 2. Have each user sign in once to the dashboard (so a profile row is created).
-- 3. Run the two UPDATE lines below with their real emails.

UPDATE profiles SET role = 'admin' WHERE email = 'mahmoud@example.com';
UPDATE profiles SET role = 'call_center' WHERE email = 'heba@example.com';

-- Heba (heba1@gmail.com) as call center (by user_id)
INSERT INTO profiles (user_id, email, role)
VALUES ('d8f41cd7-aaca-45d4-9c85-c16749bb80e7', 'heba1@gmail.com', 'call_center')
ON CONFLICT (user_id) DO UPDATE SET role = 'call_center', email = 'heba1@gmail.com';
