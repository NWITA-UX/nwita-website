"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { waLink } from "@/lib/utils";
import { WhatsAppGlyph } from "./Nav";

type SettingsLite = {
  brand: { name: string; slogan: string };
  contact: { whatsapp: string; email: string; phone: string; location: string };
  social: { instagram: string; instagramHandle: string; tiktok: string; tiktokHandle: string };
  footer: { note: string };
};

export default function Footer() {
  const [s, setS] = useState<SettingsLite | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d.settings))
      .catch(() => {});
  }, []);

  const brand = s?.brand?.name ?? "NWITA";
  const wa = s ? waLink(s.contact.whatsapp, `Hello ${brand}, I have a question.`) : "#";

  return (
    <footer className="relative overflow-hidden border-t border-line bg-coal">
      {/* Giant ghost wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-display text-[24vw] leading-none tracking-[0.08em] text-outline opacity-60 select-none whitespace-nowrap md:-bottom-10"
      >
        {brand}
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 pt-20 pb-40 md:px-10 md:pt-24 md:pb-64">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl text-bone">{s?.brand?.slogan ?? "Wear the Feeling"}</p>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-fog">
              {s?.footer?.note ?? "Every piece is numbered. Every feeling is yours."}
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 border border-line px-6 py-3.5 text-[11px] font-light uppercase tracking-[0.3em] text-bone transition-all duration-300 hover:border-wa/60 hover:bg-wa/10"
            >
              <WhatsAppGlyph className="h-4 w-4 text-wa" />
              Order on WhatsApp
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="md:col-span-3">
            <p className="label mb-5">Navigate</p>
            <ul className="space-y-3 text-sm font-light text-bone/80">
              {[
                { href: "/shop", label: "Shop All" },
                { href: "/collections", label: "Collections" },
                { href: "/about", label: "The House" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="u-slide hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label mb-5">Follow</p>
            <ul className="space-y-3 text-sm font-light text-bone/80">
              <li>
                <a
                  href={s?.social?.instagram ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-slide hover:text-bone"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={s?.social?.tiktok ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-slide hover:text-bone"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a href={`mailto:${s?.contact?.email ?? ""}`} className="u-slide hover:text-bone">
                  Email
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label mb-5">Legal</p>
            <ul className="space-y-3 text-sm font-light text-bone/80">
              <li>
                <Link href="/privacy" className="u-slide hover:text-bone">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="u-slide hover:text-bone">
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/admin" className="u-slide hover:text-bone">
                  Atelier Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[11px] font-light tracking-[0.2em] text-fog uppercase md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </span>
          <span>{s?.contact?.location ?? "Paris — Shipping Worldwide"}</span>
        </div>
      </div>
    </footer>
  );
}
