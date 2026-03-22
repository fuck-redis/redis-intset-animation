import React from 'react';
import { Search, Zap, AlertCircle, GitBranch } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const SearchAlgorithm: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">查找算法</h1>
        <p className="chapter-subtitle">
          深入分析IntSet的二分查找实现及其优化技巧
        </p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">intsetSearch 函数</h2>
        <div className="section-content">
          <p>
            <code>intsetSearch</code>是IntSet查找功能的核心，它使用优化的二分查找算法。
            该函数不仅返回是否找到元素，还会返回元素的位置或应该插入的位置。
          </p>
        </div>

        <CodeBlock
          code={`static uint8_t intsetSearch(intset *is, int64_t value, uint32_t *pos) {
    int min = 0, max = intrev32ifbe(is->length)-1, mid = -1;
    int64_t cur = -1;

    /* 1. 空集合检查 - 处理边界情况 */
    if (intrev32ifbe(is->length) == 0) {
        if (pos) *pos = 0;
        return 0;
    }

    /* 2. 边界检查 - O(1) 快速判断，利用有序性 */
    if (value > _intsetGet(is,max)) {
        if (pos) *pos = intrev32ifbe(is->length);
        return 0;
    } else if (value < _intsetGet(is,0)) {
        if (pos) *pos = 0;
        return 0;
    }

    /* 3. 二分查找主循环 - 经典折半查找 */
    while(max >= min) {
        mid = ((unsigned int)min + (unsigned int)max) >> 1;
        cur = _intsetGet(is,mid);
        if (value > cur) {
            min = mid+1;
        } else if (value < cur) {
            max = mid-1;
        } else {
            break;
        }
    }

    /* 4. 返回结果 - 找到返回1，未找到返回插入位置 */
    if (value == cur) {
        if (pos) *pos = mid;
        return 1;  /* 找到目标 */
    } else {
        if (pos) *pos = min;
        return 0;  /* 未找到，pos指向应插入位置 */
    }
}`}
          language="c"
          title="intset.c - intsetSearch"
        />

        {/* 代码执行流程 */}
        <div className="code-execution-flow">
          <h3 className="execution-flow-title">
            <GitBranch size={18} />
            代码执行流程详解
          </h3>

          <div className="execution-step">
            <span className="execution-step-number">1</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">初始化变量</h4>
              <p className="execution-step-desc">
                设置 min=0, max=length-1, mid=-1, cur=-1。max-1确保在空集合时max=-1。
              </p>
              <code className="execution-step-code">min=0, max=6, mid=? (假设有7个元素)</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">2</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">空集合快速返回</h4>
              <p className="execution-step-desc">
                如果length==0，直接返回0并将pos设为0。避免后续访问无效内存。
              </p>
              <code className="execution-step-code">if (length == 0) return 0;</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">3</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">边界值检查</h4>
              <p className="execution-step-desc">
                如果value &gt; max 或 value &lt; min，说明不在范围内，直接返回插入位置。
                这是O(1)的优化，避免不必要的循环。
              </p>
              <code className="execution-step-code">if (value &gt; max) pos = length; // 插入末尾</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">4</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">二分查找循环</h4>
              <p className="execution-step-desc">
                使用位运算计算中点，比除法快。比较value与cur，调整搜索范围。
              </p>
              <code className="execution-step-code">mid = (min + max) &gt;&gt; 1; cur = contents[mid];</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">5</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">返回结果</h4>
              <p className="execution-step-desc">
                找到返回1和位置，未找到返回0和插入位置(保持有序)。
              </p>
              <code className="execution-step-code">return found ? 1 : 0;</code>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">算法流程图</h2>
        <div className="flow-diagram">
          <div className="flow-step">初始化变量</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">空集合检查</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">边界快速判断</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">二分循环</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">返回结果</div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">变量追踪示例</h2>
        <div className="section-content">
          <p>以在 <code>[1, 15, 23, 42, 56, 78, 89]</code> 中查找 42 为例：</p>
        </div>

        <div className="variable-tracker">
          <h4 className="variable-tracker-title">查找过程变量变化</h4>
          <div className="variable-item">
            <span className="variable-name">初始</span>
            <span className="variable-value">min=0, max=6, mid=?</span>
            <span className="variable-desc">7个元素，索引0-6</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">第1轮</span>
            <span className="variable-value">mid=3, cur=42</span>
            <span className="variable-desc">(0+6)&gt;&gt;1=3, contents[3]=42</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">比较</span>
            <span className="variable-value">42 == 42</span>
            <span className="variable-desc">找到！返回1，pos=3</span>
          </div>
        </div>

        <div className="variable-tracker">
          <h4 className="variable-tracker-title">查找35（不存在）</h4>
          <div className="variable-item">
            <span className="variable-name">第1轮</span>
            <span className="variable-value">mid=3, cur=42</span>
            <span className="variable-desc">35 &lt; 42，调整max</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">第2轮</span>
            <span className="variable-value">mid=1, cur=15</span>
            <span className="variable-desc">35 &gt; 15，调整min</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">第3轮</span>
            <span className="variable-value">mid=2, cur=23</span>
            <span className="variable-desc">35 &gt; 23，调整min</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">结果</span>
            <span className="variable-value">min=3, max=1</span>
            <span className="variable-desc">min &gt; max，退出循环，返回0，pos=3</span>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键优化技巧</h2>

        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={18} />
              1. 位运算计算中点
            </h3>
            <p className="feature-card-content">
              使用 <code>((unsigned int)min + (unsigned int)max) &gt;&gt; 1</code> 代替 <code>(min + max) / 2</code>。
              位移运算比除法快，转为unsigned防止整数溢出。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={18} />
              2. 边界检查提前返回
            </h3>
            <p className="feature-card-content">
              先检查边界情况，对于超出范围的值直接返回，避免进入二分查找循环。
              这在插入场景中特别有效（很多插入值在边界）。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={18} />
              3. 复用查找结果
            </h3>
            <p className="feature-card-content">
              即使未找到元素，也返回应插入的位置。插入操作不需要再次查找，
              直接使用返回的位置即可，避免重复工作。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={18} />
              4. 指针参数传递
            </h3>
            <p className="feature-card-content">
              使用指针参数<code>pos</code>返回位置信息，函数返回值用于表示成功与否。
              这种设计避免了使用复杂的返回结构体。
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">性能分析</h2>

        <h3 className="section-subtitle">时间复杂度</h3>
        <div className="section-content">
          <ul>
            <li><strong>最好情况</strong>：O(1) - 空集合或边界检查直接返回</li>
            <li><strong>平均情况</strong>：O(log n) - 标准二分查找</li>
            <li><strong>最坏情况</strong>：O(log n) - 需要完整的二分查找</li>
          </ul>
        </div>

        <h3 className="section-subtitle">空间复杂度</h3>
        <div className="section-content">
          <p>O(1) - 只使用了几个局部变量，不需要额外空间。</p>
        </div>

        <div className="info-box">
          <h3 className="info-box-title">
            <Search size={18} />
            实际性能表现
          </h3>
          <div className="info-box-content">
            <p>在实际使用中，由于边界检查的存在：</p>
            <ul>
              <li>查找最大/最小值：O(1)</li>
              <li>查找略大于最大值的元素：O(1)</li>
              <li>查找略小于最小值的元素：O(1)</li>
              <li>其他情况：O(log n)</li>
            </ul>
            <p>这些优化使得IntSet在许多常见场景下性能优于理论值。</p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">代码细节解读</h2>

        <h3 className="section-subtitle">为什么使用 unsigned int 转换？</h3>
        <CodeBlock
          code={`mid = ((unsigned int)min + (unsigned int)max) >> 1;`}
          language="c"
          title="防止整数溢出"
        />
        <div className="section-content">
          <p>
            在计算中点时，如果min和max都很大（接近INT_MAX），直接相加可能导致有符号整数溢出。
            转换为unsigned int后，即使溢出也能得到正确的结果（模2^32运算）。
          </p>
        </div>

        <h3 className="section-subtitle">为什么要单独处理空集合？</h3>
        <div className="section-content">
          <p>
            空集合时<code>max = -1</code>，如果不特殊处理，
            进入while循环条件<code>max &gt;= min</code>会不满足，
            但后续的cur值是未定义的。提前处理避免了这个问题。
          </p>
        </div>

        <h3 className="section-subtitle">返回插入位置的巧妙设计</h3>
        <div className="section-content">
          <p>
            查找失败时返回<code>min</code>作为插入位置是精心设计的：
          </p>
          <ul>
            <li>如果value小于所有元素，最终min=0</li>
            <li>如果value大于所有元素，最终min=length</li>
            <li>如果value在中间，min指向第一个大于value的位置</li>
          </ul>
          <p>在任何情况下，min都是保持有序的正确插入位置。</p>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">与标准二分查找的对比</h2>

        <table className="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>标准二分查找</th>
              <th>IntSet实现</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>边界检查</td>
              <td>通常没有</td>
              <td>有，提前返回</td>
            </tr>
            <tr>
              <td>中点计算</td>
              <td>(min + max) / 2</td>
              <td>位运算 + unsigned防溢出</td>
            </tr>
            <tr>
              <td>未找到时返回</td>
              <td>返回-1或NULL</td>
              <td>返回插入位置</td>
            </tr>
            <tr>
              <td>空集合处理</td>
              <td>可能有问题</td>
              <td>专门处理</td>
            </tr>
            <tr>
              <td>代码健壮性</td>
              <td>一般</td>
              <td>考虑了边界情况</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="warning-box">
        <h3 className="warning-box-title">
          <AlertCircle size={18} />
          常见误区
        </h3>
        <div className="warning-box-content">
          <p><strong>误区1：</strong>认为二分查找很简单，随便写就能工作。</p>
          <p>
            实际上，正确实现二分查找需要注意很多细节，如边界条件、溢出问题等。
            Redis的实现展示了工业级代码应该如何处理这些问题。
          </p>
          <p><strong>误区2：</strong>忽视边界检查的性能优势。</p>
          <p>
            边界检查不仅是正确性保证，在很多场景下还能显著提升性能，
            尤其是顺序插入或查找边界值的场景。
          </p>
        </div>
      </div>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>学习要点：</strong>
          IntSet的查找算法虽然基于经典的二分查找，但在细节上做了多处优化。
          这些优化不仅提升了性能，还增强了代码的健壮性。
          建议对照标准二分查找实现，仔细体会每个优化的意图。
        </div>
      </div>
    </div>
  );
};

export default SearchAlgorithm;
