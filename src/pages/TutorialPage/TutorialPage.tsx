import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, Play } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock/CodeBlock';
import Alert from '../../components/Alert/Alert';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import {
  BinarySearchVideo,
  EncodingUpgradeVideo,
  MemoryLayoutVideo,
  InsertOperationVideo,
  DeleteOperationVideo,
} from '../../videos';
import './TutorialPage.css';

const VIDEO_CONFIGS: VideoConfig[] = [
  {
    id: 'memory-layout',
    title: 'IntSet 内存布局',
    description: '详解 Header 和数据区的内存结构',
    component: MemoryLayoutVideo,
    props: { encoding: 'INT16', length: 5 },
  },
  {
    id: 'encoding-upgrade',
    title: '编码升级机制',
    description: 'INT16 → INT32 → INT64 自动升级过程',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 50000 },
  },
  {
    id: 'binary-search',
    title: '二分查找算法',
    description: 'O(log n) 时间复杂度的查找过程',
    component: BinarySearchVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
  },
  {
    id: 'insert-operation',
    title: '插入操作详解',
    description: '二分查找 → 编码检查 → 元素移动 → 写入新值',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] },
  },
  {
    id: 'delete-operation',
    title: '删除操作详解',
    description: '二分查找 → 标记删除 → 元素左移',
    component: DeleteOperationVideo,
    props: { operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] },
  },
];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  videoId?: string;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <h2>{title}</h2>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  );
};

const VideoSection: React.FC<{ videoId: string }> = ({ videoId }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);
  const video = VIDEO_CONFIGS.find((v) => v.id === videoId);

  if (!video) return null;

  return (
    <>
      <div className="video-section">
        <div className="video-section-header">
          <Video size={20} />
          <span>视频讲解</span>
        </div>
        <button className="video-play-btn" onClick={() => setSelectedVideo(video)}>
          <Play size={16} />
          播放视频
        </button>
      </div>
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  );
};

