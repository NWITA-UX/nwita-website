import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NWITA handles your data — briefly and honestly.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you contact us through WhatsApp, we see the details you choose to share — your name, the piece you are interested in, your size, colour and delivery details. Our website itself does not require an account and does not collect personal data to browse.",
  },
  {
    title: "How we use it",
    body: "Your details are used for exactly one purpose: to fulfil and deliver your order, and to answer your questions. We do not sell, rent or trade your data. We do not send marketing messages unless you explicitly ask for them.",
  },
  {
    title: "Cookies & analytics",
    body: "The site uses only the cookies strictly necessary for it to function. If anonymous analytics are enabled, they are used solely to understand which pieces move people — never to build profiles of individuals.",
  },
  {
    title: "Retention",
    body: "Order conversations remain in our WhatsApp correspondence for as long as needed to honour guarantees and returns. You may ask us to delete any record of your exchange at any time.",
  },
  {
    title: "Your rights",
    body: "You may request access to, correction of, or deletion of any data we hold about you by messaging the atelier. We answer every request personally, typically within 48 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-36 pb-28 md:pt-44">
      <Reveal>
        <p className="label">Legal</p>
        <h1 className="mt-4 font-display text-5xl text-bone md:text-7xl">Privacy.</h1>
        <p className="mt-6 text-sm font-light text-fog">
          Last updated — January {new Date().getFullYear()}. Written by humans, kept short on purpose.
        </p>
      </Reveal>
      <div className="mt-14">
        {SECTIONS.map((sec, i) => (
          <Reveal key={sec.title} delay={i * 80}>
            <section className="border-b border-line py-8">
              <h2 className="flex items-baseline gap-4 font-display text-2xl text-bone">
                <span className="text-sm font-light text-fog tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {sec.title}
              </h2>
              <p className="mt-4 pl-9 text-base font-light leading-relaxed text-bone/70">{sec.body}</p>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
