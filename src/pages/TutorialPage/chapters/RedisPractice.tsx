import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';

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
      </section>

      <section>
        <h2>触发编码升级</h2>
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
      </section>
    </div>
  );
};

export default RedisPractice;
