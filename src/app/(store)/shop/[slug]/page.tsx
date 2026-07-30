import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSettings } from "@/lib/settings";
import { queryProducts } from "@/lib/queries";
import ProductOrder from "@/components/ProductOrder";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const all = await queryProducts();
  const p = all.find((x) => x.slug === slug);
  if (!p) return { title: "Piece not found" };
  return {
    title: p.name,
    description: p.description ?? `${p.name} — numbered piece by NWITA. Wear the Feeling.`,
    openGraph: {
      title: `${p.name} — NWITA`,
      description: p.description ?? undefined,
      images: p.images.map((i) => i.url),
    },
  };
}

export default async function ProductPage({ params }: Ctx) {
  const { slug } = await params;
  const [s, all] = await Promise.all([getAllSettings(), queryProducts()]);
  const product = all.find((x) => x.slug === slug);
  if (!product) notFound();

  const related = all
    .filter((x) => x.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.collectionId === product.collectionId) -
          Number(a.collectionId === product.collectionId) ||
        Number(b.featured) - Number(a.featured),
    )
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: s.brand.name },
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: s.store.currency,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-28 pb-24 md:px-10 md:pt-36 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <nav className="label flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-bone">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-bone">Shop</Link>
          {product.collection && (
            <>
              <span>/</span>
              <Link
                href={`/collections/${product.collectionSlug}`}
                className="hover:text-bone"
              >
                {product.collection}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-bone">{product.name}</span>
        </nav>
      </Reveal>

      <div className="mt-10">
        <ProductOrder
          product={product}
          whatsapp={s.contact.whatsapp}
          symbol={s.store.currencySymbol}
          collectionSlug={product.collectionSlug}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-28 border-t border-line pt-16">
          <div className="mb-12 flex items-end justify-between">
            <Reveal>
              <p className="label">Continue</p>
              <h2 className="mt-3 font-display text-4xl text-bone md:text-5xl">
                Worn together.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <Link href="/shop" className="u-slide label hidden hover:text-bone sm:block">
                Shop all →
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard
                  product={p}
                  whatsapp={s.contact.whatsapp}
                  symbol={s.store.currencySymbol}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
