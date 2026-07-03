"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Link as LinkType } from "@/lib/types";
import { ExternalLink, Trash2 } from "lucide-react";

export function Links({
  topicId,
  initialLinks,
  userId,
}: {
  topicId: string;
  initialLinks: LinkType[];
  userId: string;
}) {
  const [links, setLinks] = useState<LinkType[]>(initialLinks);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`links-${topicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "links", filter: `topic_id=eq.${topicId}` },
        () => {
          supabase
            .from("links")
            .select("*")
            .eq("topic_id", topicId)
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setLinks(data));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function addLink() {
    if (!url.trim()) return;
    const { data } = await supabase
      .from("links")
      .insert({ topic_id: topicId, url: url.trim(), label: label.trim() || null, created_by: userId })
      .select()
      .single();
    if (data) setLinks((prev) => [data, ...prev]);
    setUrl("");
    setLabel("");
  }

  async function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("links").delete().eq("id", id);
  }

  return (
    <div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li
            key={l.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-sand-light/70 px-3 py-2"
          >
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 truncate text-sm text-bush-700 hover:text-terracotta-dark"
            >
              <ExternalLink size={14} className="shrink-0" />
              <span className="truncate">{l.label || l.url}</span>
            </a>
            <button
              onClick={() => deleteLink(l.id)}
              aria-label="Link löschen"
              className="shrink-0 text-ink/30 transition hover:text-terracotta"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {links.length === 0 && <p className="text-sm text-ink/50">Noch keine Links.</p>}
      </ul>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="flex-1 rounded-xl border border-sand-dark bg-sand-light px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Beschriftung (optional)"
          className="w-full rounded-xl border border-sand-dark bg-sand-light px-3 py-2 text-sm outline-none focus:border-terracotta sm:w-48"
        />
        <button
          onClick={addLink}
          className="rounded-xl bg-bush-700 px-4 py-2 text-sm font-medium text-paper transition hover:bg-bush-900"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  );
}
