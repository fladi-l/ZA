"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function Notes({
  topicId,
  initialNotes,
  userId,
  nameById,
}: {
  topicId: string;
  initialNotes: Note[];
  userId: string;
  nameById: Map<string, string>;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`notes-${topicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `topic_id=eq.${topicId}` },
        () => {
          supabase
            .from("notes")
            .select("*")
            .eq("topic_id", topicId)
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setNotes(data));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function addNote() {
    if (!draft.trim()) return;
    const { data } = await supabase
      .from("notes")
      .insert({ topic_id: topicId, content: draft.trim(), created_by: userId })
      .select()
      .single();
    if (data) setNotes((prev) => [data, ...prev]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Notiz hinzufügen…"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-sand-dark bg-sand-light px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <button
          onClick={addNote}
          className="self-end rounded-xl bg-bush-700 px-4 py-2 text-sm font-medium text-paper transition hover:bg-bush-900"
        >
          Speichern
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {notes.map((note) => (
          <li key={note.id} className="rounded-xl bg-sand-light/70 p-3">
            <p className="whitespace-pre-wrap text-sm text-ink">{note.content}</p>
            <p className="mt-1.5 font-mono text-xs text-ink/45">
              {nameById.get(note.created_by) ?? "Unbekannt"} ·{" "}
              {format(new Date(note.created_at), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
            </p>
          </li>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-ink/50">Noch keine Notizen vorhanden.</p>
        )}
      </ul>
    </div>
  );
}
