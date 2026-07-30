import type { Metadata } from "next";
import localFont from "next/font/local";
import { Familjen_Grotesk } from "next/font/google";

import "@/app/globals.css";

const karrik = localFont({
  src: [
    { path: "../fonts/Karrik-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Karrik-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-karrik",
  display: "swap",
});

const familjen = Familjen_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-familjen",
  display: "swap",
});

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
    <html lang="pl" className={`${karrik.variable} ${familjen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
