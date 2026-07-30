"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn, waLink } from "@/lib/utils";
import { api } from "./ui";
import ProductsPanel from "./panels/ProductsPanel";
import CollectionsPanel from "./panels/CollectionsPanel";
import MediaPanel from "./panels/MediaPanel";
import HomepagePanel from "./panels/HomepagePanel";
import ContentPanel from "./panels/ContentPanel";
import SettingsPanel from "./panels/SettingsPanel";

type PanelId =
  | "overview"
  | "products"
  | "collections"
  | "media"
  | "homepage"
  | "content"
  | "settings";

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const NAV: { id: PanelId; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: icon(<><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>) },
  { id: "products", label: "Products", icon: icon(<><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="M12 12 4 7m8 5 8-5m-8 5v9" /></>) },
  { id: "collections", label: "Collections", icon: icon(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>) },
  { id: "media", label: "Media", icon: icon(<><rect x="3" y="5" width="18" height="14" /><path d="m10 9 5 3-5 3V9Z" /></>) },
  { id: "homepage", label: "Homepage", icon: icon(<><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></>) },
  { id: "content", label: "About & Contact", icon: icon(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>) },
  { id: "settings", label: "Settings", icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>) },
];

export default function AdminShell() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [panel, setPanel] = useState<PanelId>("overview");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          setEmail(d.user?.email ?? "");
          setAuthed(true);
        } else {
          setAuthed(false);
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        setAuthed(false);
        router.replace("/admin/login");
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (authed === null) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="animate-blink font-display text-2xl tracking-[0.42em] text-bone">NWITA</span>
      </div>
    );
  }
  if (!authed) return null;

  return (
    <div className="min-h-svh bg-ink">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-coal/60 md:flex">
        <Link href="/" className="border-b border-line px-6 py-6">
          <span className="font-display text-xl tracking-[0.38em] text-bone">NWITA</span>
          <span className="label mt-1 block !text-[9px]">Atelier CMS</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPanel(n.id)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-light transition-all duration-300",
                panel === n.id
                  ? "bg-bone text-ink"
                  : "text-bone/70 hover:bg-smoke hover:text-bone",
              )}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-xs font-light text-fog">{email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="flex-1 border border-line px-2 py-2 text-center text-[10px] font-medium tracking-[0.2em] text-bone/70 uppercase transition-colors hover:border-bone/60 hover:text-bone">
              View site
            </Link>
            <button onClick={logout} className="flex-1 border border-line px-2 py-2 text-[10px] font-medium tracking-[0.2em] text-fog uppercase transition-colors hover:border-red-400/60 hover:text-red-300">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="font-display text-base tracking-[0.35em] text-bone">NWITA · CMS</span>
          <button onClick={logout} className="label !text-[9px] hover:text-red-300">Sign out</button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPanel(n.id)}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[10px] font-light tracking-[0.15em] uppercase transition-colors",
                panel === n.id ? "border-bone bg-bone text-ink" : "border-line text-fog",
              )}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-8 md:ml-60 md:px-10 md:py-10">
        {panel === "overview" && <Overview goTo={setPanel} />}
        {panel === "products" && <ProductsPanel />}
        {panel === "collections" && <CollectionsPanel />}
        {panel === "media" && <MediaPanel />}
        {panel === "homepage" && <HomepagePanel />}
        {panel === "content" && <ContentPanel />}
        {panel === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ goTo }: { goTo: (p: PanelId) => void }) {
  const [stats, setStats] = useState<{
    published: number;
    hidden: number;
    collections: number;
    media: number;
    whatsapp: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      api("/api/products?all=1"),
      api("/api/collections?all=1"),
      api("/api/media"),
      api("/api/settings"),
    ])
      .then(([p, c, m, s]) => {
        const prods = (p as { products: { published: boolean }[] }).products;
        const cols = (c as { collections: unknown[] }).collections;
        const med = (m as { media: unknown[] }).media;
        const st = (s as { settings: { contact: { whatsapp: string } } }).settings;
        setStats({
          published: prods.filter((x) => x.published).length,
          hidden: prods.filter((x) => !x.published).length,
          collections: cols.length,
          media: med.length,
          whatsapp: st.contact.whatsapp,
        });
      })
      .catch(console.error);
  }, []);

  const tiles = stats
    ? [
        { label: "Published pieces", value: stats.published, panel: "products" as PanelId },
        { label: "Hidden pieces", value: stats.hidden, panel: "products" as PanelId },
        { label: "Collections", value: stats.collections, panel: "collections" as PanelId },
        { label: "Media files", value: stats.media, panel: "media" as PanelId },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <p className="label">The Atelier</p>
      <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">Good to see you.</h1>
      <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-fog">
        Everything on the website — products, collections, imagery, films, the hero, the
        story, even the WhatsApp number — is edited from here. No code required.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <button
            key={t.label}
            onClick={() => goTo(t.panel)}
            className="group border border-line bg-coal/50 p-5 text-left transition-all duration-300 hover:border-bone/50"
          >
            <span className="font-display text-4xl text-bone tabular-nums">
              {stats ? t.value : "–"}
            </span>
            <span className="label mt-2 block group-hover:text-bone/80">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border border-line bg-coal/50 p-6">
          <h2 className="font-display text-xl text-bone">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => goTo("products")} className="border border-line px-4 py-2.5 text-[10px] font-medium tracking-[0.2em] text-bone/80 uppercase transition-colors hover:border-bone/60">
              + New product
            </button>
            <button onClick={() => goTo("homepage")} className="border border-line px-4 py-2.5 text-[10px] font-medium tracking-[0.2em] text-bone/80 uppercase transition-colors hover:border-bone/60">
              Edit hero
            </button>
            <button onClick={() => goTo("media")} className="border border-line px-4 py-2.5 text-[10px] font-medium tracking-[0.2em] text-bone/80 uppercase transition-colors hover:border-bone/60">
              Upload film
            </button>
            <button onClick={() => goTo("settings")} className="border border-line px-4 py-2.5 text-[10px] font-medium tracking-[0.2em] text-bone/80 uppercase transition-colors hover:border-bone/60">
              Replace logo
            </button>
          </div>
        </div>
        <div className="border border-line bg-coal/50 p-6">
          <h2 className="font-display text-xl text-bone">Orders arrive here</h2>
          <p className="mt-3 text-xs font-light leading-relaxed text-fog">
            Every “Order on WhatsApp” button on the site opens a chat with{" "}
            <span className="text-wa">+{stats?.whatsapp ?? "…"}</span>. Change the number any
            time under About & Contact.
          </p>
          {stats?.whatsapp && (
            <a
              href={waLink(stats.whatsapp, "Hello NWITA — test message from the admin panel.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-wa/40 px-4 py-2.5 text-[10px] font-medium tracking-[0.2em] text-wa uppercase transition-colors hover:bg-wa/10"
            >
              Send a test message
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
