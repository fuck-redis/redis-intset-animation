import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import VideoEmbed from '../../../components/VideoEmbed';
import { EncodingUpgradeVideo, ResizeToHashTableVideo, CommandDemoVideo, SetMaxEntriesVideo, NonIntegerConversionVideo } from '../../../videos';

const RedisPractice: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>Redis实战</h1>

      <section>
        <h2>查看底层编码</h2>
        <p>
          在实际使用中，了解Set的底层编码有助于优化决策。
          Redis提供了多个命令来检查IntSet的状态。
        </p>

        <CodeBlock
          code={`# 创建整数Set
127.0.0.1:6379> SADD numbers 1 2 3 4 5
(integer) 5

# 查看底层编码类型
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"  # 整数集合使用了IntSet编码

# 查看内存占用（字节）
127.0.0.1:6379> MEMORY USAGE numbers
(integer) 94  # 包含Redis对象头的总内存

# 查看详细内部信息
127.0.0.1:6379> DEBUG OBJECT numbers
Value at:0x7f... refcount:1 encoding:intset serializedlength:22 lru:14553210 lru_seconds_idle:12`}
          language="bash"
          title="查看底层编码"
        />

        <VideoEmbed
          title="Redis命令演示动画"
          description="终端演示OBJECT ENCODING和MEMORY USAGE命令的使用"
          component={CommandDemoVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>触发编码升级</h2>
        <p>
          当插入的值超出当前编码范围时，IntSet会自动升级到更大的编码类型。
          让我们通过实际示例和动画来理解这个过程：
        </p>

        <CodeBlock
          code={`# Step 1: 初始状态 - INT16编码
127.0.0.1:6379> SADD ids 100 200 300
(integer) 3
127.0.0.1:6379> OBJECT ENCODING ids
"intset"  # 100, 200, 300 都在INT16范围内

# Step 2: 插入超出INT16范围的值
127.0.0.1:6379> SADD ids 50000
(integer) 1
127.0.0.1:6379> OBJECT ENCODING ids
"intset"  # 已自动升级到INT32

# Step 3: 验证编码已升级
127.0.0.1:6379> DEBUG OBJECT ids
... encoding:intset serializedlength:22 ...

# Step 4: 删除大值后编码不会降级
127.0.0.1:6379> SREM ids 50000
(integer) 1
127.0.0.1:6379> OBJECT ENCODING ids
"intset"  # 仍然是INT32！`}
          language="bash"
          title="编码升级示例"
        />

        <VideoEmbed
          title="编码升级动画演示"
          description="观察INT16如何升级到INT32编码"
          component={EncodingUpgradeVideo}
          props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>转换为HashTable</h2>
        <p>
          IntSet会在以下两种情况下转换为HashTable：
        </p>

        <div className="info-box">
          <h4>转换触发条件</h4>
          <ol>
            <li><strong>元素数量超限</strong>：超过 <code>set-max-intset-entries</code>（默认512）</li>
            <li><strong>类型变化</strong>：添加非整数元素（如字符串）</li>
          </ol>
        </div>

        <h3>场景一：元素数量超过阈值</h3>
        <CodeBlock
          code={`# 创建512个元素的IntSet
127.0.0.1:6379> EVAL "redis.call('SADD', KEYS[1], ...Array.from({length: 512}, (_, i) => i))" 1 large_set
(integer) 512
127.0.0.1:6379> OBJECT ENCODING large_set
"intset"

# 添加第513个元素，触发转换
127.0.0.1:6379> SADD large_set 999
(integer) 1
127.0.0.1:6379> OBJECT ENCODING large_set
"hashtable"  # 已转换为HashTable！`}
          language="bash"
          title="元素数量超限"
        />

        <VideoEmbed
          title="IntSet转换为HashTable动画演示"
          description="观察IntSet在超过512元素时如何转换为HashTable"
          component={ResizeToHashTableVideo}
          props={{ triggerType: 'overflow', initialData: Array.from({length: 600}, (_, i) => i), maxEntries: 512 }}
          autoplay={true}
        />

        <h3>场景二：添加非整数元素</h3>
        <CodeBlock
          code={`# 创建整数集合
127.0.0.1:6379> SADD myset 1 2 3
(integer) 3
127.0.0.1:6379> OBJECT ENCODING myset
"intset"

# 添加字符串元素
127.0.0.1:6379> SADD myset "hello"
(integer) 1
127.0.0.1:6379> OBJECT ENCODING myset
"hashtable"  # 立即转换为HashTable！

# 注意：这是不可逆的
127.0.0.1:6379> SREM myset "hello"
(integer) 1
127.0.0.1:6379> OBJECT ENCODING myset
"hashtable"  # 仍然是hashtable！`}
          language="bash"
          title="添加非整数元素"
        />

        <VideoEmbed
          title="添加非整数元素时转换"
          description="观察添加字符串 hello 时IntSet立即转换为HashTable"
          component={NonIntegerConversionVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>配置优化</h2>
        <p>
          <code>set-max-intset-entries</code> 配置决定了IntSet转换为HashTable的阈值。
          根据实际场景调整这个值可以获得更好的内存或性能表现。
        </p>

        <div className="pro-con">
          <div className="pro-con-box pro">
            <h4>增大阈值的好处</h4>
            <ul>
              <li>更多集合使用IntSet</li>
              <li>内存占用更低</li>
              <li>适合读多写少场景</li>
            </ul>
          </div>
          <div className="pro-con-box con">
            <h4>增大阈值的代价</h4>
            <ul>
              <li>插入性能可能下降</li>
              <li>编码升级更频繁</li>
              <li>元素过多时二分查找优势减弱</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          code={`# 方法1: 在redis.conf中配置（需要重启）
# 文件位置: /etc/redis/redis.conf
set-max-intset-entries 1024

# 方法2: 运行时修改（立即生效，但重启后失效）
127.0.0.1:6379> CONFIG SET set-max-intset-entries 1024
OK
127.0.0.1:6379> CONFIG GET set-max-intset-entries
1) "set-max-intset-entries"
2) "1024"

# 方法3: 查看当前配置
127.0.0.1:6379> CONFIG GET set-max-intset-entries
1) "set-max-intset-entries"
2) "512"`}
          language="bash"
          title="redis.conf配置"
        />

        <VideoEmbed
          title="SetMaxEntries配置动画演示"
          description="观察set-max-intset-entries配置如何影响IntSet到HashTable的转换阈值"
          component={SetMaxEntriesVideo}
          props={{ threshold: 512 }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>实战案例：用户在线状态</h2>
        <p>
          这是一个典型的IntSet使用场景。假设我们需要记录当前在线的用户ID。
        </p>

        <CodeBlock
          code={`# 场景：记录10万个在线用户ID

# 使用IntSet存储
127.0.0.1:6379> SADD online_users 1001 1002 1003 ... 110000
(integer) 100000
127.0.0.1:6379> OBJECT ENCODING online_users
"intset"  # 自动选择合适的编码

# 查看内存占用
127.0.0.1:6379> MEMORY USAGE online_users
(integer) 408144  # 约400KB

# 判断用户是否在线 - O(log n) 但极快
127.0.0.1:6379> SISMEMBER online_users 10050
(integer) 1  # 在线

# 统计在线人数
127.0.0.1:6379> SCARD online_users
(integer) 100000

# 对比：如果用HashTable存储
# 预估内存：100000 * 48字节 ≈ 4.8MB
# IntSet节省约 90% 内存！`}
          language="bash"
          title="用户在线状态案例"
        />

        <div className="key-points">
          <h4>使用IntSet的最佳实践</h4>
          <ul>
            <li>初始化时批量添加：<code>SADD key m1 m2 m3 ...</code></li>
            <li>避免频繁的单元素插入：每次插入都是O(n)</li>
            <li>定期同步而非实时更新：批量处理更高效</li>
            <li>监控编码类型：使用 <code>OBJECT ENCODING</code> 了解当前状态</li>
          </ul>
        </div>

        <h3>进阶案例：用户签到系统</h3>
        <p>使用IntSet记录用户每日的签到情况，支持查询某用户是否签到：</p>

        <CodeBlock
          code={`# 设计思路：每天一个Set，key格式为 checkin:YYYYMMDD
# 用户ID为整数，非常适合IntSet存储

# Step 1: 用户签到（添加用户ID到当天的签到集合）
127.0.0.1:6379> SADD checkin:20240315 1001 1002 1003 1004 1005
(integer) 5

# Step 2: 检查用户是否签到
127.0.0.1:6379> SISMEMBER checkin:20240315 1003
(integer) 1  # 已签到
127.0.0.1:6379> SISMEMBER checkin:20240315 9999
(integer) 0  # 未签到

# Step 3: 统计当天签到人数
127.0.0.1:6379> SCARD checkin:20240315
(integer) 5

# Step 4: 获取所有签到用户
127.0.0.1:6379> SMEMBERS checkin:20240315
1) "1001"
2) "1002"
3) "1003"
4) "1004"
5) "1005"

# Step 5: 查看内存占用
127.0.0.1:6379> MEMORY USAGE checkin:20240315
(integer) 96

# 扩展：统计连续签到用户（需要对比多天数据）
127.0.0.1:6379> SINTER checkin:20240315 checkin:20240314 checkin:20240313
(empty array)  # 没有用户连续签到3天`}
          language="bash"
          title="签到系统案例"
        />

        <h3>进阶案例：商品收藏系统</h3>
        <p>使用IntSet记录用户收藏的商品ID：</p>

        <CodeBlock
          code={`# key格式：favorites:userID
# 存储用户收藏的商品ID列表

# 用户1001收藏了一些商品
127.0.0.1:6379> SADD favorites:1001 50001 50002 50003 50004 50005
(integer) 5
127.0.0.1:6379> OBJECT ENCODING favorites:1001
"intset"

# 检查是否收藏了某商品
127.0.0.1:6379> SISMEMBER favorites:1001 50003
(integer) 1  # 已收藏

# 获取所有收藏商品
127.0.0.1:6379> SMEMBERS favorites:1001
1) "50001"
2) "50002"
3) "50003"
4) "50004"
5) "50005"

# 取消收藏
127.0.0.1:6379> SREM favorites:1001 50005
(integer) 1

# 获取收藏数量
127.0.0.1:6379> SCARD favorites:1001
(integer) 4

# 场景：找出共同收藏了两个商品的用户
127.0.0.1:6379> SADD favorites:1002 50001 50002 50003
(integer) 3
127.0.0.1:6379> SINTER favorites:1001 favorites:1002
1) "50001"
2) "50002"
3) "50003"  # 用户1001和1002都收藏了这些商品`}
          language="bash"
          title="商品收藏系统案例"
        />

        <h3>进阶案例：IP黑名单</h3>
        <p>使用IntSet存储被禁止的IP地址（转换为整数）：</p>

        <CodeBlock
          code={`# 将IP地址转换为整数存储
# 例如：192.168.1.100 -> 3232235876

# 添加IP到黑名单
127.0.0.1:6379> SADD blocked_ips 3232235876 3232235877 3232235878
(integer) 3

# 检查IP是否被封禁
# 假设 3232235876 是 192.168.1.100
127.0.0.1:6379> SISMEMBER blocked_ips 3232235876
(integer) 1  # 被封禁

# 批量封禁多个IP
127.0.0.1:6379> SADD blocked_ips 3232235879 3232235880 3232235881
(integer) 3

# 解封某个IP
127.0.0.1:6379> SREM blocked_ips 3232235877
(integer) 1

# 查看被封禁的IP数量
127.0.0.1:6379> SCARD blocked_ips
(integer) 5

# 查看所有被封禁的IP
127.0.0.1:6379> SMEMBERS blocked_ips
1) "3232235876"
2) "3232235878"
3) "3232235879"
4) "3232235880"
5) "3232235881"

# IP转整数工具函数（Python示例）
# import ipaddress
# ip_int = int(ipaddress.ip_address("192.168.1.100"))
# print(ip_int)  # 3232235876`}
          language="bash"
          title="IP黑名单案例"
        />
      </section>
    </div>
  );
};

export default RedisPractice;
