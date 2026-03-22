import React from 'react';
import { BookMarked, ExternalLink } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import '../chapters/ChapterStyles.css';

const APIReference: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">API完整参考</h1>
        <p className="chapter-subtitle">IntSet提供的所有公共接口函数详解</p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">核心API</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>函数</th>
              <th>功能</th>
              <th>时间复杂度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>intsetNew()</code></td>
              <td>创建空IntSet</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td><code>intsetAdd()</code></td>
              <td>添加元素</td>
              <td>O(n)</td>
            </tr>
            <tr>
              <td><code>intsetRemove()</code></td>
              <td>删除元素</td>
              <td>O(n)</td>
            </tr>
            <tr>
              <td><code>intsetFind()</code></td>
              <td>查找元素</td>
              <td>O(log n)</td>
            </tr>
            <tr>
              <td><code>intsetRandom()</code></td>
              <td>随机返回一个元素</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td><code>intsetGet()</code></td>
              <td>获取指定位置元素</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td><code>intsetLen()</code></td>
              <td>获取元素数量</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td><code>intsetBlobLen()</code></td>
              <td>获取内存占用字节数</td>
              <td>O(1)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">函数详解</h2>

        <h3 className="section-subtitle">intsetFind - 查找元素</h3>
        <CodeBlock
          code={`uint8_t intsetFind(intset *is, int64_t value) {
    uint8_t valenc = _intsetValueEncoding(value);
    return valenc <= intrev32ifbe(is->encoding) &&
           intsetSearch(is,value,NULL);
}`}
          language="c"
          title="intset.c"
        />
        <div className="section-content">
          <p>返回1表示找到，0表示未找到。先检查编码避免不必要的查找。</p>
        </div>

        <h3 className="section-subtitle">intsetGet - 获取指定位置元素</h3>
        <CodeBlock
          code={`uint8_t intsetGet(intset *is, uint32_t pos, int64_t *value) {
    if (pos < intrev32ifbe(is->length)) {
        *value = _intsetGet(is,pos);
        return 1;
    }
    return 0;
}`}
          language="c"
          title="intset.c"
        />
        <div className="section-content">
          <p>按索引获取元素，pos从0开始。成功返回1，越界返回0。</p>
        </div>

        <h3 className="section-subtitle">intsetLen - 获取长度</h3>
        <CodeBlock
          code={`uint32_t intsetLen(const intset *is) {
    return intrev32ifbe(is->length);
}`}
          language="c"
          title="intset.c"
        />

        <h3 className="section-subtitle">intsetBlobLen - 获取内存占用</h3>
        <CodeBlock
          code={`size_t intsetBlobLen(intset *is) {
    return sizeof(intset) +
           (size_t)intrev32ifbe(is->length) *
           intrev32ifbe(is->encoding);
}`}
          language="c"
          title="intset.c"
        />
      </section>

      <section className="chapter-section">
        <h2 className="section-title">使用示例</h2>
        <CodeBlock
          code={`// 创建IntSet
intset *is = intsetNew();

// 添加元素
uint8_t success;
is = intsetAdd(is, 1, &success);
is = intsetAdd(is, 3, &success);
is = intsetAdd(is, 5, &success);

// 查找元素
if (intsetFind(is, 3)) {
    printf("找到3\\n");
}

// 获取长度
printf("元素数量: %u\\n", intsetLen(is));

// 获取指定位置元素
int64_t value;
if (intsetGet(is, 1, &value)) {
    printf("位置1的元素: %lld\\n", value);
}

// 删除元素
int removed;
is = intsetRemove(is, 3, &removed);

// 释放内存
zfree(is);`}
          language="c"
          title="示例代码"
        />
      </section>

      <section className="chapter-section">
        <h2 className="section-title">学习资源</h2>
        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <BookMarked size={20} />
              官方源码
            </h3>
            <p className="feature-card-content">
              查看最新的Redis IntSet实现
            </p>
            <a 
              href="https://github.com/redis/redis/blob/unstable/src/intset.c" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              style={{ marginTop: '0.5rem', display: 'inline-flex' }}
            >
              <ExternalLink size={14} />
              访问GitHub
            </a>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">Redis文档</h3>
            <p className="feature-card-content">
              Redis官方文档关于数据类型的说明
            </p>
            <a 
              href="https://redis.io/docs/data-types/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              style={{ marginTop: '0.5rem', display: 'inline-flex' }}
            >
              <ExternalLink size={14} />
              查看文档
            </a>
          </div>
        </div>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>实践建议：</strong>
          阅读完API后，建议下载Redis源码，结合GDB调试器实际运行和观察IntSet的行为，
          这样能更深刻地理解每个函数的工作原理。
        </div>
      </div>
    </div>
  );
};

export default APIReference;
