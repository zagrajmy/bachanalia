import Image from "next/image";
import Link from "next/link";

import { FUNDING } from "@/content/partners";

export function FundingStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 py-5">
      {FUNDING.map((logo) => (
        <Link
          key={logo.name}
          href={logo.href}
          rel="noreferrer"
          target="_blank"
          className="flex aspect-square w-[min(320px,72vw)] items-center justify-center border border-transparent no-underline hover:border-dashed hover:border-navy/30"
        >
          <Image
            alt={logo.name}
            className="size-auto max-h-full max-w-full"
            sizes="(min-width: 640px) 320px, 72vw"
            src={logo.src}
          />
        </Link>
      ))}
    </div>
  );
}
