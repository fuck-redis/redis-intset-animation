import React from 'react';
import { PlusCircle, GitBranch, Clock } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const InsertOperation: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">插入操作</h1>
        <p className="chapter-subtitle">详解IntSet插入元素的完整流程和内存管理</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">intsetAdd 函数</h2>
        <CodeBlock
          code={`intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    /* 步骤1: 确定新值的编码类型 */
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 1;

    /* 步骤2: 判断是否需要升级编码 - O(n)操作 */
    if (valenc > intrev32ifbe(is->encoding)) {
        return intsetUpgradeAndAdd(is,value);  /* 触发升级 */
    }

    /* 步骤3: 查找插入位置（同时检查元素是否存在） */
    if (intsetSearch(is,value,&pos)) {
        if (success) *success = 0;  /* 已存在，不重复插入 */
        return is;
    }

    /* 步骤4: 扩展内存空间 */
    is = intsetResize(is,intrev32ifbe(is->length)+1);

    /* 步骤5: 移动元素腾出空间 - 使用memmove批量移动 */
    if (pos < intrev32ifbe(is->length))
        intsetMoveTail(is,pos,pos+1);

    /* 步骤6: 写入新值并更新长度 */
    _intsetSet(is,pos,value);
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}`}
          language="c"
          title="intset.c - intsetAdd"
        />

        {/* 代码执行流程 */}
        <div className="code-execution-flow">
          <h3 className="execution-flow-title">
            <GitBranch size={18} />
            插入操作执行流程详解
          </h3>

          <div className="execution-step">
            <span className="execution-step-number">1</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">确定编码类型</h4>
              <p className="execution-step-desc">
                调用<code>_intsetValueEncoding()</code>确定新值需要哪种编码。
                返回值可能是2(INT16)、4(INT32)或8(INT64)。
              </p>
              <code className="execution-step-code">valenc = _intsetValueEncoding(50000); // 返回4 (INT32)</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">2</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">检查是否需要升级</h4>
              <p className="execution-step-desc">
                如果valenc &gt; current encoding，必须先升级再插入。
                升级是O(n)操作，需要迁移所有现有元素。
              </p>
              <code className="execution-step-code">if (valenc &gt; is-&gt;encoding) return intsetUpgradeAndAdd(...)</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">3</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">二分查找插入位置</h4>
              <p className="execution-step-desc">
                调用intsetSearch查找位置。如果元素已存在，直接返回（不插入重复值）。
                未找到时，pos指向应插入的位置。
              </p>
              <code className="execution-step-code">if (intsetSearch(is,value,&pos)) return is; // 已存在</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">4</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">扩展内存</h4>
              <p className="execution-step-desc">
                调用intsetResize分配更多内存。新的enc * (length+1)字节空间。
                使用realloc尝试就地扩展，避免数据拷贝。
              </p>
              <code className="execution-step-code">is = intsetResize(is, length + 1);</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">5</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">移动元素腾出空间</h4>
              <p className="execution-step-desc">
                intsetMoveTail使用memmove批量移动pos之后的所有元素到pos+1位置。
                这是O(n)操作，但memmove会用最优方式完成。
              </p>
              <code className="execution-step-code">intsetMoveTail(is, pos, pos+1); // 腾出插入位置</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">6</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">写入新值并更新长度</h4>
              <p className="execution-step-desc">
                _intsetSet在pos位置写入新值，然后length++。
                注意：length的读写都需要intrev32ifbe转换字节序。
              </p>
              <code className="execution-step-code">_intsetSet(is, pos, value); is-&gt;length++;</code>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">插入流程图</h2>
        <div className="flow-diagram">
          <div className="flow-step">确定编码</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">检查升级</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">查找位置</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">扩展内存</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">移动元素</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">写入值</div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">插入示例演示</h2>
        <div className="section-content">
          <p>在 <code>[10, 20, 30, 40, 50]</code> 中插入 35 的过程：</p>
        </div>

        <div className="variable-tracker">
          <h4 className="variable-tracker-title">插入过程变量追踪</h4>
          <div className="variable-item">
            <span className="variable-name">初始状态</span>
            <span className="variable-value">[10, 20, 30, 40, 50], length=5, encoding=INT16</span>
            <span className="variable-desc">已按升序排列</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤1</span>
            <span className="variable-value">valenc = 2 (35可以用INT16存储)</span>
            <span className="variable-desc">编码检查通过，无需升级</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤3</span>
            <span className="variable-value">intsetSearch(35) 返回 pos=2</span>
            <span className="variable-desc">35应该插在30之后(索引2)</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤4</span>
            <span className="variable-value">扩展到 length+1 = 6</span>
            <span className="variable-desc">分配6个元素的空间</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤5</span>
            <span className="variable-value">移动 [40, 50] 到索引 [3, 4]</span>
            <span className="variable-desc">腾出索引2的位置</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">最终状态</span>
            <span className="variable-value">[10, 20, 30, 35, 40, 50], length=6</span>
            <span className="variable-desc">插入成功，保持有序</span>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">性能分析</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <PlusCircle size={18} />
              时间复杂度
            </h3>
            <p className="feature-card-content">
              O(n) - 主要开销在移动元素上，最坏情况需要移动所有元素
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Clock size={18} />
              各步骤复杂度
            </h3>
            <p className="feature-card-content">
              编码检查: O(1) | 升级检查: O(1) | 查找: O(log n) | 内存扩展: O(n) | 元素移动: O(n)
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">优化技巧</h3>
            <p className="feature-card-content">
              使用memmove批量移动、search返回插入位置避免重复查找
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键代码解析</h2>

        <h3 className="section-subtitle">为什么要先检查编码？</h3>
        <div className="section-content">
          <p>
            如果新值的编码大于当前IntSet的编码，说明当前空间不足以存储新值，
            必须先升级。这种情况触发升级的概率很低，但一旦发生就是O(n)操作。
          </p>
        </div>

        <h3 className="section-subtitle">intsetMoveTail 的作用</h3>
        <div className="section-content">
          <p>
            这是一个使用memmove实现的批量移动函数，比逐个移动元素效率高得多。
            它将pos位置之后的所有元素向右移动一位，腾出插入位置。
          </p>
        </div>

        <h3 className="section-subtitle">为什么成功/失败状态用指针参数？</h3>
        <div className="section-content">
          <p>
            函数需要同时返回结果（IntSet指针）和成功状态。如果只用返回值表示成功，
            就无法区分成功插入和内存分配失败的情况。用指针参数解决了这个问题。
          </p>
        </div>

        <h3 className="section-subtitle">为什么检查元素是否已存在？</h3>
        <div className="section-content">
          <p>
            IntSet作为集合，不允许重复元素。在查找位置时就一并检查了元素是否存在，
            如果存在就直接返回，避免后续无意义的内存操作。
          </p>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>设计亮点：</strong>
          插入操作充分利用了查找函数返回插入位置的设计，避免了重复的二分查找。
          同时通过检查编码升级和元素存在性，将各种边界情况都处理得恰到好处。
        </div>
      </div>
    </div>
  );
};

export default InsertOperation;
