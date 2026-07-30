import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import {
  COOKIE_NAME,
  createSession,
  destroySession,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";

type Ctx = { params: Promise<{ action: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { action } = await ctx.params;
  if (action === "me") {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user: { email: user.email, name: user.name } });
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: Request, ctx: Ctx) {
  const { action } = await ctx.params;

  if (action === "login") {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    const session = await createSession(user.id);
    const res = NextResponse.json({ user: { email: user.email, name: user.name } });
    res.cookies.set(COOKIE_NAME, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });
    return res;
  }

  if (action === "logout") {
    const c = await cookies();
    await destroySession(c.get(COOKIE_NAME)?.value);
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
