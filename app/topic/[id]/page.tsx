import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Checklist } from "@/components/Checklist";
import { Notes } from "@/components/Notes";
import { Comments } from "@/components/Comments";
import { Attachments } from "@/components/Attachments";
import { Links } from "@/components/Links";
import { StatusControls } from "@/components/StatusControls";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", params.id)
    .single();

  if (!topic) notFound();

  const [{ data: notes }, { data: checklistItems }, { data: attachments }, { data: links }, { data: comments }, { data: profiles }] =
    await Promise.all([
      supabase.from("notes").select("*").eq("topic_id", topic.id).order("created_at", { ascending: false }),
      supabase.from("checklist_items").select("*").eq("topic_id", topic.id).order("sort_order", { ascending: true }),
      supabase.from("attachments").select("*").eq("topic_id", topic.id).order("created_at", { ascending: false }),
      supabase.from("links").select("*").eq("topic_id", topic.id).order("created_at", { ascending: false }),
      supabase.from("comments").select("*").eq("topic_id", topic.id).order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name"),
    ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <main className="min-h-dvh bg-sand-light/40 pb-16">
      <header className="bg-bush-700 px-6 pb-8 pt-6 text-paper">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-sand transition hover:text-paper"
          >
            <ArrowLeft size={16} /> Alle Themen
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold">{topic.title}</h1>
          {topic.description && <p className="mt-1 text-sand">{topic.description}</p>}
        </div>
      </header>

      <div className="mx-auto -mt-4 max-w-3xl space-y-5 px-6">
        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <StatusControls
            topicId={topic.id}
            initialStatus={topic.status}
            initialResponsible={topic.responsible}
            userId={user.id}
          />
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Checkliste</h2>
          <div className="mt-3">
            <Checklist topicId={topic.id} initialItems={checklistItems ?? []} userId={user.id} />
          </div>
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Notizen</h2>
          <div className="mt-3">
            <Notes topicId={topic.id} initialNotes={notes ?? []} userId={user.id} nameById={nameById} />
          </div>
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Anhänge</h2>
          <div className="mt-3">
            <Attachments topicId={topic.id} initialAttachments={attachments ?? []} userId={user.id} />
          </div>
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Links</h2>
          <div className="mt-3">
            <Links topicId={topic.id} initialLinks={links ?? []} userId={user.id} />
          </div>
        </section>

        <section className="rounded-2xl bg-paper p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-bush-900">Kommentare</h2>
          <div className="mt-3">
            <Comments topicId={topic.id} initialComments={comments ?? []} userId={user.id} nameById={nameById} />
          </div>
        </section>
      </div>
    </main>
  );
}
