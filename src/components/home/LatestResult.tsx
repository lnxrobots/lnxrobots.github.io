import Image from "next/image";
import Link from "next/link";
import { achievements } from "@/data/achievements";
import { coverOf } from "@/lib/covers";
import { getTeam } from "@/data/teams";
import { ResultBadge } from "@/components/event/ResultBadge";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatDate } from "@/lib/utils";

export function LatestResult() {
  const latest = achievements[0];
  if (!latest) return null;
  const cover = coverOf(latest);
  const teams = (Array.isArray(latest.team) ? latest.team : [latest.team]).map((slug) => {
    return getTeam(slug);
  });

  return (
    <section className="border-y border-copper/15 bg-board-raised/50 mb-10">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <SectionLabel>most recent result</SectionLabel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {cover && (
            <Link
              href={`/event/${latest.id}`}
              className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden border border-copper/20 sm:w-64"
            >
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(min-width: 640px) 256px, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </Link>
          )}
          <div className="sm:flex-1">
            <h2 className="font-display text-2xl text-paper sm:text-3xl">
              <Link href={`/event/${latest.id}`} className="hover:text-signal-bright">
                {latest.event}
              </Link>
            </h2>
            <p className="mt-1 font-mono text-sm text-paper-muted">
              {latest.location} · {formatDate(latest.date)}
              {teams && (
                <span className="text-paper-muted">
                  {" · "}Team{teams.length > 1 && "s"}:{" "}
                  {teams.map((team, i) => {
                    return team && (
                      <span key={i}>
                        {i !== 0 && ", "}
                        <Link
                          href={`/team/${team.slug}`}
                          className="text-copper/80 hover:text-copper-bright"
                        >
                          {team?.name}
                        </Link>
                      </span>
                    )
                  })}
                </span>
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <DisciplineTag slug={latest.discipline} />
              {latest.results.map((r, i) => (
                <ResultBadge key={i} result={r} />
              ))}
            </div>
          </div>

          <Link
            href="/achievements"
            className="shrink-0 font-mono text-sm text-signal/80 underline decoration-signal/30 underline-offset-4 hover:text-signal-bright"
          >
            Full results board →
          </Link>
        </div>
      </div>
    </section>
  );
}
