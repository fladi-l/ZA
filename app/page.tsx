import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { TopicCard } from "@/components/TopicCard";
import type { Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).single()
    : { data: null };

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: notes } = await supabase.from("notes").select("topic_id");

  const noteCounts = new Map<string, number>();
  for (const n of notes ?? []) {
    noteCounts.set(n.topic_id, (noteCounts.get(n.topic_id) ?? 0) + 1);
  }

  return (
    <main className="min-h-dvh bg-sand-light/40 pb-16">
      <Header activeUserName={profile?.display_name} />

      <div className="mx-auto -mt-6 max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(topics as Topic[] | null)?.map((topic) => (
            <TopicCard key={topic.id} topic={topic} noteCount={noteCounts.get(topic.id) ?? 0} />
          ))}
        </div>

        {(!topics || topics.length === 0) && (
          <div className="mt-12 rounded-2xl border border-dashed border-sand-dark p-10 text-center text-ink/60">
            Noch keine Themen vorhanden. Führt das Seed-SQL aus `supabase/schema.sql` aus.
          </div>
        )}
      </div>
    </main>
  );
}
