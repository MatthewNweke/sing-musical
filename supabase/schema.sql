-- Sing Musically — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once
-- you're ready to move off mock data. Row Level Security is enabled
-- everywhere a user's own data needs protecting.

create extension if not exists "uuid-ossp";

-- Profiles ------------------------------------------------------------
-- Mirrors auth.users 1:1, created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New Singer',
  handle text unique not null,
  avatar_url text,
  bio text default '',
  follower_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (new.id, 'user_' || substr(new.id::text, 1, 8), coalesce(new.raw_user_meta_data->>'display_name', 'New Singer'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Songs -----------------------------------------------------------------
create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  key text not null default 'C major',
  bpm integer not null default 120,
  duration_seconds integer not null default 0,
  cover_color text not null default 'mint',
  master_waveform jsonb not null default '[]',
  master_level_db numeric not null default -6,
  mix_quality text not null default 'needs_work' check (mix_quality in ('balanced', 'needs_work', 'clipping')),
  is_public boolean not null default false,
  plays integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;

create policy "Owners can do everything with their songs"
  on public.songs for all using (auth.uid() = owner_id);

create policy "Public songs are viewable by everyone"
  on public.songs for select using (is_public = true);

-- Tracks (multi-track mixer rows within a song) --------------------------
create table if not exists public.tracks (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid not null references public.songs(id) on delete cascade,
  role text not null check (role in ('lead_vocal', 'high_harmony', 'low_harmony', 'instrumental', 'upload')),
  label text not null,
  sublabel text not null default '',
  color text not null default 'mint',
  volume integer not null default 75 check (volume between 0 and 100),
  pan integer not null default 0 check (pan between -50 and 50),
  muted boolean not null default false,
  soloed boolean not null default false,
  waveform jsonb not null default '[]',
  storage_path text, -- points into the "audio" storage bucket once real recording lands
  created_at timestamptz not null default now()
);

alter table public.tracks enable row level security;

create policy "Track access follows the parent song"
  on public.tracks for all using (
    exists (
      select 1 from public.songs
      where songs.id = tracks.song_id
      and (songs.owner_id = auth.uid() or songs.is_public = true)
    )
  );

-- Live sessions -----------------------------------------------------------
create table if not exists public.live_sessions (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  is_live boolean not null default true,
  listener_count integer not null default 0,
  started_at timestamptz default now(),
  ended_at timestamptz
);

alter table public.live_sessions enable row level security;

create policy "Live sessions are viewable by everyone"
  on public.live_sessions for select using (true);

create policy "Hosts manage their own live sessions"
  on public.live_sessions for all using (auth.uid() = host_id);

-- Follows -------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users manage their own follow relationships"
  on public.follows for all using (auth.uid() = follower_id);

-- Storage: a private-by-default bucket for raw vocal/instrumental audio.
insert into storage.buckets (id, name, public)
values ('audio', 'audio', false)
on conflict (id) do nothing;

create policy "Users manage files in their own folder"
  on storage.objects for all using (
    bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text
  );
