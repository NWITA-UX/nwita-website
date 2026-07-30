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
  Toggle,
  type SaveState,
} from "../ui";

export default function HomepagePanel() {
  const [ready, setReady] = useState(false);
  const [hero, setHero] = useState<Record<string, string | boolean>>({});
  const [home, setHome] = useState<Record<string, string>>({});
  const [footerNote, setFooterNote] = useState("");
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    api("/api/settings")
      .then((d) => {
        const s = d.settings as SiteSettings;
        setHero({
          overline: s.hero.overline,
          title: s.hero.title,
          subtitle: s.hero.subtitle,
          backgroundImage: s.hero.backgroundImage,
          backgroundVideo: s.hero.backgroundVideo,
          videoEnabled: s.hero.videoEnabled,
          ctaLabel: s.hero.ctaLabel,
          ctaLink: s.hero.ctaLink,
        });
        setHome({
          marqueeText: s.homepage.marquee.join("\n"),
          selectionTitle: s.homepage.selectionTitle,
          selectionIntro: s.homepage.selectionIntro,
          storyTitle: s.homepage.storyTitle,
          storyText: s.homepage.storyText,
          storyImage: s.homepage.storyImage,
          storyVideo: s.homepage.storyVideo,
          storyCtaLabel: s.homepage.storyCtaLabel,
          lookbookTitle: s.homepage.lookbookTitle,
          instagramTitle: s.homepage.instagramTitle,
        });
        setFooterNote(s.footer.note);
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

  if (!ready) return <p className="label">Loading homepage…</p>;

  const hUp = (k: string) => (v: string | boolean) => setHero((o) => ({ ...o, [k]: v }));
  const mUp = (k: string) => (v: string) => setHome((o) => ({ ...o, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="label">Front of house</p>
        <h1 className="mt-2 font-display text-4xl text-bone">Homepage</h1>
        <p className="mt-3 text-sm font-light text-fog">
          Changes go live the moment you press save — no rebuild, no code.
        </p>
      </div>

      <Section
        title="Hero section"
        desc="The full-screen cinematic opening."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.hero ?? "idle"} />
            <Btn
              onClick={() =>
                save("hero", {
                  ...hero,
                  marquee: undefined,
                  videoEnabled: Boolean(hero.videoEnabled),
                })
              }
            >
              Save hero
            </Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Overline" hint="Small line above the title.">
            <TextInput value={String(hero.overline ?? "")} onChange={(e) => hUp("overline")(e.target.value)} />
          </Field>
          <Field label="CTA button label">
            <TextInput value={String(hero.ctaLabel ?? "")} onChange={(e) => hUp("ctaLabel")(e.target.value)} />
          </Field>
        </div>
        <Field label="Title" hint="Set in the display face — keep it short and heavy.">
          <TextInput value={String(hero.title ?? "")} onChange={(e) => hUp("title")(e.target.value)} />
        </Field>
        <Field label="Subtitle">
          <TextArea rows={2} value={String(hero.subtitle ?? "")} onChange={(e) => hUp("subtitle")(e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="CTA link">
            <TextInput value={String(hero.ctaLink ?? "")} onChange={(e) => hUp("ctaLink")(e.target.value)} placeholder="/shop" />
          </Field>
          <Field label="Background video URL" hint="MP4 — plays muted behind the image. Leave empty for image only.">
            <TextInput value={String(hero.backgroundVideo ?? "")} onChange={(e) => hUp("backgroundVideo")(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Toggle checked={Boolean(hero.videoEnabled)} onChange={(v) => hUp("videoEnabled")(v)} label="Play hero video" />
        </div>
        <ImagePicker label="Hero background image" value={String(hero.backgroundImage ?? "")} onChange={hUp("backgroundImage")} />
      </Section>

      <Section
        title="Sections & copy"
        desc="Marquee ticker, featured selection and the story block."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.homepage ?? "idle"} />
            <Btn
              onClick={() =>
                save("homepage", {
                  ...home,
                  marquee: String(home.marqueeText ?? "")
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            >
              Save sections
            </Btn>
          </div>
        }
      >
        <Field label="Marquee items" hint="One per line — the scrolling ticker under the hero.">
          <TextArea rows={5} value={home.marqueeText ?? ""} onChange={(e) => mUp("marqueeText")(e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Selection title">
            <TextInput value={home.selectionTitle ?? ""} onChange={(e) => mUp("selectionTitle")(e.target.value)} />
          </Field>
          <Field label="Lookbook title">
            <TextInput value={home.lookbookTitle ?? ""} onChange={(e) => mUp("lookbookTitle")(e.target.value)} />
          </Field>
        </div>
        <Field label="Selection intro">
          <TextArea rows={2} value={home.selectionIntro ?? ""} onChange={(e) => mUp("selectionIntro")(e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Story title">
            <TextInput value={home.storyTitle ?? ""} onChange={(e) => mUp("storyTitle")(e.target.value)} />
          </Field>
          <Field label="Story CTA label">
            <TextInput value={home.storyCtaLabel ?? ""} onChange={(e) => mUp("storyCtaLabel")(e.target.value)} />
          </Field>
        </div>
        <Field label="Story text">
          <TextArea rows={4} value={home.storyText ?? ""} onChange={(e) => mUp("storyText")(e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <ImagePicker label="Story image" value={home.storyImage ?? ""} onChange={mUp("storyImage")} />
          <Field label="Story video URL" hint="Plays in the story block. Empty = image only.">
            <TextInput value={home.storyVideo ?? ""} onChange={(e) => mUp("storyVideo")(e.target.value)} />
          </Field>
        </div>
        <Field label="Instagram section title">
          <TextInput value={home.instagramTitle ?? ""} onChange={(e) => mUp("instagramTitle")(e.target.value)} />
        </Field>
      </Section>

      <Section
        title="Footer line"
        desc="The quiet sentence under the slogan in the footer."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.footer ?? "idle"} />
            <Btn onClick={() => save("footer", { note: footerNote })}>Save</Btn>
          </div>
        }
      >
        <Field label="Footer note">
          <TextInput value={footerNote} onChange={(e) => setFooterNote(e.target.value)} />
        </Field>
      </Section>
    </div>
  );
}
