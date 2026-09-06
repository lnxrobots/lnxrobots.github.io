import Link from "next/link";
import { CircuitBackground } from "@/components/pcb/CircuitBackground";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <CircuitBackground className="absolute inset-0 h-full w-full opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-board/40 via-board/85 to-board" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-start px-5 py-28 sm:px-8">
        <p className="font-mono text-sm text-signal/80">
          <span className="text-copper/60">// </span>
          trace not found
        </p>
        <h1 className="mt-3 font-display text-4xl text-paper sm:text-5xl">
          404 — open circuit
        </h1>
        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-paper-muted">
          This route doesn&apos;t connect to anything on the board. It may
          have moved, or the page you wanted hasn&apos;t been routed yet.
        </p>
        <Link
          href="/"
          className="pad-chamfer-sm mt-8 border border-copper-bright/60 bg-copper/10 px-5 py-2.5 font-mono text-sm text-copper-bright transition-colors hover:bg-copper/20"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
