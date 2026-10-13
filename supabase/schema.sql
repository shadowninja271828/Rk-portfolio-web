create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  description text not null default '' check (char_length(description) <= 280),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  phone text not null default '',
  whatsapp_url text not null default '',
  instagram_url text not null default '',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists content jsonb not null default '{}'::jsonb;

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  array[
    'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'
  ]::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.admin_users enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

create policy "Admins can read their own admin record"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Anyone can view portfolio items"
  on public.portfolio_items for select
  to anon, authenticated
  using (true);

create policy "Admins can insert portfolio items"
  on public.portfolio_items for insert
  to authenticated
  with check (public.is_portfolio_admin());

create policy "Admins can update portfolio items"
  on public.portfolio_items for update
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

create policy "Admins can delete portfolio items"
  on public.portfolio_items for delete
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Anyone can view portfolio media" on storage.objects;
create policy "Anyone can view portfolio media"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio-media');

drop policy if exists "Admins can upload portfolio media" on storage.objects;
create policy "Admins can upload portfolio media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

drop policy if exists "Admins can update portfolio media" on storage.objects;
create policy "Admins can update portfolio media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_portfolio_admin())
  with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

drop policy if exists "Admins can delete portfolio media" on storage.objects;
create policy "Admins can delete portfolio media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

create policy "Anyone can view site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_portfolio_admin());

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

grant select on public.portfolio_items, public.site_settings to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;
grant insert, update on public.site_settings to authenticated;
