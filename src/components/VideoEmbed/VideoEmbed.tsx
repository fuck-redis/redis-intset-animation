import React, { useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Play, X } from 'lucide-react';
import './VideoEmbed.css';

interface VideoEmbedProps {
  component: React.FC<Record<string, unknown>>;
  props: Record<string, unknown>;
  title: string;
  description?: string;
  aspectRatio?: '16:9' | '4:3';
  autoplay?: boolean;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  component,
  props,
  title,
  description,
  aspectRatio = '16:9',
  autoplay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const playerRef = React.useRef<PlayerRef>(null);

  // When autoplay is enabled, start playing immediately
  React.useEffect(() => {
    if (autoplay && playerRef.current) {
      playerRef.current.play();
    }
  }, [autoplay]);

  return (
    <div className={`video-embed ${aspectRatio === '4:3' ? 'aspect-4-3' : ''} ${autoplay ? 'video-embed-autoplay' : ''}`}>
      <div className="video-embed-header">
        <span className="video-embed-title">{title}</span>
        {description && <span className="video-embed-desc">{description}</span>}
      </div>

      {!isPlaying && !autoplay ? (
        <div className="video-embed-preview" onClick={() => setIsPlaying(true)}>
          <div className="video-embed-thumbnail">
            <div className="video-embed-placeholder">
              <div className="play-icon">
                <Play size={32} fill="white" />
              </div>
              <span className="click-hint">点击播放视频演示</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="video-embed-player">
          <button className="video-embed-close" onClick={() => setIsPlaying(false)}>
            <X size={20} />
          </button>
          <Player
            ref={playerRef}
            component={component}
            inputProps={props}
            durationInFrames={300}
            fps={30}
            compositionWidth={1280}
            compositionHeight={aspectRatio === '4:3' ? 960 : 720}
            style={{
              width: '100%',
              height: '100%',
              minHeight: autoplay ? '360px' : '280px',
            }}
            controls={!autoplay}
            loop
          />
        </div>
      )}
    </div>
  );
};

export default VideoEmbed;
