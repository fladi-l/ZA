import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { Countdown } from "@/components/Countdown";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import type { Topic } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: topics } = await supabase.from("topics").select("*");
  const { data: tripMeta } = await supabase.from("trip_meta").select("*").single();
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");

  const list = (topics as Topic[] | null) ?? [];
  const total = list.length;
  const done = list.filter((t) => t.status === "erledigt").length;
  const open = total - done;
  const percent = total > 0 ? (done / total) * 100 : 0;

  const byResponsible = {
    ich: list.filter((t) => t.responsible === "ich"),
    freundin: list.filter((t) => t.responsible === "freundin"),
    beide: list.filter((t) => t.responsible === "beide"),
  };

  const recentlyUpdated = [...list]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <main className="min-h-dvh bg-sand-light/40 pb-16">
      <Header />

      <div className="mx-auto -mt-6 max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Countdown departureDate={tripMeta?.departure_date ?? null} />

          <div className="rounded-2xl bg-paper p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
              Gesamtfortschritt
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-bush-900">
              {done} / {total}
            </p>
            <div className="mt-4">
              <ProgressBar percent={percent} />
            </div>
          </div>

          <div className="rounded-2xl bg-paper p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
              Offene Aufgaben
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-terracotta-dark">
              {open}
            </p>
            <p className="mt-1 text-sm text-ink/60">noch nicht erledigt</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-paper p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-bush-900">
              Nach Verantwortlichem
            </h2>
            <div className="mt-4 space-y-4">
              {(["ich", "freundin", "beide"] as const).map((key) => (
                <div key={key}>
                  <p className="text-sm font-medium capitalize text-ink/70">
                    {key === "ich" ? "Ich" : key === "freundin" ? "Freundin" : "Beide"} (
                    {byResponsible[key].length})
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {byResponsible[key].map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/topic/${t.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sand-light px-3 py-1 text-xs text-ink/80 transition hover:bg-sand"
                        >
                          {t.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-paper p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-bush-900">
              Letzte Änderungen
            </h2>
            <ul className="mt-4 space-y-3">
              {recentlyUpdated.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/topic/${t.slug}`} className="font-medium text-ink hover:text-terracotta-dark">
                      {t.title}
                    </Link>
                    <p className="text-xs text-ink/50">
                      {t.updated_by ? `von ${nameById.get(t.updated_by) ?? "?"} · ` : ""}
                      {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-paper p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Erledigte Aufgaben</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {list
              .filter((t) => t.status === "erledigt")
              .map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/topic/${t.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-bush-50 px-3 py-1.5 text-sm text-bush-700 transition hover:bg-bush-100"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            {done === 0 && <p className="text-sm text-ink/50">Noch nichts erledigt – auf geht's!</p>}
          </ul>
        </section>
      </div>
    </main>
  );
}
