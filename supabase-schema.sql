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
  is_archived boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  caption text,
  image_url text,
  visual text,
  story_type text not null default 'general',
  published boolean not null default false,
  is_archived boolean not null default false,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- These ALTERs make the script safe to run on a project where the original
-- tables were created before lifecycle state was introduced.
alter table public.posts add column if not exists is_archived boolean not null default false;
alter table public.stories add column if not exists is_archived boolean not null default false;
alter table public.stories drop constraint if exists stories_post_id_fkey;
alter table public.stories
  add constraint stories_post_id_fkey foreign key (post_id)
  references public.posts(id) on delete cascade;
create index if not exists posts_public_feed_idx
  on public.posts (published, is_archived, created_at desc);
create index if not exists stories_active_post_idx
  on public.stories (post_id, published, is_archived, expires_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  post_key text,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  user_email text,
  text text not null,
  verified boolean not null default false,
  profession text,
  created_at timestamptz not null default now()
);

create table if not exists public.reach_us_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  budget text,
  message text not null,
  source text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'new',
  user_name text,
  avatar text,
  text text not null,
  post_id uuid references public.posts(id) on delete cascade,
  post_key text,
  unread boolean not null default true,
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

-- One transactional lifecycle operation keeps every Story linked to a Post
-- synchronized. A post delete relies on the FK cascade above; archive changes
-- only lifecycle state, never created_at (the feed-order field).
create or replace function public.manage_post_lifecycle(p_post_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if p_action = 'delete' then
    delete from public.posts where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
  elsif p_action in ('archive', 'unarchive') then
    update public.posts
      set is_archived = (p_action = 'archive')
      where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
    update public.stories
      set is_archived = (p_action = 'archive')
      where post_id = p_post_id;
  else
    raise exception 'Unsupported lifecycle action: %', p_action;
  end if;

  return jsonb_build_object('post_id', p_post_id, 'action', p_action);
end;
$$;

grant execute on function public.manage_post_lifecycle(uuid, text) to authenticated;

grant select on public.posts, public.stories to anon, authenticated;
grant insert, update, delete on public.posts, public.stories to authenticated;
grant select on public.admin_users to authenticated;
grant insert on public.comments, public.reach_us_messages to anon, authenticated;
grant select, delete on public.comments, public.reach_us_messages to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.stories enable row level security;
alter table public.comments enable row level security;
alter table public.reach_us_messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts"
on public.posts for select to anon, authenticated
using ((published = true and is_archived = false) or (select public.is_admin()));

drop policy if exists "admins can create posts" on public.posts;
create policy "admins can create posts"
on public.posts for insert to authenticated
with check ((select public.is_admin()) and created_by = (select auth.uid()));

drop policy if exists "admins can update posts" on public.posts;
create policy "admins can update posts"
on public.posts for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "public can read comments" on public.comments;
drop policy if exists "admins can read comments" on public.comments;
create policy "admins can read comments" on public.comments for select to authenticated using ((select public.is_admin()));
drop policy if exists "visitors can add comments" on public.comments;
create policy "visitors can add comments" on public.comments for insert to anon, authenticated
with check (length(trim(text)) between 1 and 2000 and verified = false and user_id is null);
drop policy if exists "admins can add comments" on public.comments;
create policy "admins can add comments" on public.comments for insert to authenticated
with check ((select public.is_admin()));
drop policy if exists "admins can delete comments" on public.comments;
create policy "admins can delete comments" on public.comments for delete to authenticated using ((select public.is_admin()));

drop policy if exists "visitors can send reach us messages" on public.reach_us_messages;
create policy "visitors can send reach us messages" on public.reach_us_messages for insert to anon, authenticated
with check (length(trim(name)) between 1 and 200 and length(trim(message)) between 1 and 5000);
drop policy if exists "admins can read reach us messages" on public.reach_us_messages;
create policy "admins can read reach us messages" on public.reach_us_messages for select to authenticated using ((select public.is_admin()));
drop policy if exists "admins can update reach us messages" on public.reach_us_messages;
drop policy if exists "admins can update reach_us messages" on public.reach_us_messages;
create policy "admins can update reach us messages" on public.reach_us_messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins can delete reach us messages" on public.reach_us_messages;
create policy "admins can delete reach us messages" on public.reach_us_messages for delete to authenticated using ((select public.is_admin()));

drop policy if exists "admins can manage notifications" on public.notifications;
create policy "admins can manage notifications" on public.notifications for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admins can delete posts" on public.posts;
create policy "admins can delete posts"
on public.posts for delete to authenticated
using ((select public.is_admin()));

drop policy if exists "public can read active stories" on public.stories;
create policy "public can read active stories"
on public.stories for select to anon, authenticated
using (
  (published = true and is_archived = false and expires_at > now()
    and (post_id is null or exists (
      select 1 from public.posts
      where posts.id = stories.post_id and posts.published = true and posts.is_archived = false
    )))
  or (select public.is_admin())
);

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
