import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "The terms under which NWITA pieces change hands.",
};

const SECTIONS = [
  {
    title: "How an order works",
    body: "Orders are placed through WhatsApp. A sale is confirmed when the atelier replies with a confirmation of the piece, its number, the price and delivery details. Until that confirmation, a piece remains available to others.",
  },
  {
    title: "Prices & payment",
    body: "Prices are shown in the currency configured on the site and include applicable taxes unless stated otherwise. Payment is arranged directly in the WhatsApp conversation using the methods agreed with the atelier.",
  },
  {
    title: "Numbered pieces",
    body: "Many NWITA pieces are produced in numbered runs. The number assigned to your garment is final and is recorded by the house. Once a run is sold through, it is retired and will not be reproduced.",
  },
  {
    title: "Shipping",
    body: "Pieces ship from our atelier within 2–4 business days of confirmation, with tracking provided in the chat. Delivery times depend on the carrier and destination; import duties, where applicable, are the responsibility of the recipient.",
  },
  {
    title: "Returns & exchanges",
    body: "You have 14 days from delivery to return an unworn piece in its original condition for an exchange or refund. Because each piece is numbered, returns are matched to their original number. Items marked as final sale in the chat are exempt.",
  },
  {
    title: "Care of the garment",
    body: "Our fabrics are chosen to age. Natural fading, softening and patina are characteristics of the material, not defects. Care instructions accompany every piece; following them keeps the feeling intact for decades.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-36 pb-28 md:pt-44">
      <Reveal>
        <p className="label">Legal</p>
        <h1 className="mt-4 font-display text-5xl text-bone md:text-7xl">Terms.</h1>
        <p className="mt-6 text-sm font-light text-fog">
          Last updated — January {new Date().getFullYear()}. The short, honest version of how we trade.
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
