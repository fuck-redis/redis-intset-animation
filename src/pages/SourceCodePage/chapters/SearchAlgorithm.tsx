import React from 'react';
import { Search, Zap, AlertCircle } from 'lucide-react';
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

        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">intset.c - intsetSearch</span>
          </div>
          <pre><code>{`static uint8_t intsetSearch(intset *is, int64_t value, uint32_t *pos) {
    int min = 0, max = intrev32ifbe(is->length)-1, mid = -1;
    int64_t cur = -1;

    /* 空集合的特殊处理 */
    if (intrev32ifbe(is->length) == 0) {
        if (pos) *pos = 0;
        return 0;
    } else {
        /* 检查值是否超出范围 */
        if (value > _intsetGet(is,max)) {
            if (pos) *pos = intrev32ifbe(is->length);
            return 0;
        } else if (value < _intsetGet(is,0)) {
            if (pos) *pos = 0;
            return 0;
        }
    }

    /* 二分查找主循环 */
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

    if (value == cur) {
        if (pos) *pos = mid;
        return 1;  /* 找到 */
    } else {
        if (pos) *pos = min;
        return 0;  /* 未找到，pos指向应插入位置 */
    }
}`}</code></pre>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">算法流程分析</h2>

        <ol className="steps-list">
          <li className="step-item">
            <h4 className="step-title">空集合检查</h4>
            <p className="step-description">
              首先检查IntSet是否为空。如果为空，直接返回0（未找到），并将插入位置设为0。
            </p>
          </li>

          <li className="step-item">
            <h4 className="step-title">边界值快速判断</h4>
            <p className="step-description">
              检查待查找值是否超出当前范围。如果大于最大值或小于最小值，
              直接返回失败并给出正确的插入位置（末尾或开头）。这个优化避免了不必要的二分查找。
            </p>
          </li>

          <li className="step-item">
            <h4 className="step-title">二分查找循环</h4>
            <p className="step-description">
              使用经典的二分查找算法。每次取中间位置，比较目标值与中间值的大小，
              缩小查找范围直到找到目标或范围为空。
            </p>
          </li>

          <li className="step-item">
            <h4 className="step-title">返回结果</h4>
            <p className="step-description">
              如果找到，返回1并设置pos为元素位置；
              如果未找到，返回0并设置pos为应该插入的位置（保持有序）。
            </p>
          </li>
        </ol>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键优化技巧</h2>

        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              1. 位运算计算中点
            </h3>
            <p className="feature-card-content">
              使用 <code>((unsigned int)min + (unsigned int)max) &gt;&gt; 1</code> 代替 <code>(min + max) / 2</code>。
              位移运算比除法快，转为unsigned防止整数溢出。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              2. 边界检查提前返回
            </h3>
            <p className="feature-card-content">
              先检查边界情况，对于超出范围的值直接返回，避免进入二分查找循环。
              这在插入场景中特别有效（很多插入值在边界）。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
              3. 复用查找结果
            </h3>
            <p className="feature-card-content">
              即使未找到元素，也返回应插入的位置。插入操作不需要再次查找，
              直接使用返回的位置即可，避免重复工作。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <Zap size={20} />
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
            <Search size={20} />
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
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">防止整数溢出</span>
          </div>
          <pre><code>{`mid = ((unsigned int)min + (unsigned int)max) >> 1;`}</code></pre>
        </div>
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
          <AlertCircle size={20} />
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
