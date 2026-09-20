import Download04Icon from "@hugeicons/core-free-icons/Download04Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import { guardianConsentDocument } from "@/content/documents";
import { cn } from "@/lib/utils";

export function GuardianConsentDownload({ className }: { className?: string }) {
  return (
    <a
      className={cn(
        "marked-link relative flex max-w-full items-start gap-2 before:absolute before:-inset-2",
        className,
      )}
      download
      href={guardianConsentDocument.href}
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0"
        icon={Download04Icon}
        strokeWidth={2}
      />
      <span>{guardianConsentDocument.downloadLabel}</span>
    </a>
  );
}
