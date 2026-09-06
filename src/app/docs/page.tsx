import type { Metadata } from "next";
import { teams } from "@/data/teams";
import { DocList } from "@/components/teams/DocList";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageHeader } from "@/components/ui/PageHeader";
import { Document } from "@/data/types";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsPage() {
  const byYear = new Map<number, Document[]>();
  for (const team of teams) {
    for (const campaign of team.campaigns) {
      for (const doc of campaign.docs) {
        const list = byYear.get(doc.year) ?? [];
        list.push(doc);
        byYear.set(doc.year, list);
      }
    }
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        eyebrow="posters · TDPs · schematics"
        title="Documentation library"
        description="Every poster, team description paper, design document, and PCB schematic we have published."
      />

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        {years.length === 0 ? (
          <p className="font-mono text-sm text-paper-faint">Nothing published yet.</p>
        ) : (
          years.map((year) => (
            <div key={year} className="mb-12">
              <SectionLabel>{year}</SectionLabel>
              <DocList docs={byYear.get(year)!} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
