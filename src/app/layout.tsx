import type { Metadata } from "next";
import { IBM_Plex_Sans, Sora } from "next/font/google";

import "@/app/globals.css";

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
      <body>{children}</body>
    </html>
  );
}
