"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ProductRow } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";
import {
  api,
  Btn,
  DangerDelete,
  Field,
  SaveNote,
  Select,
  TextArea,
  TextInput,
  Toggle,
  Uploader,
  type SaveState,
} from "../ui";

type Ref = { id: number; name: string };

const EMPTY_FORM = {
  name: "",
  slug: "",
  price: "0",
  compareAtPrice: "",
  stock: "0",
  description: "",
  details: "",
  categoryId: "",
  collectionId: "",
  sizes: "",
  colors: "",
  featured: false,
  published: true,
  images: [] as { url: string; alt: string }[],
};

export default function ProductsPanel() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [cols, setCols] = useState<Ref[]>([]);
  const [cats, setCats] = useState<Ref[]>([]);
  const [editing, setEditing] = useState<ProductRow | "new" | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [p, c, k] = await Promise.all([
      api("/api/products?all=1"),
      api("/api/collections?all=1"),
      api("/api/categories"),
    ]);
    setItems(p.products as ProductRow[]);
    setCols(c.collections as Ref[]);
    setCats(k.categories as Ref[]);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const quickPatch = async (id: number, data: Record<string, unknown>) => {
    await api(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    load();
  };

  const list = items.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.collection ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl text-bone">Products</h1>
        </div>
        <div className="flex gap-3">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="!w-44"
          />
          <Btn onClick={() => setEditing("new")}>+ New product</Btn>
        </div>
      </div>

      <div className="mt-8 border border-line">
        {list.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0 hover:bg-smoke/40"
          >
            <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-coal">
              {p.images[0] ? (
                <Image src={p.images[0].url} alt={p.name} fill sizes="44px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-display text-lg text-outline">
                  {p.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-bone">{p.name}</p>
              <p className="truncate text-xs font-light text-fog">
                {formatMoney(p.price)} · {p.collection ?? "No collection"} ·{" "}
                {p.images.length} img
              </p>
            </div>
            <div className="hidden items-center gap-5 sm:flex">
              <Toggle checked={p.published} onChange={(v) => quickPatch(p.id, { published: v })} label="Live" />
              <Toggle checked={p.featured} onChange={(v) => quickPatch(p.id, { featured: v })} label="Featured" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Btn variant="ghost" onClick={() => setEditing(p)} className="!px-3 !py-1.5">
                Edit
              </Btn>
              <DangerDelete
                onConfirm={async () => {
                  await api(`/api/products/${p.id}`, { method: "DELETE" });
                  load();
                }}
              />
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="px-4 py-10 text-center text-sm font-light text-fog">
            No products match — add your first piece above.
          </p>
        )}
      </div>

      {editing && (
        <Editor
          initial={editing}
          cols={cols}
          cats={cats}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          onNewCategory={async (name) => {
            const r = await api("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
            setCats((c) => [...c, r.category as Ref]);
            return (r.category as Ref).id;
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Editor overlay ---------------- */
function Editor({
  initial,
  cols,
  cats,
  onClose,
  onSaved,
  onNewCategory,
}: {
  initial: ProductRow | "new";
  cols: Ref[];
  cats: Ref[];
  onClose: () => void;
  onSaved: () => void;
  onNewCategory: (name: string) => Promise<number>;
}) {
  const isNew = initial === "new";
  const src = isNew ? null : initial;
  const [f, setF] = useState(() => ({
    ...EMPTY_FORM,
    ...(src
      ? {
          name: src.name,
          slug: src.slug,
          price: src.price,
          compareAtPrice: src.compareAtPrice ?? "",
          stock: String(src.stock),
          description: src.description ?? "",
          details: src.details ?? "",
          categoryId: src.categoryId ? String(src.categoryId) : "",
          collectionId: src.collectionId ? String(src.collectionId) : "",
          sizes: src.sizes.join(", "),
          colors: src.colors.join(", "),
          featured: src.featured,
          published: src.published,
          images: src.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
        }
      : {}),
  }));
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setF((old) => ({ ...old, [k]: v }));

  const split = (s: string) =>
    s.split(",").map((x) => x.trim()).filter(Boolean);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      setError("A product needs a name.");
      setState("error");
      return;
    }
    setState("saving");
    setError("");
    const payload = {
      name: f.name,
      slug: f.slug || undefined,
      description: f.description || null,
      details: f.details || null,
      price: f.price || "0",
      compareAtPrice: f.compareAtPrice || null,
      stock: Number(f.stock) || 0,
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      collectionId: f.collectionId ? Number(f.collectionId) : null,
      sizes: split(f.sizes),
      colors: split(f.colors),
      featured: f.featured,
      published: f.published,
      images: f.images,
    };
    try {
      if (isNew) {
        await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await api(`/api/products/${src!.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      setState("saved");
      setTimeout(onSaved, 400);
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/97 backdrop-blur-sm">
      <form onSubmit={save} className="mx-auto my-8 w-full max-w-3xl border border-line bg-coal p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-3xl text-bone">
            {isNew ? "New piece" : `Edit — ${src!.name}`}
          </h2>
          <button type="button" onClick={onClose} className="label hover:text-bone">
            ✕ Close
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name">
            <TextInput value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Old Art T-Shirt" />
          </Field>
          <Field label="Slug" hint="Leave empty to generate from the name.">
            <TextInput value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="old-art-t-shirt" />
          </Field>
          <Field label="Price">
            <TextInput value={f.price} onChange={(e) => set("price", e.target.value)} inputMode="decimal" />
          </Field>
          <Field label="Compare-at price" hint="Shows a strike-through and a Sale tag.">
            <TextInput value={f.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} inputMode="decimal" placeholder="Optional" />
          </Field>
          <Field label="Stock">
            <TextInput value={f.stock} onChange={(e) => set("stock", e.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Collection">
            <Select value={f.collectionId} onChange={(v) => set("collectionId", v)}>
              <option value="">— None —</option>
              {cols.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={f.categoryId} onChange={(v) => set("categoryId", v)}>
              <option value="">— None —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="New category" hint="Create one on the fly.">
            <div className="flex gap-2">
              <TextInput value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Knitwear" />
              <Btn
                variant="ghost"
                onClick={async () => {
                  if (!newCat.trim()) return;
                  const id = await onNewCategory(newCat.trim());
                  set("categoryId", String(id));
                  setNewCat("");
                }}
                className="shrink-0"
              >
                Add
              </Btn>
            </div>
          </Field>
          <Field label="Sizes" hint="Comma separated — XS, S, M, L, XL">
            <TextInput value={f.sizes} onChange={(e) => set("sizes", e.target.value)} />
          </Field>
          <Field label="Colours" hint="Comma separated — Black, Bone, Washed Grey">
            <TextInput value={f.colors} onChange={(e) => set("colors", e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Description">
            <TextArea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Fabric & care details">
            <TextArea rows={4} value={f.details} onChange={(e) => set("details", e.target.value)} />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-8">
          <Toggle checked={f.published} onChange={(v) => set("published", v)} label="Published (visible in the shop)" />
          <Toggle checked={f.featured} onChange={(v) => set("featured", v)} label="Featured on homepage" />
        </div>

        {/* Images */}
        <div className="mt-8">
          <p className="label mb-3">Images — first image is the cover</p>
          <Uploader
            accept="image/*"
            onDone={(urls) =>
              set("images", [...f.images, ...urls.map((u) => ({ url: u, alt: "" }))])
            }
          />
          {f.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {f.images.map((img, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden border border-line">
                  <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-bone px-1.5 py-0.5 text-[9px] font-medium tracking-widest text-ink uppercase">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => set("images", f.images.filter((_, x) => x !== i))}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center bg-ink/80 text-xs text-bone opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-9 flex items-center gap-4 border-t border-line pt-6">
          <Btn type="submit" disabled={state === "saving"}>
            {isNew ? "Create product" : "Save changes"}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <SaveNote state={state} error={error} />
        </div>
      </form>
    </div>
  );
}
