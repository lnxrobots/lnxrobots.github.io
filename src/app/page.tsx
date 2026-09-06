import { Hero } from "@/components/home/Hero";
import { LatestResult } from "@/components/home/LatestResult";
import { TeamsPreview } from "@/components/home/TeamsPreview";
import { SponsorStrip } from "@/components/home/SponsorStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestResult />
      <TeamsPreview />
      <SponsorStrip />
    </>
  );
}
