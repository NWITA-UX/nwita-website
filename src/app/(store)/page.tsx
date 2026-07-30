import Image from "next/image";
import Link from "next/link";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { collections, media, products } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { queryProducts } from "@/lib/queries";
import { cn, waLink } from "@/lib/utils";
import FeaturedList from "@/components/FeaturedList";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { WhatsAppGlyph } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [s, allProducts, cols, lookbook] = await Promise.all([
    getAllSettings(),
    queryProducts(),
    db
      .select({
        c: collections,
        count: sql<number>`count(${products.id})::int`.mapWith(Number),
      })
      .from(collections)
      .leftJoin(
        products,
        and(eq(products.collectionId, collections.id), eq(products.published, true)),
      )
      .where(eq(collections.published, true))
      .groupBy(collections.id)
      .orderBy(asc(collections.sortOrder)),
    db.select().from(media).where(eq(media.type, "image")).orderBy(asc(media.sortOrder)),
  ]);

  const symbol = s.store.currencySymbol;
  const featured = allProducts.filter((p) => p.featured);
  const heroCollections = [...cols].sort((a, b) => Number(b.c.featured) - Number(a.c.featured)).slice(0, 3);
  const titleWords = s.hero.title.split(" ");
  const mid = Math.ceil(titleWords.length / 2);
  const titleLines = [titleWords.slice(0, mid).join(" "), titleWords.slice(mid).join(" ")].filter(Boolean);
  const wa = waLink(s.contact.whatsapp, `Hello ${s.brand.name}, I would like to know more about the current collection.`);

  return (
    <>
      {/* ================= CINEMATIC OPENING ================= */}
      <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          {s.hero.backgroundImage && (
            <Image
              src={s.hero.backgroundImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="animate-kenburns object-cover"
            />
          )}
          {s.hero.videoEnabled && s.hero.backgroundVideo && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={s.hero.backgroundVideo}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/70" />
        </div>

        {/* Side rail */}
        <div className="absolute top-1/2 right-6 hidden -translate-y-1/2 [writing-mode:vertical-rl] xl:block">
          <span className="label">N° 001 — FW·26 — {s.contact.location.split("—")[0].trim()}</span>
        </div>

        <div className="relative mx-auto w-full max-w-[1500px] px-5 pt-32 pb-14 md:px-10 md:pb-20">
          <Reveal>
            <p className="label flex items-center gap-3">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-wa" />
              {s.hero.overline}
            </p>
          </Reveal>

          <h1 className="mt-6 max-w-5xl font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.95] text-bone">
            {titleLines.map((line, i) => (
              <Reveal key={i} delay={150 + i * 140} className="mask-line">
                <span>{line}</span>
              </Reveal>
            ))}
          </h1>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Reveal delay={420}>
              <p className="max-w-md text-base font-light leading-relaxed text-bone/75 md:text-lg">
                {s.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={540} className="flex items-center gap-6">
              <Link
                href={s.hero.ctaLink || "/shop"}
                className="group border border-bone/60 px-8 py-4 text-[11px] font-medium tracking-[0.3em] text-bone uppercase transition-all duration-300 hover:bg-bone hover:text-ink"
              >
                {s.hero.ctaLabel}
                <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
              <Link href="/about" className="u-slide label shrink-0 hover:text-bone">
                The House
              </Link>
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 pb-2 md:flex">
          <span className="label !text-[9px]">Scroll</span>
          <span className="block h-12 w-px animate-blink bg-bone/50" />
        </div>
      </section>

      <Marquee items={s.homepage.marquee} />

      {/* ================= THE SELECTION ================= */}
      <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-36">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="label">01 — Featured</p>
            <h2 className="mt-4 font-display text-5xl text-bone md:text-7xl">
              {s.homepage.selectionTitle}
            </h2>
          </Reveal>
          <Reveal delay={150} className="max-w-sm">
            <p className="text-sm font-light leading-relaxed text-fog">{s.homepage.selectionIntro}</p>
            <Link href="/shop" className="u-slide label mt-5 inline-block hover:text-bone">
              View all pieces →
            </Link>
          </Reveal>
        </div>
        <Reveal delay={100}>
          <FeaturedList products={featured.length ? featured : allProducts.slice(0, 5)} symbol={symbol} />
        </Reveal>
      </section>

      {/* ================= COLLECTIONS ================= */}
      <section className="border-y border-line bg-coal/60">
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-32">
          <div className="mb-14 flex items-end justify-between">
            <Reveal>
              <p className="label">02 — Collections</p>
              <h2 className="mt-4 font-display text-5xl text-bone md:text-7xl">Three rooms.</h2>
            </Reveal>
            <Reveal delay={150}>
              <Link href="/collections" className="u-slide label hidden hover:text-bone sm:block">
                All collections →
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
            {heroCollections.map((col, i) => {
              const big = i === 0;
              return (
                <Reveal
                  key={col.c.id}
                  delay={i * 120}
                  className={cn(big ? "lg:col-span-4" : "lg:col-span-3")}
                >
                  <Link href={`/collections/${col.c.slug}`} className="group block">
                    <div
                      className={cn(
                        "relative overflow-hidden bg-smoke",
                        big ? "aspect-[16/11]" : "aspect-[16/10]",
                      )}
                    >
                      {col.c.image && (
                        <Image
                          src={col.c.image}
                          alt={col.c.name}
                          fill
                          sizes={big ? "60vw" : "40vw"}
                          className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                      <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between p-6 md:p-8">
                        <div>
                          <p className="text-[10px] font-light tracking-[0.3em] text-bone/60 uppercase">
                            {col.count} {col.count === 1 ? "piece" : "pieces"}
                          </p>
                          <h3 className="mt-2 font-display text-3xl text-bone md:text-5xl">
                            {col.c.name}
                          </h3>
                        </div>
                        <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-bone/40 text-lg text-bone transition-all duration-500 group-hover:bg-bone group-hover:text-ink">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= STORY — inverted bone section ================= */}
      <section className="bg-bone text-ink">
        <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="label !text-ink/50">03 — The House</p>
              <h2 className="mt-5 font-display text-5xl leading-[1.02] md:text-7xl">
                {s.homepage.storyTitle}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 max-w-md text-base font-light leading-relaxed text-ink/70 md:text-lg">
                {s.homepage.storyText}
              </p>
              <Link
                href="/about"
                className="group mt-10 inline-flex items-center gap-3 border border-ink/40 px-7 py-3.5 text-[11px] font-medium tracking-[0.3em] uppercase transition-all duration-300 hover:bg-ink hover:text-bone"
              >
                {s.homepage.storyCtaLabel}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
          </div>

          <div className="relative">
            <Reveal delay={100}>
              <div className="relative aspect-[4/5] overflow-hidden">
                {s.homepage.storyVideo ? (
                  <video
                    className="h-full w-full object-cover"
                    src={s.homepage.storyVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={s.homepage.storyImage}
                  />
                ) : (
                  s.homepage.storyImage && (
                    <Image src={s.homepage.storyImage} alt="The NWITA atelier" fill sizes="50vw" className="object-cover" />
                  )
                )}
              </div>
            </Reveal>
            <Reveal delay={260}>
              <figure className="relative z-10 -mt-16 ml-8 w-3/5 rotate-[-2.5deg] border-8 border-bone bg-bone shadow-2xl shadow-ink/30 md:-mt-24 md:ml-16">
                {s.homepage.storyImage && (
                  <Image
                    src={s.homepage.storyImage}
                    alt="Atelier hands"
                    width={500}
                    height={620}
                    className="aspect-[4/5] w-full object-cover"
                  />
                )}
                <figcaption className="px-1 py-2 text-[10px] font-light tracking-[0.25em] text-ink/60 uppercase">
                  Atelier — {new Date().getFullYear()}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= LOOKBOOK STRIP ================= */}
      <section className="overflow-hidden py-24 md:py-32">
        <Reveal className="mx-auto mb-12 max-w-[1500px] px-5 md:px-10">
          <p className="label">04 — {s.homepage.lookbookTitle}</p>
          <h2 className="mt-4 font-display text-5xl text-bone md:text-7xl">In motion.</h2>
        </Reveal>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee-slow will-change-transform">
            {[0, 1].map((g) => (
              <div key={g} aria-hidden={g === 1} className="flex shrink-0 gap-5 pr-5">
                {lookbook.map((m) => (
                  <div key={`${g}-${m.id}`} className="relative h-[420px] w-[300px] shrink-0 overflow-hidden bg-coal md:h-[480px] md:w-[340px]">
                    <Image
                      src={m.url}
                      alt={m.title ?? "NWITA lookbook"}
                      fill
                      sizes="340px"
                      className="object-cover"
                    />
                    {m.title && (
                      <span className="absolute bottom-3 left-3 bg-ink/70 px-2.5 py-1 text-[10px] font-light tracking-[0.2em] text-bone/80 uppercase backdrop-blur-sm">
                        {m.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEW ARRIVALS GRID ================= */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-32">
          <div className="mb-14 flex items-end justify-between">
            <Reveal>
              <p className="label">05 — Latest</p>
              <h2 className="mt-4 font-display text-5xl text-bone md:text-7xl">Fresh numbers.</h2>
            </Reveal>
            <Reveal delay={120}>
              <Link href="/shop" className="u-slide label hidden hover:text-bone sm:block">
                Shop everything →
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {allProducts.slice(0, 4).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 100}>
                <ProductCard product={p} whatsapp={s.contact.whatsapp} symbol={symbol} eager={i < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section className="border-t border-line bg-coal/60">
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-28">
          <div className="mb-10 flex items-end justify-between">
            <Reveal>
              <p className="label">06 — {s.homepage.instagramTitle}</p>
              <a
                href={s.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="u-slide mt-3 inline-block font-display text-3xl text-bone md:text-5xl"
              >
                {s.social.instagramHandle}
              </a>
            </Reveal>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {allProducts.slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <a
                  href={s.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden bg-smoke"
                  aria-label={`NWITA on Instagram — ${p.name}`}
                >
                  {p.images[0] && (
                    <Image
                      src={p.images[0].url}
                      alt={p.name}
                      fill
                      sizes="16vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-bone" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CLOSING STATEMENT ================= */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="mx-auto max-w-[1500px] px-5 py-28 text-left md:px-10 md:py-40">
          <Reveal>
            <p className="label">The invitation</p>
            <h2 className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] leading-[1.02] text-bone">
              Some clothes are worn.
              <span className="text-outline"> Ours are felt.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-12 inline-flex items-center gap-4 bg-bone px-9 py-5 text-[12px] font-medium tracking-[0.32em] text-ink uppercase transition-all duration-300 hover:bg-wa"
            >
              <WhatsAppGlyph className="h-5 w-5" />
              Begin an order
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
