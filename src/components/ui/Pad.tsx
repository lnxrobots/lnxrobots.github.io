import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface PadProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article";
}

/**
 * The recurring "component footprint" shape used for every boxed piece of
 * content on the site: square corners on three sides, one 45° chamfer
 * (the way a footprint's silkscreen marks pin 1), a hairline copper border.
 */
export function Pad({ className, children, ...props }: PadProps) {
  return (
    <div
      className={cn(
        "pad-chamfer border border-copper/25 bg-board-raised/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
