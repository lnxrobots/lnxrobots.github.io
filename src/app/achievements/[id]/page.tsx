import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { achievements, getAchievement } from "@/data/achievements";
import { getTeam } from "@/data/teams";
import { getDiscipline } from "@/data/disciplines";
import { ResultBadge } from "@/components/achievements/ResultBadge";
import { EventGallery } from "@/components/achievements/EventGallery";
import { DisciplineTag } from "@/components/ui/DisciplineTag";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return achievements.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = getAchievement(id);
  return { title: a ? a.event : "Event" };
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achievement = getAchievement(id);
  if (!achievement) notFound();

  const team = getTeam(achievement.team);
  const discipline = getDiscipline(achievement.discipline);

  return (
    <>
      <PageHeader
        eyebrow={`${discipline?.shortName ?? achievement.discipline} · ${formatDate(achievement.date)}`}
        title={achievement.event}
        description={achievement.location}
      />

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <DisciplineTag slug={achievement.discipline} />
          {achievement.results.map((r, i) => (
            <ResultBadge key={i} result={r} />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm">
          {team && (
            <span className="text-paper-muted">
              Team:{" "}
              <Link
                href={`/teams/${team.slug}`}
                className="text-copper/80 hover:text-copper-bright"
              >
                {team.name}
              </Link>
            </span>
          )}
          {achievement.resultsUrl && (
            <a
              href={achievement.resultsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-signal/80 hover:text-signal-bright"
            >
              Standings →
            </a>
          )}
          {achievement.youtubeId && (
            <a
              href={`https://www.youtube.com/watch?v=${achievement.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="text-signal/80 hover:text-signal-bright"
            >
              Match video →
            </a>
          )}
        </div>

        <div className="mt-12">
          <SectionLabel>gallery</SectionLabel>
          <EventGallery images={achievement.gallery ?? []} id={achievement.id} />
        </div>

        <div className="mt-12">
          <Link
            href="/achievements"
            className="font-mono text-sm text-paper-muted hover:text-signal-bright"
          >
            ← All results
          </Link>
        </div>
      </div>
    </>
  );
}
