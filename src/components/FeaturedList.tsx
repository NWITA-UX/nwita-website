"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductRow } from "@/lib/queries";
import { cn, formatMoney } from "@/lib/utils";

/**
 * The Selection — an editorial index of featured pieces.
 * Desktop: hovering a row summons a floating preview that trails the cursor.
 * Mobile: a horizontal snap rail of cards.
 */
export default function FeaturedList({
  products,
  symbol,
}: {
  products: ProductRow[];
  symbol: string;
}) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: -400, y: -400 });
  const target = useRef({ x: -400, y: -400 });
  const [render, setRender] = useState({ x: -400, y: -400 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.14;
      pos.current.y += (target.current.y - pos.current.y) * 0.14;
      setRender({ x: pos.current.x, y: pos.current.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const current = products[active];

  return (
    <>
      {/* Desktop index */}
      <div
        className="relative hidden lg:block"
        onMouseMove={(e) => {
          target.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {products.map((p, i) => (
          <Link
            key={p.id}
            href={`/shop/${p.slug}`}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "group flex items-baseline gap-8 border-b border-line py-8 transition-all duration-500 first:border-t",
              active === i ? "pl-6" : "pl-0",
            )}
          >
            <span className="w-10 shrink-0 font-light text-sm text-fog tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "font-display text-4xl transition-all duration-500 xl:text-6xl",
                active === i ? "text-bone" : "text-bone/45",
              )}
            >
              {p.name}
            </span>
            <span className="ml-auto hidden shrink-0 text-[11px] font-light tracking-[0.3em] text-fog uppercase xl:block">
              {p.collection ?? p.category ?? "NWITA"}
            </span>
            <span className="shrink-0 text-sm font-light text-bone/80 tabular-nums">
              {formatMoney(p.price, symbol)}
            </span>
            <span
              className={cn(
                "shrink-0 text-xl transition-all duration-500",
                active === i ? "translate-x-0 text-bone opacity-100" : "-translate-x-2 opacity-0",
              )}
            >
              →
            </span>
          </Link>
        ))}

        {/* Cursor-following preview */}
        {current?.images[0] && (
          <div
            className={cn(
              "pointer-events-none fixed z-40 h-[380px] w-[290px] overflow-hidden transition-opacity duration-300",
              hovering ? "opacity-100" : "opacity-0",
            )}
            style={{ left: render.x, top: render.y, transform: "translate(-50%, -50%) rotate(-3deg)" }}
          >
            <Image
              src={current.images[0].url}
              alt={current.name}
              fill
              sizes="290px"
              className="object-cover"
            />
            <div className="absolute inset-0 border border-bone/20" />
          </div>
        )}
      </div>

      {/* Mobile rail */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p, i) => (
          <Link
            key={p.id}
            href={`/shop/${p.slug}`}
            className="w-[72vw] max-w-[320px] shrink-0 snap-start"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-coal">
              {p.images[0] && (
                <Image
                  src={p.images[0].url}
                  alt={p.name}
                  fill
                  sizes="72vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex items-baseline justify-between pt-3">
              <span className="font-display text-lg text-bone">
                <span className="mr-3 text-xs font-light text-fog tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.name}
              </span>
              <span className="text-sm font-light text-fog">{formatMoney(p.price, symbol)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
