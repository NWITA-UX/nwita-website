"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { api, Btn, DangerDelete, TextInput, Uploader } from "../ui";

type Item = { id: number; type: string; url: string; title: string | null };

export default function MediaPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const load = useCallback(async () => {
    const r = await api("/api/media");
    setItems(r.media as Item[]);
  }, []);
  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const add = async (mediaUrl: string, mediaTitle: string) => {
    await api("/api/media", {
      method: "POST",
      body: JSON.stringify({ url: mediaUrl, title: mediaTitle || undefined }),
    });
    load();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="label">Library</p>
      <h1 className="mt-2 font-display text-4xl text-bone">Images & Films</h1>
      <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-fog">
        Campaign imagery and cinematic films. Uploaded files can be used anywhere on the
        site; pasted video URLs (MP4) work too.
      </p>

      {/* Add */}
      <div className="mt-8 grid gap-4 border border-line bg-coal/50 p-5 md:grid-cols-2">
        <div>
          <p className="label mb-3">Upload files</p>
          <Uploader
            onDone={async (urls) => {
              for (const u of urls) await add(u, "");
            }}
          />
        </div>
        <div className="space-y-3">
          <p className="label">Or add by URL (e.g. a film)</p>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/film.mp4 or /images/….jpg" />
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
          <Btn
            onClick={async () => {
              if (!url.trim()) return;
              await add(url.trim(), title.trim());
              setUrl("");
              setTitle("");
            }}
          >
            Add to library
          </Btn>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div key={m.id} className="group border border-line bg-coal/50">
            <div className="relative aspect-[4/5] overflow-hidden bg-smoke">
              {m.type === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
              ) : (
                <Image src={m.url} alt={m.title ?? ""} fill sizes="200px" className="object-cover" />
              )}
              <span className="absolute top-2 left-2 bg-ink/80 px-2 py-0.5 text-[9px] font-medium tracking-[0.2em] text-bone uppercase">
                {m.type}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="min-w-0 truncate text-xs font-light text-bone/80">
                {m.title || m.url.split("/").pop()}
              </p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(m.url).catch(() => {});
                    setCopied(m.id);
                    setTimeout(() => setCopied(null), 1200);
                  }}
                  className="border border-line px-2 py-1 text-[9px] font-medium tracking-[0.15em] text-fog uppercase transition-colors hover:border-bone/60 hover:text-bone"
                >
                  {copied === m.id ? "Copied" : "Copy URL"}
                </button>
                <DangerDelete
                  label="✕"
                  onConfirm={async () => {
                    await api(`/api/media?id=${m.id}`, { method: "DELETE" });
                    load();
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
