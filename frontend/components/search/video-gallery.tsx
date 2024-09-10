import { VideoSource } from '@/lib/types';
import React, { memo } from 'react';

type VideoGalleryProps = {
    videos: VideoSource[];
};

const VideoGallery: React.FC<VideoGalleryProps> = memo(({ videos }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, index) => (
                <div key={index} className="aspect-video w-full">
                    <iframe
                        className="size-full rounded-xl"
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
            ))}
        </div>
    );
});

VideoGallery.displayName = 'VideoGallery';
export default VideoGallery;
