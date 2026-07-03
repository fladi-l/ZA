"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Anmeldung fehlgeschlagen. E-Mail oder Passwort prüfen.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="horizon-arc relative flex min-h-dvh items-center justify-center bg-bush-700 px-6">
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-paper p-8 shadow-cardHover">
        <p className="font-mono text-xs uppercase tracking-widest text-terracotta">
          Südafrika 2027
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-bush-700">
          Willkommen zurück
        </h1>
        <p className="mt-1 text-sm text-bush-500">Meldet euch an, um weiterzuplanen.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-sand-dark bg-sand-light px-4 py-3 text-ink outline-none transition focus:border-terracotta"
              placeholder="du@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-sand-dark bg-sand-light px-4 py-3 text-ink outline-none transition focus:border-terracotta"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-bush-700 px-4 py-3 font-semibold text-paper transition hover:bg-bush-900 disabled:opacity-60"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>
      </div>
    </main>
  );
}
