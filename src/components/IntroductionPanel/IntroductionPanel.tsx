import React from 'react';
import { BookOpen, Target, Zap, TrendingUp, GitBranch } from 'lucide-react';
import './IntroductionPanel.css';

const IntroductionPanel: React.FC = () => {
  return (
    <div className="introduction-panel">
      <div className="intro-header">
        <BookOpen size={24} />
        <h2>什么是 Redis IntSet？</h2>
      </div>
      
      <div className="intro-content">
        <section className="intro-section">
          <p className="intro-lead">
            IntSet（整数集合）是Redis用于存储<strong>整数类型Set集合</strong>的底层数据结构之一。
            它通过<strong>紧凑的内存编码</strong>和<strong>有序存储</strong>，实现高效的空间利用和快速查找。
          </p>
        </section>

        <section className="intro-section">
          <h3><Target size={18} /> 核心特性</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h4>紧凑存储</h4>
              <p>根据整数范围自动选择最小编码（INT16/INT32/INT64），节省内存</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>有序维护</h4>
              <p>元素始终保持升序排列，支持O(log n)的二分查找</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>自动升级</h4>
              <p>插入超出范围的值时自动升级编码，无需手动干预</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h4>高效查询</h4>
              <p>利用二分查找算法，查询效率远超线性扫描</p>
            </div>
          </div>
        </section>

        <section className="intro-section">
          <h3><Zap size={18} /> Redis中的使用</h3>
          <div className="redis-usage">
            <div className="usage-condition">
              <h4>🎯 启用条件</h4>
              <ul>
                <li>所有元素都是<strong>整数值</strong></li>
                <li>元素数量 ≤ <code>set-max-intset-entries</code>（默认512）</li>
                <li>满足以上条件时，Redis自动使用IntSet作为Set的底层实现</li>
              </ul>
            </div>
            
            <div className="usage-example">
              <h4>💡 使用示例</h4>
              <pre><code>{`# 创建整数Set（自动使用IntSet）
SADD numbers 10 20 30 40 50

# 检查是否存在（O(log n)）
SISMEMBER numbers 30  # 返回 1

# 查看底层编码
OBJECT ENCODING numbers  # 返回 "intset"

# 添加非整数后会转换为hashtable
SADD numbers "hello"
OBJECT ENCODING numbers  # 返回 "hashtable"`}</code></pre>
            </div>
          </div>
        </section>

        <section className="intro-section">
          <h3><TrendingUp size={18} /> 性能特点</h3>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th>时间复杂度</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>查找（SISMEMBER）</td>
                  <td className="complexity">O(log n)</td>
                  <td>二分查找，效率高</td>
                </tr>
                <tr>
                  <td>插入（SADD）</td>
                  <td className="complexity">O(n)</td>
                  <td>需要移动元素保持有序</td>
                </tr>
                <tr>
                  <td>删除（SREM）</td>
                  <td className="complexity">O(n)</td>
                  <td>删除后需要填补空隙</td>
                </tr>
                <tr>
                  <td>编码升级</td>
                  <td className="complexity">O(n)</td>
                  <td>一次性升级，后续操作无影响</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="intro-section">
          <h3><GitBranch size={18} /> 编码升级机制</h3>
          <div className="encoding-flow">
            <div className="encoding-step">
              <div className="encoding-box int16">
                <strong>INT16</strong>
                <span>2字节</span>
                <small>-32,768 ~ 32,767</small>
              </div>
              <div className="arrow">→</div>
              <div className="encoding-box int32">
                <strong>INT32</strong>
                <span>4字节</span>
                <small>±21亿</small>
              </div>
              <div className="arrow">→</div>
              <div className="encoding-box int64">
                <strong>INT64</strong>
                <span>8字节</span>
                <small>±922亿亿</small>
              </div>
            </div>
            <p className="encoding-note">
              ⚠️ <strong>注意</strong>：编码升级是<strong>单向的</strong>，即使删除大值元素，编码也不会降级。
              这是Redis的设计权衡，避免频繁的编码转换开销。
            </p>
          </div>
        </section>

        <section className="intro-section best-practices">
          <h3>💡 最佳实践</h3>
          <div className="practice-list">
            <div className="practice-item good">
              <span className="practice-icon">✅</span>
              <div>
                <strong>适合使用IntSet的场景：</strong>
                <ul>
                  <li>存储用户ID集合</li>
                  <li>标签ID、分类ID等整数标识</li>
                  <li>时间戳集合（秒级）</li>
                  <li>元素数量较少（&lt;1000）的整数集合</li>
                </ul>
              </div>
            </div>
            <div className="practice-item bad">
              <span className="practice-icon">❌</span>
              <div>
                <strong>不适合使用IntSet的场景：</strong>
                <ul>
                  <li>频繁插入/删除操作（O(n)开销大）</li>
                  <li>大数据集（&gt;10000元素，考虑hashtable）</li>
                  <li>混合整数和字符串（会强制转为hashtable）</li>
                  <li>值范围跨度极大（会强制使用INT64）</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IntroductionPanel;
