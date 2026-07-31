import type { Metadata } from "next";
import { Bricolage_Grotesque, Cinzel } from "next/font/google";

import "@/app/globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const fontVars = `${bricolage.variable} ${cinzel.variable}`;

const TITLE = "Bachanalia Fantastyczne XL";
const DESCRIPTION =
  "XL Ogólnopolski festiwal popkultury i Polcon 2026. 25-27 września, Kampus B Uniwersytetu Zielonogórskiego.";

/**
 * Nearly every visitor arrives from a link shared on Facebook, so the card is
 * the first thing most people see of this site. opengraph-image.png and
 * icon.png sit next to this file; Next picks them up by filename.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://bachanaliafantastyczne.pl"),
  title: { default: TITLE, template: `%s | ${TITLE}` },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
