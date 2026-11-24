-- JobFit database schema (Supabase / Postgres).
-- Run once in the Supabase SQL editor. The app talks to these tables only from
-- the server with the service-role key. RLS is enabled with NO policies, so the
-- public anon key cannot read or write anything.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  trial_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists otp_challenges (
  phone text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0
);

create or replace function increment_otp_attempts(p_phone text) returns void
language sql security definer set search_path = public as $$
  update otp_challenges set attempts = attempts + 1 where phone = p_phone;
$$;
-- Only the server (service_role / secret key) may call it, never the public API.
revoke execute on function increment_otp_attempts(text) from public, anon, authenticated;
grant execute on function increment_otp_attempts(text) to service_role;

create table if not exists rate_events (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_key_time on rate_events (key, created_at);

create table if not exists subscriptions (
  user_id uuid primary key references users(id) on delete cascade,
  plan text not null check (plan in ('trial','monthly','quarterly')),
  status text not null check (status in ('active','canceled','expired')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  provider_ref text
);

-- One free scan per phone number and per device, kept after account deletion
-- (user_id is nulled) so deleting and re-registering doesn't unlock another.
create table if not exists free_scans (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  phone text not null,
  device_id text not null,
  ip text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists free_scans_phone on free_scans (phone);
create index if not exists free_scans_device on free_scans (device_id);

create table if not exists usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('scan','tailor','cover')),
  created_at timestamptz not null default now()
);
create index if not exists usage_user_kind_time on usage_events (user_id, kind, created_at);

create table if not exists documents (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  analysis jsonb not null,
  resume jsonb not null,
  add_only_if_true jsonb not null default '[]',
  change_log jsonb not null default '[]',
  honesty_flags jsonb not null default '[]',
  source_resume_text text not null default '',
  cover_letter text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_user_time on documents (user_id, created_at desc);

-- Resume builder drafts (one-time product). Purchase unlocks one draft.
create table if not exists builder_drafts (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  mode text not null check (mode in ('improve','scratch')),
  answers jsonb not null,
  source_resume_text text not null default '',
  diagnosis jsonb not null default '[]',
  unlocked boolean not null default false,
  resume jsonb,
  notes jsonb not null default '[]',
  honesty_flags jsonb not null default '[]',
  template text not null default 'classic' check (template in ('classic','modern','minimal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists builder_drafts_user_time on builder_drafts (user_id, updated_at desc);

-- Tailoring step between "analyze" and "write": the analysis, the role research,
-- the questions and the candidate's answers. Deleted after 7 days by the app.
create table if not exists tailor_sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  resume_text text not null,
  job jsonb not null,
  language text not null default 'auto' check (language in ('auto','he','en')),
  analysis jsonb not null,
  questions jsonb not null default '[]',
  answers jsonb not null default '{}',
  document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tailor_sessions_user on tailor_sessions (user_id, created_at desc);
create index if not exists tailor_sessions_created on tailor_sessions (created_at);

-- Payments are kept for accounting even if the account is deleted.
create table if not exists payments (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  plan text not null,
  amount_agorot int not null,
  status text not null,
  provider_ref text not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table otp_challenges enable row level security;
alter table rate_events enable row level security;
alter table subscriptions enable row level security;
alter table free_scans enable row level security;
alter table usage_events enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table builder_drafts enable row level security;
alter table tailor_sessions enable row level security;

-- The server key works through the service_role Postgres role. Grant it
-- explicitly, in case the project doesn't expose new tables automatically.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Housekeeping (privacy policy): the app itself deletes, once a day, documents and
-- builder drafts not updated for 180 days, tailoring sessions older than 7 days,
-- expired login codes and old rate-limit counters (src/lib/privacy.ts).
