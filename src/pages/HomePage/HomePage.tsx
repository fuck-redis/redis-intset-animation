import React, { useState, useEffect } from 'react';
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
  Video,
  Binary,
  Layers,
  Hash,
  GitBranch,
  Zap,
  Database,
  Target,
  Clock,
  Users,
  Shield,
  Rocket,
  Info,
  RefreshCw
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

// Animated IntSet Memory Diagram Component - 更清晰的版本
const IntSetMemoryDiagram: React.FC = () => {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);

  const values = [10, 25, 50, 80, 100];
  const encoding = 'INT16';
  const totalBytes = 8 + values.length * 2; // header + data

  // 单元格尺寸
  const cellWidth = 80;
  const cellHeight = 45;
  const cellGap = 6;

  // Header 3个字段
  const headerFields = [
    { label: 'encoding', value: encoding, tooltip: '编码类型，决定每个值的字节数' },
    { label: 'length', value: String(values.length), tooltip: '元素数量' },
    { label: 'blob', value: `${totalBytes}B`, tooltip: '总字节数 = 8 + 5×2' },
  ];

  // 计算总宽度
  const headerWidth = headerFields.length * cellWidth + (headerFields.length - 1) * cellGap;
  const dataWidth = values.length * cellWidth + (values.length - 1) * cellGap;
  const totalWidth = Math.max(headerWidth, dataWidth) + 160;
  const svgHeight = 260;

  // 居中起始位置
  const headerStartX = (totalWidth - headerWidth) / 2;
  const dataStartX = (totalWidth - dataWidth) / 2;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${svgHeight}`} className="intset-diagram" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* 标题 */}
      <text x={totalWidth / 2} y={22} textAnchor="middle" fontSize={15} fontWeight={700} fill="#1e293b">
        IntSet 内存结构示例
      </text>
      <text x={totalWidth / 2} y={40} textAnchor="middle" fontSize={11} fill="#64748b">
        存储值: [{values.join(', ')}] | 编码: {encoding} | 总占用: {totalBytes} bytes
      </text>

      {/* Header 区域标注 */}
      <rect x={headerStartX - 70} y={55} width={55} height={22} rx={4} fill="#e0f2fe" />
      <text x={headerStartX - 42} y={70} textAnchor="middle" fontSize={11} fontWeight={600} fill="#0284c7">Header</text>
      <text x={headerStartX - 42} y={82} textAnchor="middle" fontSize={9} fill="#0284c7">8 bytes</text>

      {/* Header 单元格 */}
      {headerFields.map((field, i) => (
        <g key={field.label} transform={`translate(${headerStartX + i * (cellWidth + cellGap)}, 55)`}>
          <rect width={cellWidth} height={cellHeight} rx={6} fill="white" stroke="#0ea5e9" strokeWidth={2} />
          <text x={cellWidth / 2} y={16} textAnchor="middle" fontSize={10} fill="#64748b">{field.label}</text>
          <text x={cellWidth / 2} y={34} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0ea5e9">{field.value}</text>
        </g>
      ))}

      {/* 指向 Header 的箭头 */}
      <path d={`M ${headerStartX + cellWidth / 2} 78 L ${headerStartX + cellWidth / 2} 95`} stroke="#0ea5e9" strokeWidth={2} markerEnd="url(#arrowhead)" />

      {/* Data 区域标注 */}
      <rect x={dataStartX - 70} y={110} width={55} height={22} rx={4} fill="#dcfce7" />
      <text x={dataStartX - 42} y={125} textAnchor="middle" fontSize={11} fontWeight={600} fill="#16a34a">Data</text>
      <text x={dataStartX - 42} y={137} textAnchor="middle" fontSize={9} fill="#16a34a">{values.length}×2B</text>

      {/* 连续内存条 */}
      <rect x={dataStartX - 10} y={105} width={dataWidth + 20} height={cellHeight + 15} rx={8} fill="#f0fdf4" stroke="#16a34a" strokeWidth={1} strokeDasharray="4,2" />

      {/* Data 单元格 */}
      {values.map((value, i) => {
        const x = dataStartX + i * (cellWidth + cellGap);
        const isHovered = hoveredBlock === i;

        return (
          <g
            key={i}
            transform={`translate(${x}, 115)`}
            onMouseEnter={() => setHoveredBlock(i)}
            onMouseLeave={() => setHoveredBlock(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              width={cellWidth}
              height={cellHeight}
              rx={6}
              fill={isHovered ? '#bbf7d0' : '#dcfce7'}
              stroke={isHovered ? '#16a34a' : '#86efac'}
              strokeWidth={isHovered ? 3 : 1}
              style={{ transition: 'all 0.2s' }}
            />
            {/* 索引标签 */}
            <text x={8} y={14} fontSize={9} fill="#64748b">[{i}]</text>
            {/* 值 */}
            <text x={cellWidth / 2} y={28} textAnchor="middle" fontSize={16} fontWeight={700} fill="#15803d">{value}</text>
            {/* 十六进制 */}
            <text x={cellWidth / 2} y={42} textAnchor="middle" fontSize={9} fill="#86efac">0x{value.toString(16).toUpperCase().padStart(4, '0')}</text>
          </g>
        );
      })}

      {/* 内存地址递增标注 */}
      <text x={dataStartX} y={185} fontSize={9} fill="#94a3b8">内存地址 →</text>
      <text x={dataStartX + dataWidth - 10} y={185} fontSize={9} fill="#94a3b8">→</text>

      {/* 图例说明 */}
      <g transform={`translate(${totalWidth / 2 - 120}, 210)`}>
        <rect width={12} height={12} rx={2} fill="#dcfce7" stroke="#86efac" />
        <text x={18} y={10} fontSize={10} fill="#64748b">鼠标悬停查看详情</text>
      </g>

      {/* Hover 信息展示 */}
      {hoveredBlock !== null && (
        <g transform={`translate(${totalWidth / 2 - 100}, 230)`}>
          <rect width={200} height={24} rx={4} fill="#fef9c3" stroke="#eab308" />
          <text x={100} y={16} textAnchor="middle" fontSize={10} fill="#854d0e">
            索引 {hoveredBlock}: 值 {values[hoveredBlock]} | 十六进制: 0x{values[hoveredBlock].toString(16).toUpperCase().padStart(4, '0')} | 占用 2 bytes
          </text>
        </g>
      )}

      {/* 箭头标记定义 */}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <polygon points="0,0 8,4 0,8" fill="#0ea5e9" />
        </marker>
      </defs>
    </svg>
  );
};

// Binary Search Animation Component - 更清晰的版本
const BinarySearchVisual: React.FC = () => {
  const [searchStep, setSearchStep] = useState(0);
  const data = [1, 15, 23, 42, 56, 78, 89, 100];
  const target = 42;

  const steps = [
    { left: 0, right: 7, mid: 3, found: false, description: '第1步: 检查中间位置', action: '42 > 23，向右找' },
    { left: 0, right: 2, mid: 1, found: false, description: '第2步: 缩小范围到 [0,2]', action: '42 > 15，向右找' },
    { left: 2, right: 2, mid: 2, found: true, description: '第3步: 检查索引 2', action: '✓ 找到 42!' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = steps[searchStep];

  return (
    <div className="binary-search-visual" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>二分查找演示</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
          在有序数组中查找 <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{target}</span>
        </div>
      </div>

      {/* 数据展示区域 */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px' }}>
        {data.map((value, i) => {
          const isMid = i === current.mid;
          const isFound = current.found && i === current.mid;
          const isEliminated = i < current.left || i > current.right;

          return (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: isFound ? '#dcfce7' : isMid ? '#dbeafe' : isEliminated ? '#f1f5f9' : '#fff',
                border: isFound ? '2px solid #16a34a' : isMid ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                borderRadius: '6px',
                transition: 'all 0.3s',
                opacity: isEliminated ? 0.4 : 1,
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: isFound ? '#15803d' : isMid ? '#0284c7' : '#334155' }}>{value}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>[{i}]</div>
            </div>
          );
        })}
      </div>

      {/* 范围指示 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          搜索范围: <span style={{ fontWeight: 600, color: '#0ea5e9' }}>[{current.left} ~ {current.right}]</span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          当前检查: <span style={{ fontWeight: 600, color: '#0284c7' }}>索引 {current.mid}</span>
        </div>
      </div>

      {/* 步骤说明 */}
      <div style={{
        textAlign: 'center',
        padding: '10px',
        background: current.found ? '#dcfce7' : '#e0f2fe',
        borderRadius: '6px',
        marginBottom: '8px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: current.found ? '#15803d' : '#0284c7' }}>
          {current.description}
        </div>
        <div style={{ fontSize: '11px', color: current.found ? '#16a34a' : '#0284c7', marginTop: '4px' }}>
          {current.action}
        </div>
      </div>

      {/* 图例 */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#dbeafe', border: '1px solid #0ea5e9', borderRadius: '2px' }}></div>
          <span>当前检查</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#dcfce7', border: '1px solid #16a34a', borderRadius: '2px' }}></div>
          <span>找到目标</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '2px', opacity: 0.5 }}></div>
          <span>已排除</span>
        </div>
      </div>
    </div>
  );
};

// Encoding Upgrade Visual Component
const EncodingUpgradeVisual: React.FC = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="encoding-upgrade-visual">
      <div className={`encoding-block int16 ${phase >= 0 ? '' : 'anim-pulse'}`}>
        <div className="label">INT16</div>
        <div className="bytes">2 bytes</div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7 }}>Range: -32768 ~ 32767</div>
      </div>
      <div className={`upgrade-arrow ${phase >= 1 ? 'anim-pulse' : ''}`}>→</div>
      <div className={`encoding-block int32 ${phase >= 1 ? '' : 'anim-pulse'}`}>
        <div className="label">INT32</div>
        <div className="bytes">4 bytes</div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7 }}>Range: -2.1B ~ 2.1B</div>
      </div>
      <div className={`upgrade-arrow ${phase >= 2 ? 'anim-pulse' : ''}`}>→</div>
      <div className={`encoding-block int64 ${phase >= 2 ? '' : 'anim-pulse'}`}>
        <div className="label">INT64</div>
        <div className="bytes">8 bytes</div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7 }}>Range: -9.2Q ~ 9.2Q</div>
      </div>
    </div>
  );
};

// Memory Layout Visual Component
const MemoryLayoutVisual: React.FC = () => {
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPhase((prev) => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const values = [10, 20, 30];
  const blockSize = 50;
  const headerSize = 30;

  return (
    <svg viewBox="0 0 320 140" style={{ width: '100%', height: 'auto' }}>
      {/* Header */}
      <g transform="translate(20, 20)">
        <text x={0} y={-5} fontSize={10} fill="#64748b">Header</text>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * (headerSize + 4)}, 0)`}>
            <rect width={headerSize} height={headerSize} className="header-cell" />
            <text x={5} y={14} fontSize={8} fill="#64748b">{['enc', 'len', 'blob'][i]}</text>
            <text x={5} y={26} fontSize={9} fontWeight={600} fill="#1e293b">{[2, 3, 14][i]}</text>
          </g>
        ))}
      </g>

      {/* Data blocks */}
      <g transform="translate(20, 70)">
        <text x={0} y={-5} fontSize={10} fill="#64748b">Data (continuous memory)</text>
        {values.map((v, i) => (
          <g key={i} transform={`translate(${i * (blockSize + 4)}, 0)`}>
            <rect
              width={blockSize}
              height={blockSize}
              className="memory-block-rect"
              style={{
                fill: animPhase === i ? '#dbeafe' : '#f1f5f9',
                stroke: animPhase === i ? '#0ea5e9' : '#cbd5e1',
                strokeWidth: animPhase === i ? 2 : 1,
              }}
            />
            <text x={blockSize / 2} y={20} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1e293b">
              {v}
            </text>
            <text x={blockSize / 2} y={38} textAnchor="middle" fontSize={8} fill="#64748b">
              0x{v.toString(16).toUpperCase().padStart(4, '0')}
            </text>
          </g>
        ))}
        {/* Arrow showing continuous memory */}
        <line x1={0} y1={blockSize + 8} x2={values.length * (blockSize + 4) - 4} y2={blockSize + 8} stroke="#cbd5e1" strokeWidth={1} markerEnd="url(#arrow)" />
        <text x={values.length * (blockSize + 4) / 2} y={blockSize + 20} textAnchor="middle" fontSize={8} fill="#94a3b8">
          Continuous memory layout
        </text>
      </g>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
      </defs>
    </svg>
  );
};

