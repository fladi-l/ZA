# Südafrika Reiseplaner

Private Web-App für zwei Personen zur Planung einer Südafrika-Reise.
Next.js 14 (App Router) + Supabase (DB, Auth, Storage, Realtime) + Claude-API.

## 1. Supabase-Projekt anlegen

1. Auf https://supabase.com ein neues Projekt erstellen.
2. Unter **SQL Editor** den kompletten Inhalt von `supabase/schema.sql` einfügen und ausführen.
   Das legt alle Tabellen, Row-Level-Security-Policies, Realtime-Freigaben und die
   13 Standard-Themen an.
3. Unter **Storage** einen neuen Bucket namens `attachments` anlegen (Public Bucket = an,
   damit Bilder/PDFs direkt verlinkt werden können).
4. Unter **Authentication -> Providers** sicherstellen, dass "Email" aktiviert ist.
   Unter **Authentication -> Users** manuell genau zwei Nutzer anlegen (eure beiden
   E-Mail-Adressen + Passwort, "Auto Confirm User" aktivieren).
5. Für jeden der beiden angelegten Auth-User im **SQL Editor** einen Eintrag in
   `profiles` anlegen (User-ID aus der Auth-Tabelle kopieren):

   ```sql
   insert into public.profiles (id, display_name, email) values
     ('<uuid-von-user-1>', 'Ich', 'ich@example.com'),
     ('<uuid-von-user-2>', 'Freundin', 'freundin@example.com');
   ```

   Nur wer hier eingetragen ist, darf die App überhaupt sehen (Row Level Security
   greift über `is_trip_member()`).

6. Optional: Abflug-/Rückreisedatum für den Countdown setzen:

   ```sql
   update public.trip_meta
   set departure_date = '2027-02-10', return_date = '2027-02-28';
   ```

## 2. Lokale Entwicklung

```bash
cp .env.local.example .env.local
# Werte aus Supabase (Settings -> API) eintragen
npm install
npm run dev
```

App läuft dann auf http://localhost:3000. Der erste Aufruf leitet automatisch
zu `/login` weiter.

## 3. Deployment auf Vercel

1. Repo zu GitHub pushen.
2. Auf https://vercel.com "Add New Project" -> Repo auswählen.
3. Unter **Environment Variables** die zwei Werte aus `.env.local` eintragen
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy klicken. Fertig – die App ist live, nur für euch zwei zugänglich.

Kosten: Sowohl Supabase als auch Vercel bieten für dieses kleine private
Projekt einen kostenlosen Free-Tier, der völlig ausreicht. Es fallen keine
laufenden Kosten an.

## Architektur-Überblick

- **Auth**: Supabase Auth (E-Mail/Passwort). `middleware.ts` schützt alle Seiten
  außer `/login`. Row Level Security in der DB stellt zusätzlich sicher, dass
  nur die zwei in `profiles` eingetragenen User überhaupt Daten sehen –
  selbst wenn jemand versehentlich einen dritten Auth-User anlegt.
- **Realtime-Sync**: Jede Client-Komponente (Checkliste, Notizen, Kommentare,
  Anhänge, Links) abonniert die passende Supabase-Realtime-Tabelle.
  Änderungen der einen Person erscheinen ohne Reload bei der anderen.
- **Design**: Tokensystem in `tailwind.config.ts` (Weiß/Dunkelgrün/Sand +
  Terracotta-Akzent), Fraunces als Display-Schrift, Inter für UI-Text,
  JetBrains Mono für Daten/Countdown/Status. Signature-Element ist der
  dezente „Horizont"-Verlauf (`.horizon-arc` in `app/globals.css`).

## Was als Nächstes sinnvoll wäre

- Push-Benachrichtigungen bei neuen Kommentaren (z. B. über Supabase Edge
  Functions + Web Push).
- Offline-Fähigkeit als PWA (Service Worker + Manifest).
- Foto-Vorschau direkt im Anhänge-Bereich statt nur Icon + Link.
- Falls später doch gewünscht: ein KI-Assistent lässt sich bei Bedarf wieder
  ergänzen, dann aber mit einem Budget-Limit im Anthropic-Dashboard, um die
  Kosten im Blick zu behalten.
