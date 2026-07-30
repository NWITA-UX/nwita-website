import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const pid = Number(id);

  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  const fields = [
    "name",
    "slug",
    "description",
    "details",
    "stock",
    "categoryId",
    "collectionId",
    "sizes",
    "colors",
    "featured",
    "published",
  ] as const;
  for (const f of fields) {
    if (b[f] !== undefined) patch[f] = b[f];
  }
  if (b.price !== undefined) patch.price = String(b.price);
  patch.compareAtPrice = b.compareAtPrice
    ? String(b.compareAtPrice)
    : b.compareAtPrice === ""
      ? null
      : undefined;
  if (patch.compareAtPrice === undefined) delete patch.compareAtPrice;

  await db.update(products).set(patch).where(eq(products.id, pid));

  // Replace the image set only when the client sends one.
  if (Array.isArray(b.images)) {
    await db.delete(productImages).where(eq(productImages.productId, pid));
    const imgs = (b.images as { url: string; alt?: string }[]).filter((i) => i?.url);
    if (imgs.length) {
      await db.insert(productImages).values(
        imgs.map((i, idx) => ({
          productId: pid,
          url: i.url,
          alt: i.alt || `${String(b.name ?? "Product")} — NWITA`,
          sortOrder: idx,
        })),
      );
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return NextResponse.json({ ok: true });
}
