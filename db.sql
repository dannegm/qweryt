-- db.sql — canonical schema for qweryt (Supabase / PostgreSQL, schema `qweryt`)
-- This file is the single source of truth for recreating the database from scratch.
-- It is NOT a migration history — it always reflects the current desired state.
-- Changes go through /migrate (creates migrations/NNN_*.sql AND updates this file).
-- The schema must be exposed in Supabase → Settings → API → Exposed schemas.

create schema if not exists qweryt;

-- Tablas

create table if not exists qweryt.profiles (
  id text primary key, -- client-generated nanoid(10), stored in the browser settings
  name text not null,
  color text not null default '#4f46e5',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists qweryt.qrs (
  id text primary key, -- client-generated nanoid(8), also the public link: /q/<id>
  profile_id text not null references qweryt.profiles(id) on delete cascade,
  title text not null default '',
  type text not null, -- content type id: url, text, wifi, vcard, email, phone, sms, geo, event
  content jsonb not null default '{}'::jsonb, -- the type's field values (url: { url, shorten, short_url })
  style jsonb not null default '{}'::jsonb, -- engine style (shapes, colors, logo data URI…)
  card_color text not null default '#4f46e5',
  v int not null default 1, -- schema version of content/style
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qrs_content_max_size check (octet_length(content::text) <= 20000),
  constraint qrs_style_max_size check (octet_length(style::text) <= 200000)
);

-- Índices

create index if not exists idx_qrs_profile_id_created_at on qweryt.qrs (profile_id, created_at desc);

-- Row Level Security

alter table qweryt.profiles enable row level security;
create policy "profiles: permitir todo"
  on qweryt.profiles for all using (true) with check (true);

alter table qweryt.qrs enable row level security;
create policy "qrs: permitir todo"
  on qweryt.qrs for all using (true) with check (true);

-- Grants (sin auth: anon y authenticated tienen acceso completo)

grant usage on schema qweryt to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema qweryt to anon, authenticated;
grant usage, select on all sequences in schema qweryt to anon, authenticated;

alter default privileges in schema qweryt
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema qweryt
  grant usage, select on sequences to anon, authenticated;
