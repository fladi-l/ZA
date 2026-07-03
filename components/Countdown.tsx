"use client";

import { differenceInCalendarDays } from "date-fns";

export function Countdown({ departureDate }: { departureDate: string | null }) {
  if (!departureDate) {
    return (
      <div className="horizon-arc relative rounded-2xl bg-bush-700 p-6 text-paper">
        <p className="relative z-10 font-mono text-xs uppercase tracking-widest text-sand">
          Countdown
        </p>
        <p className="relative z-10 mt-2 font-display text-xl">
          Abflugdatum noch nicht gesetzt
        </p>
      </div>
    );
  }

  const days = differenceInCalendarDays(new Date(departureDate), new Date());
  const label = days > 0 ? "Tage bis zum Abflug" : days === 0 ? "Heute geht's los!" : "Reise läuft / vorbei";

  return (
    <div className="horizon-arc relative overflow-hidden rounded-2xl bg-bush-700 p-6 text-paper">
      <p className="relative z-10 font-mono text-xs uppercase tracking-widest text-sand">
        Countdown
      </p>
      <p className="relative z-10 mt-2 font-display text-5xl font-semibold tabular-nums">
        {Math.max(days, 0)}
      </p>
      <p className="relative z-10 mt-1 text-sm text-sand">{label}</p>
    </div>
  );
}
