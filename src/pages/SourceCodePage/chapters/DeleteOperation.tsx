import React from 'react';
import { Trash2 } from 'lucide-react';
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
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">intset.c</span>
          </div>
          <pre><code>{`intset *intsetRemove(intset *is, int64_t value, int *success) {
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 0;

    if (valenc <= intrev32ifbe(is->encoding) && 
        intsetSearch(is,value,&pos)) {
        uint32_t len = intrev32ifbe(is->length);
        if (success) *success = 1;

        if (pos < (len-1)) intsetMoveTail(is,pos+1,pos);
        is = intsetResize(is,len-1);
        is->length = intrev32ifbe(len-1);
    }
    return is;
}`}</code></pre>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">删除流程</h2>
        <ol className="steps-list">
          <li className="step-item">
            <h4 className="step-title">检查编码和查找元素</h4>
            <p className="step-description">如果值的编码大于当前编码，说明不可能存在</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">移动后续元素</h4>
            <p className="step-description">将删除位置后的元素向前移动覆盖</p>
          </li>
          <li className="step-item">
            <h4 className="step-title">缩小内存</h4>
            <p className="step-description">调用intsetResize释放多余内存</p>
          </li>
        </ol>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">特点</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Trash2 size={20} />
              不降级编码
            </h3>
            <p className="feature-card-content">
              删除大值后不会降级编码，保持稳定性
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">立即释放内存</h3>
            <p className="feature-card-content">
              删除后立即调用realloc缩小内存，节省空间
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeleteOperation;
