import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { collections, products } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Collections",
    description: "The rooms of NWITA — Old Art, Core Essentials and the Archive.",
  };
}

export default async function CollectionsPage() {
  const [s, cols] = await Promise.all([
    getAllSettings(),
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
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32">
      <Reveal>
        <p className="label">The Rooms</p>
        <h1 className="mt-4 font-display text-6xl text-bone md:text-8xl">Collections</h1>
        <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-fog">
          Three rooms, three moods. Each collection is a numbered run — when its last
          number is claimed, the room closes.
        </p>
      </Reveal>

      <div className="mt-16 space-y-6">
        {cols.map((col, i) => (
          <Reveal key={col.c.id} delay={80}>
            <Link
              href={`/collections/${col.c.slug}`}
              className="group grid overflow-hidden border border-line transition-colors duration-500 hover:border-bone/40 md:grid-cols-2"
            >
              <div className={cn("relative aspect-[16/10] overflow-hidden bg-coal md:aspect-auto md:min-h-[360px]", i % 2 === 1 && "md:order-2")}>
                {col.c.image && (
                  <Image
                    src={col.c.image}
                    alt={col.c.name}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center bg-coal/70 p-8 md:p-14">
                <div className="flex items-center gap-5">
                  <span className="font-display text-5xl text-outline md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-display text-4xl text-bone md:text-5xl">{col.c.name}</h2>
                    <p className="mt-1 text-[11px] font-light tracking-[0.25em] text-fog uppercase">
                      {col.count} {col.count === 1 ? "piece" : "pieces"}
                      {col.c.featured ? " · Featured" : ""}
                    </p>
                  </div>
                </div>
                {col.c.description && (
                  <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-bone/70">
                    {col.c.description}
                  </p>
                )}
                <span className="mt-8 flex w-max items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-bone uppercase">
                  Enter the room
                  <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-16 text-center text-sm font-light text-fog">
          Looking for something specific?{" "}
          <a
            href={`https://wa.me/${s.contact.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="u-slide text-bone"
          >
            Ask the atelier on WhatsApp
          </a>
          .
        </p>
      </Reveal>
    </div>
  );
}
