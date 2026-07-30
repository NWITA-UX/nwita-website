import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const list = await db
    .select()
    .from(media)
    .orderBy(asc(media.sortOrder), asc(media.id));
  return NextResponse.json({ media: list });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = (await req.json()) as { type?: string; url?: string; title?: string };
  if (!b.url) return NextResponse.json({ error: "A media URL is required." }, { status: 400 });
  const isVideo =
    b.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(b.url);
  const [row] = await db
    .insert(media)
    .values({
      type: isVideo ? "video" : "image",
      url: b.url,
      title: b.title || null,
      sortOrder: 0,
    })
    .returning();
  return NextResponse.json({ ok: true, item: row });
}

/** DELETE /api/media?id=7 */
export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (Number.isFinite(id)) await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ ok: true });
}
