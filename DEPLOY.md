# Deployment checklist

Follow these steps so the dashboard works when you deploy (e.g. Vercel, Netlify).

## 1. Environment variables

In your hosting dashboard (Vercel → Settings → Environment Variables, etc.), add:

- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – your Supabase anon key  

Redeploy after changing env vars.

## 2. Supabase setup (do once)

1. Open **Supabase** → your project → **SQL Editor**.  
2. Run **supabase-auth-and-roles.sql** (creates `profiles` table and RLS).  
3. Run **supabase-bootstrap-profiles.sql** (creates a profile for every user in Authentication).  
4. Add users in **Authentication → Users** (email + password). New users get a profile via trigger; if not, run supabase-bootstrap-profiles.sql again.  

After that: open site → Login → Dashboard. Sign out → Login again. To make someone admin: `UPDATE profiles SET role = 'admin' WHERE email = 'their@email.com';`
