import { YoutubeVideo } from "@/data/types";
import { useState } from "react";
import SmartImage from "./SmartImage";


export default function VideoEmbed({ video }: { video: YoutubeVideo }) {
  const [isActive, setIsActive] = useState(false);

  const handlePlayVideo = () => {
    setIsActive(true);
  };

  const idSplit = video.id.split('?t=')
  const cleanVideoId = idSplit[0];
  const startTimestamp = idSplit.length > 1 ? idSplit[1] : "0"

  const baseVideoUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?start=${startTimestamp}&autoplay=1`;
  const thumbnailUrlBase = `https://i.ytimg.com/vi/${cleanVideoId}/`;

  return (
    <div
      key={video.id}
      className="video-container relative max-w-full bg-black aspect-video"
    >
      {isActive && (
        <iframe
          width="100%"
          height="100%"
          src={baseVideoUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="overflow-hidden border border-copper-bright"
        ></iframe>
      )}

      {!isActive && (
        <div
          onClick={() => handlePlayVideo()}
          className="absolute inset-0 w-full h-full bg-board cursor-pointer transition-all group z-10 border border-copper-dim hover:border-copper flex flex-col items-center"
        >
          <SmartImage
            primaryUrl={thumbnailUrlBase + "maxresdefault.jpg"}
            fallbackUrl={thumbnailUrlBase + "hqdefault.jpg"}
            alt=''
            className="opacity-100 group-hover:opacity-50 transition-all object-cover"
          />
          <span className="mt-1 text-white font-medium px-4 text-center text-sm drop-shadow bg-board/90 rounded">
            {video.title}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-12 flex items-center justify-center rounded-xl bg-red-600 text-white shadow-xl transform group-hover:scale-110 opacity-70 group-hover:opacity-100 transition-all">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
