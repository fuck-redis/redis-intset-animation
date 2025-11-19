import React from 'react';
import { Zap } from 'lucide-react';
import '../chapters/ChapterStyles.css';

const Optimization: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">性能优化技巧</h1>
        <p className="chapter-subtitle">Redis IntSet实现中的性能优化手法总结</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">核心优化技巧</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              1. 柔性数组成员
            </h3>
            <p className="feature-card-content">
              避免额外指针，数据紧凑连续，提高缓存命中率
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              2. 位运算优化
            </h3>
            <p className="feature-card-content">
              使用<code>&gt;&gt;1</code>代替<code>/2</code>，指令级加速
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              3. 边界检查提前返回
            </h3>
            <p className="feature-card-content">
              先检查边界再二分查找，常见场景更快
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              4. 批量内存操作
            </h3>
            <p className="feature-card-content">
              使用memmove批量移动，比逐个复制快数倍
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              5. 查找结果复用
            </h3>
            <p className="feature-card-content">
              search返回插入位置，避免重复查找
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              6. 升级位置优化
            </h3>
            <p className="feature-card-content">
              升级时新值在边界，无需查找位置
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">内存优化</h2>
        <div className="section-content">
          <ul>
            <li><strong>自适应编码</strong> - 根据值选最小编码</li>
            <li><strong>延迟分配</strong> - 需要时才分配contents内存</li>
            <li><strong>立即收缩</strong> - 删除后立即释放多余内存</li>
            <li><strong>固定头部</strong> - 头部只占8字节</li>
          </ul>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">代码级优化</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>优化技巧</th>
              <th>实现方式</th>
              <th>效果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>静态内联函数</td>
              <td>关键函数用static</td>
              <td>减少函数调用开销</td>
            </tr>
            <tr>
              <td>分支预测</td>
              <td>把常见情况放前面</td>
              <td>CPU分支预测更准确</td>
            </tr>
            <tr>
              <td>避免重复计算</td>
              <td>缓存encoding/length</td>
              <td>减少内存访问</td>
            </tr>
            <tr>
              <td>字节序处理</td>
              <td>编译期宏展开</td>
              <td>零运行时开销</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>性能哲学：</strong>
          IntSet的优化体现了"积少成多"的思想，每个小优化单独看不明显，
          但组合起来带来显著的性能提升。这些技巧值得应用到自己的代码中。
        </div>
      </div>
    </div>
  );
};

export default Optimization;
