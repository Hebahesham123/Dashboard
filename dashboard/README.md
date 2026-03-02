# Submissions Dashboard

Professional dashboard that displays your Supabase form submissions and updates **in real time** when new data is submitted.

## Setup

1. **Configure Supabase**  
   Open `config.js` and set:
   - `url` – your project URL (e.g. `https://xxxx.supabase.co`)
   - `anonKey` – your project anon/public key
   - `tableName` – the table where form submissions are stored (e.g. `submissions`)
   - `createdAtColumn` – optional; column name for submission time (default `created_at`) for “Today” and “This week” stats

2. **Enable Realtime for the table**  
   In Supabase Dashboard: **Database → Replication** → turn on replication for your table under the `supabase_realtime` publication.  
   Or run in SQL Editor:
   ```sql
   alter publication supabase_realtime add table your_table_name;
   ```
   For this project (table `sample_inquiries`):
   ```sql
   alter publication supabase_realtime add table sample_inquiries;
   ```

3. **Open the dashboard**  
   Open `index.html` in a browser (e.g. double‑click or use a local server like `npx serve .` in the `dashboard` folder).

## Features

- **Live updates** – New submissions appear automatically without refresh.
- **Stats** – Total, today, and this week counts (when `createdAtColumn` is set).
- **Search** – Filter rows by any column.
- **Sort** – Newest or oldest first.
- **Pagination** – 25 / 50 / 100 rows per page.
- **Toast** – Notification when a new submission is received.

The table columns are built from your Supabase table; no code changes needed for different column names.
