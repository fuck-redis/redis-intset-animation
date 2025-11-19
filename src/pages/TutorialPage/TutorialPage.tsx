import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock/CodeBlock';
import Alert from '../../components/Alert/Alert';
import './TutorialPage.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
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
