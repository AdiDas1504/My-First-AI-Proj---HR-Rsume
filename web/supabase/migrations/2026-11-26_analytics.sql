-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Adds the tables for the owner dashboard (page views and AI cost). Safe to run more than once.

-- Anonymous page views for the owner's conversion funnel. "visitor" is a
-- one-way key of the browser's device cookie, never a phone or a name.
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  visitor text,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_time on analytics_events (created_at);

-- Real AI cost per call (tokens from the API response; cost in millionths of a dollar).
create table if not exists ai_usage (
  id bigint generated always as identity primary key,
  model text not null,
  purpose text not null,
  input_tokens int not null,
  output_tokens int not null,
  cost_micros bigint not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_time on ai_usage (created_at);

alter table analytics_events enable row level security;
alter table ai_usage enable row level security;
grant all on analytics_events to service_role;
grant all on ai_usage to service_role;
grant usage, select on all sequences in schema public to service_role;
