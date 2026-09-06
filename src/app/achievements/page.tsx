import type { Metadata } from "next";
import { achievements } from "@/data/achievements";
import { Timeline } from "@/components/achievements/Timeline";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Achievements" };

export default function AchievementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="timeline"
        title="Achievements &amp; Events"
        description="Every result since our first Slovak-nationals win in 2023. Click into any of them for photos, video, and standings."
      />
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Timeline items={achievements} />
      </div>
    </>
  );
}
