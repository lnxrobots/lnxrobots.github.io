import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SponsorTile } from "@/components/sponsors/SponsorTile";
import { sponsors, fundingNote } from "@/data/sponsors";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="the club"
        title="About us"
        description={site.longTagline}
      />

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <SectionLabel>get in touch</SectionLabel>
        <p className="font-body text-sm leading-relaxed text-paper-muted">
          Questions, match requests, or interested in sponsoring a season?
          Reach the team at{" "}
          <a href={`mailto:${site.email}`} className="text-signal/90 hover:text-signal-bright">
            {site.email}
          </a>
          , or follow along on{" "}
          <a href={site.social.github} className="text-signal/90 hover:text-signal-bright">
            GitHub
          </a>
          ,{" "}
          <a href={site.social.youtube} className="text-signal/90 hover:text-signal-bright">
            YouTube
          </a>{" "}
          and{" "}
          <a href={site.social.instagram} className="text-signal/90 hover:text-signal-bright">
            Instagram
          </a>
          .
        </p>

        <div className="mt-14">
          <SectionLabel>sponsors &amp; partners</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {sponsors.map((s) => (
              <SponsorTile key={s.name} sponsor={s} />
            ))}
          </div>
          <p className="mt-6 font-mono text-xs text-paper-faint">{fundingNote}</p>
          <p className="mt-2 font-body text-sm text-paper-muted">
            Want to support a future team?{" "}
            <a href={`mailto:${site.email}`} className="text-signal/90 hover:text-signal-bright">
              Get in touch
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
