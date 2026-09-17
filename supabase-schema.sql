-- SpaceMush content and admin foundation
-- Run this whole script in Supabase SQL Editor.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  handle text not null default 'spacemush_architects_chennai',
  subtitle text,
  caption text,
  location text,
  category text,
  post_type text not null default 'project',
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  caption text,
  image_url text,
  visual text,
  story_type text not null default 'general',
  published boolean not null default false,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

grant select on public.posts, public.stories to anon, authenticated;
grant insert, update, delete on public.posts, public.stories to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.stories enable row level security;

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts"
on public.posts for select to anon, authenticated
using (published = true or (select public.is_admin()));

drop policy if exists "admins can create posts" on public.posts;
create policy "admins can create posts"
on public.posts for insert to authenticated
with check ((select public.is_admin()) and created_by = (select auth.uid()));

drop policy if exists "admins can update posts" on public.posts;
create policy "admins can update posts"
on public.posts for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins can delete posts" on public.posts;
create policy "admins can delete posts"
on public.posts for delete to authenticated
using ((select public.is_admin()));

drop policy if exists "public can read active stories" on public.stories;
create policy "public can read active stories"
on public.stories for select to anon, authenticated
using ((published = true and expires_at > now()) or (select public.is_admin()));

drop policy if exists "admins can create stories" on public.stories;
create policy "admins can create stories"
on public.stories for insert to authenticated
with check ((select public.is_admin()) and created_by = (select auth.uid()));

drop policy if exists "admins can update stories" on public.stories;
create policy "admins can update stories"
on public.stories for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins can delete stories" on public.stories;
create policy "admins can delete stories"
on public.stories for delete to authenticated
using ((select public.is_admin()));
