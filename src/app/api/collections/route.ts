import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { collections, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all") === "1";
  if (all) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      c: collections,
      productCount: sql<number>`count(${products.id})::int`.mapWith(Number),
    })
    .from(collections)
    .leftJoin(
      products,
      and(eq(products.collectionId, collections.id), eq(products.published, true)),
    )
    .groupBy(collections.id)
    .orderBy(asc(collections.sortOrder), asc(collections.id));

  const list = rows
    .filter((r) => all || r.c.published)
    .map((r) => ({ ...r.c, productCount: r.productCount }));
  return NextResponse.json({ collections: list });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Collection name is required." }, { status: 400 });

  const [row] = await db
    .insert(collections)
    .values({
      name,
      slug: slugify(String(b.slug ?? name)) || `collection-${Date.now()}`,
      description: (b.description as string) || null,
      image: (b.image as string) || null,
      featured: Boolean(b.featured),
      published: b.published === undefined ? true : Boolean(b.published),
      sortOrder: Number(b.sortOrder ?? 0),
    })
    .returning();
  return NextResponse.json({ ok: true, id: row.id });
}
