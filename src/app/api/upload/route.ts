import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_BYTES = 40 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `${file.name} is too large` },
        { status: 413 }
      );
    }

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from("uploads")
      .upload(filename, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("uploads")
      .getPublicUrl(filename);

    urls.push(data.publicUrl);
  }

  return NextResponse.json({ urls });
}