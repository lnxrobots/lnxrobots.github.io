import Link from "next/link";
import { CircuitBackground } from "@/components/pcb/CircuitBackground";
import { CountdownReadout } from "./CountdownReadout";
import { site } from "@/data/site";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-copper/15">
      <div className="absolute inset-0 bg-grid-fine opacity-40" />
      <CircuitBackground withPulse className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-board/10 via-board/70 to-board" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.444fr,1fr] lg:items-end">
        <div>
          <p className="font-mono text-sm text-signal/80">
            <span className="text-copper/70">// </span>
            {site.location} — student robotics club
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
            Turning spare parts into world-class robots.
          </h1>
          <p className="mt-5 max-w-md text-balance font-body text-base leading-relaxed text-paper-muted">
            {site.longTagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/teams"
              className="pad-chamfer-sm border border-copper-bright/60 bg-copper/10 px-5 py-2.5 font-mono text-sm text-copper-bright transition-colors hover:bg-copper/20"
            >
              Browse the teams
            </Link>
            <Link
              href="/achievements"
              className="font-mono text-sm text-paper-muted underline decoration-copper/40 underline-offset-4 transition-colors hover:text-signal-bright"
            >
              See the results board →
            </Link>
          </div>
        </div>

        <div className="lg:justify-self-end w-full max-w-sm z-10 lg:absolute lg:bottom-10 lg:right-32">
          <CountdownReadout />
        </div>

        <div className="max-w-md w-full aspect-square absolute hidden lg:block pad-chamfer group border border-signal/15 bg-board-raised/90 right-5 top-8">
          <Image src="/content/cover.jpg" alt="Nyvora the robot" fill />
          <div className="w-full h-full absolute bg-gradient-to-b from-board/10 via-board/50 to-board">
          </div>
        </div>
      </div>
    </section>
  );
}
