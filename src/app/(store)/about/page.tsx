import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllSettings } from "@/lib/settings";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "The House",
    description:
      "NWITA was born from a refusal — of noise, of logos, of seasons that burn out. Read the story of the house.",
  };
}

export default async function AboutPage() {
  const s = await getAllSettings();
  const a = s.about;

  return (
    <>
      {/* Opening statement */}
      <section className="relative mx-auto max-w-[1500px] px-5 pt-36 pb-20 md:px-10 md:pt-48 md:pb-28">
        <Reveal>
          <p className="label">{a.overline}</p>
        </Reveal>
        <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.6rem,6.5vw,6rem)] leading-[1.04] text-bone">
          {a.headline.split(". ").map((part, i, arr) => (
            <Reveal key={i} delay={i * 150} className="mask-line">
              <span>{part}{i < arr.length - 1 ? "." : part.endsWith(".") ? "" : ""}</span>
            </Reveal>
          ))}
        </h1>
      </section>

      {/* Story + portrait */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-6">
            {a.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 120}>
                <p className={`mb-7 font-light leading-relaxed text-bone/75 ${i === 0 ? "text-lg text-bone md:text-xl" : "text-base"}`}>
                  <span className="mr-4 font-display text-2xl text-outline align-middle">{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </p>
              </Reveal>
            ))}
            <Reveal delay={200}>
              <blockquote className="mt-10 border-l-2 border-bone/40 pl-6">
                <p className="font-display text-2xl text-bone italic md:text-3xl">“{a.quote}”</p>
                <cite className="label mt-4 block not-italic">— The house credo</cite>
              </blockquote>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <Reveal delay={150} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={a.image || "/images/hero.jpg"}
                  alt={`${s.brand.name} — the house`}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="animate-kenburns object-cover"
                />
              </div>
              <span className="absolute -bottom-5 left-6 bg-ink px-4 py-2 text-[10px] font-light tracking-[0.3em] text-bone/70 uppercase">
                {s.contact.location}
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values — editorial index, not cards */}
      <section className="border-t border-line bg-coal/60">
        <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
          <Reveal>
            <p className="label">What we refuse to compromise</p>
            <h2 className="mt-4 font-display text-5xl text-bone md:text-6xl">Three vows.</h2>
          </Reveal>
          <div className="mt-14">
            {a.values.map((v, i) => (
              <Reveal key={v.n} delay={i * 110}>
                <div className="group grid gap-4 border-b border-line py-8 first:border-t md:grid-cols-[100px_1fr_1.4fr] md:items-baseline md:gap-8 md:py-10">
                  <span className="font-display text-4xl text-outline transition-colors duration-500 group-hover:text-bone md:text-5xl">
                    {v.n}
                  </span>
                  <h3 className="font-display text-2xl text-bone md:text-4xl">{v.title}</h3>
                  <p className="max-w-xl text-base font-light leading-relaxed text-fog">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Film */}
      {a.video && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
            <Reveal>
              <p className="label mb-8">Campaign film</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="relative aspect-video overflow-hidden bg-coal">
                <video
                  className="h-full w-full object-cover"
                  src={a.video}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-14 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                <p className="max-w-md font-display text-3xl leading-snug text-bone md:text-4xl">
                  Ready to feel it for yourself?
                </p>
                <Link
                  href="/shop"
                  className="group border border-bone/60 px-8 py-4 text-[11px] font-medium tracking-[0.3em] text-bone uppercase transition-all duration-300 hover:bg-bone hover:text-ink"
                >
                  Enter the shop
                  <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
