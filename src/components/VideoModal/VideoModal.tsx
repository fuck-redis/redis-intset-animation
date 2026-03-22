import React, { useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { X } from 'lucide-react';
import './VideoModal.css';

export interface VideoConfig {
  id: string;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
}

interface VideoModalProps {
  video: VideoConfig | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const playerRef = React.useRef<PlayerRef>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (video) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div
        className="video-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="video-modal-close" onClick={onClose}>
          <X size={20} />
          <span>关闭 (ESC)</span>
        </button>

        <div className="video-modal-content">
          <Player
            ref={playerRef}
            component={video.component}
            inputProps={video.props}
            durationInFrames={300}
            fps={30}
            compositionWidth={1280}
            compositionHeight={720}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
            loop
          />
        </div>

        <div className="video-modal-title">
          <h3>{video.title}</h3>
          <p>{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
