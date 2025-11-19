import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';

const FAQ: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>常见问题FAQ</h1>
      
      <section className="faq-section">
        <div className="faq-item">
          <h3>Q1: IntSet为什么不能降级编码？</h3>
          <p>
            <strong>A:</strong> 这是性能和复杂度的权衡。如果支持降级，每次删除都要检查是否可以降级，
            这会带来额外的性能开销。Redis选择了更简单高效的单向升级策略。
          </p>
        </div>

        <div className="faq-item">
          <h3>Q2: IntSet的元素是如何保持有序的？</h3>
          <p>
            <strong>A:</strong> 通过插入时的二分查找和元素移动。每次插入都会找到正确的位置，
            然后移动后续元素为新元素腾出空间。虽然插入是O(n)，但这保证了查找是O(log n)。
          </p>
        </div>

        <div className="faq-item">
          <h3>Q3: 什么时候IntSet会转换为HashTable？</h3>
          <p><strong>A:</strong> 两种情况：</p>
          <ol>
            <li>添加了非整数元素（如字符串）</li>
            <li>元素数量超过<code>set-max-intset-entries</code>配置值（默认512）</li>
          </ol>
          <p>注意：转换是<strong>不可逆</strong>的，转为HashTable后不会再转回IntSet。</p>
        </div>

        <div className="faq-item">
          <h3>Q4: IntSet适合存储哪些数据？</h3>
          <p><strong>A:</strong> 最适合：</p>
          <ul>
            <li>✅ 用户ID集合（如在线用户、活跃用户）</li>
            <li>✅ 文章ID、商品ID等业务ID</li>
            <li>✅ 标签ID、分类ID</li>
            <li>✅ 日期时间戳（秒级）</li>
            <li>✅ 小规模（&lt;512）的整数集合</li>
          </ul>
        </div>

        <div className="faq-item">
          <h3>Q5: 如何判断当前Set使用的是IntSet还是HashTable？</h3>
          <p><strong>A:</strong> 使用<code>OBJECT ENCODING</code>命令：</p>
          <CodeBlock 
            code={`127.0.0.1:6379> OBJECT ENCODING myset
"intset"  # 或 "hashtable"`}
            language="bash"
          />
        </div>
      </section>
    </div>
  );
};

export default FAQ;
