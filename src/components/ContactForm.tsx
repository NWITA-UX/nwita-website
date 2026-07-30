"use client";

import { useState, type FormEvent } from "react";
import { waLink } from "@/lib/utils";
import { WhatsAppGlyph } from "./Nav";

/** Composes a WhatsApp message from the visitor's note and opens the chat. */
export default function ContactForm({ whatsapp, brand }: { whatsapp: string; brand: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "opening">("idle");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a short message.");
      return;
    }
    setError("");
    setStatus("opening");
    const text = `Hello ${brand}, my name is ${name.trim()}.\n\n${message.trim()}\n\nThank you.`;
    window.open(waLink(whatsapp, text), "_blank", "noopener,noreferrer");
    setTimeout(() => setStatus("idle"), 1600);
  };

  const inputCls =
    "w-full border border-line bg-transparent px-0 py-3.5 text-base font-light text-bone placeholder:text-fog/60 focus:border-bone/60 focus:outline-none transition-colors";

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      <div>
        <label htmlFor="cf-name" className="label block mb-2">
          Your name
        </label>
        <input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How should we address you?"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="cf-msg" className="label block mb-2">
          Message
        </label>
        <textarea
          id="cf-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Sizing, availability, a specific piece…"
          className={`${inputCls} resize-none`}
        />
      </div>
      {error && <p className="text-sm font-light text-red-400/90">{error}</p>}
      <button
        type="submit"
        className="group flex w-full items-center justify-center gap-3 bg-bone px-8 py-4.5 text-[11px] font-medium tracking-[0.3em] text-ink uppercase transition-all duration-300 hover:bg-wa hover:text-ink disabled:opacity-60"
      >
        <WhatsAppGlyph className="h-4 w-4" />
        {status === "opening" ? "Opening WhatsApp…" : "Send via WhatsApp"}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
      <p className="text-center text-xs font-light text-fog">
        Replies within a few hours, Monday to Saturday.
      </p>
    </form>
  );
}
