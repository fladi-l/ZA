"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Attachment } from "@/lib/types";
import { Paperclip, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

const BUCKET = "attachments";

export function Attachments({
  topicId,
  initialAttachments,
  userId,
}: {
  topicId: string;
  initialAttachments: Attachment[];
  userId: string;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`attachments-${topicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attachments", filter: `topic_id=eq.${topicId}` },
        () => {
          supabase
            .from("attachments")
            .select("*")
            .eq("topic_id", topicId)
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setAttachments(data));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const path = `${topicId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

    if (!uploadError) {
      const { data } = await supabase
        .from("attachments")
        .insert({
          topic_id: topicId,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type,
          uploaded_by: userId,
        })
        .select()
        .single();
      if (data) setAttachments((prev) => [data, ...prev]);
    }

    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(att: Attachment) {
    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
    await supabase.storage.from(BUCKET).remove([att.storage_path]);
    await supabase.from("attachments").delete().eq("id", att.id);
  }

  function publicUrl(path: string) {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {attachments.map((att) => (
          <li
            key={att.id}
            className="group relative flex flex-col items-center gap-1.5 rounded-xl border border-sand-dark/40 bg-sand-light/70 p-3"
          >
            <a
              href={publicUrl(att.storage_path)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5"
            >
              {att.mime_type?.startsWith("image/") ? (
                <ImageIcon size={22} className="text-bush-700" />
              ) : (
                <FileText size={22} className="text-bush-700" />
              )}
              <span className="line-clamp-1 max-w-[9rem] text-center text-xs text-ink/70">
                {att.file_name}
              </span>
            </a>
            <button
              onClick={() => handleDelete(att)}
              aria-label="Anhang löschen"
              className="absolute right-1.5 top-1.5 text-ink/30 opacity-0 transition group-hover:opacity-100 hover:text-terracotta"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-sand-dark px-4 py-2.5 text-sm text-ink/70 transition hover:border-terracotta hover:text-terracotta-dark">
        <Paperclip size={16} />
        {uploading ? "Wird hochgeladen…" : "Bild oder PDF anhängen"}
        <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
      </label>
    </div>
  );
}
