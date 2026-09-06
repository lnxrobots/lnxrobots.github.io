import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teams, getTeam, sortedCampaigns } from "@/data/teams";
import { achievements } from "@/data/achievements";
import { getDiscipline } from "@/data/disciplines";
import { RobotSpecTable } from "@/components/teams/RobotSpecTable";
import { DocList } from "@/components/teams/DocList";
import { Gallery } from "@/components/teams/Gallery";
import { PersonCard } from "@/components/teams/PersonCard";
import { ResultBadge } from "@/components/achievements/ResultBadge";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pad } from "@/components/ui/Pad";
import { formatDate, cn } from "@/lib/utils";

export function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeam(slug);
  return { title: team ? team.name : "Team" };
}

const campaignStatusStyles: Record<string, string> = {
  competing: "text-signal-bright border-signal/40",
  retired: "text-paper-muted border-paper-muted/30",
  "in-development": "text-copper-bright border-copper/40",
};

const campaignStatusLabel: Record<string, string> = {
  competing: "ACTIVE",
  retired: "RETIRED",
  "in-development": "IN DEV",
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeam(slug);
  if (!team) notFound();

  const teamAchievements = achievements.filter((a) => a.team === team.slug);
  const campaigns = sortedCampaigns(team);

  return (
    <>
      <PageHeader
        eyebrow={`${team.designation} · since ${team.since}`}
        title={team.name}
        description={team.summary}
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <SectionLabel>people</SectionLabel>
        {team.mentors.length === 0 && team.members.length === 0 ? (
          <p className="font-mono text-sm text-paper-faint">
            Roster not filed yet for this team.
          </p>
        ) : (
          <div className="space-y-6">
            {team.mentors.length > 0 && (
              <div>
                <p className="mb-3 font-mono text-[11px] text-paper-faint">
                  MENTOR{team.mentors.length > 1 ? "S" : ""}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {team.mentors.map((p) => (
                    <PersonCard key={p.name} person={p} />
                  ))}
                </div>
              </div>
            )}
            {team.members.length > 0 && (
              <div>
                <p className="mb-3 font-mono text-[11px] text-paper-faint">MEMBERS</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {team.members.map((p) => (
                    <PersonCard key={p.name} person={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-copper/15 bg-board-raised/40">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <SectionLabel>competitions &amp; builds</SectionLabel>
          <p className="max-w-xl font-body text-sm text-paper-muted">
            Every competition this team has entered, each with its own build.
            A team can run more than one of these at once.
          </p>

          {campaigns.length === 0 ? (
            <p className="mt-6 font-mono text-sm text-paper-faint">
              No campaigns logged yet.
            </p>
          ) : (
            <div className="mt-8 space-y-6">
              {campaigns.map((c) => {
                const discipline = getDiscipline(c.discipline);
                return (
                  <Pad key={c.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-copper/70">
                          {discipline?.org ?? "Competition"} · {c.years}
                        </p>
                        <h3 className="mt-1 font-display text-xl text-paper">
                          {discipline?.name ?? c.discipline}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 border px-2 py-1 font-mono text-[10px] tracking-wide",
                          campaignStatusStyles[c.status]
                        )}
                      >
                        {campaignStatusLabel[c.status]}
                      </span>
                    </div>

                    <p className="mt-3 font-body text-sm leading-relaxed text-paper-muted">
                      {c.summary}
                    </p>

                    <div className="mt-6 grid gap-8 lg:grid-cols-2">
                      <div>
                        <p className="mb-2 font-mono text-[11px] text-paper-faint">BUILD</p>
                        <RobotSpecTable specs={c.specs} />
                        <div className="mt-4 flex flex-wrap gap-4">
                          {c.codeRepo && (
                            <a
                              href={c.codeRepo}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-sm text-signal/80 underline decoration-signal/30 underline-offset-4 hover:text-signal-bright"
                            >
                              Software repository →
                            </a>
                          )}
                          {c.hardwareRepo && (
                            <a
                              href={c.hardwareRepo}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-sm text-signal/80 underline decoration-signal/30 underline-offset-4 hover:text-signal-bright"
                            >
                              Hardware files →
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-mono text-[11px] text-paper-faint">
                          DOCUMENTATION
                        </p>
                        <DocList docs={c.docs} />
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="mb-2 font-mono text-[11px] text-paper-faint">GALLERY</p>
                      <Gallery images={c.gallery} slug={team.slug} />
                    </div>
                  </Pad>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <SectionLabel>competition record</SectionLabel>
        {teamAchievements.length === 0 ? (
          <p className="font-mono text-sm text-paper-faint">No competitions logged yet.</p>
        ) : (
          <ul className="space-y-4">
            {teamAchievements.map((a) => (
              <li key={a.id} className="border-l-2 border-copper/25 pl-4">
                <p className="font-body text-sm text-paper">{a.event}</p>
                <p className="font-mono text-xs text-paper-faint">
                  {a.location} · {formatDate(a.date)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <DisciplineTag slug={a.discipline} />
                  {a.results.map((r, i) => (
                    <ResultBadge key={i} result={r} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <Link
          href="/teams"
          className="font-mono text-sm text-paper-muted hover:text-signal-bright"
        >
          ← All teams
        </Link>
      </div>
    </>
  );
}
