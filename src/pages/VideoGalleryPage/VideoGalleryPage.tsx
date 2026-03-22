import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Filter, BookOpen, Cpu, MemoryStick, Layers, Sparkles } from 'lucide-react';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import { VideoCard } from '../../components/VideoCard/VideoCard';
import {
  BinarySearchVideo,
  BinarySearchStepVideo,
  EncodingUpgradeVideo,
  EncodingDowngradeVideo,
  EncodingRangeVideo,
  EncodingScenarioVideo,
  MemoryLayoutVideo,
  MemoryCalculationVideo,
  InsertOperationVideo,
  DeleteOperationVideo,
  LittleEndianVideo,
  IntSetVsHashTableVideo,
  OperationCompareVideo,
  ResizeToHashTableVideo,
  ComplexityCompareVideo,
  MemoryCompareVideo,
  StructVisualizationVideo,
  UseCaseRecommendationVideo,
  BatchOperationsVideo,
  ResizeMechanismVideo,
  SetMaxEntriesVideo,
  IntSetCharacteristicsVideo,
  IntSetSelectionVideo,
  NonIntegerConversionVideo,
  DataStructureOverviewVideo,
} from '../../videos';
import './VideoGalleryPage.css';

export type VideoDifficulty = '入门' | '进阶' | '高级';

interface VideoItem extends VideoConfig {
  category: string;
  duration: string;
  thumbnail: string;
  difficulty: VideoDifficulty;
  learningObjectives?: string[];
}

