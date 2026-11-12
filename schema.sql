-- Run once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists profiles(
  id uuid primary key references auth.users on delete cascade,
  username text unique not null, full_name text not null,
  role text not null default 'staff' check (role in ('staff','leader','admin')),
  approved boolean not null default false, created_at timestamptz not null default now());
create table if not exists meetings(
  id uuid primary key default gen_random_uuid(), meeting_date date not null,
  kind text not null default 'staff_meeting' check (kind in ('staff_meeting','program')),
  title text, created_by uuid references profiles(id), created_at timestamptz not null default now(),
  unique(meeting_date,kind));
create table if not exists attendance(
  meeting_id uuid references meetings on delete cascade, user_id uuid references profiles on delete cascade,
  checked_in_at timestamptz not null default now(), primary key(meeting_id,user_id));
create table if not exists comments(
  id uuid primary key default gen_random_uuid(), meeting_id uuid not null references meetings on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade, body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now());

create or replace function is_approved() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and approved) $$;
create or replace function is_leader() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and approved and role in ('leader','admin')) $$;
create or replace function is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and approved and role='admin') $$;

-- New sign-up -> profile. The very first account becomes the approved admin.
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare first_user boolean;
begin
  select not exists(select 1 from profiles) into first_user;
  insert into profiles(id,username,full_name,role,approved)
  values(new.id, lower(new.raw_user_meta_data->>'username'), coalesce(new.raw_user_meta_data->>'full_name','?'),
         case when first_user then 'admin' else 'staff' end, first_user);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table profiles enable row level security; alter table meetings enable row level security;
alter table attendance enable row level security; alter table comments enable row level security;

create policy "profiles read" on profiles for select using (id=auth.uid() or is_approved());
create policy "profiles admin update" on profiles for update using (is_admin()) with check (is_admin());
create policy "meetings read" on meetings for select using (is_approved());
create policy "meetings leader write" on meetings for all using (is_leader()) with check (is_leader());
create policy "attendance read" on attendance for select using (user_id=auth.uid() or is_leader());
create policy "attendance self check-in (meeting day only)" on attendance for insert with check (
  is_approved() and user_id=auth.uid() and exists(select 1 from meetings m where m.id=meeting_id
  and m.meeting_date=(now() at time zone 'Africa/Addis_Ababa')::date));
create policy "attendance leader insert" on attendance for insert with check (is_leader());
create policy "attendance leader delete" on attendance for delete using (is_leader());
create policy "comments read" on comments for select using (is_approved());
create policy "comments insert" on comments for insert with check (is_approved() and author_id=auth.uid());
create policy "comments delete" on comments for delete using (author_id=auth.uid() or is_leader());
