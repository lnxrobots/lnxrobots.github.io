import { sortedTeams } from "@/data/teams";
import { TeamCard } from "@/components/teams/TeamCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { copy } from "@/data/copy";

export function TeamsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8">
      <SectionLabel>{copy.home.teamsLabel}</SectionLabel>
      <h2 className="max-w-lg text-balance font-display text-3xl text-paper">
        {copy.home.teamsTitle}
      </h2>
      <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-paper-muted">
        {copy.home.teamsText}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTeams().map((t) => (
          <TeamCard key={t.slug} team={t} />
        ))}
      </div>
    </section>
  );
}
