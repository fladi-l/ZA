import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/ai-context";

// Diese Route läuft serverseitig -> der API-Key ist nie im Browser sichtbar.
// Sie erwartet: { topicId, topicSlug, topicTitle, message }
// Sie speichert sowohl die Nutzer-Nachricht als auch die KI-Antwort in
// `ai_messages`, damit beide Reisenden den Verlauf sehen (Realtime).

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { topicId, topicSlug, topicTitle, message } = await request.json();

  if (!topicId || !message) {
    return NextResponse.json({ error: "topicId und message sind erforderlich." }, { status: 400 });
  }

  // 1) Nutzer-Nachricht speichern
  await supabase.from("ai_messages").insert({
    topic_id: topicId,
    role: "user",
    content: message,
    created_by: user.id,
  });

  // 2) Bisherigen Verlauf für Kontext laden (letzte 20 Nachrichten)
  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true })
    .limit(20);

  const systemPrompt = buildSystemPrompt(topicSlug, topicTitle);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ist nicht gesetzt. Siehe README für Setup." },
      { status: 500 }
    );
  }

  // 3) Claude-API aufrufen
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: (history ?? []).map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Anthropic API error:", errText);
    return NextResponse.json({ error: "KI-Anfrage fehlgeschlagen." }, { status: 502 });
  }

  const data = await response.json();
  const assistantText: string = data.content
    ?.filter((block: { type: string }) => block.type === "text")
    ?.map((block: { text: string }) => block.text)
    ?.join("\n") ?? "Keine Antwort erhalten.";

  // 4) KI-Antwort speichern
  await supabase.from("ai_messages").insert({
    topic_id: topicId,
    role: "assistant",
    content: assistantText,
    created_by: null,
  });

  return NextResponse.json({ reply: assistantText });
}
