import Image from "next/image";
import { Sponsor } from "@/data/types";
import { Pad } from "@/components/ui/Pad";

/**
 * Renders a sponsor's logo when one is set; otherwise falls back to a
 * clean text-only tile so the grid never shows a broken or placeholder
 * image for sponsors that haven't supplied artwork yet.
 */
export function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  return (
    <Pad className="flex items-center gap-4 px-4 py-3">
      {sponsor.logo && (
        <div className="relative h-10 w-16 shrink-0">
          <Image
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            fill
            className="object-contain object-left"
          />
        </div>
      )}
      <div>
        <a
          href={sponsor.url}
          target="_blank"
          rel="noreferrer"
          className="font-body text-sm text-paper hover:text-copper-bright"
        >
          {sponsor.name}
        </a>
        {sponsor.note && (
          <p className="mt-0.5 font-mono text-xs text-paper-faint">{sponsor.note}</p>
        )}
      </div>
    </Pad>
  );
}