const TutorialPage: React.FC = () => {
  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        <div className="tutorial-header">
          <h1>IntSet 完整教程</h1>
          <p className="tutorial-subtitle">
            从零开始，系统学习Redis IntSet数据结构的原理、实现和最佳实践
          </p>
        </div>

        <CollapsibleSection title="1. IntSet是什么？" defaultOpen={true}>
          <div className="content-block">
            <h3>定义</h3>
            <p>
              IntSet（Integer Set，整数集合）是Redis用于存储<strong>整数类型Set集合</strong>的底层数据结构之一。
              它是一个<strong>有序的</strong>、<strong>紧凑的</strong>整数数组，专门为了节省内存而设计。
            </p>

            <Alert type="tip" title="核心思想">
              IntSet通过<strong>动态编码</strong>和<strong>有序存储</strong>实现了内存和性能的平衡。
              它会根据存储的整数范围自动选择最小的编码类型，从而最大化内存利用率。
            </Alert>

            <h3>为什么需要IntSet？</h3>
            <p>在Redis中，Set类型可以用两种底层实现：</p>
            <ul>
              <li><strong>HashTable</strong>：通用哈希表，查找O(1)但内存开销大</li>
              <li><strong>IntSet</strong>：整数专用，内存高效但插入删除O(n)</li>
            </ul>

            <p>
              当Set满足以下条件时，Redis会自动选择IntSet：
            </p>
            <ol>
              <li>所有元素都是<strong>整数值</strong></li>
              <li>元素数量不超过<code>set-max-intset-entries</code>（默认512）</li>
            </ol>

            <CodeBlock 
              code={`# redis.conf配置项
set-max-intset-entries 512  # 超过此值自动转为hashtable`}
              language="bash"
              title="Redis配置"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="2. 编码类型详解" defaultOpen={true}>
          <div className="content-block">
            <h3>三种编码类型</h3>
            <p>IntSet支持三种整数编码，会根据存储值的范围自动选择：</p>

            <div className="encoding-comparison">
              <div className="encoding-card int16-bg">
                <h4>INT16 (2字节)</h4>
                <div className="encoding-details">
                  <div className="detail-row">
                    <span className="label">取值范围：</span>
                    <span className="value">-32,768 ~ 32,767</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">十六进制：</span>
                    <span className="value">0x8000 ~ 0x7FFF</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">内存占用：</span>
                    <span className="value">2字节/元素</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">适用场景：</span>
                    <span className="value">用户ID、小型标签ID</span>
                  </div>
                </div>
              </div>

              <div className="encoding-card int32-bg">
                <h4>INT32 (4字节)</h4>
                <div className="encoding-details">
                  <div className="detail-row">
                    <span className="label">取值范围：</span>
                    <span className="value">-2,147,483,648 ~ 2,147,483,647</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">十六进制：</span>
                    <span className="value">0x80000000 ~ 0x7FFFFFFF</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">内存占用：</span>
                    <span className="value">4字节/元素</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">适用场景：</span>
                    <span className="value">时间戳（秒级）、大型ID</span>
                  </div>
                </div>
              </div>

              <div className="encoding-card int64-bg">
                <h4>INT64 (8字节)</h4>
                <div className="encoding-details">
                  <div className="detail-row">
                    <span className="label">取值范围：</span>
                    <span className="value">±9,223,372,036,854,775,807</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">十六进制：</span>
                    <span className="value">0x8000...0000 ~ 0x7FFF...FFFF</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">内存占用：</span>
                    <span className="value">8字节/元素</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">适用场景：</span>
                    <span className="value">时间戳（毫秒级）、超大ID</span>
                  </div>
                </div>
              </div>
            </div>

            <h3>编码升级机制</h3>
            <p>
              当插入的值超出当前编码范围时，IntSet会自动升级到更大的编码。
              这是一个<strong>单向过程</strong>，即编码只能升级不能降级。
            </p>

            <div className="upgrade-flow">
              <div className="flow-step">
                <div className="flow-box int16-bg">
                  <strong>INT16</strong>
                  <span>初始编码</span>
                </div>
                <div className="flow-condition">
                  插入值 &gt; 32767 或 &lt; -32768
                </div>
              </div>
              <div className="flow-arrow">↓</div>
              <div className="flow-step">
                <div className="flow-box int32-bg">
                  <strong>INT32</strong>
                  <span>升级后</span>
                </div>
                <div className="flow-condition">
                  插入值 &gt; 2^31-1 或 &lt; -2^31
                </div>
              </div>
              <div className="flow-arrow">↓</div>
              <div className="flow-step">
                <div className="flow-box int64-bg">
                  <strong>INT64</strong>
                  <span>最终编码</span>
                </div>
              </div>
            </div>

            <Alert type="warning" title="重要特性：编码不可降级">
              <p>
                即使删除了导致升级的大值元素，编码也不会降级回原来的类型。
                这是Redis的设计权衡，避免频繁的编码转换带来的性能开销。
              </p>
              <CodeBlock 
                code={`# 示例
SADD myset 1 2 3          # INT16编码
SADD myset 100000         # 升级到INT32
SREM myset 100000         # 删除大值
OBJECT ENCODING myset     # 仍然是INT32，不会降级`}
                language="bash"
              />
            </Alert>

            <VideoSection videoId="encoding-upgrade" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="3. 内存布局" defaultOpen={false}>
          <div className="content-block">
            <h3>IntSet结构体</h3>
            <p>IntSet在内存中的布局非常紧凑：</p>

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

            <h3>内存计算</h3>
            <p>IntSet的总内存占用 = <code>8字节（固定头部）+ length × encoding字节数</code></p>

            <div className="memory-example">
              <h4>示例：存储[1, 2, 3, 4, 5]</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>编码类型</th>
                    <th>头部</th>
                    <th>数据区</th>
                    <th>总计</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>INT16</td>
                    <td>8字节</td>
                    <td>5 × 2 = 10字节</td>
                    <td><strong>18字节</strong></td>
                  </tr>
                  <tr>
                    <td>INT32</td>
                    <td>8字节</td>
                    <td>5 × 4 = 20字节</td>
                    <td><strong>28字节</strong></td>
                  </tr>
                  <tr>
                    <td>INT64</td>
                    <td>8字节</td>
                    <td>5 × 8 = 40字节</td>
                    <td><strong>48字节</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>与HashTable对比</h3>
            <p>HashTable存储相同的5个整数大约需要<strong>120-200字节</strong>（包含节点指针、哈希值等开销）</p>
            <p>
              可见，对于小规模整数集合，IntSet的内存效率是HashTable的<strong>6-10倍</strong>！
            </p>

            <VideoSection videoId="memory-layout" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="4. 核心操作详解" defaultOpen={false}>
          <div className="content-block">
            <h3>插入操作（intsetAdd）</h3>
            <div className="algorithm-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-desc">
                  <strong>检查编码范围</strong>
                  <p>判断新值是否超出当前编码范围，如果是则升级编码</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-desc">
                  <strong>二分查找位置</strong>
                  <p>在有序数组中使用二分查找定位插入位置，复杂度O(log n)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-desc">
                  <strong>移动元素</strong>
                  <p>将插入位置后的所有元素向后移动一位，复杂度O(n)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-desc">
                  <strong>插入新值</strong>
                  <p>在空出的位置插入新元素，更新length</p>
                </div>
              </div>
            </div>

            <div className="complexity-box">
              <h4>时间复杂度分析</h4>
              <ul>
                <li><strong>无需升级</strong>：O(n) - 主要是移动元素的开销</li>
                <li><strong>需要升级</strong>：O(n) - 需要重新分配内存并迁移所有元素</li>
              </ul>
            </div>

            <h3>查找操作（intsetFind）</h3>
            <p>IntSet使用<strong>二分查找</strong>算法：</p>
            <CodeBlock 
              code={`// 伪代码
function binarySearch(value):
    left = 0
    right = length - 1
    
    while left <= right:
        mid = (left + right) / 2
        current = contents[mid]
        
        if current == value:
            return true       // 找到
        else if current < value:
            left = mid + 1
        else:
            right = mid - 1
    
    return false             // 未找到`}
              language="python"
              title="二分查找算法"
              showLineNumbers
            />

            <div className="complexity-box">
              <h4>时间复杂度：O(log n)</h4>
              <p>
                对于100个元素，最多比较7次；对于1000个元素，最多比较10次。
                相比线性查找O(n)，在大数据集上优势明显。
              </p>
            </div>

            <h3>删除操作（intsetRemove）</h3>
            <p>删除过程与插入类似，但方向相反：</p>
            <ol>
              <li>二分查找要删除的元素位置</li>
              <li>将后续所有元素向前移动覆盖</li>
              <li>减少length，释放内存（如需要）</li>
            </ol>

            <Alert type="warning" title="注意">
              删除操作不会触发编码降级，即使删除后所有元素都在小范围内。
            </Alert>

            <VideoSection videoId="insert-operation" />
            <VideoSection videoId="delete-operation" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="5. 性能特点" defaultOpen={false}>
          <div className="content-block">
            <h3>操作复杂度对比</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>操作</th>
                  <th>IntSet</th>
                  <th>HashTable</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>查找（SISMEMBER）</td>
                  <td className="complexity-good">O(log n)</td>
                  <td className="complexity-best">O(1)</td>
                  <td>HashTable更快，但IntSet也很高效</td>
                </tr>
                <tr>
                  <td>插入（SADD）</td>
                  <td className="complexity-warn">O(n)</td>
                  <td className="complexity-best">O(1)</td>
                  <td>IntSet需要移动元素</td>
                </tr>
                <tr>
                  <td>删除（SREM）</td>
                  <td className="complexity-warn">O(n)</td>
                  <td className="complexity-best">O(1)</td>
                  <td>IntSet需要移动元素</td>
                </tr>
                <tr>
                  <td>内存占用</td>
                  <td className="complexity-best">很低</td>
                  <td className="complexity-warn">较高</td>
                  <td>IntSet内存效率是HashTable的6-10倍</td>
                </tr>
                <tr>
                  <td>遍历性能</td>
                  <td className="complexity-best">O(n)且缓存友好</td>
                  <td className="complexity-warn">O(n)但缓存不友好</td>
                  <td>IntSet连续内存，缓存命中率高</td>
                </tr>
              </tbody>
            </table>

            <h3>使用建议</h3>
            <div className="decision-tree">
              <div className="decision-node">
                <div className="question">元素是否都是整数？</div>
                <div className="branches">
                  <div className="branch">
                    <div className="answer no">❌ 否</div>
                    <div className="result">使用HashTable</div>
                  </div>
                  <div className="branch">
                    <div className="answer yes">✅ 是</div>
                    <div className="sub-question">
                      <div className="question">元素数量是否 &lt; 512？</div>
                      <div className="branches">
                        <div className="branch">
                          <div className="answer no">❌ 否</div>
                          <div className="result">可能转为HashTable</div>
                        </div>
                        <div className="branch">
                          <div className="answer yes">✅ 是</div>
                          <div className="sub-question">
                            <div className="question">是否频繁插入/删除？</div>
                            <div className="branches">
                              <div className="branch">
                                <div className="answer yes">✅ 是</div>
                                <div className="result">考虑调大阈值或用HashTable</div>
                              </div>
                              <div className="branch">
                                <div className="answer no">❌ 否</div>
                                <div className="result best">✨ IntSet最佳选择</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="6. Redis实战" defaultOpen={false}>
          <div className="content-block">
            <h3>查看底层编码</h3>
            <CodeBlock 
              code={`# 创建整数Set
127.0.0.1:6379> SADD numbers 1 2 3 4 5
(integer) 5

# 查看底层编码
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"

# 查看内存占用
127.0.0.1:6379> MEMORY USAGE numbers
(integer) 94  # 包含Redis对象头的总内存`}
              language="bash"
              title="查看底层编码"
            />

            <h3>触发编码升级</h3>
            <CodeBlock 
              code={`# 初始INT16编码
127.0.0.1:6379> SADD ids 100 200 300
(integer) 3
127.0.0.1:6379> OBJECT ENCODING ids
"intset"

# 插入超出INT16范围的值
127.0.0.1:6379> SADD ids 50000
(integer) 1

# 编码已升级到INT32
127.0.0.1:6379> DEBUG OBJECT ids
Value at:0x7f... encoding:intset serializedlength:22 ...

# 删除大值后编码不降级
127.0.0.1:6379> SREM ids 50000
(integer) 1
127.0.0.1:6379> OBJECT ENCODING ids
"intset"  # 仍然是intset，但编码已是INT32`}
              language="bash"
              title="触发编码升级"
            />

            <h3>转换为HashTable</h3>
            <CodeBlock 
              code={`# 添加非整数元素
127.0.0.1:6379> SADD myset 1 2 3
(integer) 3
127.0.0.1:6379> OBJECT ENCODING myset
"intset"

# 添加字符串
127.0.0.1:6379> SADD myset "hello"
(integer) 1
127.0.0.1:6379> OBJECT ENCODING myset
"hashtable"  # 已转换为hashtable

# 或者超过数量阈值
127.0.0.1:6379> SADD bigset {1..600}
(integer) 600
127.0.0.1:6379> OBJECT ENCODING bigset
"hashtable"  # 超过512个元素自动转换`}
              language="bash"
              title="转换为HashTable"
            />

            <h3>配置优化</h3>
            <CodeBlock 
              code={`# 调整IntSet使用阈值（默认512）
# 如果你的Set通常很小且读多写少，可以适当增大
set-max-intset-entries 1024

# 如果频繁插入删除，可以适当减小
set-max-intset-entries 256

# 重启Redis后生效
# 或者运行时修改：
CONFIG SET set-max-intset-entries 1024`}
              language="bash"
              title="redis.conf"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="7. 常见问题FAQ" defaultOpen={false}>
          <div className="content-block">
            <div className="faq-item">
              <h4>Q1: IntSet为什么不能降级编码？</h4>
              <p>
                <strong>A:</strong> 这是性能和复杂度的权衡。如果支持降级，每次删除都要检查是否可以降级，
                这会带来额外的性能开销。Redis选择了更简单高效的单向升级策略。
              </p>
            </div>

            <div className="faq-item">
              <h4>Q2: IntSet的元素是如何保持有序的？</h4>
              <p>
                <strong>A:</strong> 通过插入时的二分查找和元素移动。每次插入都会找到正确的位置，
                然后移动后续元素为新元素腾出空间。虽然插入是O(n)，但这保证了查找是O(log n)。
              </p>
            </div>

            <div className="faq-item">
              <h4>Q3: 什么时候IntSet会转换为HashTable？</h4>
              <p>
                <strong>A:</strong> 两种情况：<br/>
                1. 添加了非整数元素（如字符串）<br/>
                2. 元素数量超过<code>set-max-intset-entries</code>配置值（默认512）<br/>
                注意：转换是<strong>不可逆</strong>的，转为HashTable后不会再转回IntSet。
              </p>
            </div>

            <div className="faq-item">
              <h4>Q4: IntSet适合存储哪些数据？</h4>
              <p>
                <strong>A:</strong> 最适合：<br/>
                ✅ 用户ID集合（如在线用户、活跃用户）<br/>
                ✅ 文章ID、商品ID等业务ID<br/>
                ✅ 标签ID、分类ID<br/>
                ✅ 日期时间戳（秒级）<br/>
                ✅ 小规模（&lt;512）的整数集合
              </p>
            </div>

            <div className="faq-item">
              <h4>Q5: 如何判断当前Set使用的是IntSet还是HashTable？</h4>
              <p>
                <strong>A:</strong> 使用<code>OBJECT ENCODING</code>命令：
              </p>
              <CodeBlock 
                code={`127.0.0.1:6379> OBJECT ENCODING myset
"intset"  # 或 "hashtable"`}
                language="bash"
              />
            </div>

            <div className="faq-item">
              <h4>Q6: IntSet的编码升级会影响性能吗？</h4>
              <p>
                <strong>A:</strong> 升级时会有一次O(n)的开销（重新分配内存+迁移数据），
                但这是一次性的。升级后的操作性能不变，只是内存占用增加了。
                如果你的应用确实频繁触发升级，说明数据范围变化较大，可能HashTable更合适。
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="8. 字节序与二进制存储" defaultOpen={false}>
          <div className="content-block">
            <h3>小端序（Little Endian）存储</h3>
            <p>
              IntSet使用<strong>小端序（Little Endian）</strong>存储整数，即低位字节在前，高位字节在后。
              这是Redis在大多数平台上的选择，因为小端序在x86架构上读取效率更高。
            </p>

            <div className="encoding-comparison">
              <div className="encoding-card int16-bg">
                <h4>INT16 小端序示例</h4>
                <div className="encoding-details">
                  <div className="detail-row">
                    <span className="label">十进制：</span>
                    <span className="value">258</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">INT16 HEX：</span>
                    <span className="value">0x0102</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">内存存储：</span>
                    <span className="value">02 01</span>
                  </div>
                </div>
              </div>

              <div className="encoding-card int32-bg">
                <h4>INT32 小端序示例</h4>
                <div className="encoding-details">
                  <div className="detail-row">
                    <span className="label">十进制：</span>
                    <span className="value">0x12345678</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">INT32 HEX：</span>
                    <span className="value">0x12345678</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">内存存储：</span>
                    <span className="value">78 56 34 12</span>
                  </div>
                </div>
              </div>
            </div>

            <h3>为什么选择小端序？</h3>
            <ul>
              <li><strong>CPU读取效率</strong>：x86/x64架构是小端序，CPU直接读取无需转换</li>
              <li><strong>类型转换简单</strong>：对于int16转int32，小端序只需扩展高字节</li>
              <li><strong>跨平台兼容</strong>：Redis会自动处理不同平台的字节序问题</li>
            </ul>

            <Alert type="info" title="字节序与排序">
              <p>
                重要的是：<strong>小端序不影响IntSet的有序性</strong>。
                IntSet的比较操作是基于整数值进行的，而不是基于字节序列。
                元素始终按照整数大小升序排列。
              </p>
            </Alert>

            <h3>负数的二进制表示</h3>
            <p>负数在计算机中使用<strong>补码（Two's Complement）</strong>表示：</p>

            <CodeBlock
              code={`# INT8 负数示例（8位）
+1  = 00000001
-1  = 11111111  （补码：取反 + 1）

# -128 的二进制
128 = 10000000
-128 = 10000000  （在INT8中，-128和128的二进制相同）

# 验证负数在小端序下的存储
# 值 -1 (INT16)：0xFFFF -> 内存存储：FF FF
# 值 -128 (INT16)：0xFF80 -> 内存存储：80 FF`}
              language="bash"
              title="负数补码表示"
            />

            <div className="complexity-box">
              <h4>负数比较规则</h4>
              <p>
                在IntSet中，负数的排序遵循标准整数比较规则：
                <code>-5 &lt; -3 &lt; 0 &lt; 3 &lt; 5</code>
              </p>
              <p>
                因为负数的补码形式在数学比较时与有符号整数比较规则一致。
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="9. 扩容机制详解" defaultOpen={false}>
          <div className="content-block">
            <h3>扩容策略</h3>
            <p>
              IntSet的扩容并不是简单的+1增长，而是采用<strong>预分配策略</strong>。
              当容量不足时，Redis会分配更大的缓冲区以减少未来扩容的次数。
            </p>

            <div className="encoding-card int32-bg">
              <h4>容量增长公式</h4>
              <div className="encoding-details">
                <div className="detail-row">
                  <span className="label">初始容量：</span>
                  <span className="value">4个元素</span>
                </div>
                <div className="detail-row">
                  <span className="label">扩容时机：</span>
                  <span className="value">容量满时</span>
                </div>
                <div className="detail-row">
                  <span className="label">增长倍数：</span>
                  <span className="value">约2倍</span>
                </div>
                <div className="detail-row">
                  <span className="label">容量序列：</span>
                  <span className="value">4 → 8 → 16 → 32 → 64 → 128 → 256 → 512...</span>
                </div>
              </div>
            </div>

            <h3>扩容触发条件</h3>
            <p>扩容发生在<strong>插入操作</strong>时，当且仅当：</p>
            <ol>
              <li>当前数组已满（length == capacity）</li>
              <li>需要插入新元素</li>
            </ol>

            <Alert type="warning" title="扩容性能开销">
              <p>
                扩容时需要：<br/>
                1. 分配更大的内存空间<br/>
                2. 将所有元素从旧编码转换为新编码（如果是升级场景）<br/>
                3. 使用memmove移动数据到新地址<br/>
                总体复杂度：<strong>O(n)</strong>
              </p>
            </Alert>

            <h3>扩容与升级的关系</h3>
            <p>
              <strong>扩容不一定升级，升级也不一定扩容。</strong>
            </p>
            <ul>
              <li><strong>扩容不升级</strong>：当前编码可以容纳新值，只是容量不够</li>
              <li><strong>升级不扩容</strong>：新值超出当前编码范围，但当前容量足够</li>
              <li><strong>同时扩容和升级</strong>：新值超出编码范围，且容量也不足</li>
            </ul>

            <h3>内存分配计算</h3>
            <CodeBlock
              code={`// 内存计算公式
总字节数 = sizeof(uint32_t) + sizeof(uint32_t) + (元素个数 × 单元素字节数)
         = 4 + 4 + (length × encoding_bytes)
         = 8 + (length × encoding_bytes)

// 示例：INT16编码，100个元素
总字节数 = 8 + (100 × 2) = 208字节

// 如果升级到INT32
总字节数 = 8 + (100 × 4) = 408字节`}
              language="c"
              title="内存计算"
              showLineNumbers
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="10. 元素唯一性与去重机制" defaultOpen={false}>
          <div className="content-block">
            <h3>为什么IntSet不会有重复元素？</h3>
            <p>
              IntSet保证每个元素都是<strong>唯一的</strong>，这是通过插入算法中的一个关键步骤实现的：
            </p>

            <div className="algorithm-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-desc">
                  <strong>二分查找定位</strong>
                  <p>使用二分查找在有序数组中找到新元素的"应该插入的位置"</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-desc">
                  <strong>检查元素是否存在</strong>
                  <p>如果该位置已有元素且值相等，说明元素已存在，直接返回（不插入）</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-desc">
                  <strong>仅在不存在时插入</strong>
                  <p>只有当查找结果为"不存在"时才执行插入操作</p>
                </div>
              </div>
            </div>

            <h3>源码逻辑</h3>
            <CodeBlock
              code={`// intsetAdd 核心逻辑（伪代码）
function intsetAdd(iset, value):
    // 1. 检查是否需要升级编码
    encoding = _intsetEncodingForValue(iset, value)

    // 2. 二分查找
    pos = intsetSearch(iset, value)

    // 3. ！！！关键：检查元素是否已存在
    if pos < iset.length and iset.contents[pos] == value:
        return 0  // 元素已存在，不插入

    // 4. 扩容（如需要）
    iset = intsetResize(iset, iset.length + 1)

    // 5. 移动元素腾出位置
    if pos < iset.length:
        memmove(iset.contents[pos+1], iset.contents[pos], ...)

    // 6. 插入新值
    iset.contents[pos] = value
    iset.length++
    return 1`}
              language="c"
              title="intsetAdd 核心逻辑"
              showLineNumbers
            />

            <Alert type="tip" title="时间复杂度">
              <p>
                由于二分查找的复杂度是<strong>O(log n)</strong>，检查重复的代价很小。
                即使元素已存在，也只需要O(log n)的时间。
              </p>
            </Alert>

            <h3>与Redis Set命令的关系</h3>
            <p>
              当你执行<code>SADD myset 1 2 3 3 3</code>时：
            </p>
            <ul>
              <li>Redis会解析出4个元素：1, 2, 3, 3, 3</li>
              <li>对于每个元素，调用intsetAdd</li>
              <li>第一次插入3成功，第二次和第三次发现已存在，忽略</li>
              <li>最终结果：myset包含 &#123;1, 2, 3&#125;</li>
            </ul>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="11. 批量操作与原子性" defaultOpen={false}>
          <div className="content-block">
            <h3>Redis命令的原子性保证</h3>
            <p>
              IntSet的所有操作都是<strong>原子性的</strong>。Redis使用单线程模型，
              保证每个命令的执行不会被其他命令打断。
            </p>

            <h3>SADD批量添加</h3>
            <CodeBlock
              code={`# 原子性示例
127.0.0.1:6379> SADD myset 1 2 3 4 5
(integer) 5

# 这个命令执行过程中，不会被其他命令插入
# 要么全部完成，要么全部不完成`}
              language="bash"
              title="SADD原子性"
            />

            <h3>竞态条件示例</h3>
            <Alert type="warning" title="客户端竞态">
              <p>
                <strong>注意：</strong>以下操作在两个客户端间不是原子的：
              </p>
              <CodeBlock
                code={`# 客户端A                         # 客户端B
SISMEMBER myset 1                      SISMEMBER myset 1
-> 0 (不存在)                          -> 0 (不存在)
SADD myset 1                           SADD myset 1
-> 1 (成功)                             -> 0 (失败，因为A已经插入了)
# 客户端B的SISMEMBER检查和SADD之间存在时间窗口`}
                language="bash"
                title="竞态条件"
              />
              <p>
                这是客户端逻辑问题，不是Redis服务端的问题。
                Redis命令本身是原子的，但客户端逻辑需要自行保证原子性。
              </p>
            </Alert>

            <h3>事务中的IntSet操作</h3>
            <CodeBlock
              code={`# 使用MULTI/EXEC保证原子性
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379> SADD myset 1 2 3
QUEUED
127.0.0.1:6379> SMEMBERS myset
QUEUED
127.0.0.1:6379> EXEC
1) (integer) 3
2) 1) "1"
   2) "2"
   3) "3"

# 整个事务是原子的，EXEC会原子性地执行所有命令`}
              language="bash"
              title="事务原子性"
            />

            <h3>管道（Pipeline）的原子性</h3>
            <p>
              Redis Pipeline 虽然可以批量发送命令，但<strong>每个命令仍然是独立执行的</strong>。
              如果需要批量原子性，应该使用事务（MULTI/EXEC）或Lua脚本。
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="12. IntSet vs SkipList vs HashTable" defaultOpen={false}>
          <div className="content-block">
            <h3>Redis三种Set底层实现对比</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>IntSet</th>
                  <th>HashTable</th>
                  <th>SkipList</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>使用条件</strong></td>
                  <td>全是整数 + ≤512元素</td>
                  <td>通用场景</td>
                  <td>Sorted Set专用</td>
                </tr>
                <tr>
                  <td><strong>元素类型</strong></td>
                  <td>仅整数</td>
                  <td>任意类型</td>
                  <td>任意类型 + 分数</td>
                </tr>
                <tr>
                  <td><strong>查找复杂度</strong></td>
                  <td className="complexity-good">O(log n)</td>
                  <td className="complexity-best">O(1)</td>
                  <td className="complexity-good">O(log n)</td>
                </tr>
                <tr>
                  <td><strong>插入复杂度</strong></td>
                  <td className="complexity-warn">O(n)</td>
                  <td className="complexity-best">O(1)</td>
                  <td className="complexity-good">O(log n)</td>
                </tr>
                <tr>
                  <td><strong>内存占用</strong></td>
                  <td className="complexity-best">极低</td>
                  <td className="complexity-warn">较高</td>
                  <td className="complexity-warn">最高</td>
                </tr>
                <tr>
                  <td><strong>有序性</strong></td>
                  <td>是（整数升序）</td>
                  <td>否</td>
                  <td>是（按分数排序）</td>
                </tr>
                <tr>
                  <td><strong>范围查询</strong></td>
                  <td>支持（二分）</td>
                  <td>不支持</td>
                  <td>支持（高效）</td>
                </tr>
              </tbody>
            </table>

            <h3>为什么Sorted Set不用IntSet？</h3>
            <p>
              Sorted Set需要存储<strong>元素+分数</strong>的对应关系，而IntSet只能存整数。
              如果强行用IntSet实现Sorted Set：
            </p>
            <ul>
              <li>无法存储分数信息</li>
              <li>无法实现字典序排序</li>
              <li>无法支持ZRANK等按分数排名的操作</li>
            </ul>

            <h3>SkipList结构详解</h3>
            <CodeBlock
              code={`// Redis中SkipList节点结构
typedef struct zskiplistNode {
    sds ele;              // 元素值（字符串）
    double score;          // 分數
    struct zskiplistNode *backward;  // 前驱指针
    struct zskiplistLevel {
        struct zskiplistNode *forward;  // 层级前向指针
        unsigned long span;              // 跨度
    } level[];              // 多层索引
} zskiplistNode;

// SkipList保证O(log n)插入/删除/查找
// 但每个节点占用更多内存（多层指针 + 字符串存储）`}
              language="c"
              title="SkipList结构"
              showLineNumbers
            />

            <Alert type="info" title="选择建议">
              <p>
                普通Set：IntSet（整数小集合）→ HashTable（大集合或含非整数）<br/>
                有序Set：SkipList（由ziplist或skiplist实现，元素多时自动转换）
              </p>
            </Alert>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="13. 扩展实战场景" defaultOpen={false}>
          <div className="content-block">
            <h3>场景一：验证码/激活码存储</h3>
            <CodeBlock
              code={`# 场景：存储已使用的验证码
# 验证码通常是6位数字字符串，但我们可以用整数哈希后存储

SADD used_codes 123456 234567 345678

# 判断验证码是否已使用 - O(log n)
SISMEMBER used_codes 123456
-> 1 (已使用)

SISMEMBER used_codes 999999
-> 0 (未使用)

# 查看所有已使用验证码
SMEMBERS used_codes`}
              language="bash"
              title="验证码存储"
            />

            <h3>场景二：用户在线状态追踪</h3>
            <CodeBlock
              code={`# 场景：追踪当前在线用户ID
# 用户ID通常是自增整数，非常适合IntSet

# 用户登录
SADD online_users 1001 1002 1003

# 用户登出
SREM online_users 1002

# 检查用户是否在线 - O(log n)
SISMEMBER online_users 1001
-> 1 (在线)

# 统计在线人数 - O(1)
SCARD online_users
-> 2

# 获取所有在线用户
SMEMBERS online_users`}
              language="bash"
              title="在线用户追踪"
            />

            <h3>场景三：标签反向索引</h3>
            <CodeBlock
              code={`# 场景：根据标签ID快速查找文章
# 文章有多个标签，用Set存储文章ID集合

# 标签1的文章集合
SADD tag:1:articles 101 102 103

# 标签2的文章集合
SADD tag:2:articles 102 103 104

# 查询同时拥有标签1和标签2的文章（集合交集）- O(n)
SINTER tag:1:articles tag:2:articles
-> 102 103

# 查询拥有标签1或标签2的文章（集合并集）
SUNION tag:1:articles tag:2:articles
-> 101 102 103 104

# 从标签1中排除标签2的文章（集合差集）
SDIFF tag:1:articles tag:2:articles
-> 101`}
              language="bash"
              title="标签反向索引"
            />

            <h3>场景四：时间窗口去重</h3>
            <CodeBlock
              code={`# 场景：限制接口调用频率
# 存储最近N次请求的时间戳

SADD rate_limit:user:1001 1703123456 1703123457 1703123458

# 检查时间窗口内的请求数
SCOUNT rate_limit:user:1001  # 需要Redis 6.2+

# 清理过期记录（时间窗口外的）
# 需要Lua脚本或客户端逻辑

# 或者用有序集合（Sorted Set）更方便处理时间窗口
ZADD rate_limit:user:1001 1703123456 1703123456
ZREMRANGEBYSCORE rate_limit:user:1001 -inf 1703120000  # 清理1小时前的`}
              language="bash"
              title="时间窗口去重"
            />

            <h3>场景五：商品多规格SKU管理</h3>
            <CodeBlock
              code={`# 场景：管理商品的可用规格ID
# 规格ID通常是整数编码

# 商品1001的可用规格
SADD product:1001:skus 10001 10002 10003 10004

# 添加新规格
SADD product:1001:skus 10005

# 批量检查规格是否可用
SISMEMBER product:1001:skus 10002
-> 1 (可用)

SISMEMBER product:1001:skus 99999
-> 0 (不可用)

# 获取所有可用规格
SMEMBERS product:1001:skus`}
              language="bash"
              title="SKU管理"
            />

            <Alert type="tip" title="最佳实践">
              <p>
                IntSet最适合的场景特征：<br/>
                ✅ 元素是整数（或可转换为整数）<br/>
                ✅ 元素数量 ≤ 512<br/>
                ✅ 读多写少，或写入不频繁<br/>
                ✅ 需要节省内存
              </p>
            </Alert>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="14. 调试命令详解" defaultOpen={false}>
          <div className="content-block">
            <h3>OBJECT ENCODING - 查看编码类型</h3>
            <CodeBlock
              code={`# 查看key的底层编码
127.0.0.1:6379> OBJECT ENCODING myset
"intset"  # 可能值：intset, hashtable, skiplist, ziplist

# 不同数据结构的encoding返回值
# IntSet: "intset"
# HashTable: "hashtable"
# Sorted Set (skiplist): "skiplist"
# Sorted Set (ziplist): "ziplist"
# List (ziplist): "ziplist"
# List (linkedlist): "linkedlist"`}
              language="bash"
              title="OBJECT ENCODING"
            />

            <h3>DEBUG OBJECT - 查看对象详情</h3>
            <CodeBlock
              code={`# 查看key的详细调试信息
127.0.0.1:6379> DEBUG OBJECT myset
Value at:0x7f8c9c406890 refcount:1 encoding:intset serializedlength:22 lru:33639628 lru_seconds_idle:1234

# 字段说明
# - Value at: 内存地址
# - refcount: 引用计数（用于对象共享）
# - encoding: 编码类型
# - serializedlength: 序列化后的长度（字节）
# - lru: LRU时钟
# - lru_seconds_idle: 空闲秒数`}
              language="bash"
              title="DEBUG OBJECT"
            />

            <h3>MEMORY USAGE - 查看内存占用</h3>
            <CodeBlock
              code={`# 查看key的内存占用（字节）
127.0.0.1:6379> MEMORY USAGE myset
(integer) 94

# 对比IntSet vs HashTable的内存
SADD intset_key 1 2 3 4 5
MEMORY USAGE intset_key
-> 94 字节

SADD hash_key 1 2 3 4 5
MEMORY USAGE hash_key
-> 262 字节

# 更大的集合差异更明显
SADD big_intset {1..100}
MEMORY USAGE big_intset
-> 312 字节

SADD big_hash {1..100}
MEMORY USAGE big_hash
-> 2256 字节`}
              language="bash"
              title="MEMORY USAGE"
            />

            <h3>DEBUG SLEEP - 模拟延迟</h3>
            <CodeBlock
              code={`# 模拟命令执行延迟（仅测试用）
DEBUG SLEEP 0.5  # 暂停500毫秒

# 结合IntSet操作测试超时场景
DEBUG SLEEP 0.1
SADD myset 1 2 3`}
              language="bash"
              title="DEBUG SLEEP"
            />

            <h3>SCAN - 渐进式遍历</h3>
            <CodeBlock
              code={`# 使用SCAN遍历大集合（不会阻塞Redis）
127.0.0.1:6379> SCAN 0 MATCH myset* COUNT 100
0) "0"
1) 1) "myset"
   2) "another_set"

# SCAN返回游标，下次调用用返回的cursor继续遍历
# COUNT参数是提示值，不保证精确

# 类似的还有 SSCAN, HSCAN, ZSCAN（用于Set/Hash/Sorted Set）
127.0.0.1:6379> SSCAN myset 0 COUNT 10
0) "0"
1) 1) "1"
   2) "2"
   3) "3"`}
              language="bash"
              title="SCAN命令"
            />

            <Alert type="info" title="内存优化建议">
              <p>
                使用<code>MEMORY USAGE</code>监控IntSet内存占用：<br/>
                - 如果内存增长异常，检查是否有不必要的元素<br/>
                - 如果元素数量接近512阈值，考虑是否该用HashTable<br/>
                - 定期检查长时间存在的Set是否还在使用
              </p>
            </Alert>
          </div>
        </CollapsibleSection>

        <div className="tutorial-footer">
          <div className="next-steps">
            <h3>下一步</h3>
            <p>现在你已经掌握了IntSet的理论知识，接下来可以：</p>
            <div className="next-buttons">
              <button className="next-btn" onClick={() => window.location.href = '/playground'}>
                🎮 交互演示
              </button>
              <button className="next-btn" onClick={() => window.location.href = '/scenarios'}>
                💡 学习场景
              </button>
              <button className="next-btn" onClick={() => window.location.href = '/source-code'}>
                🔬 源码分析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