const ALL_VIDEOS: VideoItem[] = [
  // 算法类
  {
    id: 'binary-search',
    title: '二分查找算法',
    description: 'O(log n) 时间复杂度的查找过程可视化，包含指针移动、区间缩小等动画',
    category: '算法',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'binary',
    component: BinarySearchVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
    learningObjectives: ['理解二分查找原理', '掌握区间缩小过程', '认识时间复杂度'],
  },
  {
    id: 'binary-search-step',
    title: '二分查找详解',
    description: '逐步演示二分查找的每一个判断和操作，帮助深入理解算法细节',
    category: '算法',
    difficulty: '进阶',
    duration: '~45s',
    thumbnail: 'binary',
    component: BinarySearchStepVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
    learningObjectives: ['理解边界条件处理', '掌握中点计算方法', '认识查找失败情况'],
  },
  // 核心机制类
  {
    id: 'encoding-upgrade',
    title: '编码升级机制',
    description: 'INT16 → INT32 → INT64 自动升级过程，详解内存重新分配和数据迁移',
    category: '核心机制',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 50000 },
    learningObjectives: ['理解编码升级时机', '掌握数据迁移原理', '认识内存重新分配'],
  },
  {
    id: 'encoding-downgrade',
    title: '编码降级机制',
    description: 'IntSet不支持编码降级的原因分析，解释为何选择单向升级策略',
    category: '核心机制',
    difficulty: '高级',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: EncodingDowngradeVideo,
    props: {},
    learningObjectives: ['理解单向升级设计', '认识性能与内存权衡', '掌握设计决策思路'],
  },
  {
    id: 'encoding-range',
    title: '编码范围详解',
    description: 'INT16/INT32/INT64各自的取值范围，以及如何根据值选择编码',
    category: '核心机制',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: EncodingRangeVideo,
    props: {},
    learningObjectives: ['掌握各编码的取值范围', '理解编码选择策略', '认识自适应编码'],
  },
  {
    id: 'encoding-scenario',
    title: '编码场景分析',
    description: '通过具体数值示例，展示何时会发生编码升级',
    category: '核心机制',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: EncodingScenarioVideo,
    props: {},
    learningObjectives: ['分析触发升级的条件', '理解为什么降级不实际', '掌握编码选择依据'],
  },
  {
    id: 'batch-operations',
    title: '批量操作原理',
    description: 'SADD命令批量添加元素的内部实现机制',
    category: '核心机制',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'insert',
    component: BatchOperationsVideo,
    props: { values: [10, 20, 30, 40, 50] },
    learningObjectives: ['理解批量操作优势', '掌握性能优化技巧', '认识内部实现'],
  },
  // 内存结构类
  {
    id: 'memory-layout',
    title: 'IntSet 内存布局',
    description: 'Header 结构、contents 柔性数组、小端序存储等内存布局详解',
    category: '内存结构',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'memory',
    component: MemoryLayoutVideo,
    props: { encoding: 'INT16', length: 5 },
    learningObjectives: ['理解结构体内存布局', '掌握柔性数组原理', '认识小端序存储'],
  },
  {
    id: 'memory-calculation',
    title: '内存计算方法',
    description: '如何计算IntSet占用的内存大小，理解内存占用公式',
    category: '内存结构',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'memory',
    component: MemoryCalculationVideo,
    props: { encoding: 'INT32', length: 100 },
    learningObjectives: ['掌握内存计算公式', '理解各编码的内存占用', '学会评估内存效率'],
  },
  {
    id: 'little-endian',
    title: '小端序存储',
    description: '详解Redis为何使用小端序，以及字节序转换的实现',
    category: '内存结构',
    difficulty: '高级',
    duration: '~30s',
    thumbnail: 'memory',
    component: LittleEndianVideo,
    props: {},
    learningObjectives: ['理解大端小端区别', '掌握字节序转换原理', '认识跨平台兼容性'],
  },
  {
    id: 'struct-visualization',
    title: '结构体可视化',
    description: 'IntSet结构体的详细可视化展示，理解每个字段的作用',
    category: '内存结构',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'memory',
    component: StructVisualizationVideo,
    props: {},
    learningObjectives: ['理解结构体设计', '掌握各字段含义', '认识连续内存布局'],
  },
  // 核心操作类
  {
    id: 'insert-operation',
    title: '插入操作详解',
    description: '二分查找定位 → 编码检查 → 元素右移 → 写入新值完整流程',
    category: '核心操作',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'insert',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] },
    learningObjectives: ['掌握插入流程', '理解元素移动原理', '认识内存扩展机制'],
  },
  {
    id: 'delete-operation',
    title: '删除操作详解',
    description: '二分查找定位 → 标记删除 → 后续元素左移填补空位',
    category: '核心操作',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'delete',
    component: DeleteOperationVideo,
    props: { operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] },
    learningObjectives: ['掌握删除流程', '理解元素移动原理', '认识内存收缩机制'],
  },
  {
    id: 'resize-mechanism',
    title: '扩容机制详解',
    description: 'IntSet如何动态调整内存大小，realloc的内部机制',
    category: '核心操作',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'insert',
    component: ResizeMechanismVideo,
    props: { operation: 'add', value: 60, initialData: [10, 20, 30, 40, 50] },
    learningObjectives: ['理解内存扩展策略', '掌握realloc机制', '认识性能优化'],
  },
  // 进阶主题类
  {
    id: 'intset-vs-hashtable',
    title: 'IntSet vs HashTable',
    description: '对比两种Set底层实现的优缺点，适用场景分析',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'binary',
    component: IntSetVsHashTableVideo,
    props: {},
    learningObjectives: ['理解实现差异', '掌握选择策略', '认识各自优势'],
  },
  {
    id: 'operation-compare',
    title: '操作复杂度对比',
    description: '查找、插入、删除等操作在IntSet和HashTable中的复杂度对比',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'binary',
    component: OperationCompareVideo,
    props: {},
    learningObjectives: ['掌握复杂度分析', '理解操作性能差异', '认识数据规模影响'],
  },
  {
    id: 'resize-to-hashtable',
    title: '转换为HashTable',
    description: '何时以及为何IntSet会转换为HashTable实现',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: ResizeToHashTableVideo,
    props: {},
    learningObjectives: ['理解转换时机', '掌握配置参数', '认识性能权衡'],
  },
  {
    id: 'complexity-compare',
    title: '复杂度可视化对比',
    description: 'O(1) vs O(log n) vs O(n) 的实际性能差异可视化',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'binary',
    component: ComplexityCompareVideo,
    props: {},
    learningObjectives: ['理解复杂度概念', '掌握实际性能差异', '认识数据规模影响'],
  },
  {
    id: 'memory-compare',
    title: '内存占用对比',
    description: 'IntSet与HashTable在不同数据规模下的内存占用对比',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'memory',
    component: MemoryCompareVideo,
    props: {},
    learningObjectives: ['掌握内存效率对比', '理解规模对内存的影响', '认识各自优势'],
  },
  {
    id: 'use-case-recommendation',
    title: '使用场景建议',
    description: '根据不同场景选择合适的Set实现方式',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'binary',
    component: UseCaseRecommendationVideo,
    props: {},
    learningObjectives: ['掌握选择策略', '理解场景需求', '认识最佳实践'],
  },
  {
    id: 'set-max-entries',
    title: '配置参数详解',
    description: 'set-max-intset-entries配置项的作用和调优建议',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: SetMaxEntriesVideo,
    props: {},
    learningObjectives: ['理解配置参数', '掌握调优方法', '认识性能影响'],
  },
  {
    id: 'intset-characteristics',
    title: 'IntSet特性总结',
    description: 'IntSet的核心特性一览，理解其设计哲学',
    category: '进阶主题',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'memory',
    component: IntSetCharacteristicsVideo,
    props: {},
    learningObjectives: ['理解核心特性', '掌握设计思想', '认识适用场景'],
  },
  {
    id: 'intset-selection',
    title: '何时使用IntSet',
    description: '详细分析选择IntSet的条件和场景',
    category: '进阶主题',
    difficulty: '进阶',
    duration: '~30s',
    thumbnail: 'binary',
    component: IntSetSelectionVideo,
    props: {},
    learningObjectives: ['掌握选择条件', '理解决策流程', '认识实际应用'],
  },
  {
    id: 'non-integer-conversion',
    title: '非整数转换',
    description: '当Set包含非整数时，IntSet如何转换为HashTable',
    category: '进阶主题',
    difficulty: '高级',
    duration: '~30s',
    thumbnail: 'upgrade',
    component: NonIntegerConversionVideo,
    props: {},
    learningObjectives: ['理解转换原因', '掌握触发条件', '认识内部机制'],
  },
  {
    id: 'data-structure-overview',
    title: '数据结构总览',
    description: 'IntSet在整个Redis数据结构体系中的位置和作用',
    category: '进阶主题',
    difficulty: '入门',
    duration: '~30s',
    thumbnail: 'memory',
    component: DataStructureOverviewVideo,
    props: {},
    learningObjectives: ['理解整体架构', '掌握数据模型', '认识内部组织'],
  },
];

