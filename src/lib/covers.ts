import type { Achievement, GalleryImage } from "@/data/types";

/** The picture shown for an event: its own cover, otherwise its first gallery photo. */
export function coverOf(a: Achievement): GalleryImage | undefined {
  return a.cover ?? a.gallery?.[0];
}
