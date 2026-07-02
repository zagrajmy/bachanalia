import { Inter } from "next/font/google";

import "@/app/globals.css";

import Navigation from "@/components/Globals/Navigation/Navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
