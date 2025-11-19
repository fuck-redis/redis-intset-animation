import React from 'react';
import { PlusCircle } from 'lucide-react';
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
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">intset.c - intsetAdd</span>
          </div>
          <pre><code>{`intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 1;

    if (valenc > intrev32ifbe(is->encoding)) {
        return intsetUpgradeAndAdd(is,value);
    } else {
        if (intsetSearch(is,value,&pos)) {
            if (success) *success = 0;
            return is;
        }
        is = intsetResize(is,intrev32ifbe(is->length)+1);
        if (pos < intrev32ifbe(is->length))
            intsetMoveTail(is,pos,pos+1);
    }
    _intsetSet(is,pos,value);
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}`}</code></pre>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">插入流程</h2>
        <ol className="steps-list">
          <li className="step-item">
            <h4 className="step-title">判断编码并检查升级</h4>
            <p className="step-description">确定新值编码，如需升级则调用升级函数</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">查找插入位置</h4>
            <p className="step-description">使用二分查找，如已存在则直接返回</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">扩展内存并移动元素</h4>
            <p className="step-description">调整内存大小，移动元素为新值腾出空间</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">设置新值</h4>
            <p className="step-description">在正确位置插入新值并更新长度</p>
          </li>
        </ol>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">性能分析</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <PlusCircle size={20} />
              时间复杂度
            </h3>
            <p className="feature-card-content">
              O(n) - 主要开销在移动元素上，最坏情况需要移动所有元素
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
    </div>
  );
};

export default InsertOperation;