const CATEGORIES = [
  { id: '全部', label: '全部', icon: null },
  { id: '算法', label: '算法', icon: BookOpen },
  { id: '核心机制', label: '核心机制', icon: Cpu },
  { id: '内存结构', label: '内存结构', icon: MemoryStick },
  { id: '核心操作', label: '核心操作', icon: Layers },
  { id: '进阶主题', label: '进阶主题', icon: Sparkles },
];

const THUMBNAIL_GRADIENTS: Record<string, { from: string; to: string; accent: string }> = {
  binary: { from: '#0f172a', to: '#1e3a5f', accent: '#3b82f6' },
  upgrade: { from: '#0f172a', to: '#2d1b4e', accent: '#8b5cf6' },
  memory: { from: '#0f172a', to: '#134e4a', accent: '#14b8a6' },
  insert: { from: '#0f172a', to: '#1a3a1a', accent: '#22c55e' },
  delete: { from: '#0f172a', to: '#3a1a1a', accent: '#ef4444' },
};

const DIFFICULTY_COLORS: Record<VideoDifficulty, { bg: string; text: string }> = {
  '入门': { bg: '#d1fae5', text: '#065f46' },
  '进阶': { bg: '#fef3c7', text: '#78350f' },
  '高级': { bg: '#fee2e2', text: '#991b1b' },
};

const VideoGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [showLearningObjectives, setShowLearningObjectives] = useState<string | null>(null);

  const filteredVideos =
    activeCategory === '全部'
      ? ALL_VIDEOS
      : ALL_VIDEOS.filter((v) => v.category === activeCategory);

  // Group videos by category for display
  const videosByCategory = filteredVideos.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {} as Record<string, VideoItem[]>);

  const totalVideos = ALL_VIDEOS.length;
  const categoryCount = [...new Set(ALL_VIDEOS.map((v) => v.category))].length;
  const difficultyCount = {
    '入门': ALL_VIDEOS.filter((v) => v.difficulty === '入门').length,
    '进阶': ALL_VIDEOS.filter((v) => v.difficulty === '进阶').length,
    '高级': ALL_VIDEOS.filter((v) => v.difficulty === '高级').length,
  };

  return (
    <div className="video-gallery-page">
      <div className="video-gallery-container">
        <div className="gallery-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            返回首页
          </button>
          <div className="gallery-title">
            <Video size={28} className="title-icon" />
            <h1>视频讲解中心</h1>
          </div>
          <p className="gallery-subtitle">
            通过高质量动画视频，深入理解 IntSet 的核心概念和工作原理
          </p>
        </div>

        <div className="video-stats">
          <div className="stat-item">
            <span className="stat-value">{totalVideos}</span>
            <span className="stat-label">视频数量</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{categoryCount}</span>
            <span className="stat-label">内容分类</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{difficultyCount['入门']}/{difficultyCount['进阶']}/{difficultyCount['高级']}</span>
            <span className="stat-label">入门/进阶/高级</span>
          </div>
        </div>

        <div className="category-filter">
          <Filter size={16} />
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {Icon && <Icon size={14} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty Legend */}
        <div className="difficulty-legend">
          <span className="legend-title">难度等级:</span>
          <span className="legend-item" style={{ background: DIFFICULTY_COLORS['入门'].bg, color: DIFFICULTY_COLORS['入门'].text }}>
            入门
          </span>
          <span className="legend-item" style={{ background: DIFFICULTY_COLORS['进阶'].bg, color: DIFFICULTY_COLORS['进阶'].text }}>
            进阶
          </span>
          <span className="legend-item" style={{ background: DIFFICULTY_COLORS['高级'].bg, color: DIFFICULTY_COLORS['高级'].text }}>
            高级
          </span>
        </div>

        {/* Category Grouped Display */}
        {activeCategory === '全部' ? (
          Object.entries(videosByCategory).map(([category, videos]) => {
            const catInfo = CATEGORIES.find((c) => c.id === category);
            const CatIcon = catInfo?.icon;
            return (
              <div key={category} className="category-section">
                <div className="category-header">
                  {CatIcon && <CatIcon size={20} className="category-icon" />}
                  <h2>{category}</h2>
                  <span className="category-count">{videos.length} 个视频</span>
                </div>
                <div className="video-grid">
                  {videos.map((video) => (
                    <div key={video.id} className="video-card-wrapper">
                      <VideoCard
                        video={{
                          id: video.id,
                          title: video.title,
                          description: video.description,
                          duration: video.duration,
                          category: video.category,
                        }}
                        thumbnail={THUMBNAIL_GRADIENTS[video.thumbnail]}
                        onClick={() => setSelectedVideo(video)}
                        onMouseEnter={() => setShowLearningObjectives(video.id)}
                        onMouseLeave={() => setShowLearningObjectives(null)}
                      />
                      {/* Difficulty Badge */}
                      <span
                        className="difficulty-badge"
                        style={{
                          background: DIFFICULTY_COLORS[video.difficulty].bg,
                          color: DIFFICULTY_COLORS[video.difficulty].text,
                        }}
                      >
                        {video.difficulty}
                      </span>
                      {/* Learning Objectives Tooltip */}
                      {showLearningObjectives === video.id && video.learningObjectives && (
                        <div className="learning-objectives-tooltip">
                          <h4>学习目标</h4>
                          <ul>
                            {video.learningObjectives.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video) => (
              <div key={video.id} className="video-card-wrapper">
                <VideoCard
                  video={{
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    duration: video.duration,
                    category: video.category,
                  }}
                  thumbnail={THUMBNAIL_GRADIENTS[video.thumbnail]}
                  onClick={() => setSelectedVideo(video)}
                  onMouseEnter={() => setShowLearningObjectives(video.id)}
                  onMouseLeave={() => setShowLearningObjectives(null)}
                />
                <span
                  className="difficulty-badge"
                  style={{
                    background: DIFFICULTY_COLORS[video.difficulty].bg,
                    color: DIFFICULTY_COLORS[video.difficulty].text,
                  }}
                >
                  {video.difficulty}
                </span>
                {showLearningObjectives === video.id && video.learningObjectives && (
                  <div className="learning-objectives-tooltip">
                    <h4>学习目标</h4>
                    <ul>
                      {video.learningObjectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="gallery-footer">
          <p>
            共 {totalVideos} 个视频 | 更多视频持续更新中...
          </p>
        </div>
      </div>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default VideoGalleryPage;
