import { cn } from "@/lib/utils";

interface TraceDividerProps {
  className?: string;
  label?: string;
}

/**
 * A trace running the width of its container with a via at each end —
 * the visual "wire" that routes one section of the board into the next.
 */
export function TraceDivider({ className, label }: TraceDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 text-copper/50", className)}>
      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
        <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="1.4" fill="currentColor" />
      </svg>
      <div className="h-px flex-1 bg-copper/30" />
      {label && (
        <span className="font-mono text-xs tracking-wide text-copper/70 shrink-0">{label}</span>
      )}
      <div className="h-px flex-1 bg-copper/30" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0">
        <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="1.4" fill="currentColor" />
      </svg>
    </div>
  );
}
