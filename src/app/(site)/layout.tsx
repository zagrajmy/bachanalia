import { SiteFooter } from "@/components/Globals/SiteFooter";
import { SiteHeader } from "@/components/Globals/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#tresc"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:font-semibold focus:text-on-accent"
      >
        Przejdź do treści
      </a>
      <SiteHeader />
      <main id="tresc">{children}</main>
      <SiteFooter />
    </>
  );
}
