import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-start justify-center px-5 md:px-16">
      <p className="label">Lost thread</p>
      <h1 className="mt-4 font-display text-[clamp(6rem,24vw,20rem)] leading-none text-outline">
        404
      </h1>
      <p className="mt-2 max-w-md text-lg font-light text-bone/70">
        This page wandered off the runway. The collection, however, is exactly where you
        left it.
      </p>
      <div className="mt-10 flex gap-5">
        <Link
          href="/"
          className="group border border-bone/60 px-7 py-3.5 text-[11px] font-medium tracking-[0.3em] text-bone uppercase transition-all duration-300 hover:bg-bone hover:text-ink"
        >
          ← Back home
        </Link>
        <Link
          href="/shop"
          className="group border border-line px-7 py-3.5 text-[11px] font-light tracking-[0.3em] text-fog uppercase transition-all duration-300 hover:border-bone hover:text-bone"
        >
          The shop →
        </Link>
      </div>
    </div>
  );
}
