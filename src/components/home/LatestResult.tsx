import Link from "next/link";
import { achievements } from "@/data/achievements";
import { getTeam } from "@/data/teams";
import { ResultBadge } from "@/components/achievements/ResultBadge";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatDate } from "@/lib/utils";

export function LatestResult() {
  const latest = achievements[0];
  if (!latest) return null;
  const team = getTeam(latest.team);

  return (
    <section className="border-y border-copper/15 bg-board-raised/50">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <SectionLabel>most recent result</SectionLabel>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-paper sm:text-3xl">
              <Link href={`/achievements/${latest.id}`} className="hover:text-signal-bright">
                {latest.event}
              </Link>
            </h2>
            <p className="mt-1 font-mono text-sm text-paper-muted">
              {latest.location} · {formatDate(latest.date)}
              {team && ` · fielded by ${team.name}`}
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
