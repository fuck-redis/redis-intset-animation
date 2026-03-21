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

interface VideoCardProps {
  video: VideoInfo;
  onClick: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div className="video-card" onClick={onClick}>
      <div className="video-card-thumbnail">
        <div className="video-card-play-btn">
          <Play size={24} fill="white" />
        </div>
        <span className="video-card-duration">{video.duration}</span>
      </div>
      <div className="video-card-content">
        <h3 className="video-card-title">{video.title}</h3>
        <p className="video-card-description">{video.description}</p>
        <span className="video-card-tag">{video.category}</span>
      </div>
    </div>
  );
};

export default VideoCard;
