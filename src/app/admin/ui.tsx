"use client";

import { useRef, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ---------- tiny fetch wrapper ---------- */
export async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
    ...opts,
  });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new Error((data.error as string) ?? res.statusText);
  return data;
}

/* ---------- form primitives ---------- */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] font-light text-fog/70">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full border border-line bg-ink px-3.5 py-2.5 text-sm font-light text-bone placeholder:text-fog/50 transition-colors focus:border-bone/60 focus:outline-none",
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-y border border-line bg-ink px-3.5 py-2.5 text-sm font-light leading-relaxed text-bone placeholder:text-fog/50 transition-colors focus:border-bone/60 focus:outline-none",
        props.className,
      )}
    />
  );
}

export function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-line bg-ink px-3 py-2.5 text-sm font-light text-bone focus:border-bone/60 focus:outline-none"
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3">
      <span
        className={cn(
          "relative h-5 w-10 shrink-0 border transition-colors duration-300",
          checked ? "border-bone bg-bone/25" : "border-line",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 transition-all duration-300",
            checked ? "left-[calc(100%-0.875rem)] bg-bone" : "left-1 bg-fog/50",
          )}
        />
      </span>
      {label && <span className="text-sm font-light text-bone/80">{label}</span>}
    </button>
  );
}

/* ---------- buttons ---------- */
export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-5 py-2.5 text-[11px] font-medium tracking-[0.25em] uppercase transition-all duration-300 disabled:opacity-40",
        variant === "primary" && "bg-bone text-ink hover:bg-wa",
        variant === "ghost" && "border border-line text-bone/80 hover:border-bone/60 hover:text-bone",
        variant === "danger" && "border border-red-500/40 text-red-300 hover:bg-red-500/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Two-step delete — first click arms it, second confirms. */
export function DangerDelete({ onConfirm, label = "Delete" }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else {
          setArmed(true);
          setTimeout(() => setArmed(false), 2600);
        }
      }}
      className={cn(
        "border px-3 py-1.5 text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-300",
        armed
          ? "border-red-400 bg-red-500/20 text-red-200"
          : "border-line text-fog hover:border-red-400/60 hover:text-red-300",
      )}
    >
      {armed ? "Sure?" : label}
    </button>
  );
}

/* ---------- save feedback ---------- */
export type SaveState = "idle" | "saving" | "saved" | "error";
export function SaveNote({ state, error }: { state: SaveState; error?: string }) {
  if (state === "idle") return null;
  return (
    <span
      className={cn(
        "text-xs font-light",
        state === "saving" && "text-fog",
        state === "saved" && "text-wa",
        state === "error" && "text-red-300",
      )}
    >
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : error ?? "Something went wrong"}
    </span>
  );
}

/* ---------- uploads ---------- */
export function Uploader({
  onDone,
  accept = "image/*,video/*",
  compact = false,
}: {
  onDone: (urls: string[]) => void;
  accept?: string;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onDone(data.urls as string[]);
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files);
      }}
      className={cn(
        "flex w-full items-center justify-center gap-3 border border-dashed transition-all duration-300",
        over ? "border-wa bg-wa/10" : "border-line hover:border-bone/50",
        compact ? "px-3 py-2.5" : "px-4 py-7",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-fog" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xs font-light text-fog">
        {busy ? "Uploading…" : over ? "Release to upload" : "Drag & drop, or click to browse"}
      </span>
      <input
        ref={ref}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
    </button>
  );
}

/** Single-image field — upload, paste URL, preview, clear. */
export function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-line bg-ink">
          {value && <Image src={value} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <Uploader compact accept="image/*" onDone={(urls) => urls[0] && onChange(urls[0])} />
          <div className="flex gap-2">
            <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" />
            {value && (
              <Btn variant="ghost" onClick={() => onChange("")} className="shrink-0 !px-3">
                ✕
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- panel shell ---------- */
export function Section({
  title,
  desc,
  children,
  action,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="border border-line bg-coal/50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 className="font-display text-xl text-bone">{title}</h2>
          {desc && <p className="mt-0.5 text-xs font-light text-fog">{desc}</p>}
        </div>
        {action}
      </header>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}
