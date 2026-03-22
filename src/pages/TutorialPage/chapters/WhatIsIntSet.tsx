import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import VideoEmbed from '../../../components/VideoEmbed';
import { BinarySearchVideo, BinarySearchStepVideo, IntSetVsHashTableVideo, IntSetCharacteristicsVideo, IntSetSelectionVideo, DataStructureOverviewVideo } from '../../../videos';
import './chapter.css';

const WhatIsIntSet: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>IntSet是什么？</h1>

      <VideoEmbed
        title="Redis 数据结构全景"
        description="了解 IntSet 在 Redis 数据结构家族中的位置"
        component={DataStructureOverviewVideo}
        props={{}}
        autoplay={true}
      />

      <section>
        <h2>核心定义</h2>
        <p>
          IntSet（Integer Set，整数集合）是Redis用于存储<strong>整数类型Set集合</strong>的底层数据结构之一。
          它是一个<strong>有序的</strong>、<strong>紧凑的</strong>整数数组，专门为优化内存占用而设计。
        </p>

        <div className="key-points">
          <h4>IntSet的三大核心特性</h4>
          <ul>
            <li><strong>动态编码</strong>：根据数值大小自动选择 INT16/INT32/INT64 编码，最大化内存效率</li>
            <li><strong>有序存储</strong>：元素按升序排列，支持二分查找，查找效率 O(log n)</li>
            <li><strong>紧凑布局</strong>：连续内存存储，无额外指针开销，节省约 90% 内存</li>
          </ul>
        </div>

        <VideoEmbed
          title="IntSet 核心特性"
          description="了解 IntSet 的有序性、紧凑存储和动态编码机制"
          component={IntSetCharacteristicsVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>为什么需要IntSet？</h2>
        <p>
          Redis的Set类型支持两种底层实现。选择合适的数据结构对性能和内存至关重要：
        </p>

        <div className="pro-con">
          <div className="pro-con-box pro">
            <h4>IntSet 优势</h4>
            <ul>
              <li>内存占用极小（1/10 HashTable）</li>
              <li>查找效率 O(log n) 对小数据足够快</li>
              <li>连续内存，CPU缓存命中率高</li>
            </ul>
          </div>
          <div className="pro-con-box con">
            <h4>HashTable 优势</h4>
            <ul>
              <li>查找时间复杂度 O(1)</li>
              <li>插入/删除无需移动元素</li>
              <li>支持非整数类型</li>
              <li>无元素数量限制</li>
            </ul>
          </div>
        </div>

        <p>Redis根据以下<strong>两个条件</strong>自动决定使用哪种底层实现：</p>
        <ol className="process-steps">
          <li>所有元素都是<strong>整数值</strong>（不含字符串）</li>
          <li>元素数量不超过<code>set-max-intset-entries</code>（默认512个）</li>
        </ol>

        <CodeBlock
          code={`# redis.conf 配置说明
# 当Set满足上述两个条件时使用IntSet，否则自动转为HashTable
set-max-intset-entries 512  # 超过此值自动转为hashtable

# 运行时查看当前配置
127.0.0.1:6379> CONFIG GET set-max-intset-entries
1) "set-max-intset-entries"
2) "512"`}
          language="bash"
          title="Redis配置项"
        />
      </section>

      <VideoEmbed
        title="IntSet 选择条件"
        description="动画演示 IntSet 的两个选择条件及决策流程"
        component={IntSetSelectionVideo}
        props={{}}
        autoplay={true}
      />

      <section>
        <h2>二分查找演示</h2>
        <p>
          IntSet的有序存储使其能够使用二分查找算法。查找过程如下：
        </p>

        <CodeBlock
          code={`// 查找元素 42 的过程（数组：[1, 15, 23, 42, 56, 78, 89, 100]）
//
// 第1轮：left=0, right=7, mid=3 → contents[3]=42 == 42 → 找到！
//
// 关键点：每轮比较将搜索范围缩小一半
// - 比较次数 = log₂(8) = 3 次
// - 相比线性查找的 4 次，效率提升 25%`}
          language="python"
          title="二分查找示例"
        />

        <VideoEmbed
          title="二分查找执行过程"
          description="点击查看 IntSet 如何进行二分查找操作"
          component={BinarySearchVideo}
          props={{ searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] }}
          autoplay={true}
        />

        <VideoEmbed
          title="二分查找分步详解"
          description="深入理解二分查找每一步的 left/right/mid 变化"
          component={BinarySearchStepVideo}
          props={{ searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] }}
          autoplay={true}
        />
      </section>

      <VideoEmbed
        title="HashTable vs IntSet 对比"
        description="点击查看 IntSet 与 HashTable 的内存布局和查找效率对比"
        component={IntSetVsHashTableVideo}
        props={{ intSetData: [1, 15, 23, 42, 56], hashTableData: [1, 15, 23, 42, 56], searchValue: 42 }}
        autoplay={true}
      />

      <section>
        <h2>实际应用场景</h2>
        <p>
          了解IntSet的最佳应用场景可以帮助你在实际项目中做出正确的架构决策。
          下面是几个典型的使用案例：
        </p>

        <div className="example-box">
          <h4>场景一：存储用户ID集合</h4>
          <p>假设有1000个在线用户ID，使用IntSet存储：</p>
          <CodeBlock
            code={`# 内存占用对比（粗略估算）
IntSet:   1000 * 4字节 = 4KB（INT32编码）
HashTable: 1000 * (8+40) = 48KB（键值对 + 哈希桶）

# 节省内存：约 92%

# 实际Redis命令演示
127.0.0.1:6379> SADD online_users 1001 1002 1003 1004 1005
(integer) 5
127.0.0.1:6379> SISMEMBER online_users 1003
(integer) 1  # 用户1003在线
127.0.0.1:6379> SCARD online_users
(integer) 5  # 5个用户在线`}
            language="bash"
          />
          <p><strong>适用原因：</strong>用户ID是整数，且查询（检查用户是否在线）是主要操作。</p>
        </div>

        <div className="example-box">
          <h4>场景二：标签ID存储</h4>
          <p>电商系统中，存储商品所属的标签ID：</p>
          <CodeBlock
            code={`127.0.0.1:6379> SADD product:1001:tags 101 205 308 412
(integer) 4
127.0.0.1:6379> OBJECT ENCODING product:1001:tags
"intset"
127.0.0.1:6379> MEMORY USAGE product:1001:tags
(integer) 144  # 包含对象头，实际数据仅几十字节

# 检查商品是否具有某个标签（快速O(log n)查询）
127.0.0.1:6379> SISMEMBER product:1001:tags 205
(integer) 1  # 有这个标签`}
            language="bash"
          />
          <p><strong>适用原因：</strong>标签ID是整数，数据量小（通常不超过几十个），读多写少。</p>
        </div>

        <div className="example-box">
          <h4>场景三：白名单/黑名单ID</h4>
          <p>游戏系统中，存储被禁言的用户ID列表：</p>
          <CodeBlock
            code={`# 批量添加禁言用户（使用管道批量操作更高效）
127.0.0.1:6379> SADD banned_users 5001 5002 5003 5004 5005
(integer) 5

# 检查用户是否在黑名单中
127.0.0.1:6379> SISMEMBER banned_users 5002
(integer) 1  # 用户5002被禁言

# 解除禁言
127.0.0.1:6379> SREM banned_users 5002
(integer) 1
127.0.0.1:6379> SISMEMBER banned_users 5002
(integer) 0  # 已解除`}
            language="bash"
          />
          <p><strong>适用原因：</strong>需要快速查询某个ID是否被禁止，IntSet的O(log n)查询非常适合。</p>
        </div>

        <div className="example-box">
          <h4>场景四：记录用户行为事件ID</h4>
          <p>分析系统中用户已读的文章ID列表：</p>
          <CodeBlock
            code={`# 记录用户100已阅读的文章ID
127.0.0.1:6379> SADD user:100:read_articles 10001 10002 10003 10004 10005
(integer) 5

# 计算用户已读多少篇文章
127.0.0.1:6379> SCARD user:100:read_articles
(integer) 5

# 检查某篇文章是否已读
127.0.0.1:6379> SISMEMBER user:100:read_articles 10003
(integer) 1  # 已读

# 获取用户的所有已读文章
127.0.0.1:6379> SMEMBERS user:100:read_articles
1) "10001"
2) "10002"
3) "10003"
4) "10004"
5) "10005"`}
            language="bash"
          />
          <p><strong>适用原因：</strong>已读列表一旦创建就很少修改，非常适合IntSet的"读多写少"特性。</p>
        </div>

        <div className="key-points">
          <h4>选择IntSet的判断标准</h4>
          <p>可以用以下 checklist 判断是否应该使用 IntSet：</p>
          <ul>
            <li>数据是否是整数类型？ (是 → 可能适合)</li>
            <li>数据量是否 ≤ 512？ (是 → 强烈推荐)</li>
            <li>操作是否是读多写少？ (是 → 强烈推荐)</li>
            <li>内存是否敏感？ (是 → IntSet优势明显)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default WhatIsIntSet;
