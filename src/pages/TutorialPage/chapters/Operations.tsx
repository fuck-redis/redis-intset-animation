import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import Alert from '../../../components/Alert/Alert';
import VideoEmbed from '../../../components/VideoEmbed';
import { InsertOperationVideo, DeleteOperationVideo, BinarySearchVideo, BinarySearchStepVideo, BatchOperationsVideo, ResizeMechanismVideo } from '../../../videos';

const Operations: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>核心操作详解</h1>

      <section>
        <h2>插入操作（intsetAdd）</h2>
        <p>
          插入是IntSet中最复杂的操作，因为它需要保持元素的有序性。
          当新元素插入到中间位置时，需要移动后续所有元素。
        </p>

        <ol className="process-steps">
          <li><strong>检查编码范围</strong>：判断新值是否超出当前编码范围，如需要则升级编码</li>
          <li><strong>二分查找位置</strong>：在有序数组中使用二分查找定位插入位置</li>
          <li><strong>扩容检查</strong>：如果容量不足，调用intsetResize扩容</li>
          <li><strong>移动元素</strong>：将插入位置后的所有元素向后移动一位</li>
          <li><strong>插入新值</strong>：在空出的位置写入新元素</li>
        </ol>

        <div className="info-box">
          <h4>时间复杂度分析</h4>
          <p>
            插入操作时间复杂度为 <strong>O(n)</strong>，其中 n 为元素数量。<br/>
            主要开销来源：移动元素 O(n) + 可能扩容 O(n)。
          </p>
        </div>

        <VideoEmbed
          title="插入操作演示"
          description="点击查看插入操作的完整过程"
          component={InsertOperationVideo}
          props={{ operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>内存扩容机制（intsetResize）</h2>
        <p>
          当IntSet的容量不足时，需要进行内存扩容。Redis使用容量翻倍策略来减少扩容次数。
        </p>

        <div className="memory-viz">
{`扩容决策过程：

当前状态: length = 5, capacity = 5
        ↓
length == capacity ?
        ↓
    是 → 触发扩容
        ↓
新容量 = capacity * 2 = 10
        ↓
分配新内存 → 复制数据 → 释放旧内存
        ↓
扩容完成，继续插入`}
        </div>

        <Alert type="info" title="扩容阈值详解">
          <ul>
            <li>初始容量通常为8个元素</li>
            <li>容量翻倍：8→16→32→64→128→256→512...</li>
            <li>当 length 达到 capacity 时触发扩容</li>
            <li>扩容涉及数据复制，有O(n)的时间成本</li>
          </ul>
        </Alert>

        <VideoEmbed
          title="内存扩容机制演示"
          description="点击查看 IntSet 内存扩容的详细过程，包括数据迁移"
          component={ResizeMechanismVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>批量插入操作</h2>
        <p>
          Redis的SADD命令支持一次性添加多个元素。批量插入会逐个处理每个元素，
          每次插入都可能触发扩容和编码升级。
        </p>

        <CodeBlock
          code={`# 批量插入示例
127.0.0.1:6379> SADD myset 1 2 3 4 5
(integer) 5

# 内部处理流程：
# 1. 插入 1 → 容量 8 → 无需扩容，INT16
# 2. 插入 2 → 容量 8 → 无需扩容
# 3. 插入 3 → 容量 8 → 无需扩容
# 4. 插入 4 → 容量 8 → 无需扩容
# 5. 插入 5 → 容量 8 → 无需扩容
#
# 最终状态：5个元素，容量8，INT16编码`}
          language="bash"
          title="批量插入示例"
        />

        <VideoEmbed
          title="批量插入操作演示"
          description="点击查看批量插入多个元素的过程，包括扩容决策"
          component={BatchOperationsVideo}
          props={{ values: [10, 20, 30, 40, 50] }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>查找操作（intsetFind）</h2>
        <p>
          IntSet的有序存储使其能够使用高效的二分查找算法。
          二分查找的时间复杂度为 O(log n)，相比线性查找的 O(n) 有显著优势。
        </p>

        <CodeBlock
          code={`// 伪代码实现
function intsetFind(set, value):
    if set.length == 0:
        return false

    # 根据编码类型确定如何读取元素
    if set.encoding == INT16:
        # 按INT16读取contents[mid]
    elif set.encoding == INT32:
        # 按INT32读取contents[mid]
    else:
        # 按INT64读取contents[mid]

    # 二分查找
    left = 0
    right = set.length - 1

    while left <= right:
        mid = (left + right) / 2
        current = contents[mid]

        if current == value:
            return true       # 找到目标
        else if current < value:
            left = mid + 1   # 目标在右半区
        else:
            right = mid - 1  # 目标在左半区

    return false             # 未找到`}
          language="python"
          title="二分查找算法"
          showLineNumbers
        />

        <div className="example-box">
          <h4>查找效率对比</h4>
          <table>
            <thead>
              <tr>
                <th>元素数量</th>
                <th>二分查找次数</th>
                <th>线性查找最多</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>8</td>
                <td>3</td>
                <td>8</td>
              </tr>
              <tr>
                <td>64</td>
                <td>6</td>
                <td>64</td>
              </tr>
              <tr>
                <td>512</td>
                <td>9</td>
                <td>512</td>
              </tr>
              <tr>
                <td>1000</td>
                <td>10</td>
                <td>1000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p><strong>时间复杂度：</strong>O(log n)</p>
      </section>

      <VideoEmbed
        title="二分查找演示"
        description="点击查看二分查找算法执行过程"
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

      <section>
        <h2>删除操作（intsetRemove）</h2>
        <p>
          删除操作与插入类似但方向相反。需要找到要删除的元素，然后移动后续元素填补空缺。
        </p>

        <ol className="process-steps">
          <li><strong>二分查找位置</strong>：找到要删除的元素位置</li>
          <li><strong>移动元素</strong>：将删除位置后的所有元素向前移动一位</li>
          <li><strong>更新长度</strong>：减少length，释放内存（如需要）</li>
        </ol>

        <Alert type="warning" title="重要特性：删除不会触发编码降级">
          即使删除后所有元素都在更小的编码范围内，编码也不会降级。
          这是Redis的设计决策，避免频繁的编码转换影响性能。
        </Alert>

        <CodeBlock
          code={`# 删除操作示例
127.0.0.1:6379> SADD numbers 1 2 50000 3 4
(integer) 5
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"  # INT32

127.0.0.1:6379> SREM numbers 50000
(integer) 1

127.0.0.1:6379> SMEMBERS numbers
1) "1"
2) "2"
3) "3"
4) "4"

127.0.0.1:6379> OBJECT ENCODING numbers
"intset"  # 仍然是INT32，不会降级`}
          language="bash"
          title="删除操作示例"
        />

        <p><strong>时间复杂度：</strong>O(n)，因为需要移动元素</p>
      </section>

      <VideoEmbed
        title="删除操作演示"
        description="点击查看删除操作的完整过程"
        component={DeleteOperationVideo}
        props={{ operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] }}
        autoplay={true}
      />

      <section>
        <h2>操作复杂度总结</h2>
        <table>
          <thead>
            <tr>
              <th>操作</th>
              <th>时间复杂度</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>查找</td>
              <td>O(log n)</td>
              <td>二分查找，有序存储</td>
            </tr>
            <tr>
              <td>插入</td>
              <td>O(n)</td>
              <td>可能需要移动所有元素</td>
            </tr>
            <tr>
              <td>删除</td>
              <td>O(n)</td>
              <td>需要移动后续元素</td>
            </tr>
            <tr>
              <td>扩容</td>
              <td>O(n)</td>
              <td>容量翻倍时复制全部数据</td>
            </tr>
            <tr>
              <td>编码升级</td>
              <td>O(n)</td>
              <td>需要重新编码所有元素</td>
            </tr>
          </tbody>
        </table>

        <h3>实战：分析你的操作性能</h3>
        <p>了解各操作的时间复杂度可以帮助你预估Redis命令的执行时间：</p>

        <CodeBlock
          code={`# 场景：分析100个元素的IntSet操作性能

# 1. 查找操作 - O(log n) = O(log 100) ≈ 7次比较
127.0.0.1:6379> SADD numbers 1 2 3 ... 100
(integer) 100
127.0.0.1:6379> SISMEMBER numbers 50
(integer) 1  # 找到

# 2. 插入操作 - O(n) = 可能需要移动最多100个元素
127.0.0.1:6379> SADD numbers 25
(integer) 1  # 需要在中间位置插入，触发元素移动

# 3. 删除操作 - O(n) = 需要移动后续元素
127.0.0.1:6379> SREM numbers 25
(integer) 1  # 删除后需要移动25之后的所有元素

# 4. 批量操作 - 每个元素O(n)，总体O(n*m)
127.0.0.1:6379> SADD numbers 51 52 53 54 55
(integer) 5  # 每次插入都可能触发扩容和元素移动

# 实战建议：
# - 如果需要频繁插入，考虑使用HashTable
# - 如果读多写少，IntSet是最佳选择`}
          language="bash"
          title="操作性能分析"
        />

        <div className="key-points">
          <h4>性能特点总结</h4>
          <p>
            IntSet的插入和删除操作都是 O(n)，不适合频繁修改的场景。
            但对于<strong>读多写少</strong>的场景，IntSet提供了极佳的内存效率和可接受的查找性能。
          </p>
        </div>

        <h3>优化建议：减少写操作开销</h3>
        <p>如果你的场景必须频繁写入，可以考虑以下优化策略：</p>

        <CodeBlock
          code={`# 优化策略1：批量写入代替单条写入
# 不推荐：循环单条插入（每次都可能有扩容和元素移动）
SADD key 1
SADD key 2
SADD key 3
...

# 推荐：一次性批量插入（Redis内部优化）
127.0.0.1:6379> SADD key 1 2 3 4 5 6 7 8 9 10
(integer) 10

# 优化策略2：使用管道（Pipeline）批量提交
# Python示例
pipe = redis.pipeline()
for i in range(1000):
    pipe.sadd('myset', i)
pipe.execute()  # 一次网络往返

# 优化策略3：预估数据量，一次性分配
# 如果你知道最终会有1000个元素，可以先创建再导入
127.0.0.1:6379> SADD key 1 2 3 ... 1000
(integer) 1000  # 一次搞定

# 优化策略4：避免频繁的小值删除
# 删除操作会移动元素，可能触发后续元素重新排列
# 如果需要清空集合，使用DEL命令更高效
127.0.0.1:6379> DEL key  # 直接删除整个IntSet`}
          language="bash"
          title="写操作优化策略"
        />
      </section>
    </div>
  );
};

export default Operations;
