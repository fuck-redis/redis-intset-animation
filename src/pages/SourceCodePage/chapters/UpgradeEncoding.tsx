import React from 'react';
import { ArrowUpCircle, AlertTriangle } from 'lucide-react';
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
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">intset.c</span>
          </div>
          <pre><code>{`static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    uint8_t curenc = intrev32ifbe(is->encoding);
    uint8_t newenc = _intsetValueEncoding(value);
    int length = intrev32ifbe(is->length);
    int prepend = value < 0 ? 1 : 0;

    is->encoding = intrev32ifbe(newenc);
    is = intsetResize(is,intrev32ifbe(is->length)+1);

    while(length--)
        _intsetSet(is,length+prepend,_intsetGetEncoded(is,length,curenc));

    if (prepend)
        _intsetSet(is,0,value);
    else
        _intsetSet(is,intrev32ifbe(is->length),value);
        
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}`}</code></pre>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">升级流程</h2>
        <ol className="steps-list">
          <li className="step-item">
            <h4 className="step-title">更新编码类型</h4>
            <p className="step-description">将IntSet的encoding字段更新为新编码</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">扩展内存</h4>
            <p className="step-description">按新编码大小重新分配内存</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">从后向前迁移</h4>
            <p className="step-description">逆序迁移所有元素避免覆盖</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">插入新值</h4>
            <p className="step-description">在开头或末尾插入触发升级的值</p>
          </li>
        </ol>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键优化</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <ArrowUpCircle size={20} />
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
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">为什么不降级？</h2>
        <div className="warning-box">
          <h3 className="warning-box-title">
            <AlertTriangle size={20} />
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
          </div>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>设计智慧：</strong>
          升级函数利用了一个关键洞察 - 触发升级的值必然超出当前范围，
          因此一定是最大或最小值，可以直接放在边界位置。
        </div>
      </div>
    </div>
  );
};

export default UpgradeEncoding;
