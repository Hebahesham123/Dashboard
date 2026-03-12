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
5. Run **supabase-status-not-reached.sql** so "Not reached (1st / 2nd / 3rd time)" count and 30‑minute cooldown are stored in the database.
6. Run **supabase-add-reference-id.sql** to add unique reference IDs (rr-00001, rr-00002, …) for each submission.

After that: open site → Login → Dashboard. Sign out → Login again. To make someone admin: `UPDATE profiles SET role = 'admin' WHERE email = 'their@email.com';`

## If you see "One-time setup required" on the deployed site

1. **Run the SQL once** in the **same** Supabase project your app uses:  
   Supabase → SQL Editor → New query → paste the SQL from the setup screen (or from `supabase-bootstrap-profiles.sql`) → Run.
2. **Set env vars** in your host (Vercel → Project → Settings → Environment Variables, or Netlify → Site → Environment):  
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as in `.env.local`).  
   Then **redeploy** (e.g. trigger a new deploy or push a commit).
3. On the site, click **Retry** or refresh the page. You should see the dashboard.
