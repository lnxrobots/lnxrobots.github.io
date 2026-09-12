import { EventGallery } from "@/components/achievements/EventGallery";
import { PageHeader } from "@/components/ui/PageHeader";
import { achievements } from "@/data/achievements";
import { getTeam } from "@/data/teams";
import { formatDate } from "@/lib/utils";
import Link from "next/link";


export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="photos from events"
        title="Gallery"
        description=""
      />
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <ol className="relative">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-copper/25" aria-hidden="true" />
          {achievements.map((a) => {
            if (!a.gallery || a.gallery.length === 0) {
              return null;
            }

            const teamNames = (Array.isArray(a.team) ? a.team : [a.team]).map((slug) => {
              return getTeam(slug)?.name ?? slug;
            });
            const teamText = teamNames.join(", ");

            return (
              <li key={a.id} className="relative py-2 pl-10">
                <span className="absolute left-0 top-[26px] text-copper/70">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2" fill="currentColor" />
                  </svg>
                </span>

                <Link
                  href={`/achievements/${a.id}`}
                  className="group -mx-3 flex items-center gap-4 border border-transparent px-3 py-3 pad-chamfer-sm transition-colors hover:border-copper/25 hover:bg-board-raised/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-4">
                      <p className="font-mono text-xs text-paper-faint">{formatDate(a.date)}</p>
                      <p className="truncate font-mono text-xs text-paper-muted">
                        {a.location}
                        {teamText && ` · ${teamText}`}
                      </p>
                    </div>
                    <h3 className="mt-0.5 truncate font-display text-lg text-paper group-hover:text-signal-bright">
                      {a.event}
                    </h3>
                  </div>

                  <span className="hidden shrink-0 font-mono text-xs text-signal/70 group-hover:text-signal-bright sm:block">
                    View event →
                  </span>
                </Link>

                {a.gallery && (
                  <div className="mt-2">
                    <EventGallery images={a.gallery} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
