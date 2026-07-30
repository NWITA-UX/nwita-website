import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand mark. Renders the uploaded logo (dark or light variant) when the
 * admin has provided one, otherwise the NWITA wordmark set in Italiana.
 */
export default function Logo({
  brandName,
  logo,
  variant = "light",
  className,
}: {
  brandName: string;
  logo: { dark?: string; light?: string };
  variant?: "light" | "dark";
  className?: string;
}) {
  const src = variant === "light" ? logo.light : logo.dark || logo.light;
  if (src) {
    return (
      <Image
        src={src}
        alt={brandName}
        width={140}
        height={40}
        className={cn("h-7 w-auto object-contain", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "font-display text-[1.35rem] leading-none tracking-[0.42em] text-bone",
        className,
      )}
    >
      {brandName}
    </span>
  );
}
