-- ============================================================
-- SA Trip Planner – Supabase Schema
-- Für genau 2 Nutzer (Ich + Freundin). Kein öffentliches Sign-up.
-- ============================================================

-- 1) PROFILE-TABELLE
-- Speichert die beiden erlaubten Nutzer. Wird nach Anlegen der
-- beiden Supabase-Auth-User manuell befüllt (siehe README).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- 2) TOPICS (die großen Karten auf der Startseite)
create type topic_status as enum ('nicht_begonnen', 'in_bearbeitung', 'erledigt');
create type responsible_type as enum ('ich', 'freundin', 'beide');

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,           -- z.B. 'fluege', 'mietwagen'
  title text not null,
  icon text not null default 'circle', -- lucide-react icon name
  description text,
  status topic_status not null default 'nicht_begonnen',
  responsible responsible_type not null default 'beide',
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

-- 3) NOTES (freie Notizen je Topic)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  content text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 4) CHECKLIST ITEMS
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  label text not null,
  is_done boolean not null default false,
  sort_order int not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 5) ATTACHMENTS (Bilder/PDFs, liegen im Supabase-Storage-Bucket 'attachments')
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 6) LINKS
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  url text not null,
  label text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 7) COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  content text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 8) TRIP META (für Countdown, Reisezeitraum – eine einzige Zeile)
create table if not exists public.trip_meta (
  id int primary key default 1,
  departure_date date,
  return_date date,
  constraint single_row check (id = 1)
);
insert into public.trip_meta (id) values (1) on conflict (id) do nothing;

-- 9) AI CONVERSATIONS (Verlauf des KI-Assistenten je Topic)
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Trigger: updated_at/updated_by auf topics automatisch pflegen,
-- sobald verknüpfte Kind-Objekte sich ändern, macht die App selbst
-- (einfacher als DB-Trigger, siehe lib/supabase/topics.ts)

-- ============================================================
-- ROW LEVEL SECURITY
-- Prinzip: Jeder eingeloggte Nutzer, der in `profiles` steht,
-- darf ALLES lesen und schreiben. Alle anderen (auch andere
-- Supabase-Auth-User, falls versehentlich angelegt) sehen nichts.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.notes enable row level security;
alter table public.checklist_items enable row level security;
alter table public.attachments enable row level security;
alter table public.links enable row level security;
alter table public.comments enable row level security;
alter table public.trip_meta enable row level security;
alter table public.ai_messages enable row level security;

-- Hilfsfunktion: ist der aktuelle User einer der beiden erlaubten?
create or replace function public.is_trip_member()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

create policy "trip members can read profiles"
  on public.profiles for select
  using (public.is_trip_member());

create policy "trip members full access topics"
  on public.topics for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access notes"
  on public.notes for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access checklist"
  on public.checklist_items for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access attachments"
  on public.attachments for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access links"
  on public.links for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access comments"
  on public.comments for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access trip_meta"
  on public.trip_meta for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

create policy "trip members full access ai_messages"
  on public.ai_messages for all
  using (public.is_trip_member())
  with check (public.is_trip_member());

-- ============================================================
-- STORAGE RLS für den 'attachments'-Bucket
-- Wichtig: der Bucket muss vorher manuell im Supabase-Dashboard
-- unter Storage angelegt werden (Name exakt: attachments).
-- Diese Policies erlauben Lesen/Schreiben/Löschen nur den beiden
-- eingetragenen Trip-Mitgliedern.
-- ============================================================
create policy "trip members read attachments bucket"
  on storage.objects for select
  using (bucket_id = 'attachments' and public.is_trip_member());

create policy "trip members upload attachments bucket"
  on storage.objects for insert
  with check (bucket_id = 'attachments' and public.is_trip_member());

create policy "trip members delete attachments bucket"
  on storage.objects for delete
  using (bucket_id = 'attachments' and public.is_trip_member());

-- ============================================================
-- REALTIME: alle relevanten Tabellen für Live-Sync freigeben
-- ============================================================
alter publication supabase_realtime add table public.topics;
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.checklist_items;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.attachments;
alter publication supabase_realtime add table public.links;

-- ============================================================
-- SEED: die 13 Standard-Themen aus dem Konzept
-- ============================================================
insert into public.topics (slug, title, icon, description, sort_order) values
  ('fluege', 'Flüge', 'plane', 'Hin- und Rückflug, Anschlussflüge, Gepäck', 1),
  ('mietwagen', 'Mietwagen', 'car', 'Fahrzeugwahl, Allrad, Versicherung', 2),
  ('unterkuenfte', 'Unterkünfte', 'bed', 'Hotels, Lodges, Guesthouses', 3),
  ('safari', 'Safari', 'binoculars', 'Nationalparks, Game Drives, Guides', 4),
  ('route', 'Route', 'map', 'Reihenfolge der Stationen, Fahrzeiten', 5),
  ('packliste', 'Packliste', 'backpack', 'Was muss mit?', 6),
  ('impfungen', 'Impfungen', 'syringe', 'Gesundheitsvorsorge, Malaria-Prophylaxe', 7),
  ('reiseversicherung', 'Reiseversicherung', 'shield-check', 'Kranken-, Reiserücktritts-, Gepäckversicherung', 8),
  ('budget', 'Budget', 'wallet', 'Kostenschätzung und Ausgaben-Tracking', 9),
  ('aktivitaeten', 'Aktivitäten', 'compass', 'Ausflüge, Touren, Erlebnisse', 10),
  ('restaurants', 'Restaurants', 'utensils', 'Essen & Trinken unterwegs', 11),
  ('einreise', 'Einreise', 'stamp', 'Visum, Pass, Einreisebestimmungen', 12),
  ('sonstiges', 'Sonstiges', 'sparkles', 'Alles andere', 13)
on conflict (slug) do nothing;
