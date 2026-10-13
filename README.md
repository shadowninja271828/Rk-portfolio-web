# Rk Editing — Portfolio

A React portfolio with an admin dashboard at `/admin`. Admin changes are saved in Supabase and published for every visitor until edited or removed. `public/images` supplies the local preview artwork.

## Run locally

1. Install Node.js 20.19+ (or 22.12+) and run `npm install`.
2. Copy `.env.example` to `.env.local` and confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` match your Supabase project.
3. Run `npm run dev`. Restart the dev server after changing environment variables.

The public page remains viewable without Supabase credentials using local preview projects, but admin publishing requires Supabase.

## Supabase setup

1. For a new installation, run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. For an existing installation, run [`supabase/migrations/20261013_portfolio_media.sql`](./supabase/migrations/20261013_portfolio_media.sql) and [`supabase/migrations/20261013_portfolio_video.sql`](./supabase/migrations/20261013_portfolio_video.sql) instead of rerunning the full schema.
2. In Supabase Authentication, enable email/password sign-in and set the site's local and deployed URLs under **Authentication → URL Configuration**. Include `/login` as an allowed redirect destination for email confirmation links.
3. Clients can create accounts at `/signup` and sign in at `/login`. With email confirmation enabled, new users must follow the emailed link before they can sign in. Disable public sign-ups in Supabase if account creation should be owner-managed.
4. In the SQL Editor, register the owner's account as the site admin, replacing the email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'shadowninja2.71828@gmail.com'
   on conflict (user_id) do nothing;
   ```

5. Add the project's Supabase URL and anon/publishable key to `.env.local`, then restart the dev server or redeploy the site.
6. Sign in at `/login` (or open `/admin`, which redirects unauthenticated visitors to `/login`). Admin status is determined by membership in `admin_users` or an exact match with the fallback email `shadowninja2.71828@gmail.com`. Admins are routed to `/admin-choice`; only confirmed accounts registered in `admin_users` can enter `/admin`. Homepage content and portfolio changes are stored in Supabase; row-level security restricts writes to registered admin accounts.

The admin accepts public image URLs and local image uploads for the hero and portfolio projects. Portfolio projects also accept local MP4, WebM, MOV, and M4V uploads up to 50 MB. Uploads use resumable 6 MB chunks and show progress in the admin. In Supabase Storage settings, ensure the project's global file size limit is at least 50 MB; the bucket itself allows up to 50 MB. Uploads are stored in the public `portfolio-media` bucket; only registered admins can upload or delete files. Replaced and deleted project media are removed from Storage after the corresponding database change succeeds. The Supabase anon/publishable key is intended for browser use. Never put a service-role key in this app. Previously saved browser-local edits are not automatically copied to Supabase.

## Project structure

- `src/pages` — public portfolio and admin screens
- `src/components` — shared portfolio, gallery, slider, and route components
- `src/layouts` — public and admin shells
- `src/hooks` — auth and Supabase-backed data state
- `src/lib` — Supabase client and data operations
- `supabase/schema.sql` — database schema and row-level security policies
