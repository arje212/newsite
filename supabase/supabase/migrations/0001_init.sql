-- =====================================================================
-- CodeCraft Studio — Supabase schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profiles (one row per auth user; holds the role)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null default '',
  role         text not null default 'client' check (role in ('admin','client')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

-- Every new auth user becomes a *client*. Role is NEVER read from user metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', ''), 'client')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_date()
returns trigger language plpgsql as $$
begin new.updated_date = now(); return new; end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.jwt_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ---------------------------------------------------------------------
-- Client-portal tables
-- ---------------------------------------------------------------------
create table if not exists public.client_projects (
  id               uuid primary key default gen_random_uuid(),
  client_name      text not null,
  client_email     text not null,
  project_title    text not null,
  description      text,
  status           text not null default 'Scoping' check (status in ('Scoping','In Progress','Review','Completed','On Hold')),
  progress_percent numeric not null default 0 check (progress_percent between 0 and 100),
  category         text not null default 'Web' check (category in ('Web','Robotics','Data','Research')),
  start_date       date,
  target_date      date,
  milestones       jsonb not null default '[]'::jsonb,
  team_lead        text,
  created_date     timestamptz not null default now(),
  updated_date     timestamptz not null default now()
);
create index if not exists idx_client_projects_email on public.client_projects (lower(client_email));

-- Defined after client_projects exists (needs the table)
create or replace function public.owns_project(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.client_projects p
    where p.id = pid and lower(p.client_email) = public.jwt_email()
  );
$$;

create table if not exists public.deliverables (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.client_projects(id) on delete cascade,
  client_email text not null,
  title        text not null,
  description  text,
  file_url     text,
  file_type    text not null default 'PDF' check (file_type in ('PDF','ZIP','Figma','Video','Spreadsheet','Other')),
  version      text not null default 'v1.0',
  is_final     boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.change_requests (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.client_projects(id) on delete cascade,
  client_email text not null,
  client_name  text,
  title        text not null,
  description  text not null,
  priority     text not null default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  status       text not null default 'Submitted' check (status in ('Submitted','Under Review','Approved','Rejected','Implemented')),
  admin_notes  text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.deliverable_reviews (
  id                uuid primary key default gen_random_uuid(),
  deliverable_id    uuid not null references public.deliverables(id) on delete cascade,
  project_id        uuid not null references public.client_projects(id) on delete cascade,
  client_email      text not null,
  client_name       text not null,
  deliverable_title text not null,
  decision          text not null check (decision in ('Approved','Needs Changes')),
  feedback          text not null,
  status            text not null default 'Pending' check (status in ('Pending','Seen','Resolved')),
  team_response     text,
  created_date      timestamptz not null default now(),
  updated_date      timestamptz not null default now()
);

create table if not exists public.project_messages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.client_projects(id) on delete cascade,
  sender_email text not null,
  sender_name  text not null,
  sender_role  text not null check (sender_role in ('client','team')),
  message      text not null,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.project_photos (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.client_projects(id) on delete cascade,
  client_email text not null,
  photo_url    text not null,
  caption      text,
  phase        text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists idx_deliverables_project on public.deliverables (project_id);
create index if not exists idx_change_requests_project on public.change_requests (project_id);
create index if not exists idx_reviews_deliverable on public.deliverable_reviews (deliverable_id);
create index if not exists idx_messages_project on public.project_messages (project_id, created_date);
create index if not exists idx_photos_project on public.project_photos (project_id);

-- ---------------------------------------------------------------------
-- Public website content (managed from the Admin Dashboard)
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null,
  location      text,
  about         text,
  specialties   jsonb not null default '[]'::jsonb,
  skills        jsonb not null default '[]'::jsonb,
  photo_url     text,
  portfolio_url text,
  sort_order    integer not null default 0,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);

create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  short_description text,
  description       text,
  icon              text not null default 'Globe',
  image_url         text,
  stack             jsonb not null default '[]'::jsonb,
  deliverables      jsonb not null default '[]'::jsonb,
  sort_order        integer not null default 0,
  is_published      boolean not null default true,
  created_date      timestamptz not null default now(),
  updated_date      timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  image_url     text,
  category      text not null default 'Web' check (category in ('Web','Robotics','Data','Research')),
  tech          jsonb not null default '[]'::jsonb,
  -- { timeline:[{name,duration,status,desc}], challenges:[{title,desc}],
  --   solutions:[{title,desc}], impact:[{value,label,desc}] }
  case_study    jsonb not null default '{}'::jsonb,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);

create table if not exists public.roadmap_milestones (
  id            uuid primary key default gen_random_uuid(),
  quarter       text not null,
  status        text not null default 'planned' check (status in ('done','active','upcoming','planned')),
  category      text not null default 'Web' check (category in ('Web','Robotics','Data','Research')),
  title         text not null,
  description   text,
  tags          jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_date  timestamptz not null default now(),
  updated_date  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Inbox + notifications
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  email        text not null check (char_length(email) between 3 and 254 and email ~ '^\S+@\S+\.\S+$'),
  message      text not null check (char_length(message) between 10 and 5000),
  created_date timestamptz not null default now()
);

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient    text not null,
  subject      text not null,
  body         text not null,
  delivered    boolean not null default false,
  created_date timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_date triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','client_projects','deliverables','change_requests','deliverable_reviews',
    'project_messages','project_photos','team_members','services','portfolio_projects','roadmap_milestones'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_date()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.client_projects     enable row level security;
alter table public.deliverables        enable row level security;
alter table public.change_requests     enable row level security;
alter table public.deliverable_reviews enable row level security;
alter table public.project_messages    enable row level security;
alter table public.project_photos      enable row level security;
alter table public.team_members        enable row level security;
alter table public.services            enable row level security;
alter table public.portfolio_projects  enable row level security;
alter table public.roadmap_milestones  enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.notifications       enable row level security;

-- profiles: read own (or all if admin); only admins change roles/rows
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- client_projects
create policy "client_projects_select" on public.client_projects for select to authenticated
  using (public.is_admin() or lower(client_email) = public.jwt_email());
create policy "client_projects_admin_write" on public.client_projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- deliverables
create policy "deliverables_select" on public.deliverables for select to authenticated
  using (public.is_admin() or public.owns_project(project_id));
create policy "deliverables_admin_write" on public.deliverables for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- project_photos
create policy "project_photos_select" on public.project_photos for select to authenticated
  using (public.is_admin() or public.owns_project(project_id));
create policy "project_photos_admin_write" on public.project_photos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- change_requests: clients may only create 'Submitted' requests for their own projects
create policy "change_requests_select" on public.change_requests for select to authenticated
  using (public.is_admin() or public.owns_project(project_id));
create policy "change_requests_client_insert" on public.change_requests for insert to authenticated
  with check (
    public.owns_project(project_id)
    and lower(client_email) = public.jwt_email()
    and status = 'Submitted'
    and admin_notes is null
  );
create policy "change_requests_admin_write" on public.change_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- deliverable_reviews: clients may only create 'Pending' reviews for their own deliverables
create policy "reviews_select" on public.deliverable_reviews for select to authenticated
  using (public.is_admin() or lower(client_email) = public.jwt_email());
create policy "reviews_client_insert" on public.deliverable_reviews for insert to authenticated
  with check (
    public.owns_project(project_id)
    and lower(client_email) = public.jwt_email()
    and status = 'Pending'
    and team_response is null
    and exists (select 1 from public.deliverables d where d.id = deliverable_id and d.project_id = deliverable_reviews.project_id)
  );
create policy "reviews_admin_write" on public.deliverable_reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- project_messages: clients post as 'client' on their own projects; admins post as 'team'
create policy "messages_select" on public.project_messages for select to authenticated
  using (public.is_admin() or public.owns_project(project_id));
create policy "messages_client_insert" on public.project_messages for insert to authenticated
  with check (
    public.owns_project(project_id)
    and sender_role = 'client'
    and lower(sender_email) = public.jwt_email()
  );
create policy "messages_admin_write" on public.project_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Public website content: anyone can read published rows; only admins write
create policy "team_members_public_read" on public.team_members for select to anon, authenticated using (true);
create policy "team_members_admin_write" on public.team_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "services_public_read" on public.services for select to anon, authenticated
  using (is_published or public.is_admin());
create policy "services_admin_write" on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "portfolio_public_read" on public.portfolio_projects for select to anon, authenticated
  using (is_published or public.is_admin());
create policy "portfolio_admin_write" on public.portfolio_projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "roadmap_public_read" on public.roadmap_milestones for select to anon, authenticated
  using (is_published or public.is_admin());
create policy "roadmap_admin_write" on public.roadmap_milestones for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contact form: anyone can submit, only admins can read/delete
create policy "contact_insert_public" on public.contact_messages for insert to anon, authenticated
  with check (true);
create policy "contact_admin_read" on public.contact_messages for select to authenticated
  using (public.is_admin());
create policy "contact_admin_delete" on public.contact_messages for delete to authenticated
  using (public.is_admin());

-- notifications: admins read/write; clients may only notify the team
create policy "notifications_admin_all" on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "notifications_client_to_team" on public.notifications for insert to authenticated
  with check (
    lower(recipient) = 'team@codecraft.dev'
    or lower(recipient) in (select lower(email) from public.profiles where role = 'admin')
  );

-- ---------------------------------------------------------------------
-- Storage
--   public-assets : team photos, service/portfolio images (public read)
--   client-files  : deliverables + project photos (private, signed URLs)
-- Free plan max file size is 50 MB; raise it on a paid plan if needed.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-assets', 'public-assets', true, 10485760,
    array['image/jpeg','image/png','image/webp','image/gif']),
  ('client-files', 'client-files', false, 52428800,
    array['image/jpeg','image/png','image/webp','image/gif','application/pdf',
          'application/zip','application/x-zip-compressed','text/plain','video/mp4','video/webm',
          'application/msword','application/vnd.ms-excel','application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "public_assets_admin_write" on storage.objects for all to authenticated
  using (bucket_id = 'public-assets' and public.is_admin())
  with check (bucket_id = 'public-assets' and public.is_admin());

create policy "client_files_admin_all" on storage.objects for all to authenticated
  using (bucket_id = 'client-files' and public.is_admin())
  with check (bucket_id = 'client-files' and public.is_admin());

-- A client can read a private file only if it is attached to one of their projects
create policy "client_files_client_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'client-files'
    and (
      exists (select 1 from public.deliverables d
              where d.file_url = 'private:' || storage.objects.name and public.owns_project(d.project_id))
      or exists (select 1 from public.project_photos p
              where p.photo_url = 'private:' || storage.objects.name and public.owns_project(p.project_id))
    )
  );

-- ---------------------------------------------------------------------
-- Realtime (live project chat)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_messages'
  ) then
    alter publication supabase_realtime add table public.project_messages;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- AFTER you create your own login (Authentication → Users → Add user),
-- promote yourself to admin by running (replace the email):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
