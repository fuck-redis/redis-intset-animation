import React from 'react';
import { Play } from 'lucide-react';
import './VideoCard.css';

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
}

interface ThumbnailConfig {
  from: string;
  to: string;
  accent: string;
}

interface VideoCardProps {
  video: VideoInfo;
  thumbnail?: ThumbnailConfig;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  thumbnail,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const gradientStyle = thumbnail
    ? {
        background: `linear-gradient(135deg, ${thumbnail.from} 0%, ${thumbnail.to} 100%)`,
      }
    : {};

  return (
    <div
      className="video-card"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="video-card-thumbnail" style={gradientStyle}>
        {thumbnail && (
          <div
            className="video-card-accent-bar"
            style={{ backgroundColor: thumbnail.accent }}
          />
        )}
        <div className="video-card-play-btn">
          <Play size={20} fill="white" />
        </div>
        <span className="video-card-duration">{video.duration}</span>
        <div className="video-card-category">{video.category}</div>
      </div>
      <div className="video-card-content">
        <h3 className="video-card-title">{video.title}</h3>
        <p className="video-card-description">{video.description}</p>
      </div>
    </div>
  );
};
