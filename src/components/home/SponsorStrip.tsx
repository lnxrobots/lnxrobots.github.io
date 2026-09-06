import Image from "next/image";
import { sponsors } from "@/data/sponsors";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function SponsorStrip() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <SectionLabel>who keeps the boards powered</SectionLabel>
      <p className="max-w-lg font-body text-sm text-paper-muted">
        LNX Robots runs on parts, travel budgets, and resources provided by the organisations below.
      </p>
      <ul className="mt-6 flex flex-wrap items-center gap-3">
        {sponsors.map((s) => (
          <li key={s.name}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 font-mono text-sm text-paper-muted transition-colors hover:text-copper-bright"
            >
              {s.logo ? (
                <span className="relative h-14 w-24 shrink-0">
                  <Image src={s.logo} alt="" fill className="object-contain" />
                </span>
              ) : (
                s.name
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