// Step-by-Step Algorithm Explanation Component
const AlgorithmSteps: React.FC<{ title: string; steps: { num: number; title: string; desc: string }[] }> = ({ title, steps }) => (
  <div className="algorithm-steps">
    <h4>{title}</h4>
    {steps.map((step) => (
      <div key={step.num} className="step-item">
        <div className="step-num">{step.num}</div>
        <div className="step-text">
          <strong>{step.title}</strong>
          <p>{step.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

// Real World Example Component
const RealWorldExample: React.FC<{ icon: React.ReactNode; title: string; scenario: string; benefit: string }> = ({ icon, title, scenario, benefit }) => (
  <div className="real-world-example">
    <div className="example-icon">{icon}</div>
    <div className="example-content">
      <h4>{title}</h4>
      <p className="scenario">{scenario}</p>
      <p className="benefit">{benefit}</p>
    </div>
  </div>
);

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
              <PlayCircle size={18} />
              开始演示
            </button>
            <button className="btn-secondary" onClick={() => navigate('/tutorial')}>
              <BookOpen size={18} />
              学习原理
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <IntSetMemoryDiagram />
        </div>
      </section>

      {/* What is IntSet Section - NEW */}
      <section className="what-is-section">
        <div className="what-is-container">
          <h2 className="section-title">什么是 IntSet？</h2>
          <p className="what-is-intro">
            IntSet（整数集合）是 Redis 用于存储整数类型 Set 元素的数据结构。当一个 Set 只包含整数元素，
            并且元素数量不超过 512 个时，Redis 会自动选择 IntSet 作为其底层实现，而不是更通用的 HashTable。
          </p>

          <div className="what-is-grid">
            <div className="what-is-card">
              <div className="what-is-icon"><Target size={32} /></div>
              <h3>核心设计目标</h3>
              <p>
                IntSet 的核心目标是在<strong>保证查找性能</strong>的前提下，
                <strong>最小化内存占用</strong>。它通过使用可变长度的整数编码来实现这一点。
              </p>
              <ul className="what-is-list">
                <li>只存储整数类型数据</li>
                <li>元素按升序排列存储</li>
                <li>支持三种编码方式自动切换</li>
                <li>紧凑的连续内存布局</li>
              </ul>
            </div>

            <div className="what-is-card">
              <div className="what-is-icon"><Database size={32} /></div>
              <h3>为什么需要 IntSet？</h3>
              <p>
                想象你有一个存储用户 ID 的 Set：<code>{'{1, 2, 3, 4, 5}'}</code>。
                如果使用 HashTable，每个元素都需要额外的哈希表结构开销。
              </p>
              <div className="comparison-box">
                <div className="comparison-item">
                  <span className="comparison-label">HashTable</span>
                  <span className="comparison-value">~72 bytes/元素</span>
                </div>
                <div className="comparison-item highlight">
                  <span className="comparison-label">IntSet</span>
                  <span className="comparison-value">2-8 bytes/元素</span>
                </div>
              </div>
            </div>

            <div className="what-is-card">
              <div className="what-is-icon"><Layers size={32} /></div>
              <h3>三种编码类型</h3>
              <p>
                IntSet 根据数值大小自动选择最合适的编码方式，编码类型直接决定了每个元素占用的字节数：
              </p>
              <div className="encoding-table">
                <div className="encoding-row header">
                  <span>编码类型</span>
                  <span>字节数</span>
                  <span>数值范围</span>
                </div>
                <div className="encoding-row">
                  <span><code>INT16</code></span>
                  <span>2 bytes</span>
                  <span>-32,768 ~ 32,767</span>
                </div>
                <div className="encoding-row">
                  <span><code>INT32</code></span>
                  <span>4 bytes</span>
                  <span>-2.1B ~ 2.1B</span>
                </div>
                <div className="encoding-row">
                  <span><code>INT64</code></span>
                  <span>8 bytes</span>
                  <span>-9.2Q ~ 9.2Q</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-callout">
            <Info size={20} />
            <div>
              <strong>关键点：</strong>IntSet 的"智能"之处在于它会根据数据特性动态调整编码。
              存储 <code>[1, 2, 3]</code> 时使用 INT16（每个元素2字节），存储 <code>[100000, 200000]</code> 时
              自动升级到 INT32（每个元素4字节）。
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">50%+</div>
            <div className="stat-label">内存节省</div>
            <div className="stat-desc">相比 HashTable 的内存占用</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">O(log n)</div>
            <div className="stat-label">查找复杂度</div>
            <div className="stat-desc">二分查找保证高效检索</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">512</div>
            <div className="stat-label">自动升级阈值</div>
            <div className="stat-desc">超过此值可能触发升级</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">3</div>
            <div className="stat-label">编码类型</div>
            <div className="stat-desc">INT16 / INT32 / INT64</div>
          </div>
        </div>
      </section>

      {/* How It Works Section - NEW */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">IntSet 工作原理</h2>
          <p className="section-intro">
            理解 IntSet 的核心机制，帮助你在实际项目中做出正确的选择
          </p>

          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <div className="how-it-works-header">
                <div className="how-icon"><RefreshCw size={24} /></div>
                <h3>编码升级机制</h3>
              </div>
              <p className="how-it-works-desc">
                当插入一个超出当前编码范围的值时，IntSet 会自动触发编码升级，将整个集合
                重新编码为更大的数据类型。这个过程虽然需要内存重分配和元素移动，
                但保证了数据存储的紧凑性。
              </p>
              <div className="upgrade-example">
                <div className="upgrade-step">
                  <span className="step-badge">1</span>
                  <span>插入值 50000（超出 INT16 范围 32767）</span>
                </div>
                <div className="upgrade-arrow-down">↓</div>
                <div className="upgrade-step">
                  <span className="step-badge">2</span>
                  <span>检测到需要 INT32 编码</span>
                </div>
                <div className="upgrade-arrow-down">↓</div>
                <div className="upgrade-step">
                  <span className="step-badge">3</span>
                  <span>分配新内存，重新编码所有元素</span>
                </div>
              </div>
              <div className="tip-box">
                <Lightbulb size={16} />
                <span>升级是单向的：INT16 → INT32 → INT64，不会降级</span>
              </div>
            </div>

            <div className="how-it-works-card">
              <div className="how-it-works-header">
                <div className="how-icon"><Binary size={24} /></div>
                <h3>二分查找算法</h3>
              </div>
              <p className="how-it-works-desc">
                IntSet 中的元素按升序存储，这使得二分查找成为可能。
                对于包含 n 个元素的集合，二分查找只需要 O(log n) 次比较就能找到目标。
              </p>
              <AlgorithmSteps
                title="查找步骤"
                steps={[
                  { num: 1, title: '确定范围', desc: '设置 left=0, right=n-1' },
                  { num: 2, title: '取中点', desc: 'mid = (left + right) / 2' },
                  { num: 3, title: '比较大小', desc: '如果 arr[mid] == target，找到！' },
                  { num: 4, title: '缩小范围', desc: '根据大小关系调整 left 或 right' },
                ]}
              />
              <div className="example-box">
                在 <code>[1,15,23,42,56,78,89,100]</code> 中查找 42：
                <br />
                第1步：中点 56 大于 42，范围缩小到左半部分
                <br />
                第2步：中点 15 小于 42，范围缩小到右半部分
                <br />
                第3步：找到 42！总共 3 步（而不是线性查找的 4 步）
              </div>
            </div>

            <div className="how-it-works-card">
              <div className="how-it-works-header">
                <div className="how-icon"><Hash size={24} /></div>
                <h3>插入操作流程</h3>
              </div>
              <p className="how-it-works-desc">
                插入新元素时，IntSet 需要保持集合的有序性。
                这涉及到查找插入位置、搬移元素和写入新值三个步骤。
              </p>
              <AlgorithmSteps
                title="插入步骤"
                steps={[
                  { num: 1, title: '二分查找', desc: '找到新元素的插入位置' },
                  { num: 2, title: '检查编码', desc: '判断是否需要升级编码' },
                  { num: 3, title: '移动元素', desc: '将插入位置后的元素后移' },
                  { num: 4, title: '写入新值', desc: '在正确位置插入新元素' },
                ]}
              />
              <div className="example-box">
                插入 35 到 <code>[10,20,30,40,50]</code>：
                <br />
                查找位置：35 应该在 30 和 40 之间
                <br />
                移动元素：40, 50 后移一位
                <br />
                结果：<code>[10,20,30,35,40,50]</code>
              </div>
            </div>

            <div className="how-it-works-card">
              <div className="how-it-works-header">
                <div className="how-icon"><Database size={24} /></div>
                <h3>内存布局结构</h3>
              </div>
              <p className="how-it-works-desc">
                IntSet 使用连续的内存块来存储数据，这种布局对于 CPU 缓存非常友好，
                能够显著提升数据访问效率。
              </p>
              <div className="memory-layout-diagram">
                <div className="memory-header">
                  <div className="memory-section-label">Header (8 bytes)</div>
                  <div className="memory-cells">
                    <div className="memory-cell">encoding</div>
                    <div className="memory-cell">length</div>
                    <div className="memory-cell">blob</div>
                  </div>
                </div>
                <div className="memory-data">
                  <div className="memory-section-label">Data (连续内存)</div>
                  <div className="memory-values">
                    <div className="memory-val">10</div>
                    <div className="memory-val">25</div>
                    <div className="memory-val">50</div>
                    <div className="memory-val">...</div>
                  </div>
                </div>
              </div>
              <div className="benefit-list">
                <div className="benefit-item">
                  <CheckCircle size={14} />
                  <span>连续内存：CPU 缓存命中率高</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={14} />
                  <span>有序存储：支持二分查找</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={14} />
                  <span>紧凑编码：内存占用最小化</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Diagrams Section */}
      <section className="diagram-section">
        <h2 className="section-title">核心概念可视化</h2>
        <p className="section-intro">
          通过动画直观理解 IntSet 的工作原理
        </p>
        <div className="diagram-container">
          <div className="diagram-card">
            <h3>
              <Binary size={18} />
              二分查找算法
            </h3>
            <p>
              O(log n) 时间复杂度，每次将搜索区间减半。
              在 100 万个元素中查找，最多只需 20 次比较！
            </p>
            <div className="diagram-svg-container">
              <BinarySearchVisual />
            </div>
            <div className="diagram-note">
              <strong>为什么这么快？</strong>
              每次比较排除一半的元素。log₂(1000000) ≈ 20
            </div>
          </div>
          <div className="diagram-card">
            <h3>
              <Layers size={18} />
              编码升级机制
            </h3>
            <p>
              当值超出当前编码范围时自动升级到更大编码。
              INT16 → INT32 → INT64，单向不可逆。
            </p>
            <div className="diagram-svg-container">
              <EncodingUpgradeVisual />
            </div>
            <div className="diagram-note">
              <strong>升级触发条件：</strong>
              插入的值超出当前编码范围，或集合长度超过 512
            </div>
          </div>
          <div className="diagram-card">
            <h3>
              <Hash size={18} />
              内存布局结构
            </h3>
            <p>
              8字节头部 + 连续内存数据区域。所有元素紧密排列，
              这种布局对 CPU 缓存非常友好。
            </p>
            <div className="diagram-svg-container">
              <MemoryLayoutVisual />
            </div>
            <div className="diagram-note">
              <strong>内存效率：</strong>
              相比 HashTable，每个元素可节省 60%+ 的内存
            </div>
          </div>
          <div className="diagram-card">
            <h3>
              <GitBranch size={18} />
              学习路径
            </h3>
            <p>从原理到实践，系统掌握 IntSet 核心知识</p>
            <div style={{ padding: '1rem', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { step: 1, title: '原理篇', desc: '编码机制与内存布局' },
                  { step: 2, title: '实践篇', desc: '可视化操作演示' },
                  { step: 3, title: '场景篇', desc: '7个实战场景' },
                  { step: 4, title: '源码篇', desc: 'C语言实现分析' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 28, height: 28, background: '#0ea5e9', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real World Examples Section - NEW */}
      <section className="real-world-section">
        <div className="real-world-container">
          <h2 className="section-title">真实世界应用场景</h2>
          <p className="section-intro">
            理解 IntSet 在实际项目中的典型应用场景
          </p>

          <div className="real-world-grid">
            <RealWorldExample
              icon={<Users size={24} />}
              title="场景 1：用户标签系统"
              scenario="为每个用户存储一组标签 ID，例如用户的兴趣标签 {1, 5, 23, 88}。"
              benefit="如果这些标签 ID 都是整数，使用 IntSet 存储比 HashTable 节省 70%+ 内存。在百万用户级别，这能节省数 GB 内存。"
            />

            <RealWorldExample
              icon={<Target size={24} />}
              title="场景 2：排行榜得分记录"
              scenario="存储游戏玩家的得分记录，例如玩家的历史最高分集合。"
              benefit="得分通常是大整数，IntSet 的有序存储使得 '获取前 10 名' 这样的操作变得简单高效。"
            />

            <RealWorldExample
              icon={<Clock size={24} />}
              title="场景 3：时间戳集合"
              scenario="记录某个事件发生的时间戳序列，例如用户登录时间记录。"
              benefit="时间戳是大整数（Unix 时间），非常适合 IntSet 存储。有序特性还便于范围查询。"
            />

            <RealWorldExample
              icon={<Shield size={24} />}
              title="场景 4：黑名单/白名单"
              scenario="存储被禁止或允许访问的用户 ID 列表。"
              benefit="黑白名单通常需要频繁查询。IntSet 的 O(log n) 查找非常适合这种高频查询场景，内存占用还小。"
            />

            <RealWorldExample
              icon={<Zap size={24} />}
              title="场景 5：去重计数器"
              scenario="统计每天访问网站的独立用户数，用 Set 存储用户 ID 去重。"
              benefit="用户 ID 是大整数。IntSet 的紧凑存储可以在保证去重功能的同时，最小化内存占用。"
            />

            <RealWorldExample
              icon={<Rocket size={24} />}
              title="场景 6：关联ID存储"
              scenario="存储文章的所有评论者 ID、博文的点赞用户列表等关联关系。"
              benefit="这些 ID 都是整数。IntSet 的有序性还便于实现 '最早点赞的用户' 等功能。"
            />
          </div>

          <div className="decision-tree">
            <h3>何时使用 IntSet？</h3>
            <div className="tree-content">
              <div className="tree-question">
                <div className="question-icon"><Target size={20} /></div>
                <div className="question-text">
                  <strong>你的 Set 元素是否满足以下条件？</strong>
                  <ul>
                    <li>所有元素都是整数类型</li>
                    <li>元素数量预计不超过几千个</li>
                    <li>需要频繁进行查找操作</li>
                    <li>希望节省内存空间</li>
                  </ul>
                </div>
              </div>
              <div className="tree-answer">
                <div className="answer-yes">
                  <CheckCircle size={18} />
                  <span>是 → IntSet 是最佳选择</span>
                </div>
                <div className="answer-no">
                  <span className="x-icon">✗</span>
                  <span>否 → 考虑使用 HashTable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">平台特色</h2>
        <p className="section-subtitle">全方位学习体验，从入门到精通</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Eye size={40} className="icon" />
            </div>
            <h3>D3.js 可视化</h3>
            <p>实时渲染内存布局，每个字节清晰可见。支持 INT16/32/64 三种编码的动态切换演示</p>
            <button className="feature-link" onClick={() => navigate('/playground')}>
              立即体验 <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BookText size={40} className="icon" />
            </div>
            <h3>7章系统教程</h3>
            <p>7000+字完整教程，涵盖编码机制、内存优化、二分查找、Redis实战等全部知识点</p>
            <button className="feature-link" onClick={() => navigate('/tutorial')}>
              开始学习 <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Film size={40} className="icon" />
            </div>
            <h3>帧级动画控制</h3>
            <p>播放/暂停/单步前进/后退，速度可调（0.5x-2x）。像调试器一样精确控制每一帧</p>
            <button className="feature-link" onClick={() => navigate('/playground')}>
              查看演示 <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Video size={40} className="icon" />
            </div>
            <h3>Remotion 视频讲解</h3>
            <p>高质量动画视频讲解核心知识点，可交互播放。编码升级、二分查找等原理一看就懂</p>
            <button
              className="feature-link"
              onClick={() => setSelectedVideo(VIDEO_CONFIGS[0])}
            >
              观看视频 <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Lightbulb size={40} className="icon" />
            </div>
            <h3>7大实战场景</h3>
            <p>编码升级、批量插入、二分查找、删除操作...从入门到高级的完整路径</p>
            <button className="feature-link" onClick={() => navigate('/scenarios')}>
              探索场景 <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Code2 size={40} className="icon" />
            </div>
            <h3>Redis源码剖析</h3>
            <p>intset.c 完整注释，5个核心函数详解，6个性能优化技巧，GitHub源码直达</p>
            <button className="feature-link" onClick={() => navigate('/source-code')}>
              阅读分析 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section">
        <h2 className="section-title">插入操作演示</h2>
        <p className="demo-description">
          观察 IntSet 如何执行插入操作：二分查找位置 → 检查编码 → 移动元素 → 写入新值
        </p>
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
            <h2>为什么要学习 IntSet？</h2>
            <div className="why-list">
              <div className="why-item">
                <CheckCircle size={20} className="check-icon" />
                <div>
                  <h4>Redis 生产环境必备</h4>
                  <p>
                    当 Set 元素全为整数且数量 ≤ 512 时自动启用，内存节省 50%+。
                    理解它才能在生产环境中进行正确的性能优化和容量规划。
                  </p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={20} className="check-icon" />
                <div>
                  <h4>高级数据结构思想</h4>
                  <p>
                    动态编码、有序存储、二分查找 —— 这些是系统设计中常用的技巧。
                    掌握 IntSet 的设计理念，能帮助你设计出更高效的其他系统。
                  </p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={20} className="check-icon" />
                <div>
                  <h4>真实性能优化案例</h4>
                  <p>
                    学会何时用 IntSet 何时用 HashTable，理解 Redis 如何在内存占用
                    与操作速度之间找到平衡。这些经验可以直接应用到你的项目中。
                  </p>
                </div>
              </div>
              <div className="why-item">
                <CheckCircle size={20} className="check-icon" />
                <div>
                  <h4>面试高频考点</h4>
                  <p>
                    阿里、腾讯、字节、美团等大厂面试常问：
                    "IntSet 和 HashTable 区别？"、"编码升级机制是什么？"、
                    "什么时候会触发升级？" —— 完全掌握就是加分项。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="learning-path-section">
        <h2 className="section-title">推荐学习路径</h2>
        <p className="section-intro">
          按照以下路径学习，从入门到精通
        </p>
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>马上开始学习</h2>
          <p>15分钟掌握基础 · 1小时深入原理 · 成为 Redis IntSet 专家</p>
          <div className="cta-buttons">
            <button className="btn-large btn-primary" onClick={() => navigate('/tutorial')}>
              <BookOpen size={20} />
              开始教程
            </button>
            <button className="btn-large btn-secondary" onClick={() => navigate('/playground')}>
              <PlayCircle size={20} />
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
