-- ============================================================
--  Awaaz — Supabase Schema
--  Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
--  complaints
-- ────────────────────────────────────────────────────────────
create table if not exists complaints (
  id           uuid primary key default gen_random_uuid(),
  text         text         not null,
  language     text         not null,
  category     text         not null,
  keywords     text[]       not null default '{}',
  department   text         not null,
  location     jsonb        not null default '{}',   -- { village, district, state }
  status       text         not null default 'pending',
  petition     text,
  audio_url    text,
  image_url    text,        -- URL from Supabase storage
  image_timestamp text,     -- ISO timestamp when image uploaded
  cluster_id   text,
  cluster_count integer      not null default 1,
  escalation_level integer   not null default 0,
  last_escalation_date text,
  status_history jsonb       not null default '[]',  -- array of {status, timestamp, notes}
  emails       jsonb        not null default '[]',   -- array of email communications
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

-- Index for cluster queries
create index if not exists complaints_cluster_id_idx on complaints (cluster_id);
-- Index for status filtering
create index if not exists complaints_status_idx on complaints (status);
-- Index for category filtering
create index if not exists complaints_category_idx on complaints (category);
-- Time-ordered fetch
create index if not exists complaints_created_at_idx on complaints (created_at desc);

-- ────────────────────────────────────────────────────────────
--  wiki_entries
-- ────────────────────────────────────────────────────────────
create table if not exists wiki_entries (
  id            uuid primary key default gen_random_uuid(),
  transcription text         not null,
  language      text         not null,
  english       text         not null default '',
  hindi         text         not null default '',
  title         text         not null,
  category      text         not null,
  tags          text[]       not null default '{}',
  description   text         not null default '',
  elder_name    text,
  village       text,
  audio_url     text,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

-- Index for category filtering
create index if not exists wiki_entries_category_idx on wiki_entries (category);
-- Index for village filtering
create index if not exists wiki_entries_village_idx on wiki_entries (village);
-- GIN index for tag array overlap queries
create index if not exists wiki_entries_tags_gin_idx on wiki_entries using gin (tags);
-- Time-ordered fetch
create index if not exists wiki_entries_created_at_idx on wiki_entries (created_at desc);

-- ────────────────────────────────────────────────────────────
--  Row Level Security (RLS)
--  Backend needs INSERT/UPDATE/DELETE. If using anon key,
--  these policies are required (service_role bypasses RLS).
-- ────────────────────────────────────────────────────────────
alter table complaints   enable row level security;
alter table wiki_entries enable row level security;

-- complaints (drop if exists for idempotency)
drop policy if exists "Public read complaints" on complaints;
drop policy if exists "Allow insert complaints" on complaints;
drop policy if exists "Allow update complaints" on complaints;
drop policy if exists "Allow delete complaints" on complaints;
create policy "Public read complaints" on complaints for select using (true);
create policy "Allow insert complaints" on complaints for insert with check (true);
create policy "Allow update complaints" on complaints for update using (true);
create policy "Allow delete complaints" on complaints for delete using (true);

-- wiki_entries
drop policy if exists "Public read wiki_entries" on wiki_entries;
drop policy if exists "Allow insert wiki_entries" on wiki_entries;
drop policy if exists "Allow update wiki_entries" on wiki_entries;
drop policy if exists "Allow delete wiki_entries" on wiki_entries;
create policy "Public read wiki_entries" on wiki_entries for select using (true);
create policy "Allow insert wiki_entries" on wiki_entries for insert with check (true);
create policy "Allow update wiki_entries" on wiki_entries for update using (true);
create policy "Allow delete wiki_entries" on wiki_entries for delete using (true);

-- ────────────────────────────────────────────────────────────
--  Storage Buckets
-- ────────────────────────────────────────────────────────────
-- Create the 'upload' bucket for complaint images/audio
insert into storage.buckets (id, name, public) values ('upload', 'upload', true);

-- Storage policies for 'upload' bucket
drop policy if exists "Public read upload" on storage.objects;
drop policy if exists "Allow insert upload" on storage.objects;
drop policy if exists "Allow update upload" on storage.objects;
drop policy if exists "Allow delete upload" on storage.objects;

create policy "Public read upload" on storage.objects for select using (bucket_id = 'upload');
create policy "Allow insert upload" on storage.objects for insert with check (bucket_id = 'upload');
create policy "Allow update upload" on storage.objects for update using (bucket_id = 'upload');
create policy "Allow delete upload" on storage.objects for delete using (bucket_id = 'upload');
