import Link from "next/link";
import { LayoutGrid, Gauge } from "lucide-react";

export function Header({ activeUserName }: { activeUserName?: string }) {
  return (
    <header className="horizon-arc relative bg-bush-700 px-6 pb-10 pt-8 text-paper">
      <div className="relative z-10 mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sand">
            Südafrika · 2027
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            Unser Reiseplaner
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-2 text-sm font-medium transition hover:bg-paper/20 sm:px-4"
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Themen</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-2 text-sm font-medium transition hover:bg-paper/20 sm:px-4"
          >
            <Gauge size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </nav>
      </div>
      {activeUserName && (
        <p className="relative z-10 mx-auto mt-4 max-w-5xl text-sm text-sand">
          Angemeldet als {activeUserName}
        </p>
      )}
    </header>
  );
}
