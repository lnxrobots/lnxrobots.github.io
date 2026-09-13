'use client';

import { Achievement } from '@/data/types';
import VideoEmbed from '../ui/VideoEmbed';

export default function AchievementVideos({ achievement }: { achievement: Achievement }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {achievement.videos && achievement.videos.map((video) => {
        return <VideoEmbed video={video} key={video.id} />;
      })}
    </div>
  );
}
