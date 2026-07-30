"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  api,
  Btn,
  DangerDelete,
  Field,
  ImagePicker,
  SaveNote,
  TextArea,
  TextInput,
  Toggle,
  type SaveState,
} from "../ui";

type Col = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  productCount?: number;
};

export default function CollectionsPanel() {
  const [items, setItems] = useState<Col[]>([]);
  const [editing, setEditing] = useState<Col | "new" | null>(null);

  const load = useCallback(async () => {
    const r = await api("/api/collections?all=1");
    setItems(r.collections as Col[]);
  }, []);
  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const quick = async (id: number, data: Record<string, unknown>) => {
    await api(`/api/collections/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    load();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">The rooms</p>
          <h1 className="mt-2 font-display text-4xl text-bone">Collections</h1>
        </div>
        <Btn onClick={() => setEditing("new")}>+ New collection</Btn>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <div key={c.id} className="flex gap-4 border border-line bg-coal/50 p-4">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-smoke">
              {c.image && <Image src={c.image} alt={c.name} fill sizes="96px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl text-bone">{c.name}</p>
              <p className="text-xs font-light text-fog">
                /{c.slug} · {c.productCount ?? 0} pieces · order {c.sortOrder}
              </p>
              <div className="mt-3 space-y-2">
                <Toggle checked={c.published} onChange={(v) => quick(c.id, { published: v })} label="Live" />
                <Toggle checked={c.featured} onChange={(v) => quick(c.id, { featured: v })} label="Featured" />
              </div>
              <div className="mt-3 flex gap-2">
                <Btn variant="ghost" onClick={() => setEditing(c)} className="!px-3 !py-1.5">
                  Edit
                </Btn>
                <DangerDelete
                  onConfirm={async () => {
                    await api(`/api/collections/${c.id}`, { method: "DELETE" });
                    load();
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Editor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Editor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Col | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = initial === "new";
  const src = isNew ? null : initial;
  const [f, setF] = useState({
    name: src?.name ?? "",
    slug: src?.slug ?? "",
    description: src?.description ?? "",
    image: src?.image ?? "",
    featured: src?.featured ?? false,
    published: src?.published ?? true,
    sortOrder: String(src?.sortOrder ?? 0),
  });
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      setError("Give the collection a name.");
      setState("error");
      return;
    }
    setState("saving");
    const payload = {
      name: f.name,
      slug: f.slug || undefined,
      description: f.description || null,
      image: f.image || null,
      featured: f.featured,
      published: f.published,
      sortOrder: Number(f.sortOrder) || 0,
    };
    try {
      if (isNew) await api("/api/collections", { method: "POST", body: JSON.stringify(payload) });
      else await api(`/api/collections/${src!.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      setState("saved");
      setTimeout(onSaved, 400);
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/97 backdrop-blur-sm">
      <form onSubmit={save} className="mx-auto my-10 w-full max-w-2xl border border-line bg-coal p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-3xl text-bone">{isNew ? "New collection" : `Edit — ${src!.name}`}</h2>
          <button type="button" onClick={onClose} className="label hover:text-bone">✕ Close</button>
        </div>
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Old Art" />
            </Field>
            <Field label="Slug" hint="Empty = generated from name.">
              <TextInput value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="old-art" />
            </Field>
          </div>
          <Field label="Description">
            <TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
          <ImagePicker label="Cover image" value={f.image} onChange={(v) => setF({ ...f, image: v })} />
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Sort order">
              <TextInput value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: e.target.value })} inputMode="numeric" />
            </Field>
            <div className="flex items-end pb-1">
              <Toggle checked={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Featured" />
            </div>
            <div className="flex items-end pb-1">
              <Toggle checked={f.published} onChange={(v) => setF({ ...f, published: v })} label="Live" />
            </div>
          </div>
        </div>
        <div className="mt-9 flex items-center gap-4 border-t border-line pt-6">
          <Btn type="submit" disabled={state === "saving"}>{isNew ? "Create collection" : "Save changes"}</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <SaveNote state={state} error={error} />
        </div>
      </form>
    </div>
  );
}
