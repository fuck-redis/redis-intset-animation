import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import VideoEmbed from '../../../components/VideoEmbed';
import { BinarySearchVideo, EncodingUpgradeVideo, EncodingDowngradeVideo, UseCaseRecommendationVideo, CommandDemoVideo } from '../../../videos';

const FAQ: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>常见问题FAQ</h1>

      <section className="faq-section">
        <div className="faq-item">
          <h3>Q1: IntSet为什么不能降级编码？</h3>
          <p>
            <strong>A:</strong> 这是Redis在<strong>性能</strong>和<strong>实现复杂度</strong>之间的权衡决策。
          </p>
          <p>
            如果支持编码降级，每次删除元素时都需要检查：是否所有元素都可以用更小的编码表示？
            这会带来额外的性能开销，而且降级后如果又插入大值，还需要再次升级。
          </p>
          <div className="info-box">
            <h4>为什么Redis选择单向升级？</h4>
            <ul>
              <li><strong>简化实现</strong>：无需维护降级逻辑</li>
              <li><strong>避免抖动</strong>：防止频繁的编码转换</li>
              <li><strong>性能稳定</strong>：删除操作的时间复杂度保持O(n)</li>
              <li><strong>内存换性能</strong>：用少量内存换取稳定的性能表现</li>
            </ul>
          </div>

          <VideoEmbed
            title="编码不可降级演示"
            description="通过动画演示为什么删除大值后编码不会降级"
            component={EncodingDowngradeVideo}
            props={{}}
            autoplay={true}
          />
        </div>

        <div className="faq-item">
          <h3>Q2: IntSet的元素是如何保持有序的？</h3>
          <p>
            <strong>A:</strong> IntSet通过<strong>插入时维护有序性</strong>来保证元素始终按升序排列。
          </p>
          <p>具体过程：</p>
          <ol>
            <li>新元素插入时，先用二分查找找到正确的位置</li>
            <li>将插入位置后的所有元素向后移动一位</li>
            <li>在空出的位置放入新元素</li>
          </ol>
          <p>
            虽然这使得插入操作的时间复杂度为O(n)，但保证了：
          </p>
          <ul>
            <li>查找操作可以使用高效的二分查找 O(log n)</li>
            <li>元素始终有序，支持范围查询</li>
            <li>相同元素不会重复（Set的特性）</li>
          </ul>

          <VideoEmbed
            title="元素有序存储演示"
            description="二分查找确保新元素插入到正确位置，保持集合有序"
            component={BinarySearchVideo}
            props={{ searchValue: 35, data: [10, 20, 30, 40, 50, 60, 70, 80] }}
            autoplay={true}
          />
        </div>

        <div className="faq-item">
          <h3>Q3: 什么时候IntSet会转换为HashTable？</h3>
          <p><strong>A:</strong> 有两种触发条件，转换都是<strong>不可逆</strong>的：</p>
          <ol>
            <li><strong>添加非整数元素</strong>：当执行 <code>SADD key "string"</code> 时</li>
            <li><strong>元素数量超限</strong>：当元素数量超过 <code>set-max-intset-entries</code>（默认512）</li>
          </ol>

          <CodeBlock
            code={`# 示例1: 添加字符串触发转换
127.0.0.1:6379> SADD nums 1 2 3
127.0.0.1:6379> OBJECT ENCODING nums
"intset"
127.0.0.1:6379> SADD nums "hello"
127.0.0.1:6379> OBJECT ENCODING nums
"hashtable"  # 已转换！

# 示例2: 元素过多触发转换
127.0.0.1:6379> SADD bigset 1 2 3 ... 512  # 512个元素
127.0.0.1:6379> OBJECT ENCODING bigset
"intset"
127.0.0.1:6379> SADD bigset 513  # 第513个元素
127.0.0.1:6379> OBJECT ENCODING bigset
"hashtable"  # 已转换！`}
            language="bash"
          />

          <VideoEmbed
            title="编码升级演示"
            description="当插入值超出当前编码范围时，IntSet会自动升级编码"
            component={EncodingUpgradeVideo}
            props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
            autoplay={true}
          />
        </div>

        <div className="faq-item">
          <h3>Q4: IntSet适合存储哪些数据？</h3>
          <p><strong>A:</strong> IntSet最适合存储以下类型的整数数据：</p>
          <ul>
            <li><strong>用户ID集合</strong>：如在线用户、活跃用户、VIP用户</li>
            <li><strong>业务ID集合</strong>：如文章ID、商品ID、订单ID</li>
            <li><strong>标签ID集合</strong>：如商品标签、用户兴趣标签</li>
            <li><strong>时间戳集合</strong>：如Unix时间戳（秒级用INT32）</li>
            <li><strong>配置类数据</strong>：如白名单、黑名单、允许列表</li>
          </ul>

          <div className="key-points">
            <h4>判断标准</h4>
            <p>
              如果你的数据满足：<br/>
              1. 全是整数 ✓<br/>
              2. 数量 ≤ 512（可调整）✓<br/>
              3. 读多写少 ✓<br/>
              那么IntSet就是最佳选择！
            </p>
          </div>

          <VideoEmbed
            title="IntSet 适用场景决策"
            description="通过决策树可视化展示如何根据场景选择数据结构"
            component={UseCaseRecommendationVideo}
            props={{}}
            autoplay={true}
          />
        </div>

        <div className="faq-item">
          <h3>Q5: 如何判断当前Set使用的是IntSet还是HashTable？</h3>
          <p><strong>A:</strong> 使用Redis的<code>OBJECT ENCODING</code>命令查看：</p>
          <CodeBlock
            code={`127.0.0.1:6379> OBJECT ENCODING myset
"intset"     # 使用IntSet编码
# 或
"hashtable"  # 使用HashTable编码`}
            language="bash"
          />

          <p>其他有用的诊断命令：</p>
          <CodeBlock
          code={`# 查看内存占用
127.0.0.1:6379> MEMORY USAGE myset
(integer) 184

# 查看元素数量
127.0.0.1:6379> SCARD myset
(integer) 5

# 查看详细内部信息
127.0.0.1:6379> DEBUG OBJECT myset
Value at:0x7f... refcount:1 encoding:intset serializedlength:22 ...`}
          language="bash"
        />

          <VideoEmbed
            title="Redis命令演示动画"
            description="终端演示OBJECT ENCODING和MEMORY USAGE命令的实际使用"
            component={CommandDemoVideo}
            props={{}}
            autoplay={true}
          />
        </div>

        <div className="faq-item">
          <h3>Q6: 为什么IntSet的最大限制是512个元素？</h3>
          <p>
            <strong>A:</strong> 512是Redis团队经过权衡后得出的<strong>经验值</strong>。
          </p>
          <p>考虑因素：</p>
          <ul>
            <li><strong>内存优化</strong>：512个INT64元素只需要约4KB内存</li>
            <li><strong>查找性能</strong>：二分查找512元素最多9次比较</li>
            <li><strong>插入成本</strong>：移动512个元素的成本在可接受范围内</li>
            <li><strong>编码升级</strong>：INT16升级到INT32的阈值</li>
          </ul>
          <p>
            这个值可以通过<code>set-max-intset-entries</code>配置调整。
            如果你的场景读多写少且内存紧张，可以适当增大这个值。
          </p>
        </div>

        <div className="faq-item">
          <h3>Q7: IntSet和Sorted Set有什么区别？</h3>
          <p>
            <strong>A:</strong> 这是两个完全不同的数据结构：
          </p>
          <table>
            <thead>
              <tr>
                <th>特性</th>
                <th>IntSet</th>
                <th>Sorted Set</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>存储内容</td>
                <td>仅整数</td>
                <td>字符串+分数</td>
              </tr>
              <tr>
                <td>排序方式</td>
                <td>整数升序</td>
                <td>按分数排序</td>
              </tr>
              <tr>
                <td>时间复杂度</td>
                <td>查找O(log n)</td>
                <td>查找O(log n)</td>
              </tr>
              <tr>
                <td>适用场景</td>
                <td>整数集合、去重</td>
                <td>排行榜、优先级队列</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="faq-item">
          <h3>Q8: 批量插入很多元素时，如何避免频繁扩容？</h3>
          <p>
            <strong>A:</strong> 可以使用<strong>预分配</strong>策略或<strong>一次性</strong>插入：
          </p>
          <CodeBlock
          code={`# 方法1: 使用管道（Pipeline）批量提交
$pipe = $redis->pipeline();
for ($i = 0; $i < 1000; $i++) {
    $pipe->sAdd('myset', $i);
}
$pipe->execute();  # 一次网络往返

# 方法2: Lua脚本原子执行
127.0.0.1:6379> EVAL "
  for i = 1, 1000 do
    redis.call('SADD', KEYS[1], i)
  end
  return 1
" 1 myset

# 方法3: 直接使用SADD多参数
127.0.0.1:6379> SADD myset 1 2 3 4 5 ... 1000

# 方法4: Python中使用管道和批量操作
import redis
r = redis.Redis()
pipe = r.pipeline()
# 一次性添加大量元素
pipe.sadd('myset', *range(1, 1001))
pipe.execute()`}
          language="bash"
        />
          <p>
            预分配策略的核心是：<strong>减少扩容次数</strong>，将多次小扩容改为少量大扩容。
          </p>
        </div>

        <div className="faq-item">
          <h3>Q9: IntSet和HashTable在实际项目中如何选择？</h3>
          <p><strong>A:</strong> 让我通过一个决策流程帮你选择：</p>

          <div className="process-steps">
            <li><strong>Step 1: 数据类型是整数吗？</strong>
              <p>如果是整数，进入Step 2；如果包含字符串，直接选HashTable。</p>
            </li>
            <li><strong>Step 2: 预计数据量是多少？</strong>
              <p>如果小于等于512，选IntSet；如果大于512，选HashTable（或可调大配置）。</p>
            </li>
            <li><strong>Step 3: 读写比例如何？</strong>
              <p>读多写少选IntSet；写多读少选HashTable。</p>
            </li>
            <li><strong>Step 4: 对内存敏感吗？</strong>
              <p>内存敏感（如大量小集合）选IntSet；对内存不敏感选HashTable。</p>
            </li>
          </div>

          <CodeBlock
          code={`# 实战选择示例

# 场景1：用户收藏的文章ID（读多写少，数据量小）
# 决策：✓ 整数 ✓ 小数据 ✓ 读多写少
# 选择：IntSet
127.0.0.1:6379> SADD user:123:favorites 10001 10002 10003
127.0.0.1:6379> OBJECT ENCODING user:123:favorites
"intset"

# 场景2：实时聊天室的在线用户（写多，数据量大）
# 决策：✓ 整数 ✗ 数据量大 ✗ 写多
# 选择：HashTable（Set类型，但底层用hashtable）
127.0.0.1:6379> SADD chatroom:live:users 10001 10002 ... 100000
127.0.0.1:6379> OBJECT ENCODING chatroom:live:users
"hashtable"

# 场景3：商品标签（读多，数据量中等）
# 决策：✓ 整数 ✓ 中等数据 ✓ 读多
# 选择：IntSet（如果标签经常变化则选HashTable）
127.0.0.1:6379> SADD product:888:tags 101 205 308
127.0.0.1:6379> OBJECT ENCODING product:888:tags
"intset"`}
            language="bash"
            title="选择决策示例"
          />
        </div>

        <div className="faq-item">
          <h3>Q10: 如何排查IntSet的性能问题？</h3>
          <p><strong>A:</strong> 按照以下步骤排查：</p>

          <ol className="process-steps">
            <li><strong>检查编码类型</strong>
              <p>确认数据是否真的在使用IntSet。</p>
              <CodeBlock code={`127.0.0.1:6379> OBJECT ENCODING mykey
"intset"  # 确认是IntSet`} language="bash" />
            </li>
            <li><strong>检查元素数量</strong>
              <p>确认数据量级，IntSet在512以内性能最佳。</p>
              <CodeBlock code={`127.0.0.1:6379> SCARD mykey
(integer) 300  # 在合理范围内`} language="bash" />
            </li>
            <li><strong>检查编码升级情况</strong>
              <p>如果插入大值导致频繁升级，会影响性能。</p>
              <CodeBlock code={`127.0.0.1:6379> DEBUG OBJECT mykey
... encoding:intset ...  # 查看编码状态`} language="bash" />
            </li>
            <li><strong>分析操作类型</strong>
              <p>如果插入/删除慢，可能是因为元素数量接近512阈值。</p>
            </li>
          </ol>

          <div className="info-box">
            <h4>常见性能问题及解决方案</h4>
            <ul>
              <li><strong>问题：</strong>批量插入很慢<br/><strong>原因：</strong>每次插入都可能触发扩容和元素移动<br/><strong>解决：</strong>使用SADD一次性插入多个值，或使用Pipeline</li>
              <li><strong>问题：</strong>删除操作慢<br/><strong>原因：</strong>删除中间元素需要移动所有后续元素<br/><strong>解决：</strong>如果需要频繁删除，考虑使用HashTable</li>
              <li><strong>问题：</strong>查询变慢<br/><strong>原因：</strong>数据量超过512已转为HashTable但仍用O(log n)查询<br/><strong>解决：</strong>检查OBJECT ENCODING确认是否仍是intset</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
