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
          让我们通过动画来理解这个过程：
        </p>

        <VideoEmbed
          title="编码升级动画演示"
          description="观察INT16如何升级到INT32编码"
          component={EncodingUpgradeVideo}
          props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
          autoplay={true}
        />

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
Value at:0x7f... encoding:intset serializedlength:22 ...`}
          language="bash"
          title="触发编码升级"
        />
      </section>

      <section>
        <h2>转换为HashTable</h2>
        <p>
          当IntSet中的元素数量超过512个时，Redis会将其转换为HashTable以保持性能。
          让我们通过动画来理解这个转换过程：
        </p>

        <VideoEmbed
          title="IntSet转换为HashTable动画演示"
          description="观察IntSet在超过512元素时如何转换为HashTable"
          component={ResizeToHashTableVideo}
          props={{ triggerType: 'overflow', initialData: Array.from({length: 600}, (_, i) => i), maxEntries: 512 }}
          autoplay={true}
        />

        <VideoEmbed
          title="添加非整数元素时转换"
          description="观察添加字符串 hello 时IntSet立即转换为HashTable"
          component={NonIntegerConversionVideo}
          props={{}}
          autoplay={true}
        />

        <CodeBlock
          code={`# 添加非整数元素
127.0.0.1:6379> SADD myset 1 2 3
(integer) 3
127.0.0.1:6379> SADD myset "hello"
(integer) 1
127.0.0.1:6379> OBJECT ENCODING myset
"hashtable"  # 已转换为hashtable`}
          language="bash"
          title="转换为HashTable"
        />
      </section>

      <section>
        <h2>配置优化</h2>
        <CodeBlock
          code={`# 调整IntSet使用阈值（默认512）
set-max-intset-entries 1024

# 重启Redis后生效
# 或者运行时修改：
CONFIG SET set-max-intset-entries 1024`}
          language="bash"
          title="redis.conf"
        />

        <VideoEmbed
          title="SetMaxEntries配置动画演示"
          description="观察set-max-intset-entries配置如何影响IntSet到HashTable的转换阈值"
          component={SetMaxEntriesVideo}
          props={{ threshold: 512 }}
          autoplay={true}
        />
      </section>
    </div>
  );
};

export default RedisPractice;
