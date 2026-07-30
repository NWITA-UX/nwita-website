import type { Metadata } from "next";
import { getAllSettings } from "@/lib/settings";
import { waLink } from "@/lib/utils";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { WhatsAppGlyph } from "@/components/Nav";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact",
    description: "Speak to the NWITA atelier — orders, sizing and everything else happen on WhatsApp.",
  };
}

export default async function ContactPage() {
  const s = await getAllSettings();
  const wa = waLink(s.contact.whatsapp, `Hello ${s.brand.name}, I have a question.`);

  const rows = [
    {
      label: "WhatsApp",
      value: s.contact.whatsapp.replace(/^(\d{1,3})(?=\d{6,})/, "+$1 "),
      href: wa,
      external: true,
      highlight: true,
    },
    { label: "Email", value: s.contact.email, href: `mailto:${s.contact.email}` },
    { label: "Phone", value: s.contact.phone, href: `tel:${s.contact.phone.replace(/[^\d+]/g, "")}` },
    { label: "Atelier", value: s.contact.location },
    { label: "Hours", value: s.contact.hours },
    {
      label: "Instagram",
      value: s.social.instagramHandle,
      href: s.social.instagram,
      external: true,
    },
    { label: "TikTok", value: s.social.tiktokHandle, href: s.social.tiktok, external: true },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 pb-24 md:px-10 md:pt-44 md:pb-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left — the invitation */}
        <div>
          <Reveal>
            <p className="label">Correspondence</p>
            <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[1.02] text-bone">
              Speak to
              <span className="block text-outline">the atelier.</span>
            </h1>
            <p className="mt-7 max-w-md text-base font-light leading-relaxed text-fog">
              No call centres, no bots. Every order and every question is answered by the
              same hands that pack your garment — on WhatsApp, within hours.
            </p>
          </Reveal>

          <div className="mt-12">
            {rows.map((r, i) => (
              <Reveal key={r.label} delay={i * 70}>
                <div className="grid grid-cols-[110px_1fr] items-baseline gap-4 border-b border-line py-5">
                  <span className="label">{r.label}</span>
                  {r.href ? (
                    <a
                      href={r.href}
                      {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`u-slide w-max max-w-full truncate text-base font-light ${
                        r.highlight ? "flex items-center gap-2.5 text-wa" : "text-bone"
                      }`}
                    >
                      {r.highlight && <WhatsAppGlyph className="h-4 w-4 shrink-0" />}
                      {r.value}
                    </a>
                  ) : (
                    <span className="text-base font-light text-bone/85">{r.value}</span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-4 bg-wa/15 px-8 py-4.5 text-[11px] font-medium tracking-[0.3em] text-wa uppercase ring-1 ring-wa/40 transition-all duration-300 hover:bg-wa hover:text-ink ring-inset"
            >
              <WhatsAppGlyph className="h-4.5 w-4.5" />
              Start a WhatsApp chat
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>

        {/* Right — composer */}
        <div className="lg:pt-4">
          <Reveal delay={180}>
            <div className="border border-line bg-coal/70 p-8 md:p-12">
              <p className="label">Write to us</p>
              <h2 className="mt-3 font-display text-3xl text-bone md:text-4xl">
                Compose a message.
              </h2>
              <p className="mt-3 mb-9 text-sm font-light leading-relaxed text-fog">
                We will open WhatsApp with your message ready to send — nothing is stored
                on this site.
              </p>
              <ContactForm whatsapp={s.contact.whatsapp} brand={s.brand.name} />
            </div>
          </Reveal>

          <Reveal delay={280}>
            <p className="mt-8 text-center text-xs font-light leading-relaxed text-fog">
              Orders are confirmed personally — payment and delivery details are arranged
              in the chat. Worldwide shipping from {s.contact.location.split("—")[0].trim()}.
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
