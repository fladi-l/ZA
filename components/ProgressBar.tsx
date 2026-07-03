export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand-dark/50">
        <div
          className="h-full rounded-full bg-terracotta transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-xs text-ink/60">{Math.round(clamped)}% abgeschlossen</p>
    </div>
  );
}
