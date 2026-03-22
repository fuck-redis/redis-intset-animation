import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import VideoEmbed from '../../../components/VideoEmbed';
import { BinarySearchVideo, InsertOperationVideo, ComplexityCompareVideo, UseCaseRecommendationVideo, MemoryCompareVideo, OperationCompareVideo } from '../../../videos';

const Performance: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>性能特点</h1>

      <section>
        <h2>操作复杂度对比</h2>
        <p>
          IntSet和HashTable在不同操作上有各自的性能优势。选择哪种数据结构取决于你的实际使用场景。
        </p>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>操作</th>
              <th>IntSet</th>
              <th>HashTable</th>
              <th>差异说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>查找</td>
              <td>O(log n)</td>
              <td>O(1)</td>
              <td>IntSet需要二分查找，HashTable直接寻址</td>
            </tr>
            <tr>
              <td>插入</td>
              <td>O(n)</td>
              <td>O(1)</td>
              <td>IntSet需要移动元素保持有序</td>
            </tr>
            <tr>
              <td>删除</td>
              <td>O(n)</td>
              <td>O(1)</td>
              <td>IntSet需要移动后续元素</td>
            </tr>
            <tr>
              <td>内存占用</td>
              <td>极小（2-8字节/元素）</td>
              <td>较大（40+字节/元素）</td>
              <td>IntSet节省约90%内存</td>
            </tr>
          </tbody>
        </table>

        <VideoEmbed
          title="操作复杂度对比动画"
          description="动态展示 IntSet 与 HashTable 在各项操作上的复杂度差异"
          component={OperationCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>时间复杂度可视化</h2>
        <p>
          下面的动画展示了<strong>O(1)</strong>、<strong>O(log n)</strong> 和 <strong>O(n)</strong> 三种复杂度随数据量增长时的性能差异。
          可以清晰地看到，当数据量较小时，各种复杂度的差异并不明显。
        </p>

        <div className="example-box">
          <h4>复杂度增长对比</h4>
          <table>
            <thead>
              <tr>
                <th>数据量n</th>
                <th>O(1)</th>
                <th>O(log n)</th>
                <th>O(n)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>8</td>
                <td>1</td>
                <td>3</td>
                <td>8</td>
              </tr>
              <tr>
                <td>64</td>
                <td>1</td>
                <td>6</td>
                <td>64</td>
              </tr>
              <tr>
                <td>512</td>
                <td>1</td>
                <td>9</td>
                <td>512</td>
              </tr>
              <tr>
                <td>4096</td>
                <td>1</td>
                <td>12</td>
                <td>4096</td>
              </tr>
            </tbody>
          </table>
        </div>

        <VideoEmbed
          title="时间复杂度对比"
          description="动态展示 O(1)、O(log n)、O(n) 随数据量增长的性能差异"
          component={ComplexityCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>查找操作 - O(log n) vs O(1)</h2>
        <p>
          IntSet使用二分查找，时间复杂度为<strong>O(log n)</strong>。
          相比HashTable的O(1)查找，虽然略慢，但对于小数据量来说差异微乎其微。
        </p>

        <div className="info-box">
          <h4>为什么O(log n)对IntSet不是问题？</h4>
          <p>
            当n=512时，二分查找最多需要9次比较。<br/>
            这9次比较在现代CPU上只需要几十个时钟周期。<br/>
            真正影响性能的是<strong>数据量大小</strong>而非算法复杂度。
          </p>
        </div>

        <VideoEmbed
          title="二分查找演示"
          description="IntSet使用二分查找，查找效率随数据量增长呈对数增长"
          component={BinarySearchVideo}
          props={{ searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>插入操作 - O(n)</h2>
        <p>
          IntSet的插入操作需要<strong>移动元素</strong>来保持有序性，因此时间复杂度为O(n)。
          这也是IntSet适合"读多写少"场景的原因。
        </p>

        <div className="pro-con">
          <div className="pro-con-box pro">
            <h4>IntSet适合的场景</h4>
            <ul>
              <li>初始化后很少修改的集合</li>
              <li>批量导入后只读的统计数据</li>
              <li>配置列表、白名单等</li>
            </ul>
          </div>
          <div className="pro-con-box con">
            <h4>HashTable适合的场景</h4>
            <ul>
              <li>频繁增删元素的场景</li>
              <li>需要O(1)查找性能的实时系统</li>
              <li>元素数量不确定的动态集合</li>
            </ul>
          </div>
        </div>

        <VideoEmbed
          title="插入操作演示"
          description="插入时需要移动后续元素，为新元素腾出位置"
          component={InsertOperationVideo}
          props={{ operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>内存与性能的权衡</h2>
        <p>
          Redis选择IntSet的核心目的是在<strong>可接受的性能</strong>下实现<strong>极致的内存优化</strong>。
          这是一个精心设计的权衡。
        </p>

        <table>
          <thead>
            <tr>
              <th>对比维度</th>
              <th>IntSet</th>
              <th>HashTable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1000元素内存</td>
              <td>~4KB</td>
              <td>~48KB</td>
            </tr>
            <tr>
              <td>查找性能</td>
              <td>9次比较</td>
              <td>1次哈希+1次比较</td>
            </tr>
            <tr>
              <td>插入性能</td>
              <td>可能移动1000元素</td>
              <td>固定1次操作</td>
            </tr>
            <tr>
              <td>适用规模</td>
              <td>≤512元素</td>
              <td>无限制</td>
            </tr>
          </tbody>
        </table>

        <div className="key-points">
          <h4>Redis的设计哲学</h4>
          <p>
            当数据量小（≤512）时，O(n)的插入开销是可以接受的，
            因为移动几百个元素只需要微秒级时间。
            但节省的内存却是实实在在的。
          </p>
        </div>
      </section>

      <section>
        <h2>使用建议</h2>
        <p>
          根据数据特征和访问模式选择合适的数据结构：
        </p>

        <ol className="process-steps">
          <li><strong>数据类型</strong>：是否全为整数？ → 是 → 可能使用IntSet</li>
          <li><strong>数据规模</strong>：预计多少元素？ → ≤512 → IntSet是首选</li>
          <li><strong>访问模式</strong>：读多写少还是写多读少？ → 读多 → IntSet更适合</li>
          <li><strong>内存敏感度</strong>：对内存占用敏感吗？ → 敏感 → 优先IntSet</li>
        </ol>

        <VideoEmbed
          title="适用场景决策树"
          description="根据数据类型和规模选择合适的数据结构"
          component={UseCaseRecommendationVideo}
          props={{}}
          autoplay={true}
        />

        <VideoEmbed
          title="内存占用对比动画"
          description="IntSet相比HashTable可节省高达91%的内存"
          component={MemoryCompareVideo}
          props={{}}
          autoplay={true}
        />

        <h3>决策树实战应用</h3>
        <p>让我们通过几个实际场景来练习决策过程：</p>

        <div className="example-box">
          <h4>场景A：用户标签系统</h4>
          <p>需求：存储用户感兴趣的标签ID（整数），主要操作是查询用户是否有某个标签。</p>
          <CodeBlock
            code={`# 分析：
# 1. 数据类型：标签ID是整数 ✓
# 2. 数据规模：每个用户可能有10-100个标签 ≤512 ✓
# 3. 访问模式：以查询为主，标签相对稳定 ✓
# 4. 内存敏感度：用户量大，内存重要 ✓

# 结论：使用IntSet
127.0.0.1:6379> SADD user:12345:tags 101 205 308 412 515
(integer) 5
127.0.0.1:6379> OBJECT ENCODING user:12345:tags
"intset"

# 查询用户是否有某标签 - O(log n)
127.0.0.1:6379> SISMEMBER user:12345:tags 205
(integer) 1  # 有这个标签`}
            language="bash"
          />
        </div>

        <div className="example-box">
          <h4>场景B：实时排行榜系统</h4>
          <p>需求：存储游戏玩家的分数排行榜，需要实时更新和排名查询。</p>
          <CodeBlock
            code={`# 分析：
# 1. 数据类型：分数排名需要按分数排序，不仅仅是整数 ✓
# 2. 数据规模：可能有数百万玩家
# 3. 访问模式：频繁更新分数（写多） ✗
# 4. 内存敏感度：需要支持实时排名

# 结论：使用Sorted Set（zset），不是普通Set
# 因为需要按分数排序，IntSet只按值排序，无法满足需求
127.0.0.1:6379> ZADD leaderboard 5000 "player1" 4500 "player2" 4800 "player3"
(integer) 3

# 获取排名前1的玩家
127.0.0.1:6379> ZREVRANGE leaderboard 0 0 WITHSCORES
1) "player1"
2) "5000"`}
            language="bash"
          />
        </div>

        <div className="example-box">
          <h4>场景C：商品多级分类</h4>
          <p>需求：存储商品所属的多个分类ID，支持多级分类查询。</p>
          <CodeBlock
            code={`# 分析：
# 1. 数据类型：分类ID是整数 ✓
# 2. 数据规模：商品可能有3-10个分类 ≤512 ✓
# 3. 访问模式：主要是查询，更新频率低 ✓
# 4. 内存敏感度：商品数量大，内存重要 ✓

# 结论：使用IntSet
127.0.0.1:6379> SADD product:888:categories 101 201 301
(integer) 3
127.0.0.1:6379> OBJECT ENCODING product:888:categories
"intset"

# 查询商品是否属于某分类
127.0.0.1:6379> SISMEMBER product:888:categories 201
(integer) 1`}
            language="bash"
          />
        </div>
      </section>

      <section>
        <h2>性能监控命令</h2>
        <p>
          在生产环境中，可以使用以下命令监控IntSet的使用情况：
        </p>

        <CodeBlock
          code={`# 查看键的编码类型
127.0.0.1:6379> OBJECT ENCODING myset
"intset"  # 或 "hashtable"

# 查看键的内存占用
127.0.0.1:6379> MEMORY USAGE myset
(integer) 1234

# 查看键的引用计数
127.0.0.1:6379> OBJECT REFCOUNT myset
(integer) 1

# 查看键的详细信息
127.0.0.1:6379> DEBUG OBJECT myset
Value at:0x7f... refcount:1 encoding:intset serializedlength:56 ...

# 查看所有键的编码类型分布（Redis 6.2+）
127.0.0.1:6379> OBJECT ENCODING myset
(intset) "intset"

# SCAN遍历所有Set类型的键，检查编码
127.0.0.1:6379> SCAN 0 TYPE set COUNT 100
1) "0"
2) 1) "myset"
   2) "another_set"
   3) "third_set"`}
          language="bash"
          title="性能监控命令"
        />

        <h3>监控脚本示例</h3>
        <p>生产环境中批量检查IntSet使用情况的脚本：</p>

        <CodeBlock
          code={`# Shell脚本：检查所有IntSet的内存占用
#!/bin/bash
redis-cli KEYS "*" | while read key; do
  encoding=$(redis-cli OBJECT ENCODING "$key")
  if [ "$encoding" = "intset" ]; then
    memory=$(redis-cli MEMORY USAGE "$key")
    count=$(redis-cli SCARD "$key")
    echo "$key: $count elements, $memory bytes, encoding=$encoding"
  fi
done

# 输出示例：
# online_users: 100000 elements, 408144 bytes, encoding=intset
# banned_users: 500 elements, 2064 bytes, encoding=intset
# product:1001:tags: 4 elements, 144 bytes, encoding=intset`}
          language="bash"
          title="监控脚本"
        />
      </section>
    </div>
  );
};

export default Performance;
