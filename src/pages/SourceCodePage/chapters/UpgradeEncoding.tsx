import React from 'react';
import { ArrowUpCircle, AlertTriangle, GitBranch } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const UpgradeEncoding: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">编码升级</h1>
        <p className="chapter-subtitle">IntSet编码升级机制的深入分析</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">intsetUpgradeAndAdd 函数</h2>
        <CodeBlock
          code={`static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    /* 步骤1: 保存当前编码和新编码 */
    uint8_t curenc = intrev32ifbe(is->encoding);  /* 当前编码 */
    uint8_t newenc = _intsetValueEncoding(value); /* 新编码需要的编码 */
    int length = intrev32ifbe(is->length);
    int prepend = value < 0 ? 1 : 0;  /* 是否插入到头部 */

    /* 步骤2: 更新编码并扩展内存 */
    is->encoding = intrev32ifbe(newenc);
    is = intsetResize(is, intrev32ifbe(is->length) + 1);

    /* 步骤3: 从后向前迁移元素（关键：避免覆盖） */
    while(length--)
        _intsetSet(is, length + prepend,
                    _intsetGetEncoded(is, length, curenc));

    /* 步骤4: 插入新值（在开头或末尾） */
    if (prepend)
        _intsetSet(is, 0, value);
    else
        _intsetSet(is, intrev32ifbe(is->length), value);

    /* 步骤5: 更新长度 */
    is->length = intrev32ifbe(intrev32ifbe(is->length) + 1);
    return is;
}`}
          language="c"
          title="intset.c - intsetUpgradeAndAdd"
        />

        {/* 代码执行流程 */}
        <div className="code-execution-flow">
          <h3 className="execution-flow-title">
            <GitBranch size={18} />
            升级操作执行流程详解
          </h3>

          <div className="execution-step">
            <span className="execution-step-number">1</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">保存编码信息</h4>
              <p className="execution-step-desc">
                记录当前编码和需要的新编码。prepend标志表示新值是否应该插入到头部
                （当value &lt; 0时为1，否则为0）。
              </p>
              <code className="execution-step-code">curenc=2, newenc=4, prepend=0 (假设value=50000)</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">2</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">更新编码并扩展内存</h4>
              <p className="execution-step-desc">
                先更新encoding字段，再重新分配内存。
                注意：内存扩展是基于新的编码计算的，容量增加1。
              </p>
              <code className="execution-step-code">is-&gt;encoding = 4; is = intsetResize(is, length + 1);</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">3</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">逆序迁移数据（关键步骤）</h4>
              <p className="execution-step-desc">
                <strong>核心设计：</strong>从后向前迁移所有元素到新位置。
                prepend=0时，元素从索引0开始依次往后移动；
                prepend=1时，预留头部位置。
                <strong>逆序的原因：</strong>防止迁移过程中覆盖未迁移的数据。
              </p>
              <code className="execution-step-code">while(length--) _intsetSet(is, length + prepend, old_value);</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">4</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">插入触发升级的新值</h4>
              <p className="execution-step-desc">
                新值必然是当前最大或最小值，直接放在头部(prepend=1)或尾部。
                这利用了一个关键洞察：触发升级的值一定超出当前范围。
              </p>
              <code className="execution-step-code">_intsetSet(is, prepend ? 0 : length, value);</code>
            </div>
          </div>

          <div className="execution-step">
            <span className="execution-step-number">5</span>
            <div className="execution-step-content">
              <h4 className="execution-step-title">更新长度并返回</h4>
              <p className="execution-step-desc">
                长度加1后返回升级后的IntSet。
                注意：新值已经在步骤4写入，所以这里只更新length。
              </p>
              <code className="execution-step-code">is-&gt;length = intrev32ifbe(intrev32ifbe(is-&gt;length) + 1);</code>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">升级流程图</h2>
        <div className="flow-diagram">
          <div className="flow-step">保存编码</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">更新编码</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">扩展内存</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">逆序迁移</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">插入新值</div>
          <span className="flow-arrow">-&gt;</span>
          <div className="flow-step">更新长度</div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">升级示例演示</h2>
        <div className="section-content">
          <p>在 <code>[100, 200, 300]</code> (INT16) 中插入 50000 的升级过程：</p>
        </div>

        <div className="variable-tracker">
          <h4 className="variable-tracker-title">INT16 -&gt; INT32 升级过程</h4>
          <div className="variable-item">
            <span className="variable-name">初始</span>
            <span className="variable-value">[100, 200, 300], enc=INT16(2), len=3</span>
            <span className="variable-desc">所有元素都可用2字节存储</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">检测</span>
            <span className="variable-value">50000 需要 INT32(4) 编码</span>
            <span className="variable-desc">valenc(4) &gt; curenc(2)，触发升级</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤2</span>
            <span className="variable-value">更新 encoding=4，扩展内存</span>
            <span className="variable-desc">新空间 = 4 * 4 = 16字节（原来8字节）</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">步骤3</span>
            <span className="variable-value">逆序迁移: [300,200,100]</span>
            <span className="variable-desc">50000 &gt; 300，放在末尾</span>
          </div>
          <div className="variable-item">
            <span className="variable-name">最终</span>
            <span className="variable-value">[100, 200, 300, 50000], enc=INT32(4), len=4</span>
            <span className="variable-desc">升级完成，保持有序</span>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">为什么逆序迁移？</h2>
        <div className="section-content">
          <p>假设有INT16的 <code>[100, 200, 300]</code> 要升级到INT32：</p>
        </div>

        <CodeBlock
          code={`升级前 (INT16, 每个元素2字节):
┌────┬────┬────┐
│100 │200 │300 │
└────┴────┴────┘

升级后 (INT32, 每个元素4字节):
┌────┬────┬────┬────┐
│100 │200 │300 │ ?? │  <- 50000放这里
└────┴────┴────┴────┘

如果正序迁移 (错误):
第1个元素: 100 -> 位置0-3 (OK)
第2个元素: 200 -> 位置4-7 (OK)
第3个元素: 300 -> 位置8-11 (OK)

如果逆序迁移 (正确):
第3个元素: 300 -> 位置8-11 (OK)
第2个元素: 200 -> 位置4-7 (OK)
第1个元素: 100 -> 位置0-3 (OK)`}
          language="c"
          title="内存变化示意"
        />

        <div className="warning-box">
          <h3 className="warning-box-title">
            <AlertTriangle size={18} />
            关键设计点
          </h3>
          <div className="warning-box-content">
            <p>
              <strong>逆序迁移是为了避免数据覆盖。</strong>
              新编码下每个元素占用更多空间，如果正序迁移，
              后面的元素可能会覆盖还未迁移的旧数据。
              逆序保证了所有旧数据都被新数据覆盖前已经被读取。
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键优化</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <ArrowUpCircle size={18} />
              无需查找位置
            </h3>
            <p className="feature-card-content">
              触发升级的值必然是最大或最小值，直接放在边界无需二分查找
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">逆序迁移</h3>
            <p className="feature-card-content">
              从后向前迁移，避免新旧数据重叠导致的覆盖问题
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">单次升级</h3>
            <p className="feature-card-content">
              每次只升级一级（INT16→INT32或INT32→INT64），简化逻辑
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">利用洞察</h3>
            <p className="feature-card-content">
              触发升级的值一定超出当前范围，所以一定是最大或最小值
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">为什么不降级？</h2>
        <div className="warning-box">
          <h3 className="warning-box-title">
            <AlertTriangle size={18} />
            单向升级的设计权衡
          </h3>
          <div className="warning-box-content">
            <p><strong>不降级的原因：</strong></p>
            <ul>
              <li>降级需要扫描所有元素判断是否可降，开销大</li>
              <li>频繁升降级会导致性能不稳定</li>
              <li>实际应用中降级场景很少</li>
              <li>牺牲少量内存换取性能一致性</li>
            </ul>
            <p>
              <strong>实际例子：</strong>假设插入和删除交替进行，如果支持降级，
              每次删除大值后都要检查是否需要降级，增加了复杂度且收益有限。
            </p>
          </div>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>设计智慧：</strong>
          升级函数利用了一个关键洞察 - 触发升级的值必然超出当前范围，
          因此一定是最大或最小值，可以直接放在边界位置。
          逆序迁移的设计更是避免了潜在的数据覆盖bug。
        </div>
      </div>
    </div>
  );
};

export default UpgradeEncoding;
