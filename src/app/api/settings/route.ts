import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllSettings, SETTINGS_DEFAULTS, updateSetting } from "@/lib/settings";

/** Public read — the storefront renders from these documents. */
export async function GET() {
  const all = await getAllSettings();
  return NextResponse.json({ settings: all });
}

/** Admin write — merges a partial document into one settings key. */
export async function PATCH(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { key?: string; value?: Record<string, unknown> };
  if (!body.key || !(body.key in SETTINGS_DEFAULTS) || typeof body.value !== "object") {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }
  const merged = await updateSetting(body.key, body.value);
  return NextResponse.json({ ok: true, value: merged });
}
