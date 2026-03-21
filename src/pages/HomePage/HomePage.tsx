import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Eye,
  BookText,
  Film,
  Lightbulb,
  Code2,
  Zap,
  Video
} from 'lucide-react';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import VideoEmbed from '../../components/VideoEmbed';
import { EncodingUpgradeVideo, BinarySearchVideo, InsertOperationVideo } from '../../videos';
import './HomePage.css';

const VIDEO_CONFIGS: VideoConfig[] = [
  {
    id: 'encoding-upgrade',
    title: '编码升级机制',
    description: '详解 INT16 → INT32 → INT64 的自动升级过程',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 50000 },
  },
  {
    id: 'binary-search',
    title: '二分查找算法',
    description: 'O(log n) 时间复杂度的查找过程可视化',
    component: BinarySearchVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Redis核心数据结构</div>
          <h1 className="hero-title">
            Redis <span className="gradient-text">IntSet</span> 完全指南
          </h1>
          <p className="hero-description">
            内存节省50%+的整数集合实现 · 从原理到源码的深度解析 · 7个实战场景 · 完整可视化演示
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/playground')}>
              <PlayCircle size={20} />
              开始演示
            </button>
            <button className="btn-secondary" onClick={() => navigate('/tutorial')}>
              <BookOpen size={20} />
              学习原理
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <VideoEmbed
              title="编码升级动画演示"
              description="IntSet 如何自动升级编码以容纳更大的值"
              component={EncodingUpgradeVideo}
              props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
              autoplay={true}
              aspectRatio="4:3"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">平台特色</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Eye size={48} className="icon" />
            </div>
            <h3>D3.js 可视化</h3>
            <p>实时渲染内存布局，每个字节清晰可见。支持INT16/32/64三种编码的动态切换演示</p>
            <button className="feature-link" onClick={() => navigate('/playground')}>
              立即体验 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BookText size={48} className="icon" />
            </div>
            <h3>7章系统教程</h3>
            <p>7000+字完整教程，涵盖编码机制、内存优化、二分查找、Redis实战等全部知识点</p>
            <button className="feature-link" onClick={() => navigate('/tutorial')}>
              开始学习 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Film size={48} className="icon" />
            </div>
            <h3>帧级动画控制</h3>
            <p>播放/暂停/单步前进/后退，速度可调（0.5x-2x）。像调试器一样精确控制每一帧</p>
            <button className="feature-link" onClick={() => navigate('/playground')}>
              查看演示 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Video size={48} className="icon" />
            </div>
            <h3>Remotion 视频讲解</h3>
            <p>高质量动画视频讲解核心知识点，可交互播放。编码升级、二分查找等原理一看就懂</p>
            <button
              className="feature-link"
              onClick={() => setSelectedVideo(VIDEO_CONFIGS[0])}
            >
              观看视频 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card feature-card-video">
            <div className="feature-video-demo">
              <VideoEmbed
                title="二分查找演示"
                description="O(log n) 时间复杂度的查找过程"
                component={BinarySearchVideo}
                props={{ searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] }}
                autoplay={true}
                aspectRatio="4:3"
              />
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Lightbulb size={48} className="icon" />
            </div>
            <h3>7大实战场景</h3>
            <p>编码升级、批量插入、二分查找、删除操作...从入门到高级的完整路径</p>
            <button className="feature-link" onClick={() => navigate('/scenarios')}>
              探索场景 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Code2 size={48} className="icon" />
            </div>
            <h3>Redis源码剖析</h3>
            <p>intset.c完整注释，5个核心函数详解，6个性能优化技巧，GitHub源码直达</p>
            <button className="feature-link" onClick={() => navigate('/source-code')}>
              阅读分析 <ArrowRight size={16} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={48} className="icon" />
            </div>
            <h3>性能数据对比</h3>
            <p>内存占用、查询速度、插入效率全方位对比。包含决策树帮你选择最优方案</p>
            <button className="feature-link" onClick={() => navigate('/tutorial')}>
              了解更多 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="learning-path-section">
        <h2 className="section-title">推荐学习路径</h2>
        <div className="learning-path">
          <div className="path-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>原理篇</h3>
              <p>掌握编码机制、内存布局、升级策略</p>
              <button className="step-btn" onClick={() => navigate('/tutorial')}>
                开始学习
              </button>
            </div>
          </div>

          <div className="path-arrow">→</div>

          <div className="path-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>实践篇</h3>
              <p>可视化演示，看懂插入、查找、删除</p>
              <button className="step-btn" onClick={() => navigate('/playground')}>
                开始演示
              </button>
            </div>
          </div>

          <div className="path-arrow">→</div>

          <div className="path-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>场景篇</h3>
              <p>7个实战场景，从基础到高级</p>
              <button className="step-btn" onClick={() => navigate('/scenarios')}>
                探索场景
              </button>
            </div>
          </div>

          <div className="path-arrow">→</div>

          <div className="path-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>源码篇</h3>
              <p>C语言实现，性能优化技巧</p>
              <button className="step-btn" onClick={() => navigate('/source-code')}>
                阅读源码
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Demo Section */}
      <section className="demo-section">
        <h2 className="section-title">插入操作演示</h2>
        <p className="demo-description">观察 IntSet 如何执行插入操作：二分查找位置 → 检查编码 → 移动元素 → 写入新值</p>
        <div className="demo-video-container">
          <VideoEmbed
            title="插入操作详解"
            description="完整演示插入算法的每一步执行过程"
            component={InsertOperationVideo}
            props={{ operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] }}
            autoplay={true}
            aspectRatio="16:9"
          />
        </div>
      </section>

      {/* Why IntSet Section */}
      <section className="why-section">
        <div className="why-container">
          <div className="why-content">
            <h2>为什么要学习IntSet？</h2>
            <div className="why-list">
              <div className="why-item">
                <CheckCircle size={24} className="check-icon" />
                <div>
                  <h4>Redis生产环境必备</h4>
                  <p>当Set元素全为整数且数量≤512时自动启用，内存节省50%+，理解它才能优化生产系统</p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={24} className="check-icon" />
                <div>
                  <h4>高级数据结构思想</h4>
                  <p>动态编码、有序存储、二分查找——掌握这些技巧将帮你设计出高性能系统</p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={24} className="check-icon" />
                <div>
                  <h4>真实性能优化案例</h4>
                  <p>学会何时用IntSet何时用HashTable，了解Redis如何在内存与速度之间找到平衡</p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={24} className="check-icon" />
                <div>
                  <h4>面试高频考点</h4>
                  <p>阿里、腾讯、字节面试常问："IntSet和HashTable区别?"、"编码升级机制?"，完全掌握加分项</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>🚀 马上开始学习</h2>
          <p>15分钟掌握基础 · 1小时深入原理 · 成为Redis IntSet专家</p>
          <div className="cta-buttons">
            <button className="btn-large btn-primary" onClick={() => navigate('/tutorial')}>
              <BookOpen size={24} />
              开始教程
            </button>
            <button className="btn-large btn-secondary" onClick={() => navigate('/playground')}>
              <PlayCircle size={24} />
              立即演示
            </button>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default HomePage;
