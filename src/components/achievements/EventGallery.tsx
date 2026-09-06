import { GalleryImage } from "@/data/types";
import { LightboxGrid } from "@/components/ui/LightboxGrid";

export function EventGallery({ images, id }: { images: GalleryImage[]; id: string }) {
  if (images.length === 0) {
    return (
      <div className="pad-chamfer border border-dashed border-copper/25 px-5 py-8 text-center">
        <p className="font-mono text-sm text-paper-faint">
          No photos filed yet for this event.
        </p>
      </div>
    );
  }

  return <LightboxGrid images={images} />;
}
