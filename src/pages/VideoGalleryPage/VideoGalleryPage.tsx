import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Filter } from 'lucide-react';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import { VideoCard } from '../../components/VideoCard/VideoCard';
import {
  BinarySearchVideo,
  EncodingUpgradeVideo,
  MemoryLayoutVideo,
  InsertOperationVideo,
  DeleteOperationVideo,
} from '../../videos';
import './VideoGalleryPage.css';

const ALL_VIDEOS: (VideoConfig & { category: string })[] = [
  {
    id: 'binary-search',
    title: '二分查找算法',
    description: 'O(log n) 时间复杂度的查找过程可视化，包含指针移动、区间缩小等动画',
    category: '算法',
    component: BinarySearchVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
  },
  {
    id: 'encoding-upgrade',
    title: '编码升级机制',
    description: 'INT16 → INT32 → INT64 自动升级过程，详解内存重新分配和数据迁移',
    category: '核心机制',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 50000 },
  },
  {
    id: 'memory-layout',
    title: 'IntSet 内存布局',
    description: 'Header 结构、contents 柔性数组、小端序存储等内存布局详解',
    category: '内存结构',
    component: MemoryLayoutVideo,
    props: { encoding: 'INT16', length: 5 },
  },
  {
    id: 'insert-operation',
    title: '插入操作详解',
    description: '二分查找定位 → 编码检查 → 元素右移 → 写入新值完整流程',
    category: '核心操作',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] },
  },
  {
    id: 'delete-operation',
    title: '删除操作详解',
    description: '二分查找定位 → 标记删除 → 后续元素左移填补空位',
    category: '核心操作',
    component: DeleteOperationVideo,
    props: { operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] },
  },
];

const CATEGORIES = ['全部', '算法', '核心机制', '内存结构', '核心操作'];

const VideoGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredVideos =
    activeCategory === '全部'
      ? ALL_VIDEOS
      : ALL_VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <div className="video-gallery-page">
      <div className="video-gallery-container">
        <div className="gallery-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            返回首页
          </button>
          <div className="gallery-title">
            <Video size={32} className="title-icon" />
            <h1>视频讲解中心</h1>
          </div>
          <p className="gallery-subtitle">
            通过高质量动画视频，深入理解 IntSet 的核心概念和工作原理
          </p>
        </div>

        <div className="category-filter">
          <Filter size={18} />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="video-grid">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={{
                id: video.id,
                title: video.title,
                description: video.description,
                duration: '~30s',
                category: video.category,
              }}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>

        <div className="gallery-footer">
          <p>
            更多视频持续更新中...
          </p>
        </div>
      </div>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default VideoGalleryPage;
