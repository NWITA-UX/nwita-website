import Image from "next/image";
import Link from "next/link";
import type { ProductRow } from "@/lib/queries";
import { buildOrderMessage, formatMoney, waLink } from "@/lib/utils";
import { WhatsAppGlyph } from "./Nav";

/** Editorial product tile — image crossfade on hover + one-tap WhatsApp order. */
export default function ProductCard({
  product,
  whatsapp,
  symbol,
  eager = false,
}: {
  product: ProductRow;
  whatsapp: string;
  symbol: string;
  eager?: boolean;
}) {
  const [first, second] = product.images;
  const onSale = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  return (
    <div className="group relative">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-coal">
          {first ? (
            <Image
              src={first.url}
              alt={first.alt ?? product.name}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
              priority={eager}
              className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-5xl text-outline">{product.name.charAt(0)}</span>
            </div>
          )}
          {second && (
            <Image
              src={second.url}
              alt={second.alt ?? `${product.name} detail`}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {onSale && (
            <span className="absolute top-3 left-3 bg-bone px-2.5 py-1 text-[10px] font-medium tracking-[0.25em] text-ink uppercase">
              Sale
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 pt-4">
          <div>
            {product.collection && (
              <p className="label !text-[10px]">{product.collection}</p>
            )}
            <h3 className="mt-1.5 font-display text-xl text-bone transition-transform duration-500 group-hover:translate-x-1">
              {product.name}
            </h3>
            <p className="mt-1 text-sm font-light text-fog">
              {formatMoney(product.price, symbol)}
              {product.compareAtPrice && (
                <span className="ml-2 line-through opacity-60">
                  {formatMoney(product.compareAtPrice, symbol)}
                </span>
              )}
            </p>
          </div>
          <span className="mt-1 hidden text-[10px] font-light tracking-[0.25em] text-fog uppercase sm:block">
            {product.colors.length} colours
          </span>
        </div>
      </Link>

      {/* Quick order — opens WhatsApp with the product pre-filled */}
      <a
        href={waLink(
          whatsapp,
          buildOrderMessage({
            product: product.name,
            note: "(I would like to confirm sizes and colours.)",
          }),
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Order ${product.name} on WhatsApp`}
        className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink/80 opacity-0 backdrop-blur-sm transition-all duration-400 group-hover:opacity-100 hover:!bg-wa md:translate-y-1 md:group-hover:translate-y-0"
      >
        <WhatsAppGlyph className="h-4.5 w-4.5 text-bone" />
      </a>
    </div>
  );
}
