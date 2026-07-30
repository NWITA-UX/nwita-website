"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductRow } from "@/lib/queries";
import { buildOrderMessage, cn, colorHex, formatMoney, waLink } from "@/lib/utils";
import { WhatsAppGlyph } from "./Nav";

/**
 * Full product experience — gallery with hover zoom, size / colour /
 * quantity selection and the "Order on WhatsApp" conversion action.
 */
export default function ProductOrder({
  product,
  whatsapp,
  symbol,
  collectionSlug,
}: {
  product: ProductRow;
  whatsapp: string;
  symbol: string;
  collectionSlug: string | null;
}) {
  const [img, setImg] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [zoom, setZoom] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });
  const [openPanel, setOpenPanel] = useState<string | null>("fabric");

  const active = product.images[img];
  const onSale = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  const wa = waLink(
    whatsapp,
    buildOrderMessage({
      product: product.name,
      size: size || undefined,
      color: color || undefined,
      quantity: qty,
      note: note || undefined,
    }),
  );

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      {/* ---------- Gallery ---------- */}
      <div>
        <div
          className="relative aspect-[3/4] cursor-crosshair overflow-hidden bg-coal"
          onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({
              on: true,
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
        >
          {active ? (
            <Image
              src={active.url}
              alt={active.alt ?? product.name}
              fill
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={{
                transform: zoom.on ? "scale(1.9)" : "scale(1)",
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-7xl text-outline">{product.name.charAt(0)}</span>
            </div>
          )}
          {onSale && (
            <span className="absolute top-4 left-4 z-10 bg-bone px-3 py-1.5 text-[10px] font-medium tracking-[0.25em] text-ink uppercase">
              Sale
            </span>
          )}
          <span className="absolute right-4 bottom-4 z-10 text-[10px] font-light tracking-[0.3em] text-bone/70 uppercase">
            Hover to zoom
          </span>
        </div>

        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {product.images.map((im, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "relative h-24 w-20 shrink-0 overflow-hidden border transition-all duration-300",
                  i === img ? "border-bone" : "border-transparent opacity-50 hover:opacity-90",
                )}
              >
                <Image src={im.url} alt={im.alt ?? ""} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Buy panel ---------- */}
      <div className="lg:pt-4">
        {product.collection && (
          <Link
            href={collectionSlug ? `/collections/${collectionSlug}` : "/collections"}
            className="label u-slide hover:text-bone"
          >
            {product.collection}
          </Link>
        )}
        <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">{product.name}</h1>

        <div className="mt-4 flex items-baseline gap-4">
          <span className="text-xl font-light text-bone">{formatMoney(product.price, symbol)}</span>
          {product.compareAtPrice && (
            <span className="text-base font-light text-fog line-through">
              {formatMoney(product.compareAtPrice, symbol)}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[11px] tracking-[0.2em] text-fog uppercase">
              Only {product.stock} left
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-bone/75">
            {product.description}
          </p>
        )}

        {/* Size */}
        {product.sizes.length > 0 && (
          <div className="mt-8">
            <p className="label mb-3">
              Size — <span className="text-bone">{size || "Select"}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 border px-4 py-2.5 text-sm font-light transition-all duration-300",
                    size === s
                      ? "border-bone bg-bone text-ink"
                      : "border-line text-bone/80 hover:border-bone/50",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colour */}
        {product.colors.length > 0 && (
          <div className="mt-7">
            <p className="label mb-3">
              Colour — <span className="text-bone">{color || "Select"}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                  title={c}
                  className={cn(
                    "flex items-center gap-2.5 border px-3.5 py-2 text-sm font-light transition-all duration-300",
                    color === c
                      ? "border-bone text-bone"
                      : "border-line text-fog hover:border-bone/50 hover:text-bone/80",
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-bone/25"
                    style={{ background: colorHex(c) }}
                  />
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + note */}
        <div className="mt-7 grid gap-5 sm:grid-cols-[auto_1fr]">
          <div>
            <p className="label mb-3">Quantity</p>
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-bone/70 transition-colors hover:text-bone"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-light tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 text-bone/70 transition-colors hover:text-bone"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <p className="label mb-3">Note for the atelier (optional)</p>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Gift wrap, delivery wishes…"
              className="w-full border border-line bg-transparent px-4 py-2.5 text-sm font-light text-bone placeholder:text-fog/60 focus:border-bone/60 focus:outline-none"
            />
          </div>
        </div>

        {/* THE button */}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-9 flex w-full items-center justify-center gap-4 bg-bone py-5 text-[12px] font-medium tracking-[0.32em] text-ink uppercase transition-all duration-300 hover:bg-wa"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          Order on WhatsApp
        </a>
        <p className="mt-4 text-center text-xs font-light text-fog">
          Your size, colour and note are attached to the message automatically.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-px border border-line bg-line text-center">
          {["Numbered piece", "Ships worldwide", "Hand finished"].map((t) => (
            <div key={t} className="bg-ink px-2 py-4 text-[10px] font-light tracking-[0.18em] text-fog uppercase">
              {t}
            </div>
          ))}
        </div>

        {/* Accordions */}
        <div className="mt-10 divide-y divide-line border-y border-line">
          {[
            { key: "fabric", label: "Fabric & Care", body: product.details ?? "Heavyweight natural fibres, garment-dyed and pre-washed. Wash cold, inside out. Hang dry — the fabric ages better that way." },
            { key: "shipping", label: "Shipping & Returns", body: "Orders are confirmed on WhatsApp and ship from our atelier within 2–4 business days, tracked worldwide. 14 days for returns, no questions asked." },
            { key: "number", label: "The Number", body: "Every NWITA piece is numbered inside the garment. Your number is yours alone — once a run is sold through, it is retired forever." },
          ].map((a) => (
            <div key={a.key}>
              <button
                onClick={() => setOpenPanel(openPanel === a.key ? null : a.key)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className="label !text-bone/85">{a.label}</span>
                <span
                  className={cn(
                    "text-fog transition-transform duration-300",
                    openPanel === a.key && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  openPanel === a.key ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="max-w-md pb-5 text-sm font-light leading-relaxed text-fog">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
