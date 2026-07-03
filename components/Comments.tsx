"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function Comments({
  topicId,
  initialComments,
  userId,
  nameById,
}: {
  topicId: string;
  initialComments: Comment[];
  userId: string;
  nameById: Map<string, string>;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${topicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `topic_id=eq.${topicId}` },
        () => {
          supabase
            .from("comments")
            .select("*")
            .eq("topic_id", topicId)
            .order("created_at", { ascending: true })
            .then(({ data }) => data && setComments(data));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function addComment() {
    if (!draft.trim()) return;
    const { data } = await supabase
      .from("comments")
      .insert({ topic_id: topicId, content: draft.trim(), created_by: userId })
      .select()
      .single();
    if (data) setComments((prev) => [...prev, data]);
    setDraft("");
  }

  return (
    <div>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bush-50 font-mono text-xs font-medium text-bush-700">
              {(nameById.get(c.created_by) ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 rounded-xl bg-sand-light/70 p-3">
              <p className="text-sm text-ink">{c.content}</p>
              <p className="mt-1 font-mono text-xs text-ink/45">
                {nameById.get(c.created_by) ?? "Unbekannt"} ·{" "}
                {format(new Date(c.created_at), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
              </p>
            </div>
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-ink/50">Noch keine Kommentare.</p>
        )}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addComment()}
          placeholder="Kommentieren…"
          className="flex-1 rounded-xl border border-sand-dark bg-sand-light px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <button
          onClick={addComment}
          className="rounded-xl bg-bush-700 px-4 py-2 text-sm font-medium text-paper transition hover:bg-bush-900"
        >
          Senden
        </button>
      </div>
    </div>
  );
}
