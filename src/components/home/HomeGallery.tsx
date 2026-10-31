import { site } from "@/data/site";
import { LightboxGrid } from "@/components/ui/LightboxGrid";
import { SectionLabel } from "@/components/ui/SectionLabel";
import Link from "next/link";

export function HomeGallery() {
  const gallery = site.homeGallery;
  if (!gallery || gallery.images.length === 0) return null;

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>some photos</SectionLabel>
        <h2 className="max-w-lg text-balance font-display text-3xl text-paper">{gallery.title}</h2>
        {gallery.text && (
          <p className="mt-3 max-w-lg font-body text-sm leading-relaxed text-paper-muted">{gallery.text}</p>
        )}
        <div className="mt-10">
          <LightboxGrid images={gallery.images} />
        </div>
      </section>
      <Link
        href="/gallery"
        className="border-y border-copper/15 bg-board-raised/50 mt-6 flex items-center justify-center py-4 font-mono text-sm text-signal/80 underline decoration-signal/30 underline-offset-4 hover:text-signal-bright"
      >
        View full gallery →
      </Link>
    </>
  );
}
