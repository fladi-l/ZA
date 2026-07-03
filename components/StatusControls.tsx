"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TopicStatus, Responsible } from "@/lib/types";

const STATUS_OPTIONS: { value: TopicStatus; label: string }[] = [
  { value: "nicht_begonnen", label: "Nicht begonnen" },
  { value: "in_bearbeitung", label: "In Bearbeitung" },
  { value: "erledigt", label: "Erledigt" },
];

const RESPONSIBLE_OPTIONS: { value: Responsible; label: string }[] = [
  { value: "ich", label: "Ich" },
  { value: "freundin", label: "Freundin" },
  { value: "beide", label: "Beide" },
];

export function StatusControls({
  topicId,
  initialStatus,
  initialResponsible,
  userId,
}: {
  topicId: string;
  initialStatus: TopicStatus;
  initialResponsible: Responsible;
  userId: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [responsible, setResponsible] = useState(initialResponsible);
  const supabase = createClient();

  async function updateStatus(value: TopicStatus) {
    setStatus(value);
    await supabase
      .from("topics")
      .update({ status: value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", topicId);
  }

  async function updateResponsible(value: Responsible) {
    setResponsible(value);
    await supabase
      .from("topics")
      .update({ responsible: value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", topicId);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value as TopicStatus)}
        className="rounded-xl border border-sand-dark bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={responsible}
        onChange={(e) => updateResponsible(e.target.value as Responsible)}
        className="rounded-xl border border-sand-dark bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta"
      >
        {RESPONSIBLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
