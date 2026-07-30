import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { queryProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

async function getCollection(slug: string) {
  const [c] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
  return c ?? null;
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return { title: "Collection not found" };
  return { title: c.name, description: c.description ?? `${c.name} — a collection by NWITA.` };
}

export default async function CollectionPage({ params }: Ctx) {
  const { slug } = await params;
  const [s, collection, all, others] = await Promise.all([
    getAllSettings(),
    getCollection(slug),
    queryProducts(),
    db.select().from(collections).where(eq(collections.published, true)).orderBy(asc(collections.sortOrder)),
  ]);
  if (!collection || !collection.published) notFound();

  const list = all.filter((p) => p.collectionId === collection.id);

  return (
    <>
      {/* Banner */}
      <section className="relative flex min-h-[72svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          {collection.image && (
            <Image
              src={collection.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="animate-kenburns object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
        </div>
        <div className="relative mx-auto w-full max-w-[1500px] px-5 pt-40 pb-14 md:px-10 md:pb-20">
          <Reveal>
            <p className="label">Collection</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,9vw,8rem)] leading-none text-bone">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-bone/75 md:text-lg">
                {collection.description}
              </p>
            )}
            <p className="label mt-8">
              {list.length} numbered {list.length === 1 ? "piece" : "pieces"}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-4xl text-bone/60">The room is being prepared.</p>
            <Link href="/collections" className="u-slide label mt-8 inline-block hover:text-bone">
              ← Other collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 90}>
                <ProductCard
                  product={p}
                  whatsapp={s.contact.whatsapp}
                  symbol={s.store.currencySymbol}
                  eager={i < 4}
                />
              </Reveal>
            ))}
          </div>
        )}

        {/* Other rooms */}
        <div className="mt-24 flex flex-wrap items-center justify-center gap-3 border-t border-line pt-12">
          <span className="label mr-3">Other rooms —</span>
          {others
            .filter((c) => c.slug !== collection.slug)
            .map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="border border-line px-5 py-2.5 text-[11px] font-light tracking-[0.25em] text-fog uppercase transition-all duration-300 hover:border-bone hover:text-bone"
              >
                {c.name}
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
