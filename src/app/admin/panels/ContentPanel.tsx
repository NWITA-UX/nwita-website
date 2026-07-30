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

export default function ContentPanel() {
  const [ready, setReady] = useState(false);
  const [about, setAbout] = useState({
    overline: "",
    headline: "",
    paragraphsText: "",
    quote: "",
    image: "",
    video: "",
  });
  const [values, setValues] = useState<{ title: string; text: string }[]>([]);
  const [contact, setContact] = useState({ whatsapp: "", phone: "", email: "", location: "", hours: "" });
  const [social, setSocial] = useState({ instagram: "", instagramHandle: "", tiktok: "", tiktokHandle: "" });
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    api("/api/settings")
      .then((d) => {
        const s = d.settings as SiteSettings;
        setAbout({
          overline: s.about.overline,
          headline: s.about.headline,
          paragraphsText: s.about.paragraphs.join("\n\n"),
          quote: s.about.quote,
          image: s.about.image,
          video: s.about.video,
        });
        setValues(s.about.values.map((v) => ({ title: v.title, text: v.text })));
        setContact({ ...s.contact });
        setSocial({ ...s.social });
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
        <p className="label">Words & numbers</p>
        <h1 className="mt-2 font-display text-4xl text-bone">About & Contact</h1>
      </div>

      {/* ---------- About ---------- */}
      <Section
        title="About page"
        desc="The story of the house."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.about ?? "idle"} />
            <Btn
              onClick={() =>
                save("about", {
                  ...about,
                  paragraphs: about.paragraphsText
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean),
                  values: values.map((v, i) => ({
                    n: String(i + 1).padStart(2, "0"),
                    title: v.title,
                    text: v.text,
                  })),
                })
              }
            >
              Save about
            </Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Overline">
            <TextInput value={about.overline} onChange={(e) => setAbout({ ...about, overline: e.target.value })} />
          </Field>
          <Field label="Video URL" hint="Campaign film shown at the bottom of the page.">
            <TextInput value={about.video} onChange={(e) => setAbout({ ...about, video: e.target.value })} />
          </Field>
        </div>
        <Field label="Headline">
          <TextArea rows={2} value={about.headline} onChange={(e) => setAbout({ ...about, headline: e.target.value })} />
        </Field>
        <Field label="Paragraphs" hint="Separate paragraphs with a blank line.">
          <TextArea rows={8} value={about.paragraphsText} onChange={(e) => setAbout({ ...about, paragraphsText: e.target.value })} />
        </Field>
        <Field label="Quote">
          <TextInput value={about.quote} onChange={(e) => setAbout({ ...about, quote: e.target.value })} />
        </Field>
        <ImagePicker label="Portrait image" value={about.image} onChange={(v) => setAbout({ ...about, image: v })} />

        <div>
          <p className="label mb-3">The three vows</p>
          {values.map((v, i) => (
            <div key={i} className="mb-3 grid gap-3 border border-line p-4 md:grid-cols-[180px_1fr_auto]">
              <TextInput value={v.title} onChange={(e) => setValues(values.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} placeholder="Title" />
              <TextInput value={v.text} onChange={(e) => setValues(values.map((x, xi) => (xi === i ? { ...x, text: e.target.value } : x)))} placeholder="One line of belief" />
              <Btn variant="ghost" className="!px-3" onClick={() => setValues(values.filter((_, xi) => xi !== i))}>✕</Btn>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setValues([...values, { title: "", text: "" }])}>+ Add vow</Btn>
        </div>
      </Section>

      {/* ---------- Contact ---------- */}
      <Section
        title="Contact & WhatsApp"
        desc="Where every order lands. The WhatsApp number powers every order button on the site."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.contact ?? "idle"} />
            <Btn onClick={() => save("contact", { ...contact })}>Save contact</Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="WhatsApp number" hint="Digits with country code, e.g. 33612345678.">
            <TextInput value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </Field>
          <Field label="Location">
            <TextInput value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} />
          </Field>
        </div>
        <Field label="Opening hours">
          <TextInput value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
        </Field>
      </Section>

      {/* ---------- Social ---------- */}
      <Section
        title="Social links"
        desc="Used in the footer, contact page and Instagram section."
        action={
          <div className="flex items-center gap-3">
            <SaveNote state={saveState.social ?? "idle"} />
            <Btn onClick={() => save("social", { ...social })}>Save social</Btn>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Instagram URL">
            <TextInput value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
          </Field>
          <Field label="Instagram handle">
            <TextInput value={social.instagramHandle} onChange={(e) => setSocial({ ...social, instagramHandle: e.target.value })} />
          </Field>
          <Field label="TikTok URL">
            <TextInput value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} />
          </Field>
          <Field label="TikTok handle">
            <TextInput value={social.tiktokHandle} onChange={(e) => setSocial({ ...social, tiktokHandle: e.target.value })} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
