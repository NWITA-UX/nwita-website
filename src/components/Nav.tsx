"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn, waLink } from "@/lib/utils";
import Logo from "./Logo";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type SettingsLite = {
  brand: { name: string };
  logo: { dark?: string; light?: string };
  contact: { whatsapp: string };
};

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<SettingsLite | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d.settings))
      .catch(() => {});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const brand = s?.brand?.name ?? "NWITA";
  const wa = s ? waLink(s.contact.whatsapp, `Hello ${brand}, I have a question about an order.`) : "#";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open
            ? "border-b border-line bg-ink/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:h-20 md:px-10">
          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.slice(0, 2).map((l) => (
              <Link key={l.href} href={l.href} className="u-slide label hover:text-bone">
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/" aria-label={`${brand} — home`} className="absolute left-1/2 -translate-x-1/2">
            <Logo brandName={brand} logo={s?.logo ?? {}} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.slice(2).map((l) => (
              <Link key={l.href} href={l.href} className="u-slide label hover:text-bone">
                {l.label}
              </Link>
            ))}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors duration-300 hover:border-wa/60 hover:bg-wa/10"
            >
              <WhatsAppGlyph className="h-4 w-4 text-bone transition-colors group-hover:text-wa" />
            </a>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[7px] lg:hidden"
          >
            <span
              className={cn(
                "h-px w-6 bg-bone transition-transform duration-300",
                open && "translate-y-[4px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-bone transition-transform duration-300",
                open && "-translate-y-[4px] -rotate-45",
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-center bg-ink px-8 transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {LINKS.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "border-b border-line py-5 font-display text-4xl text-bone transition-all duration-500 hover:pl-3",
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
          >
            {l.label}
          </Link>
        ))}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 flex w-max items-center gap-3 text-wa"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          <span className="label !text-wa">Order on WhatsApp</span>
        </a>
      </div>
    </>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8.6 8.2c.3-.6.9-.6 1.2 0l.6 1.2c.2.4 0 .8-.3 1.1l-.3.3c.4.9 1.2 1.7 2.1 2.1l.3-.3c.3-.3.7-.5 1.1-.3l1.2.6c.6.3.6.9 0 1.2l-.8.5c-.5.3-1.1.4-1.6.1a8.6 8.6 0 0 1-4-4c-.3-.5-.2-1.1.1-1.6l.4-.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
