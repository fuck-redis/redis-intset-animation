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
        <p>
          IntSet的底层实现是一个紧凑的C语言结构体。理解其内存布局有助于深入了解Redis的内存优化策略。
        </p>

        <CodeBlock
          code={`typedef struct intset {
    uint32_t encoding;  // 编码类型：INTSET_ENC_INT16/INT32/INT64
    uint32_t length;    // 元素数量
    int8_t contents[];  // 柔性数组，实际存储整数的地方
} intset;

// 关键点：
// 1. encoding 和 length 各占 4 字节（固定头部）
// 2. contents 是柔性数组，不占实际空间
// 3. 实际数据紧跟在结构体后面连续存储`}
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

      <section>
        <h2>内存布局详解</h2>
        <p>假设有一个IntSet存储 [5, 10, 15]，编码为INT16，让我们详细分析其内存布局：</p>

        <div className="memory-viz">
{`内存地址        字段           值              说明
─────────────────────────────────────────────────
0x0000         encoding      0x00000002      INT16编码（值为2）
0x0004         length        0x00000003      3个元素
0x0008         contents[0]   0x0005          第一个元素：5
0x000A         contents[1]   0x000A          第二个元素：10
0x000C         contents[2]   0x000F          第三个元素：15

总内存占用：4 + 4 + (3 × 2) = 14 字节`}
        </div>

        <h3>内存布局详细解读</h3>
        <p>让我们一步步分析内存中的每个字节：</p>

        <ol className="process-steps">
          <li>
            <strong>地址 0x0000-0x0003（encoding字段）</strong>
            <p>占用4字节，存储编码类型常量：</p>
            <ul>
              <li>INT16 = 2（二进制 00000010）</li>
              <li>INT32 = 4（二进制 00000100）</li>
              <li>INT64 = 8（二进制 00001000）</li>
            </ul>
          </li>
          <li>
            <strong>地址 0x0004-0x0007（length字段）</strong>
            <p>占用4字节，存储元素数量。上例中 length=3 表示有3个元素。</p>
          </li>
          <li>
            <strong>地址 0x0008 开始（contents柔性数组）</strong>
            <p>实际存储整数的数据区域。每个元素占用字节数由encoding决定：</p>
            <ul>
              <li>INT16：每个元素2字节</li>
              <li>INT32：每个元素4字节</li>
              <li>INT64：每个元素8字节</li>
            </ul>
          </li>
        </ol>

        <h3>实战：计算你的IntSet内存占用</h3>
        <p>使用以下公式计算IntSet的理论内存占用：</p>

        <CodeBlock
          code={`# 内存计算公式
总内存 = 8字节（固定头部）+ (元素数量 × 每元素字节数)

# 每元素字节数由编码决定：
# INT16 = 2字节/元素
# INT32 = 4字节/元素
# INT64 = 8字节/元素

# 示例1：100个INT16编码的元素
总内存 = 8 + (100 × 2) = 208字节

# 示例2：100个INT32编码的元素
总内存 = 8 + (100 × 4) = 408字节

# 示例3：100个INT64编码的元素
总内存 = 8 + (100 × 8) = 808字节

# 实际Redis验证
127.0.0.1:6379> SADD test_100 1 2 3 ... 100
(integer) 100
127.0.0.1:6379> MEMORY USAGE test_100
(integer) 288  # ≈ 8 + 100*2.8（包含Redis对象头）`}
          language="bash"
          title="内存计算实战"
        />

        <h3>不同编码的实际内存对比</h3>
        <CodeBlock
          code={`# 场景：存储1000个用户ID

# 方案1：使用INT16（如果ID在0-65535范围内）
理论内存 = 8 + (1000 × 2) = 2008字节 ≈ 2KB

# 方案2：使用INT32（如果ID在0-21亿范围内）
理论内存 = 8 + (1000 × 4) = 4008字节 ≈ 4KB

# 方案3：使用INT64（如雪花算法ID）
理论内存 = 8 + (1000 × 8) = 8008字节 ≈ 8KB

# 对比HashTable
理论内存 = 1000 × 48 = 48000字节 ≈ 47KB

# IntSet（INT32）vs HashTable节省比例
(47KB - 4KB) / 47KB = 91.5%`}
          language="bash"
          title="内存对比示例"
        />
      </section>

      <VideoEmbed
        title="小端序存储演示"
        description="查看整数在内存中的小端序存储方式"
        component={LittleEndianVideo}
        props={{ value: 0x1234, encoding: 'INT16' }}
        autoplay={true}
      />

      <section>
        <h2>小端序（Little Endian）存储</h2>
        <p>
          Redis使用小端序存储整数，这意味着<strong>低位字节存储在低地址</strong>。
          这与现代CPU的内存访问方式一致，可以提高存取效率。
        </p>

        <div className="example-box">
          <h4>数字 0x1234 在内存中的存储（INT16）</h4>
          <CodeBlock
          code={`# 大端序（Big Endian）存储：
内存地址:  0x00    0x01
存储值:    0x12    0x34

# 小端序（Little Endian）存储：Redis使用这种
内存地址:  0x00    0x01
存储值:    0x34    0x12

# 为什么Redis使用小端序？
# 1. 大多数现代CPU（x86、x64）为小端序
# 2. 硬件层面直接支持，转换效率高
# 3. 读取时直接从低地址开始即可`}
          language="c"
        />
        </div>
      </section>

      <VideoEmbed
        title="内存计算示例"
        description="查看 IntSet 内存计算过程"
        component={MemoryCalculationVideo}
        props={{ encoding: 'INT16', length: 3 }}
        autoplay={true}
      />

      <section>
        <h2>内存计算公式</h2>
        <p>IntSet的内存占用可以通过以下公式计算：</p>

        <div className="info-box">
          <h4>内存计算公式</h4>
          <p>
            <strong>总内存 = 8字节（头部）+ (元素数量 × 每元素字节数)</strong>
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>编码类型</th>
              <th>每元素字节数</th>
              <th>100元素内存</th>
              <th>1000元素内存</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>INT16</td>
              <td>2字节</td>
              <td>208字节</td>
              <td>2008字节</td>
            </tr>
            <tr>
              <td>INT32</td>
              <td>4字节</td>
              <td>408字节</td>
              <td>4008字节</td>
            </tr>
            <tr>
              <td>INT64</td>
              <td>8字节</td>
              <td>808字节</td>
              <td>8008字节</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>与HashTable对比</h2>
        <p>
          让我们详细对比IntSet和HashTable的内存占用。HashTable的每个节点需要存储键、值、指针等额外信息。
        </p>

        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>IntSet</th>
              <th>HashTable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>每元素内存</td>
              <td>2-8字节（取决于编码）</td>
              <td>约40-48字节（键值对+指针）</td>
            </tr>
            <tr>
              <td>额外开销</td>
              <td>8字节（只有头部）</td>
              <td>哈希桶数组（8-16个桶）</td>
            </tr>
            <tr>
              <td>内存布局</td>
              <td>连续内存</td>
              <td>分散的节点 + 桶数组</td>
            </tr>
          </tbody>
        </table>

        <div className="example-box">
          <h4>实际对比：存储5个整数 [1, 15, 23, 42, 56]</h4>
          <CodeBlock
          code={`# IntSet 内存计算（INT16编码）
头部: 8字节
数据: 5 × 2 = 10字节
总计: 18字节

# HashTable 内存计算
节点1: 40字节 (8字节指针 + 8字节键 + 8字节值 + 16字节元数据)
节点2-5: 同上
桶数组: 8 × 8 = 64字节
总计: 5 × 40 + 64 = 264字节

# 节省内存比例
IntSet: 18字节
HashTable: 264字节
节省比例: (264-18)/264 = 93%`}
          language="bash"
          title="内存对比"
        />

        <VideoEmbed
          title="内存占用对比动画"
          description="动态展示 IntSet 与 HashTable 的内存占用差异"
          component={MemoryCompareVideo}
          props={{}}
          autoplay={true}
        />
        </div>
      </section>

      <section>
        <h2>为什么IntSet更节省内存？</h2>
        <ol className="process-steps">
          <li><strong>连续存储</strong>：元素紧密排列，无指针开销</li>
          <li><strong>无键值分离</strong>：只存值，不存键（集合元素即键）</li>
          <li><strong>动态编码</strong>：根据数值大小选择最小编码</li>
          <li><strong>无哈希冲突</strong>：有序数组通过二分查找定位，无需哈希计算</li>
        </ol>

        <div className="key-points">
          <h4>适用场景建议</h4>
          <p>
            IntSet的内存优势在<strong>小数据量</strong>时最为明显。
            当元素数量超过512时，Redis会自动转为HashTable以保证性能。
          </p>
        </div>
      </section>
    </div>
  );
};

export default MemoryLayout;
