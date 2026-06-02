-- Run this in your Supabase SQL Editor to create the database schema

-- Assessments table: one row per evaluation session
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  share_id text unique not null default substr(md5(random()::text), 1, 10),
  company text not null default '',
  sector text not null default '',
  eval_date date not null default current_date,
  scores jsonb not null default '{}',
  goals jsonb not null default '{}',
  notes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on save
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger assessments_updated_at
  before update on assessments
  for each row execute function update_updated_at();

-- Enable Row Level Security (public read/write via share_id)
alter table assessments enable row level security;

-- Allow anyone with the share_id to read and update (no auth required)
create policy "public read by share_id" on assessments
  for select using (true);

create policy "public insert" on assessments
  for insert with check (true);

create policy "public update" on assessments
  for update using (true);
