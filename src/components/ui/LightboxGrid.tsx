"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GalleryImage } from "@/data/types";

/**
 * A grid of photo thumbnails that expand into a full-screen lightbox on
 * click, showing the image larger along with its alt/caption text. Used by
 * both the team gallery and the event gallery so the behaviour (and the
 * keyboard/close handling) only needs to be built once.
 */
export function LightboxGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const showPrev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const showNext = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, showPrev, showNext]);

  const active = index !== null ? images[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            className="pad-chamfer-sm group relative aspect-[4/3] overflow-hidden border border-copper/15 text-left transition-colors hover:border-copper/40"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-copper/30 text-copper-bright hover:border-copper/60"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

          <div
            className="relative h-[65vh] w-full max-w-4xl sm:h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-copper/30 bg-board/70 font-mono text-copper-bright hover:border-copper/60"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-copper/30 bg-board/70 font-mono text-copper-bright hover:border-copper/60"
                >
                  →
                </button>
              </>
            )}
          </div>

          <p
            className="max-w-2xl text-balance text-center font-mono text-sm text-paper-muted"
            onClick={(e) => e.stopPropagation()}
          >
            {active.alt}
            {images.length > 1 && (
              <span className="ml-2 text-paper-faint">
                ({index! + 1}/{images.length})
              </span>
            )}
          </p>
        </div>
      )}
    </>
  );
}
