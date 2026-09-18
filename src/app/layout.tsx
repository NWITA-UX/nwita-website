import type { Metadata } from "next";
import { Italiana, Jost } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

/** Display face — the NWITA wordmark voice. */
const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

/** Body face — geometric, editorial, quiet. */
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nwita.com"),
  title: {
    default: "NWITA — Wear the Feeling",
    template: "%s — NWITA",
  },
  description:
    "NWITA is a luxury clothing house crafting timeless monochrome essentials. Numbered pieces, cinematic cuts. Wear the Feeling.",
  icons: {
  icon: "/icon.png",
  apple: "/apple-icon.png",
},
  openGraph: {
    siteName: "NWITA",
    title: "NWITA — Wear the Feeling",
    description: "Luxury essentials, cut from silence. Numbered pieces, cinematic cuts.",
    images: ["/images/hero.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${italiana.variable} ${jost.variable}`}>
      <body className="grain min-h-screen overflow-x-clip">{children}</body>
    </html>
  );
}
