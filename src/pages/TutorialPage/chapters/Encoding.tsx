import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import Alert from '../../../components/Alert/Alert';
import VideoEmbed from '../../../components/VideoEmbed';
import { EncodingUpgradeVideo, EncodingDowngradeVideo, EncodingRangeVideo, EncodingScenarioVideo } from '../../../videos';

const Encoding: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>编码类型详解</h1>

      <section>
        <h2>三种编码类型</h2>
        <p>
          IntSet支持三种整数编码类型。Redis会根据存储值的范围自动选择最小的编码类型，
          从而最大化内存利用率。编码类型直接决定了每个元素占用的字节数。
        </p>

        <div className="encoding-cards">
          <div className="encoding-card">
            <h3>INT16 (2字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>-32,768 ~ 32,767</li>
              <li><strong>内存占用：</strong>2字节/元素</li>
              <li><strong>适用场景：</strong>小型ID、状态码、年龄</li>
              <li><strong>典型用例：</strong>用户年龄（0-150）、月份（1-12）</li>
            </ul>
          </div>

          <div className="encoding-card">
            <h3>INT32 (4字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>-2,147,483,648 ~ 2,147,483,647</li>
              <li><strong>内存占用：</strong>4字节/元素</li>
              <li><strong>适用场景：</strong>时间戳（秒级）、中型ID</li>
              <li><strong>典型用例：</strong>Unix时间戳（2024年约1.7亿）、订单号</li>
            </ul>
          </div>

          <div className="encoding-card">
            <h3>INT64 (8字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>±9,223,372,036,854,775,807</li>
              <li><strong>内存占用：</strong>8字节/元素</li>
              <li><strong>适用场景：</strong>时间戳（毫秒级）、超大型ID</li>
              <li><strong>典型用例：</strong>毫秒级时间戳、雪花算法ID</li>
            </ul>
          </div>
        </div>

        <VideoEmbed
          title="编码适用场景决策"
          description="不同场景下如何选择编码类型：用户ID、时间戳、超大数值"
          component={EncodingScenarioVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <VideoEmbed
        title="编码数值范围对比"
        description="可视化展示 INT16、INT32、INT64 三种编码的取值范围差异"
        component={EncodingRangeVideo}
        props={{}}
        autoplay={true}
      />

      <section>
        <h2>编码升级机制</h2>
        <p>
          当插入的值超出当前编码范围时，IntSet会自动升级到更大的编码类型。
          这是一个<strong>单向过程</strong>：编码只能升级，不能降级。
        </p>

        <div className="info-box">
          <h4>升级触发条件</h4>
          <ul>
            <li>INT16 → INT32：当添加的值超出 -32,768 ~ 32,767 范围</li>
            <li>INT32 → INT64：当添加的值超出 -2,147,483,648 ~ 2,147,483,647 范围</li>
          </ul>
        </div>

        <Alert type="warning" title="重要特性：编码不可降级">
          即使删除了导致升级的大值元素，编码也不会降级回原来的类型。
          这是Redis的设计权衡：避免频繁的编码转换带来的性能开销，同时简化实现。
        </Alert>

        <CodeBlock
          code={`# 完整示例：编码升级全过程
127.0.0.1:6379> SADD numbers 1 2 3          # 初始状态，INT16编码
(integer) 3
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"

127.0.0.1:6379> SADD numbers 50000         # 触发升级：INT16 → INT32
(integer) 1
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"

127.0.0.1:6379> SREM numbers 50000         # 删除大值
(integer) 1
127.0.0.1:6379> OBJECT ENCODING numbers    # 编码不变，仍是INT32
"intset"

# 验证：剩余的小值仍然是INT32编码
127.0.0.1:6379> SMEMBERS numbers
1) "1"
2) "2"
3) "3"`}
          language="bash"
          title="编码升级与不可降级示例"
        />

        <VideoEmbed
          title="编码升级演示"
          description="点击查看 INT16 → INT32 → INT64 升级过程"
          component={EncodingUpgradeVideo}
          props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
          autoplay={true}
        />

        <VideoEmbed
          title="编码不可降级特性"
          description="演示删除大值后编码不会降级的现象，解释Redis的设计权衡"
          component={EncodingDowngradeVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>编码选择实战指南</h2>
        <p>了解编码类型有助于预估内存占用和优化策略：</p>

        <table>
          <thead>
            <tr>
              <th>数据场景</th>
              <th>数值范围</th>
              <th>推荐编码</th>
              <th>每元素内存</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>布尔标志位</td>
              <td>0, 1</td>
              <td>INT16</td>
              <td>2字节</td>
            </tr>
            <tr>
              <td>年份</td>
              <td>1900-2100</td>
              <td>INT16</td>
              <td>2字节</td>
            </tr>
            <tr>
              <td>Unix时间戳（秒）</td>
              <td>0 - 2^31-1</td>
              <td>INT32</td>
              <td>4字节</td>
            </tr>
            <tr>
              <td>雪花算法ID</td>
              <td>0 - 2^63-1</td>
              <td>INT64</td>
              <td>8字节</td>
            </tr>
            <tr>
              <td>毫秒级时间戳</td>
              <td>0 - 2^63-1</td>
              <td>INT64</td>
              <td>8字节</td>
            </tr>
          </tbody>
        </table>

        <div className="example-box">
          <h4>实际内存计算示例</h4>
          <p>存储10000个Unix时间戳（秒级）：</p>
          <CodeBlock
          code={`# 内存占用计算
INT16: 10000 * 2 = 20,000 字节 ≈ 20 KB
INT32: 10000 * 4 = 40,000 字节 ≈ 40 KB
INT64: 10000 * 8 = 80,000 字节 ≈ 80 KB

# 实际Redis输出
127.0.0.1:6379> SADD timestamps 1700000000 1700000001 1700000002 ... 1700009999
(integer) 10000
127.0.0.1:6379> MEMORY USAGE timestamps
(integer) 40144  # ≈ 40KB，与INT32计算一致`}
          language="bash"
        />
        </div>
      </section>

      <section>
        <h2>为什么需要动态编码？</h2>
        <p>
          动态编码是Redis为IntSet设计的内存优化机制。固定编码会导致内存浪费：
        </p>
        <ul>
          <li>如果统一使用INT64，存储小数字会浪费75%内存</li>
          <li>如果统一使用INT16，无法存储超过32767的数字</li>
          <li>动态编码让IntSet根据实际数据选择最优编码</li>
        </ul>

        <div className="key-points">
          <h4>编码优化的实际效果</h4>
          <p>
            假设存储 [1, 100, 200] 三个数字：<br/>
            INT64编码：3 × 8 = 24字节<br/>
            INT16编码：3 × 2 = 6字节<br/>
            <strong>节省 75% 内存！</strong>
          </p>
        </div>

        <h3>实战：如何查看当前编码</h3>
        <p>在生产环境中，你可能需要查看某个Set的当前编码类型。以下是具体步骤：</p>

        <CodeBlock
          code={`# Step 1: 创建一个整数集合
127.0.0.1:6379> SADD test_ints 10 20 30
(integer) 3

# Step 2: 查看编码类型
# encoding 为 "intset" 表示使用了整数集合编码
127.0.0.1:6379> OBJECT ENCODING test_ints
"intset"

# Step 3: 查看内存占用（字节）
127.0.0.1:6379> MEMORY USAGE test_ints
(integer) 72

# Step 4: 查看元素数量
127.0.0.1:6379> SCARD test_ints
(integer) 3

# Step 5: 查看详细内部信息
127.0.0.1:6379> DEBUG OBJECT test_ints
Value at:0x7f8a... refcount:1 encoding:intset serializedlength:16 lru:2412456 lru_seconds_idle:5

# 参数说明：
# encoding:intset  -> 使用IntSet编码（不是hashtable）
# serializedlength:16 -> 序列化后占16字节
# refcount:1 -> 引用计数为1`}
          language="bash"
          title="查看编码类型实战"
          showLineNumbers
        />

        <h3>编码升级的实战影响</h3>
        <p>让我们通过一个完整示例理解编码升级对内存的影响：</p>

        <CodeBlock
          code={`# 场景：存储用户年龄数据
# 初始状态 - 小数字使用INT16
127.0.0.1:6379> SADD user_ages 25 30 35 40 45
(integer) 5
127.0.0.1:6379> OBJECT ENCODING user_ages
"intset"  # INT16编码，每个元素2字节

# 内存计算：8字节头 + 5×2字节 = 18字节
127.0.0.1:6379> MEMORY USAGE user_ages
(integer) 72  # 包含Redis对象头

# 添加一个大年龄值，触发编码升级
127.0.0.1:6379> SADD user_ages 150000  # 超出INT16范围
(integer) 1
127.0.0.1:6379> OBJECT ENCODING user_ages
"intset"  # 已升级为INT32

# 内存变化：8字节头 + 6×4字节 = 32字节
127.0.0.1:6379> MEMORY USAGE user_ages
(integer) 112

# 查看所有元素
127.0.0.1:6379> SMEMBERS user_ages
1) "25"
2) "30"
3) "35"
4) "40"
5) "45"
6) "150000"`}
          language="bash"
          title="编码升级实战"
          showLineNumbers
        />

        <div className="info-box">
          <h4>实战建议：避免频繁编码升级</h4>
          <p>如果你的业务场景中偶尔会有大值插入，建议：</p>
          <ul>
            <li>批量导入数据时先对数据进行排序，先插入大值</li>
            <li>一次SADD插入多个值时，如果有一个触发升级，整个IntSet都会升级</li>
            <li>删除触发升级的大值后，编码不会降级，所以初始插入顺序很重要</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Encoding;
