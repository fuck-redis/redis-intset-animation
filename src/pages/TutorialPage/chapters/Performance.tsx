import './chapter.css';
import React from 'react';

const Performance: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>性能特点</h1>
      
      <section>
        <h2>操作复杂度对比</h2>
        <table className="performance-table">
          <thead>
            <tr>
              <th>操作</th>
              <th>IntSet</th>
              <th>HashTable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>插入</td>
              <td>O(n)</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td>查找</td>
              <td>O(log n)</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td>删除</td>
              <td>O(n)</td>
              <td>O(1)</td>
            </tr>
            <tr>
              <td>内存占用</td>
              <td>非常小</td>
              <td>较大</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>使用建议</h2>
        <ul>
          <li><strong>适合IntSet</strong>：
            <ul>
              <li>元素数量少（≤512）</li>
              <li>全是整数</li>
              <li>读多写少</li>
              <li>内存敏感场景</li>
            </ul>
          </li>
          <li><strong>适合HashTable</strong>：
            <ul>
              <li>元素数量大（{'>'} 512）</li>
              <li>有非整数元素</li>
              <li>写操作频繁</li>
              <li>追求极致查询速度</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Performance;
