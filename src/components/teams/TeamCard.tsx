import Image from "next/image";
import Link from "next/link";
import { Team } from "@/data/types";
import { teamDisciplines } from "@/data/teams";
import { Pad } from "@/components/ui/Pad";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { cn } from "@/lib/utils";

export function TeamCard({ team }: { team: Team }) {
  const headcount = team.members.length + team.mentors.length;
  const disciplines = teamDisciplines(team);

  return (
    <Link href={`/team/${team.slug}`} className="group block h-full">
      <Pad className="flex h-full flex-col p-6 transition-colors group-hover:border-copper/50">
        {team.cover && (
          <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/9] overflow-hidden border-b border-copper/15">
            <Image
              src={team.cover.src}
              alt={team.cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-board-raised/60 via-transparent to-transparent" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-copper/70">Since {team.since}</p>
            <h3 className="mt-1 font-display text-xl text-paper">{team.name}</h3>
          </div>
          <span
            className={cn(
              "shrink-0 border px-2 py-1 font-mono text-[10px] tracking-wide",
              team.active
                ? "text-signal-bright border-signal/40"
                : "text-paper-muted border-paper-muted/30"
            )}
          >
            {team.active ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {disciplines.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {disciplines.map((d) => (
              <DisciplineTag key={d} slug={d} />
            ))}
          </div>
        )}

        <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-paper-muted">
          {team.tagline}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-paper-faint">
          {headcount > 0 && (
            <span>
              {headcount} {headcount === 1 ? "person" : "people"}
            </span>
          )}
          <span>
            {team.campaigns.length} {team.campaigns.length === 1 ? "campaign" : "campaigns"}
          </span>
        </div>

        <p className="mt-5 font-mono text-xs text-signal/80 group-hover:text-signal-bright">
          View team →
        </p>
      </Pad>
    </Link>
  );
}
