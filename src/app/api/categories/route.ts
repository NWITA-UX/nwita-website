import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const list = await db.select().from(categories).orderBy(asc(categories.name));
  return NextResponse.json({ categories: list });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json()) as { name?: string };
  const name = (b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  const [row] = await db
    .insert(categories)
    .values({ name, slug: slugify(name) || `category-${Date.now()}` })
    .returning();
  return NextResponse.json({ ok: true, category: row });
}

/** DELETE /api/categories?id=4 */
export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (Number.isFinite(id)) await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
