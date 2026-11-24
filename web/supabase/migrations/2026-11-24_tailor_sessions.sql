-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Adds the table for the new "analyze, ask, then write" tailoring flow.
-- Safe to run more than once.

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

alter table tailor_sessions enable row level security;
grant all on tailor_sessions to service_role;
