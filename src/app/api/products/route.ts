import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { queryProducts } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const includeHidden = new URL(req.url).searchParams.get("all") === "1";
  if (includeHidden) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await queryProducts({ includeHidden });
  return NextResponse.json({ products: list });
}

async function uniqueSlug(base: string, excludeId?: number) {
  let slug = slugify(base) || "product";
  let i = 2;
  for (;;) {
    const [dupe] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!dupe || (excludeId !== undefined && dupe.id === excludeId)) return slug;
    slug = `${slugify(base)}-${i++}`;
  }
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });

  const [row] = await db
    .insert(products)
    .values({
      name,
      slug: await uniqueSlug(String(b.slug ?? name)),
      description: (b.description as string) || null,
      details: (b.details as string) || null,
      price: String(b.price ?? "0"),
      compareAtPrice: b.compareAtPrice ? String(b.compareAtPrice) : null,
      stock: Number(b.stock ?? 0),
      categoryId: (b.categoryId as number | null) ?? null,
      collectionId: (b.collectionId as number | null) ?? null,
      sizes: (b.sizes as string[]) ?? [],
      colors: (b.colors as string[]) ?? [],
      featured: Boolean(b.featured),
      published: b.published === undefined ? true : Boolean(b.published),
    })
    .returning();

  const images = (b.images as { url: string; alt?: string }[] | undefined) ?? [];
  if (images.length) {
    await db.insert(productImages).values(
      images
        .filter((i) => i?.url)
        .map((i, idx) => ({
          productId: row.id,
          url: i.url,
          alt: i.alt || `${name} — NWITA`,
          sortOrder: idx,
        })),
    );
  }
  return NextResponse.json({ ok: true, id: row.id });
}
