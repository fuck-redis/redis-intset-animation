import React from 'react';
import { Trash2, GitBranch } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const DeleteOperation: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">删除操作</h1>
        <p className="chapter-subtitle">IntSet删除元素的实现细节</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">intsetRemove 函数</h2>
        <CodeBlock
          code={`intset *intsetRemove(intset *is, int64_t value, int *success) {
    uint8_t valenc = _intsetValueEncoding(value);  /* 获取值的编码 */
    uint32_t pos;
    if (success) *success = 0;

    /* 步骤1: 快速检查 - 编码不匹配则必定不存在 */
    if (valenc <= intrev32ifbe(is->encoding) &&
        intsetSearch(is,value,&pos)) {
        uint32_t len = intrev32ifbe(is->length);

        if (success) *success = 1;

        /* 步骤2: 移动后续元素覆盖删除位置 */
        if (pos < (len-1))
            intsetMoveTail(is,pos+1,pos);

        /* 步骤3: 缩小内存并更新长度 */
        is = intsetResize(is,len-1);
        is->length = intrev32ifbe(len-1);
    }
    return is;
}`}
          language="c"
          title="intset.c - intsetRemove"
        />

        {/* 代码执行流程 */}
        <div className="code-execution-flow">
          <h3 className="execution-flow-title">
            <GitBranch size={18} />
            删除操作执行流程详解
          </h3>

          <div className="execution-step">
            <span className="execution-step-number">1</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">确定编码并快速检查</h4>
              <p className="execution-step-desc">
                获取要删除值的编码，如果 valenc &gt; current encoding，
                说明该值不可能存在（IntSet只升级不降级），直接返回。
                这是O(1)的优化，避免不必要的查找。
              </p>
              <code className="execution-step-code">if (valenc &gt; is-&gt;encoding) return is; // 快速返回</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">2</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">二分查找元素位置</h4>
              <p className="execution-step-desc">
                编码检查通过后，调用intsetSearch查找元素。
                如果找到，pos为元素位置；未找到则不执行删除。
              </p>
              <code className="execution-step-code">if (intsetSearch(is,value,&amp;pos)) &#123;...&#125; // 找到才删除</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">3</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">标记删除成功</h4>
              <p className="execution-step-desc">
                即将执行删除操作，先将success标志设为1。
                后续任何一步失败都不会改变这个值。
              </p>
              <code className="execution-step-code">if (success) *success = 1;</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">4</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">移动后续元素</h4>
              <p className="execution-step-desc">
                调用intsetMoveTail将pos+1位置之后的所有元素
                向前移动到pos位置，覆盖被删除的元素。
              </p>
              <code className="execution-step-code">intsetMoveTail(is, pos+1, pos); // 元素前移</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">5</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">收缩内存并更新长度</h4>
              <p className="execution-step-desc">
                调用intsetResize缩小内存，然后更新length字段。
                注意：顺序是先Resize再更新length。
              </p>
              <code className="execution-step-code">is = intsetResize(is, len-1); is-&gt;length = len-1;</code>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">删除流程图</h2>
        <div className="flow-diagram">
          <div className="flow-step">编码检查</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">二分查找</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">移动元素</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">收缩内存</div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">删除示例演示</h2>
        <div className="section-content">
          <p>从 <code>[10, 20, 30, 40, 50]</code> 中删除 30 的过程：</p>
        </div>

        <div className="variable-tracker">
          <h4 className="variable-tracker-title">删除过程变量追踪</h4>
          <div className="variable-item">
            <span className="variable-name">初始状态</span>
            <span className="variable-value">[10, 20, 30, 40, 50], length=5</span>
            <span className="variable-desc">已按升序排列</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤1-2</span>
            <span className="variable-value">valenc检查通过, intsetSearch(30) 返回 pos=2</span>
            <span className="variable-desc">找到要删除的元素</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤4</span>
            <span className="variable-value">intsetMoveTail(is, 3, 2)</span>
            <span className="variable-desc">将索引3开始的元素[40,50]移动到索引2</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">最终状态</span>
            <span className="variable-value">[10, 20, 40, 50], length=4</span>
            <span className="variable-desc">删除成功，保持有序</span>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">特点</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Trash2 size={18} />
              不降级编码
            </h3>
            <p className="feature-card-content">
              删除大值后不会降级编码，保持稳定性，避免频繁的编码转换
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">立即释放内存</h3>
            <p className="feature-card-content">
              删除后立即调用realloc缩小内存，节省空间
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">O(1) 编码检查</h3>
            <p className="feature-card-content">
              通过编码比较快速判断元素是否存在，避免不必要的查找
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键优化</h2>

        <h3 className="section-subtitle">为什么先检查编码？</h3>
        <div className="section-content">
          <p>
            IntSet的编码只会升级不会降级。如果要删除的值的编码大于当前IntSet的编码，
            说明这个值一定不存在于集合中，可以直接返回，无需执行耗时的二分查找。
          </p>
        </div>

        <h3 className="section-subtitle">为什么使用 intsetMoveTail？</h3>
        <div className="section-content">
          <p>
            删除操作需要将pos+1位置之后的所有元素向前移动。intsetMoveTail使用memmove
            批量移动，比逐个移动效率高得多。这是典型的空间换时间策略。
          </p>
        </div>

        <h3 className="section-subtitle">为什么不检查pos边界？</h3>
        <div className="section-content">
          <p>
            因为intsetSearch已经找到了元素，pos必然在有效范围内 [0, length-1]。
            如果pos == length-1（最后一个元素），intsetMoveTail不会被调用，
            因为 pos &lt; (len-1) 条件不满足。这是正确的优化。
          </p>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>设计亮点：</strong>
          删除操作充分利用了IntSet的有序性特点，通过编码检查快速排除不存在的元素，
          通过批量移动减少内存操作开销。整体设计简洁高效。
        </div>
      </div>
    </div>
  );
};

export default DeleteOperation;
