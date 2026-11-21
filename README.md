# CodeCraft Studio Platform

React + Vite frontend on **Supabase** (Postgres, Auth, Storage, Realtime). There is no custom server any more — the site is static and talks to Supabase directly, with Row Level Security enforcing who can see and change what.

All website content (Portfolio, Services, Roadmap, Team) is stored in the database and managed from **/admin**. Nothing is hardcoded in the frontend.

## 1. Create the Supabase project

1. Create a project at <https://supabase.com>.
2. **SQL Editor → New query**, paste the whole of `supabase/migrations/0001_init.sql`, and run it. This creates the tables, security policies, storage buckets and realtime settings.
3. **Authentication → Providers → Email**: keep Email enabled and **turn OFF "Allow new users to sign up"** (accounts are created by you, not by visitors).
4. **Authentication → Users → Add user** → create your own login (tick *Auto Confirm User*).
5. Make yourself admin — SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

## 2. Deploy the client-account function

Creating client logins needs the service-role key, so it runs as an Edge Function:

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase functions deploy create-client
```

(`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function automatically.)

## 3. Run the site

```bash
npm install
cp .env.example .env     # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Both values are in **Project Settings → API**. Only the *anon* key goes in `.env` — never the service-role key.

Sign in at `/login`, open `/admin`, and add your content:

| Admin tab | Appears on |
|---|---|
| Portfolio | Projects page (cards + case-study popup) |
| Services | Services page and the Home "sectors" cards |
| Roadmap | Home page timeline |
| Team Members | Team and About pages |

Public pages show a friendly empty state (or hide the section on Home) until you add something. Each item has a **Sort order** (lower = first) and a **Visible on the website** switch.

## Client portal

Admin → **Client Accounts** creates a client login. Then create their project under **Client Projects** using the same email. Clients only ever see rows tied to their own email/projects — enforced by RLS in the database.

## Files and images

- `public-assets` bucket (public): team photos, service/portfolio images.
- `client-files` bucket (private): deliverables and project gallery photos. The app serves them through short-lived signed URLs, and only the owning client (or an admin) can open them.
- The Free plan caps files at 50 MB.

## Deploy

```bash
npm run build     # outputs dist/
```

Host `dist/` on any static host (Vercel, Netlify, Cloudflare Pages). Add the two `VITE_SUPABASE_*` variables in the host's settings. `public/_redirects` is included for single-page routing on Netlify/Cloudflare; on Vercel add a rewrite of `/(.*)` → `/index.html`.

## Notes

- **Emails:** notifications are saved in the `notifications` table. Nothing is emailed until you connect a sender (e.g. a Database Webhook on `notifications` → an Edge Function using Resend/SendGrid). The UI never claims an email was delivered.
- **Contact form spam:** anyone can insert into `contact_messages` (length-checked). If spam appears, put Cloudflare Turnstile/hCaptcha in front or move submission to an Edge Function with rate limiting.
- The old Express + SQLite server (`server/`, `data/`, `uploads/`) was removed. Existing SQLite data is **not** migrated automatically — re-enter content from the admin.
