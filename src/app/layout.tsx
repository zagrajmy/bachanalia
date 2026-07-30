import type { Metadata } from "next";
import localFont from "next/font/local";
import { Familjen_Grotesk } from "next/font/google";

import "@/app/globals.css";

const karrik = localFont({
  src: [
    { path: "../../public/fonts/Karrik-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Karrik-Italic.woff2", weight: "400", style: "italic" },
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

export const metadata: Metadata = {
  title: {
    default: "Bachanalia Fantastyczne XL",
    template: "%s | Bachanalia Fantastyczne XL",
  },
  description: "XL Ogólnopolski festiwal popkultury. 25-27 września 2026, Zielona Góra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${karrik.variable} ${familjen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
