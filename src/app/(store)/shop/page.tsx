import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, collections } from "@/db/schema";
import { getAllSettings } from "@/lib/settings";
import { queryProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return {
    title: "Shop",
    description: `Every numbered piece from ${s.brand.name} — ${s.brand.slogan.toLowerCase()}.`,
  };
}

type SP = { category?: string; collection?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [s, all, cats, cols] = await Promise.all([
    getAllSettings(),
    queryProducts(),
    db.select().from(categories).orderBy(asc(categories.name)),
    db.select().from(collections).orderBy(asc(collections.sortOrder)),
  ]);

  let list = all.filter(
    (p) =>
      (!sp.category || p.category === sp.category) &&
      (!sp.collection || p.collectionSlug === sp.collection),
  );
  switch (sp.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price-desc":
      list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "newest":
      break; // already newest-first
    default:
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  const chip = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={cn(
        "border px-4 py-2 text-[11px] font-light tracking-[0.22em] uppercase transition-all duration-300",
        active
          ? "border-bone bg-bone text-ink"
          : "border-line text-fog hover:border-bone/50 hover:text-bone",
      )}
    >
      {label}
    </Link>
  );

  const keepSort = sp.sort ? `?sort=${sp.sort}` : "";

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32">
      <Reveal>
        <p className="label">The Wardrobe</p>
        <h1 className="mt-4 font-display text-6xl text-bone md:text-8xl">Shop</h1>
        <p className="mt-4 text-sm font-light tracking-[0.2em] text-fog uppercase">
          {list.length} numbered {list.length === 1 ? "piece" : "pieces"}
        </p>
      </Reveal>

      {/* Filters */}
      <Reveal delay={140}>
        <div className="mt-12 space-y-4 border-y border-line py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-3 w-20 shrink-0">Room</span>
            {chip(`/shop${keepSort}`, "All", !sp.collection)}
            {cols.map((c) =>
              chip(
                `/shop?collection=${c.slug}${sp.sort ? `&sort=${sp.sort}` : ""}`,
                c.name,
                sp.collection === c.slug,
              ),
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label mr-3 w-20 shrink-0">Sort</span>
            {[
              { v: "featured", label: "Featured" },
              { v: "newest", label: "Newest" },
              { v: "price-asc", label: "Price ↑" },
              { v: "price-desc", label: "Price ↓" },
            ].map((o) => (
              <Link
                key={o.v}
                href={`/shop?sort=${o.v}${sp.collection ? `&collection=${sp.collection}` : ""}${sp.category ? `&category=${sp.category}` : ""}`}
                className={cn(
                  "border px-4 py-2 text-[11px] font-light tracking-[0.22em] uppercase transition-all duration-300",
                  (sp.sort ?? "featured") === o.v
                    ? "border-bone bg-bone text-ink"
                    : "border-line text-fog hover:border-bone/50 hover:text-bone",
                )}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-4xl text-bone/60">Nothing here yet.</p>
          <p className="mt-4 text-sm font-light text-fog">
            This room is being prepared. Check back soon — or order anything on WhatsApp.
          </p>
          <Link href="/shop" className="u-slide label mt-8 inline-block hover:text-bone">
            ← Back to all pieces
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
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
    </div>
  );
}
