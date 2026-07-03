import type { TopicStatus, Responsible } from "@/lib/types";

const STATUS_STYLES: Record<TopicStatus, { label: string; className: string }> = {
  nicht_begonnen: {
    label: "Nicht begonnen",
    className: "bg-sand-dark/50 text-bush-700",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    className: "bg-terracotta/15 text-terracotta-dark",
  },
  erledigt: {
    label: "Erledigt",
    className: "bg-bush-100 text-bush-700",
  },
};

export function StatusBadge({ status }: { status: TopicStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

const RESPONSIBLE_LABELS: Record<Responsible, string> = {
  ich: "Ich",
  freundin: "Freundin",
  beide: "Beide",
};

export function ResponsibleBadge({ responsible }: { responsible: Responsible }) {
  return (
    <span className="inline-flex items-center rounded-full bg-bush-50 px-2.5 py-1 text-xs font-medium text-bush-700">
      {RESPONSIBLE_LABELS[responsible]}
    </span>
  );
}
