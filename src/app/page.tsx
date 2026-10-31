import { Hero } from "@/components/home/Hero";
import { LatestResult } from "@/components/home/LatestResult";
import { TeamsPreview } from "@/components/home/TeamsPreview";
import { HomeGallery } from "@/components/home/HomeGallery";
import { SponsorStrip } from "@/components/home/SponsorStrip";
import { TraceDivider } from "@/components/pcb/TraceDivider";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestResult />
      <HomeGallery />
      <TraceDivider className="mx-auto max-w-6xl px-5 sm:px-8 my-10" />
      <TeamsPreview />
      <TraceDivider className="mx-auto max-w-6xl px-5 sm:px-8 my-10" />
      <SponsorStrip />
    </>
  );
}
