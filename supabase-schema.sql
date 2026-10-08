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
  is_deleted boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bundled_post_state (
  post_key text primary key,
  is_deleted boolean not null default false,
  is_archived boolean not null default false,
  is_permanently_deleted boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
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
  is_archived boolean not null default false,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- These ALTERs make the script safe to run on a project where the original
-- tables were created before lifecycle state was introduced.
alter table public.posts add column if not exists is_archived boolean not null default false;
alter table public.posts add column if not exists is_deleted boolean not null default false;
alter table public.posts add column if not exists published_at timestamptz;
update public.posts set published_at = created_at where published = true and published_at is null;
alter table public.stories add column if not exists is_archived boolean not null default false;
alter table public.bundled_post_state add column if not exists is_archived boolean not null default false;
alter table public.bundled_post_state add column if not exists is_permanently_deleted boolean not null default false;
insert into public.bundled_post_state (post_key,is_deleted,is_archived,updated_by,updated_at)
select substring(slug from 9),is_deleted,is_archived,created_by,updated_at
from public.posts where left(slug,8)='bundled-'
on conflict (post_key) do update
  set is_archived = excluded.is_archived, updated_at = now();
alter table public.stories drop constraint if exists stories_post_id_fkey;
alter table public.stories
  add constraint stories_post_id_fkey foreign key (post_id)
  references public.posts(id) on delete set null;
create index if not exists posts_public_feed_lifecycle_idx
  on public.posts (published, is_archived, is_deleted, created_at desc);
create index if not exists stories_active_post_idx
  on public.stories (post_id, published, is_archived, expires_at desc);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('post-media','post-media',true,20971520,array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

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

-- Normal deletion is recoverable. Only the explicit permanent_delete action
-- removes the row; linked stories are retained and detached by the FK.
create or replace function public.manage_post_lifecycle(p_post_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_archived boolean;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if p_action = 'delete' then
    update public.posts
      set is_deleted = true, updated_at = now()
      where id = p_post_id and is_deleted = false;
    if not found then raise exception 'Post not found or already deleted'; end if;
    select slug,is_archived into v_slug,v_archived from public.posts where id = p_post_id;
    if left(v_slug, 8) = 'bundled-' then
      insert into public.bundled_post_state (post_key,is_deleted,is_archived,is_permanently_deleted,updated_by,updated_at)
      values (substring(v_slug from 9),true,v_archived,false,auth.uid(),now())
      on conflict (post_key) do update
        set is_deleted = true, is_permanently_deleted = false, updated_by = auth.uid(), updated_at = now();
    end if;
  elsif p_action = 'restore' then
    update public.posts
      set is_deleted = false, updated_at = now()
      where id = p_post_id and is_deleted = true;
    if not found then raise exception 'Deleted post not found'; end if;
    select slug into v_slug from public.posts where id = p_post_id;
    if left(v_slug, 8) = 'bundled-' then
      update public.bundled_post_state
        set is_deleted = false, is_permanently_deleted = false, updated_by = auth.uid(), updated_at = now()
        where post_key = substring(v_slug from 9);
    end if;
  elsif p_action = 'publish' then
    update public.posts
      set published = true, is_archived = false, is_deleted = false,
          published_at = coalesce(published_at, now()), updated_at = now()
      where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
  elsif p_action = 'draft' then
    update public.posts
      set published = false, is_archived = false, is_deleted = false,
          published_at = null, updated_at = now()
      where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
  elsif p_action = 'permanent_delete' then
    select slug,is_archived into v_slug,v_archived from public.posts where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
    if left(v_slug, 8) = 'bundled-' then
      insert into public.bundled_post_state (post_key,is_deleted,is_archived,is_permanently_deleted,updated_by,updated_at)
      values (substring(v_slug from 9),true,v_archived,true,auth.uid(),now())
      on conflict (post_key) do update
        set is_deleted = true, is_permanently_deleted = true, updated_by = auth.uid(), updated_at = now();
    end if;
    update public.stories set published = false where post_id = p_post_id;
    delete from public.posts where id = p_post_id;
    if not found then raise exception 'Post not found'; end if;
  elsif p_action in ('archive', 'unarchive') then
    update public.posts
      set is_archived = (p_action = 'archive'), updated_at = now()
      where id = p_post_id and is_deleted = false;
    if not found then raise exception 'Post not found'; end if;
    select slug into v_slug from public.posts where id = p_post_id;
    if left(v_slug, 8) = 'bundled-' then
      insert into public.bundled_post_state (post_key,is_deleted,is_archived,is_permanently_deleted,updated_by,updated_at)
      values (substring(v_slug from 9),false,(p_action = 'archive'),false,auth.uid(),now())
      on conflict (post_key) do update
        set is_archived = (p_action = 'archive'), updated_by = auth.uid(), updated_at = now();
    end if;
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
grant select on public.bundled_post_state to anon, authenticated;
grant insert, update on public.bundled_post_state to authenticated;
grant insert on public.comments, public.reach_us_messages to anon, authenticated;
grant select, delete on public.comments, public.reach_us_messages to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.bundled_post_state enable row level security;
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
using ((published = true and is_archived = false and is_deleted = false) or (select public.is_admin()));

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

drop policy if exists "public can read bundled post state" on public.bundled_post_state;
create policy "public can read bundled post state"
on public.bundled_post_state for select to anon, authenticated
using (true);

drop policy if exists "admins can manage bundled post state" on public.bundled_post_state;
create policy "admins can manage bundled post state"
on public.bundled_post_state for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()) and (updated_by is null or updated_by = (select auth.uid())));

drop policy if exists "public can read active stories" on public.stories;
create policy "public can read active stories"
on public.stories for select to anon, authenticated
using (
  (published = true and is_archived = false and expires_at > now()
    and (post_id is null or exists (
      select 1 from public.posts
      where posts.id = stories.post_id and posts.published = true and posts.is_archived = false
        and posts.is_deleted = false
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

drop policy if exists "public can read post media" on storage.objects;
create policy "public can read post media"
on storage.objects for select to public
using (bucket_id = 'post-media');

drop policy if exists "admins can upload post media" on storage.objects;
create policy "admins can upload post media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'post-media'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "admins can update post media" on storage.objects;
create policy "admins can update post media"
on storage.objects for update to authenticated
using (
  bucket_id = 'post-media'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'post-media'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "admins can delete post media" on storage.objects;
create policy "admins can delete post media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'post-media'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
