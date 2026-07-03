"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AiMessage } from "@/lib/types";
import { Sparkles, Send } from "lucide-react";

export function AIAssistant({
  topicId,
  topicSlug,
  topicTitle,
  initialMessages,
}: {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  initialMessages: AiMessage[];
}) {
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`ai-${topicId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_messages", filter: `topic_id=eq.${topicId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as AiMessage).id)) return prev;
            return [...prev, payload.new as AiMessage];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, topicSlug, topicTitle, message: text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Unbekannter Fehler");
      }
      // Antworten kommen über die Realtime-Subscription rein;
      // hier reicht ein Reload der Nachrichtenliste als Fallback.
      const { data } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          topic_id: topicId,
          role: "assistant",
          content:
            err instanceof Error
              ? `⚠️ ${err.message}`
              : "⚠️ Die KI-Anfrage ist fehlgeschlagen.",
          created_by: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-terracotta/25 bg-terracotta/[0.04] p-4">
      <div className="flex items-center gap-2 text-terracotta-dark">
        <Sparkles size={18} />
        <h3 className="font-display text-base font-semibold">KI-Assistent · {topicTitle}</h3>
      </div>

      <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-ink/55">
            Frag mich zu {topicTitle.toLowerCase()} – ich kenne den Kontext dieses Themas
            und helfe bei Planung, offenen Punkten und Fristen.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-bush-700 text-paper"
                : "bg-paper text-ink shadow-sm"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Frage stellen…"
          className="flex-1 rounded-xl border border-terracotta/30 bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-terracotta px-3 py-2 text-sm font-medium text-paper transition hover:bg-terracotta-dark disabled:opacity-60"
        >
          <Send size={15} />
          {loading ? "…" : "Senden"}
        </button>
      </div>
    </div>
  );
}
