import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Lightbulb, Star, Video } from 'lucide-react';
import './PlaygroundHeader.css';

interface PlaygroundHeaderProps {
  title: string;
  subtitle: string;
  repoUrl: string;
  stars: number;
  starsLoading: boolean;
  onOpenIdea: () => void;
  onOpenVideo?: () => void;
}

const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
  title,
  subtitle,
  repoUrl,
  stars,
  starsLoading,
  onOpenIdea,
  onOpenVideo,
}) => {
  return (
    <header className="playground-header">
      <div className="header-left">
        <Link to="/" className="back-link">
          ← 返回学习总览
        </Link>
      </div>

      <div className="header-center">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-right">
        {onOpenVideo && (
          <button type="button" className="video-btn" onClick={onOpenVideo}>
            <Video size={16} />
            视频讲解
          </button>
        )}

        <button type="button" className="idea-btn" onClick={onOpenIdea}>
          <Lightbulb size={16} />
          算法思路
        </button>

        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="github-entry"
          title="单击去 GitHub 仓库点个 Star 支持一下"
        >
          <Github size={18} />
          <span>GitHub</span>
          <span className="star-chip">
            <Star size={13} />
            {starsLoading ? '...' : stars.toLocaleString()}
          </span>
        </a>
      </div>
    </header>
  );
};

export default PlaygroundHeader;
