import type { Metadata } from "next";
import { IBM_Plex_Sans, Sora } from "next/font/google";

import "@/app/globals.css";

import { SiteFooter } from "@/components/Globals/SiteFooter";
import { SiteHeader } from "@/components/Globals/SiteHeader";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bachanalia Fantastyczne XL",
    template: "%s | Bachanalia Fantastyczne XL",
  },
  description: "XL Ogólnopolski festiwal popkultury. 25-27 września 2026, Zielona Góra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${sora.variable} ${plex.variable}`}>
      <body>
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:font-semibold focus:text-on-accent"
        >
          Przejdź do treści
        </a>
        <SiteHeader />
        <main id="tresc">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
