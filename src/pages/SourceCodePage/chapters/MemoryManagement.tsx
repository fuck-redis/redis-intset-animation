import React from 'react';
import { Database } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const MemoryManagement: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">内存管理</h1>
        <p className="chapter-subtitle">IntSet的内存分配、释放和优化策略</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">内存计算公式</h2>
        <CodeBlock
          code={`总内存 = 8 + encoding × length 字节

示例：
- 100个INT16: 8 + 2 × 100 = 208 字节
- 100个INT32: 8 + 4 × 100 = 408 字节
- 100个INT64: 8 + 8 × 100 = 808 字节`}
          language="c"
          title="内存占用计算"
        />
      </section>

      <section className="chapter-section">
        <h2 className="section-title">内存操作函数</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Database size={20} />
              zmalloc
            </h3>
            <p className="feature-card-content">
              创建IntSet时分配初始8字节（只有头部）
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Database size={20} />
              zrealloc
            </h3>
            <p className="feature-card-content">
              插入或删除时动态调整内存大小
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Database size={20} />
              zfree
            </h3>
            <p className="feature-card-content">
              释放整个IntSet的内存
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">内存优化策略</h2>
        <div className="section-content">
          <ul>
            <li><strong>延迟分配</strong> - 创建时不分配contents，首次插入才分配</li>
            <li><strong>精确调整</strong> - 每次操作后立即调整到精确大小</li>
            <li><strong>就地扩展</strong> - realloc优先尝试就地扩展避免拷贝</li>
            <li><strong>连续布局</strong> - 头部和数据连续，减少碎片</li>
          </ul>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>内存效率：</strong>
          IntSet相比哈希表节省50-90%内存，特别适合小规模整数集合。
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
