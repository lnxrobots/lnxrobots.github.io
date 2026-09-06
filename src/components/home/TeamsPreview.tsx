import { sortedTeams } from "@/data/teams";
import { TeamCard } from "@/components/teams/TeamCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TraceDivider } from "@/components/pcb/TraceDivider";

export function TeamsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <TraceDivider className="mb-10" />
      <SectionLabel>the teams</SectionLabel>
      <h2 className="max-w-lg text-balance font-display text-3xl text-paper">
        People come and go
      </h2>
      <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-paper-muted">
        We have one mentor who's been with the club the whole time.
        The teams themselves change more — every season some people graduate out and new ones join in.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTeams().map((t) => (
          <TeamCard key={t.slug} team={t} />
        ))}
      </div>
    </section>
  );
}
