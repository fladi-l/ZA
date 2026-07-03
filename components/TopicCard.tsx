import Link from "next/link";
import * as Icons from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { StatusBadge, ResponsibleBadge } from "./StatusBadge";
import type { Topic } from "@/lib/types";

interface TopicCardProps {
  topic: Topic;
  noteCount: number;
}

export function TopicCard({ topic, noteCount }: TopicCardProps) {
  // dynamisches Icon aus lucide-react anhand des in der DB gespeicherten Namens
  const IconComponent =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[topic.icon] ?? Icons.Circle;

  return (
    <Link
      href={`/topic/${topic.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-sand-dark/40 bg-paper p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bush-50 text-bush-700 transition group-hover:bg-terracotta/10 group-hover:text-terracotta-dark">
            <IconComponent size={22} strokeWidth={1.75} />
          </div>
          <StatusBadge status={topic.status} />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-bush-900">
          {topic.title}
        </h3>
        {topic.description && (
          <p className="mt-1 text-sm text-ink/60">{topic.description}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-sand-dark/40 pt-3">
        <ResponsibleBadge responsible={topic.responsible} />
        <div className="text-right font-mono text-xs text-ink/50">
          <p>{noteCount} {noteCount === 1 ? "Notiz" : "Notizen"}</p>
          <p>
            {formatDistanceToNow(new Date(topic.updated_at), {
              addSuffix: true,
              locale: de,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
