import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import "@/components/ui/warcraftcn/styles/warcraft.css";

const buttonVariants = cva(
  "fantasy inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border-solid whitespace-nowrap text-white uppercase no-underline outline-none transition-all duration-100 [border-image-repeat:stretch] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-95 active:brightness-75 active:shadow-inner",
  {
    variants: {
      variant: {
        default:
          "wc-btn-border rounded-md border-4 px-3 py-1.5 text-xs tracking-[0.08em] [border-image-slice:16_fill]",
        frame:
          "wc-btn-border-frame border-x-[13px] border-y-[7px] px-2 py-0.5 text-[0.6875rem] tracking-[0.06em] [border-image-slice:95_180_fill]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Button({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp className={cn(buttonVariants({ variant }), className)} data-slot="button" {...props} />
  );
}

export { Button, buttonVariants };
