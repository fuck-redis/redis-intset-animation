import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';

const MemoryLayout: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>内存布局</h1>
      
      <section>
        <h2>C语言结构定义</h2>
        <CodeBlock 
          code={`typedef struct intset {
    uint32_t encoding;  // 编码类型：INTSET_ENC_INT16/INT32/INT64
    uint32_t length;    // 元素数量
    int8_t contents[];  // 柔性数组，实际存储整数的地方
} intset;`}
          language="c"
          title="C语言结构定义"
          showLineNumbers
        />
      </section>

      <section>
        <h2>内存布局示例</h2>
        <p>假设有一个IntSet存储 [5, 10, 15]，编码为INT16：</p>
        <ul>
          <li><strong>encoding</strong>：4字节，值为 INTSET_ENC_INT16</li>
          <li><strong>length</strong>：4字节，值为 3</li>
          <li><strong>contents</strong>：6字节（3个元素 × 2字节）</li>
          <li><strong>总内存</strong>：14字节</li>
        </ul>
      </section>

      <section>
        <h2>与HashTable对比</h2>
        <p>存储相同的3个整数：</p>
        <ul>
          <li><strong>IntSet</strong>：14字节</li>
          <li><strong>HashTable</strong>：约120字节（每个节点约40字节）</li>
          <li><strong>节省</strong>：约88% 的内存</li>
        </ul>
      </section>
    </div>
  );
};

export default MemoryLayout;
