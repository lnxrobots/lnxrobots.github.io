import Link from "next/link";
import Image from "next/image";
import { Achievement } from "@/data/types";
import { ResultBadge } from "./ResultBadge";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { formatDate } from "@/lib/utils";
import { getTeam } from "@/data/teams";

/**
 * Compact, scannable timeline — one row per result. Each row links to that
 * event's own dedicated page (/achievements/[id]) for the full write-up,
 * video, standings link, and photo gallery, so this list doesn't have to
 * carry all of that itself.
 */
export function Timeline({ items }: { items: Achievement[] }) {
  return (
    <ol className="relative">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-copper/25" aria-hidden="true" />
      {items.map((a) => {
        const teamNames = (Array.isArray(a.team) ? a.team : [a.team]).map((slug) => {
          return getTeam(slug)?.name ?? slug;
        });
        const teamText = teamNames.join(", ");
        const cover = a.gallery?.[0];
        const [topResult, ...rest] = a.results;

        return (
          <li key={a.id} className="relative py-2 pl-10">
            <span className="absolute left-0 top-[26px] text-copper/70">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2" fill="currentColor" />
              </svg>
            </span>

            <Link
              href={`/achievements/${a.id}`}
              className="group -mx-3 flex items-center gap-4 border border-transparent px-3 py-3 pad-chamfer-sm transition-colors hover:border-copper/25 hover:bg-board-raised/60"
            >
              {cover && (
                <div className="pad-chamfer-sm relative hidden h-14 w-20 shrink-0 overflow-hidden border border-copper/15 sm:block">
                  <Image src={cover.src} alt="" fill className="object-cover" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-paper-faint">{formatDate(a.date)}</p>
                <h3 className="mt-0.5 truncate font-display text-lg text-paper group-hover:text-signal-bright">
                  {a.event}
                </h3>
                <p className="truncate font-mono text-xs text-paper-muted">
                  {a.location}
                  {teamText && ` · ${teamText}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DisciplineTag slug={a.discipline} />
                  {topResult && <ResultBadge result={topResult} />}
                  {rest.length > 0 && (
                    <span className="font-mono text-xs text-paper-faint">
                      +{rest.length} more
                    </span>
                  )}
                </div>
              </div>

              <span className="hidden shrink-0 font-mono text-xs text-signal/70 group-hover:text-signal-bright sm:block">
                View event →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
