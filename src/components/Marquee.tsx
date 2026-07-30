import { cn } from "@/lib/utils";

/** Infinite editorial ticker — duplicated tracks keep the loop seamless. */
export default function Marquee({
  items,
  className,
  itemClassName,
  slow = false,
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  slow?: boolean;
}) {
  const row = items.length ? items : ["Wear the Feeling"];
  return (
    <div className={cn("overflow-hidden border-y border-line select-none", className)}>
      <div
        className={cn(
          "flex w-max will-change-transform",
          slow ? "animate-marquee-slow" : "animate-marquee",
        )}
      >
        {[0, 1].map((group) => (
          <div key={group} aria-hidden={group === 1} className="flex shrink-0 items-center">
            {row.map((item, i) => (
              <span
                key={i}
                className={cn(
                  "flex items-center gap-10 py-4 pr-10 text-[11px] font-light uppercase tracking-[0.4em] whitespace-nowrap text-fog",
                  itemClassName,
                )}
              >
                {item}
                <svg width="7" height="7" viewBox="0 0 8 8" className="text-bone/40">
                  <path d="M4 0 8 4 4 8 0 4Z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
