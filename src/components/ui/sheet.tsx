"use client";

import type { ComponentProps } from "react";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

/**
 * shadcn's Base UI sheet. Only the colour and motion utilities are swapped for
 * this project's tokens — there is no shadcn token layer here, and the close
 * affordance is a plain button rather than the registry's `Button` import.
 */

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-navy/30 transition-opacity duration-200 ease-[var(--ease-out)] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  closeLabel = "Zamknij",
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  closeLabel?: string;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-paper bg-clip-padding text-ink shadow-[0_18px_50px_-18px] shadow-navy/40",
          "transition-[opacity,translate] duration-250 ease-[var(--ease-out)] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:translate-x-0! motion-reduce:translate-y-0!",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-[starting-style]:-translate-y-4 data-[side=top]:data-[ending-style]:-translate-y-4",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-[starting-style]:translate-y-4 data-[side=bottom]:data-[ending-style]:translate-y-4",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-[starting-style]:-translate-x-4 data-[side=left]:data-[ending-style]:-translate-x-4 data-[side=left]:sm:max-w-sm",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-[starting-style]:translate-x-4 data-[side=right]:data-[ending-style]:translate-x-4 data-[side=right]:sm:max-w-sm",
          "border-hairline",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose
            aria-label={closeLabel}
            className="absolute end-4 top-3 flex size-10 items-center justify-center rounded-full border border-hairline text-ink transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </SheetClose>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 px-5 py-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 px-5 py-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("display text-base text-ink", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-ink-muted", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
