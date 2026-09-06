import type { Metadata } from "next";
import { sortedTeams } from "@/data/teams";
import { TeamCard } from "@/components/teams/TeamCard";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Teams" };

export default function TeamsPage() {
  return (
    <>
      <PageHeader
        eyebrow="who's competing"
        title="The Sub-Teams"
        description="Pick a team to see who's on it, what they've built, and every competition they've entered."
      />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTeams().map((t) => (
            <TeamCard key={t.slug} team={t} />
          ))}
        </div>
      </div>
    </>
  );
}
