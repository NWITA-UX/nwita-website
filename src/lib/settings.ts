import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

/* ------------------------------------------------------------------ */
/*  Site settings engine                                               */
/*  Every editable area of the site lives here as a JSON document.     */
/*  Admin panel edits are merged over these defaults, so the site      */
/*  always renders even before the first save.                         */
/* ------------------------------------------------------------------ */

export const SETTINGS_DEFAULTS = {
  brand: {
    name: "NWITA",
    slogan: "Wear the Feeling",
    tagline: "Luxury essentials, cut from silence.",
  },
  hero: {
    overline: "FW·26 — The Old Art Collection",
    title: "Wear the Feeling",
    subtitle: "Garments cut from silence. Made to be felt — not just worn.",
    backgroundImage: "/images/hero.jpg",
    backgroundVideo:
      "https://videos.pexels.com/video-files/7760062/7760062-uhd_4096_2160_25fps.mp4",
    videoEnabled: true,
    ctaLabel: "Explore the Collection",
    ctaLink: "/shop",
  },
  logo: {
    dark: "",
    light: "",
    favicon: "",
  },
  contact: {
    whatsapp: "15550123456",
    phone: "+1 (555) 012-3456",
    email: "atelier@nwita.com",
    location: "Paris — Shipping Worldwide",
    hours: "Mon – Sat · 10:00 – 19:00 CET",
  },
  social: {
    instagram: "https://instagram.com/nwita.official",
    instagramHandle: "@nwita.official",
    tiktok: "https://tiktok.com/@nwita",
    tiktokHandle: "@nwita",
  },
  seo: {
    siteTitle: "NWITA — Wear the Feeling",
    metaDescription:
      "NWITA is a luxury clothing house crafting timeless monochrome essentials. Numbered pieces, cinematic cuts. Wear the Feeling.",
    analyticsId: "",
  },
  homepage: {
    marquee: [
      "Wear the Feeling",
      "Old Art — FW·26",
      "Cut from Silence",
      "Numbered Pieces",
      "Worldwide Delivery",
    ],
    selectionTitle: "The Selection",
    selectionIntro: "Featured pieces from the current collection — numbered, never repeated.",
    storyTitle: "Cut from Silence",
    storyText:
      "Every NWITA piece begins in quiet. We work with small ateliers, heavyweight natural fabrics and a single palette — because emotion needs no noise. Each garment is numbered by hand and made to outlive the season it was born in.",
    storyImage: "/images/story.jpg",
    storyVideo:
      "https://videos.pexels.com/video-files/6962210/6962210-uhd_4096_2160_25fps.mp4",
    storyCtaLabel: "Read the Story",
    lookbookTitle: "Lookbook",
    instagramTitle: "Follow the Feeling",
  },
  about: {
    overline: "The House",
    headline: "We don't make clothes. We make feelings you can wear.",
    paragraphs: [
      "NWITA was born from a simple refusal — a refusal of logos shouting, of seasons burning out, of fabric that forgets your body. We wanted clothing that behaves like memory: quiet, heavy, and impossible to replace.",
      "Our palette is deliberately narrow. Black, bone, and the grey in between. Within that silence we obsess over what remains — weight, drape, the sound a seam makes, the way a shoulder holds its line after a hundred wears.",
      "Each piece is produced in numbered runs with family ateliers in Portugal and Japan. When a number is gone, it is gone. What you wear was made for the moment you found it.",
    ],
    quote: "Elegance is refusal — we refuse everything that does not move us.",
    image: "/images/hero.jpg",
    video: "https://videos.pexels.com/video-files/6962210/6962210-uhd_4096_2160_25fps.mp4",
    values: [
      {
        n: "01",
        title: "Silence as Luxury",
        text: "No visible branding, no seasonal noise. The garment speaks through weight and line.",
      },
      {
        n: "02",
        title: "Numbered Runs",
        text: "Every piece carries its number. Scarcity is not a tactic — it is a promise of care.",
      },
      {
        n: "03",
        title: "Made to Age",
        text: "Fabrics chosen to soften, fade and remember. A NWITA garment is finished by its owner.",
      },
    ],
  },
  footer: {
    note: "Every piece is numbered. Every feeling is yours.",
  },
  store: {
    currency: "USD",
    currencySymbol: "$",
  },
} as const;

type DeepMutable<T> = T extends readonly (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
    : T;

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;
export type SiteSettings = {
  [K in SettingsKey]: DeepMutable<(typeof SETTINGS_DEFAULTS)[K]>;
};

/** Read every setting, merging stored values over the code defaults. */
export async function getAllSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(settings);
  const out: Record<string, Record<string, unknown>> = JSON.parse(
    JSON.stringify(SETTINGS_DEFAULTS),
  );
  for (const row of rows) {
    out[row.key] = { ...(out[row.key] ?? {}), ...(row.value ?? {}) };
  }
  return out as SiteSettings;
}

export async function getSetting<K extends SettingsKey>(key: K) {
  const all = await getAllSettings();
  return all[key];
}

/** Merge a partial update into a settings document and persist it. */
export async function updateSetting(key: string, value: Record<string, unknown>) {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  const merged = { ...((row?.value as Record<string, unknown>) ?? {}), ...value };
  await db
    .insert(settings)
    .values({ key, value: merged, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: merged, updatedAt: new Date() },
    });
  return merged;
}
