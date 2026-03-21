import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import VideoEmbed from '../../../components/VideoEmbed';
import { MemoryLayoutVideo, MemoryCalculationVideo, MemoryCompareVideo, LittleEndianVideo, StructVisualizationVideo } from '../../../videos';

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

        <VideoEmbed
          title="结构体可视化"
          description="查看 IntSet 结构体字段的内存布局"
          component={StructVisualizationVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <VideoEmbed
        title="内存布局演示"
        description="点击查看 IntSet 内存结构"
        component={MemoryLayoutVideo}
        props={{ encoding: 'INT16', length: 5 }}
        autoplay={true}
      />

      <VideoEmbed
        title="小端序存储演示"
        description="查看整数在内存中的小端序存储方式"
        component={LittleEndianVideo}
        props={{ value: 0x1234, encoding: 'INT16' }}
        autoplay={true}
      />

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

      <VideoEmbed
        title="内存计算示例"
        description="查看 IntSet 内存计算过程"
        component={MemoryCalculationVideo}
        props={{ encoding: 'INT16', length: 3 }}
        autoplay={true}
      />

      <section>
        <h2>与HashTable对比</h2>
        <p>存储相同的3个整数：</p>
        <ul>
          <li><strong>IntSet</strong>：14字节</li>
          <li><strong>HashTable</strong>：约120字节（每个节点约40字节）</li>
          <li><strong>节省</strong>：约88% 的内存</li>
        </ul>

        <VideoEmbed
          title="内存占用对比动画"
          description="动态展示 IntSet 与 HashTable 的内存占用差异"
          component={MemoryCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>
    </div>
  );
};

export default MemoryLayout;
