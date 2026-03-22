import React from 'react';
import { FileCode } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const Creation: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">创建与初始化</h1>
        <p className="chapter-subtitle">IntSet的创建过程和初始状态设置</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">intsetNew 函数</h2>
        <CodeBlock
          code={`intset *intsetNew(void) {
    intset *is = zmalloc(sizeof(intset));
    is->encoding = intrev32ifbe(INTSET_ENC_INT16);
    is->length = 0;
    return is;
}`}
          language="c"
          title="intset.c"
        />

        <div className="section-content">
          <p>创建新IntSet只需三步：</p>
          <ul>
            <li>分配sizeof(intset)大小的内存（8字节）</li>
            <li>设置编码为INT16（最节省内存）</li>
            <li>设置长度为0（空集合）</li>
          </ul>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">设计要点</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <FileCode size={20} />
              默认INT16编码
            </h3>
            <p className="feature-card-content">
              新建IntSet默认使用最小编码，后续根据插入值自动升级
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">延迟分配</h3>
            <p className="feature-card-content">
              contents数组不预分配，在第一次插入时才分配内存
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Creation;
