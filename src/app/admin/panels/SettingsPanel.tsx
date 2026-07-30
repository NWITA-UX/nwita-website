"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import {
  api,
  Btn,
  Field,
  ImagePicker,
  SaveNote,
  Section,
  TextArea,
  TextInput,
  type SaveState,
} from "../ui";

export default function SettingsPanel() {
  const [ready, setReady] = useState(false);
  const [brand, setBrand] = useState({ name: "", slogan: "", tagline: "" });
  const [seo, setSeo] = useState({ siteTitle: "", metaDescription: "", analyticsId: "" });
  const [store, setStore] = useState({ currency: "USD", currencySymbol: "$" });
  const [logo, setLogo] = useState({ light: "", dark: "", favicon: "" });
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    api("/api/settings")
      .then((d) => {
        const s = d.settings as SiteSettings;
        setBrand({ ...s.brand });
        setSeo({ ...s.seo });
        setStore({ ...s.store });
        setLogo({ ...s.logo });
        setReady(true);
      })
      .catch(console.error);
  }, []);

  const save = async (key: string, value: Record<string, unknown>) => {
    setSaveState((o) => ({ ...o, [key]: "saving" }));
    try {
      await api("/api/settings", { method: "PATCH", body: JSON.stringify({ key, value }) });
      setSaveState((o) => ({ ...o, [key]: "saved" }));
      setTimeout(() => setSaveState((o) => ({ ...o, [key]: "idle" })), 2200);
    } catch {
      setSaveState((o) => ({ ...o, [key]: "error" }));
    }
  };

  if (!ready) return <p className="label">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="label">The house rules</p>
        <h1 className="mt-2 font-display text-4xl text-bone">Settings</h1>
      </div>

      <Section
        title="Brand"
        desc="Name, slogan and tagline used across the site."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.brand ?? "idle"} />
            <Btn onClick={() => save("brand", { ...brand })}>Save brand</Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Brand name">
            <TextInput value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          </Field>
          <Field label="Slogan">
            <TextInput value={brand.slogan} onChange={(e) => setBrand({ ...brand, slogan: e.target.value })} />
          </Field>
        </div>
        <Field label="Tagline">
          <TextInput value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
        </Field>
      </Section>

      <Section
        title="Logo & favicon"
        desc="Upload marks to replace the NWITA wordmark. Leave empty to keep the typographic logo."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.logo ?? "idle"} />
            <Btn onClick={() => save("logo", { ...logo })}>Save logo</Btn>
          </div>
        }
      >
        <ImagePicker label="Light logo (dark backgrounds)" value={logo.light} onChange={(v) => setLogo({ ...logo, light: v })} />
        <ImagePicker label="Dark logo (light backgrounds)" value={logo.dark} onChange={(v) => setLogo({ ...logo, dark: v })} />
        <ImagePicker label="Favicon" value={logo.favicon} onChange={(v) => setLogo({ ...logo, favicon: v })} />
      </Section>

      <Section
        title="SEO"
        desc="How search engines and shared links describe the house."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.seo ?? "idle"} />
            <Btn onClick={() => save("seo", { ...seo })}>Save SEO</Btn>
          </div>
        }
      >
        <Field label="Site title">
          <TextInput value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })} />
        </Field>
        <Field label="Meta description">
          <TextArea rows={3} value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} />
        </Field>
        <Field label="Google Analytics ID" hint="e.g. G-XXXXXXX — wired for a future tag injection.">
          <TextInput value={seo.analyticsId} onChange={(e) => setSeo({ ...seo, analyticsId: e.target.value })} />
        </Field>
      </Section>

      <Section
        title="Store"
        desc="Currency used on price tags. Orders themselves are arranged on WhatsApp."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.store ?? "idle"} />
            <Btn onClick={() => save("store", { ...store })}>Save store</Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Currency code">
            <TextInput value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })} />
          </Field>
          <Field label="Currency symbol">
            <TextInput value={store.currencySymbol} onChange={(e) => setStore({ ...store, currencySymbol: e.target.value })} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
