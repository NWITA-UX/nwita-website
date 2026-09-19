"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full border border-line bg-transparent px-4 py-3.5 text-sm font-light text-bone placeholder:text-fog/50 focus:border-bone/60 focus:outline-none transition-colors";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5">
      <p className="font-display text-3xl tracking-[0.42em] text-bone">NWITA</p>
      <p className="label mt-3">Atelier Access</p>

      <form onSubmit={submit} className="mt-10 w-full max-w-sm border border-line bg-coal/70 p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="label mb-2 block">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nwita.com"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="password" className="label mb-2 block">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className={inputCls}
            />
          </div>
          {error && (
            <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-light text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-bone py-3.5 text-[11px] font-medium tracking-[0.32em] text-ink uppercase transition-colors hover:bg-wa disabled:opacity-50"
          >
            {busy ? "Opening the door…" : "Enter"}
          </button>
        </div>
      </form>

      <div className="mt-6 w-full max-w-sm border border-dashed border-line px-5 py-4 text-center">
        <p className="text-[11px] font-light leading-relaxed text-fog">
        </p>
      </div>
    </div>
  );
}
