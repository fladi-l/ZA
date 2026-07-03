"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/types";

export function Checklist({
  topicId,
  initialItems,
  userId,
}: {
  topicId: string;
  initialItems: ChecklistItem[];
  userId: string;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newLabel, setNewLabel] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`checklist-${topicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_items", filter: `topic_id=eq.${topicId}` },
        () => {
          supabase
            .from("checklist_items")
            .select("*")
            .eq("topic_id", topicId)
            .order("sort_order", { ascending: true })
            .then(({ data }) => data && setItems(data));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, supabase]);

  async function addItem() {
    if (!newLabel.trim()) return;
    const { data } = await supabase
      .from("checklist_items")
      .insert({
        topic_id: topicId,
        label: newLabel.trim(),
        sort_order: items.length,
        created_by: userId,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
    setNewLabel("");
  }

  async function toggleItem(item: ChecklistItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i)));
    await supabase.from("checklist_items").update({ is_done: !item.is_done }).eq("id", item.id);
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("checklist_items").delete().eq("id", id);
  }

  return (
    <div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-sand-dark/40 bg-paper px-3 py-2.5"
          >
            <button
              onClick={() => toggleItem(item)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  item.is_done
                    ? "border-bush-700 bg-bush-700 text-paper"
                    : "border-sand-dark text-transparent"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </span>
              <span className={item.is_done ? "text-ink/40 line-through" : "text-ink"}>
                {item.label}
              </span>
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              aria-label="Eintrag löschen"
              className="text-ink/30 transition hover:text-terracotta"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Neuer Punkt…"
          className="flex-1 rounded-xl border border-sand-dark bg-sand-light px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <button
          onClick={addItem}
          className="flex items-center gap-1 rounded-xl bg-bush-700 px-3 py-2 text-sm font-medium text-paper transition hover:bg-bush-900"
        >
          <Plus size={16} /> Hinzufügen
        </button>
      </div>
    </div>
  );
}
