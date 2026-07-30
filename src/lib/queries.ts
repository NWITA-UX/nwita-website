import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  collections,
  productImages,
  products,
} from "@/db/schema";

export interface ProductRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  sizes: string[];
  colors: string[];
  featured: boolean;
  published: boolean;
  categoryId: number | null;
  collectionId: number | null;
  category: string | null;
  collection: string | null;
  collectionSlug: string | null;
  images: { url: string; alt: string | null }[];
  createdAt: Date | null;
}

/** Catalogue query used by both the storefront and the admin API. */
export async function queryProducts(
  opts: { includeHidden?: boolean } = {},
): Promise<ProductRow[]> {
  const rows = await db
    .select({
      p: products,
      categoryName: categories.name,
      collectionName: collections.name,
      collectionSlug: collections.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .orderBy(desc(products.id));

  const imgs = await db
    .select()
    .from(productImages)
    .orderBy(asc(productImages.sortOrder), asc(productImages.id));
  const byProduct = new Map<number, { url: string; alt: string | null }[]>();
  for (const img of imgs) {
    const list = byProduct.get(img.productId) ?? [];
    list.push({ url: img.url, alt: img.alt });
    byProduct.set(img.productId, list);
  }

  return rows
    .filter((r) => opts.includeHidden || r.p.published)
    .map((r) => ({
      ...r.p,
      category: r.categoryName,
      collection: r.collectionName,
      collectionSlug: r.collectionSlug,
      images: byProduct.get(r.p.id) ?? [],
    }));
}
