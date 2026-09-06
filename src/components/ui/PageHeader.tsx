import { CircuitBackground } from "@/components/pcb/CircuitBackground";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-copper/15">
      <CircuitBackground className="absolute inset-0 h-full w-full opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-board/40 via-board/80 to-board" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-mono text-sm text-signal/80">
          <span className="text-copper/60">// </span>
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-medium text-paper sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-paper-muted">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
