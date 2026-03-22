import React from 'react';
import { Box, Info, AlertTriangle } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const DataStructure: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">数据结构定义</h1>
        <p className="chapter-subtitle">
          深入理解IntSet结构体的每个字段及其设计考量
        </p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">IntSet结构体定义</h2>
        <div className="section-content">
          <p>IntSet的结构体定义非常简洁，只有3个字段：</p>
        </div>

        <CodeBlock
          code={`typedef struct intset {
    uint32_t encoding;  /* 编码类型：INTSET_ENC_INT16/INT32/INT64 */
    uint32_t length;    /* 集合中的元素数量 */
    int8_t contents[];  /* 柔性数组成员，实际存储整数数据 */
} intset;`}
          language="c"
          title="intset.h"
        />
      </section>

      <section className="chapter-section">
        <h2 className="section-title">字段详解</h2>

        <h3 className="section-subtitle">1. encoding - 编码类型</h3>
        <div className="section-content">
          <p>
            <code>encoding</code>字段记录当前IntSet使用的编码类型，
            决定了contents数组中每个元素占用的字节数。
          </p>
        </div>

        <CodeBlock
          code={`#define INTSET_ENC_INT16 (sizeof(int16_t))  /* 值为 2 */
#define INTSET_ENC_INT32 (sizeof(int32_t))  /* 值为 4 */
#define INTSET_ENC_INT64 (sizeof(int64_t))  /* 值为 8 */`}
          language="c"
          title="编码常量定义"
        />

        <div className="info-box">
          <h3 className="info-box-title">
            <Info size={20} />
            为什么用sizeof而不是直接用数字？
          </h3>
          <div className="info-box-content">
            <p>
              使用<code>sizeof()</code>而不是硬编码数字，是为了代码的可移植性。
              虽然在现代系统上int16_t总是2字节，但使用sizeof可以让代码在不同平台上都能正确编译。
            </p>
          </div>
        </div>

        <h3 className="section-subtitle">2. length - 元素数量</h3>
        <div className="section-content">
          <p>
            <code>length</code>字段记录IntSet中存储的整数个数。
            这是一个32位无符号整数，理论上最多可以存储4,294,967,295个元素。
          </p>
          <p>
            <strong>为什么使用uint32_t而不是size_t？</strong>
          </p>
          <ul>
            <li>在32位和64位系统上保持一致的内存布局</li>
            <li>Redis的RDB持久化需要固定大小的字段</li>
            <li>实际应用中不会有超过40亿个元素的IntSet</li>
          </ul>
        </div>

        <h3 className="section-subtitle">3. contents[] - 柔性数组成员</h3>
        <div className="section-content">
          <p>
            <code>contents[]</code>是一个柔性数组成员（Flexible Array Member），
            这是C99标准引入的特性。它有以下特点：
          </p>
          <ul>
            <li>必须是结构体的最后一个成员</li>
            <li>不占用结构体的大小（sizeof(intset) == 8）</li>
            <li>实际数据紧跟在结构体后面，内存连续</li>
            <li>类型声明为int8_t[]，但实际按encoding类型解释</li>
          </ul>
        </div>

        <div className="warning-box">
          <h3 className="warning-box-title">
            <AlertTriangle size={20} />
            类型声明的巧妙之处
          </h3>
          <div className="warning-box-content">
            <p>
              contents声明为<code>int8_t[]</code>（1字节），但实际使用时会根据encoding
              转换为<code>int16_t*</code>、<code>int32_t*</code>或<code>int64_t*</code>。
              这样做是为了：
            </p>
            <ul>
              <li>提供一个统一的基础类型</li>
              <li>便于内存分配时的字节计算</li>
              <li>通过类型转换实现多态行为</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">内存布局详解</h2>
        <div className="section-content">
          <p>让我们看看不同编码下IntSet在内存中的实际布局：</p>
        </div>

        <h3 className="section-subtitle">INT16编码示例</h3>
        <CodeBlock
          code={`┌──────────────────────────────────────────────────────────┐
│ encoding: 2 (uint32_t, 4字节)                             │
├──────────────────────────────────────────────────────────┤
│ length: 3 (uint32_t, 4字节)                               │
├──────────────────────────────────────────────────────────┤
│ contents[0]: 1 (int16_t, 2字节)                          │
├──────────────────────────────────────────────────────────┤
│ contents[1]: 3 (int16_t, 2字节)                          │
├──────────────────────────────────────────────────────────┤
│ contents[2]: 5 (int16_t, 2字节)                          │
└──────────────────────────────────────────────────────────┘
总计: 8 (头部) + 6 (数据) = 14 字节`}
          language="c"
          title="存储 [1, 3, 5] 的INT16 IntSet"
        />

        <h3 className="section-subtitle">INT32编码示例</h3>
        <CodeBlock
          code={`┌──────────────────────────────────────────────────────────┐
│ encoding: 4 (uint32_t, 4字节)                             │
├──────────────────────────────────────────────────────────┤
│ length: 3 (uint32_t, 4字节)                               │
├──────────────────────────────────────────────────────────┤
│ contents[0]: 1 (int32_t, 4字节)                          │
├──────────────────────────────────────────────────────────┤
│ contents[1]: 40000 (int32_t, 4字节)                      │
├──────────────────────────────────────────────────────────┤
│ contents[2]: 80000 (int32_t, 4字节)                      │
└──────────────────────────────────────────────────────────┘
总计: 8 (头部) + 12 (数据) = 20 字节`}
          language="c"
          title="存储 [1, 40000, 80000] 的INT32 IntSet"
        />

        <h3 className="section-subtitle">INT64编码示例</h3>
        <CodeBlock
          code={`┌──────────────────────────────────────────────────────────┐
│ encoding: 8 (uint32_t, 4字节)                             │
├──────────────────────────────────────────────────────────┤
│ length: 2 (uint32_t, 4字节)                               │
├──────────────────────────────────────────────────────────┤
│ contents[0]: 1 (int64_t, 8字节)                          │
├──────────────────────────────────────────────────────────┤
│ contents[1]: 5000000000 (int64_t, 8字节)                 │
└──────────────────────────────────────────────────────────┘
总计: 8 (头部) + 16 (数据) = 24 字节`}
          language="c"
          title="存储 [1, 5000000000] 的INT64 IntSet"
        />
      </section>

      <section className="chapter-section">
        <h2 className="section-title">与传统数组的对比</h2>

        <table className="comparison-table">
          <thead>
            <tr>
              <th>特性</th>
              <th>传统数组（int* + length）</th>
              <th>IntSet（柔性数组）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>内存布局</td>
              <td>头部和数据分离，需要两次分配</td>
              <td>头部和数据连续，一次分配</td>
            </tr>
            <tr>
              <td>指针开销</td>
              <td>需要8字节指针（64位系统）</td>
              <td>无指针，直接连续存储</td>
            </tr>
            <tr>
              <td>缓存友好性</td>
              <td>可能导致缓存失效</td>
              <td>数据连续，缓存命中率高</td>
            </tr>
            <tr>
              <td>内存碎片</td>
              <td>可能产生两个碎片</td>
              <td>单个连续块</td>
            </tr>
            <tr>
              <td>访问速度</td>
              <td>需要解引用指针</td>
              <td>直接偏移计算</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">设计权衡</h2>

        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <Box size={20} />
              优势
            </h3>
            <div className="feature-card-content">
              <ul>
                <li>内存占用最小化</li>
                <li>缓存友好，性能优秀</li>
                <li>实现简单，易于理解</li>
                <li>适合小规模数据集</li>
              </ul>
            </div>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <AlertTriangle size={20} />
              限制
            </h3>
            <div className="feature-card-content">
              <ul>
                <li>插入/删除需要移动元素</li>
                <li>编码升级开销较大</li>
                <li>不适合大规模数据</li>
                <li>不支持负数优化存储</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">实际内存计算</h2>
        <div className="section-content">
          <p>IntSet占用的总内存可以通过以下公式计算：</p>
        </div>

        <CodeBlock
          code={`总内存 = sizeof(uint32_t) * 2 + encoding * length
       = 8 + encoding * length 字节

其中：
- sizeof(uint32_t) * 2 = 8 字节（encoding + length）
- encoding: 2/4/8 字节
- length: 元素数量`}
          language="c"
          title="内存计算公式"
        />

        <div className="info-box">
          <h3 className="info-box-title">
            <Info size={20} />
            示例计算
          </h3>
          <div className="info-box-content">
            <ul>
              <li>100个INT16元素：8 + 2 × 100 = 208 字节</li>
              <li>100个INT32元素：8 + 4 × 100 = 408 字节</li>
              <li>100个INT64元素：8 + 8 × 100 = 808 字节</li>
            </ul>
            <p>相比哈希表，IntSet在小数据集上有显著的内存优势。</p>
          </div>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>关键理解：</strong>
          IntSet的结构设计体现了"简单即美"的哲学。
          仅用3个字段就实现了一个高效的整数集合，
          柔性数组的使用更是C语言底层优化的典范。
        </div>
      </div>
    </div>
  );
};

export default DataStructure;
