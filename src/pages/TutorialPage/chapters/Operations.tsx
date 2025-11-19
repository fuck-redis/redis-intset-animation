import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import Alert from '../../../components/Alert/Alert';

const Operations: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>核心操作详解</h1>
      
      <section>
        <h2>插入操作（intsetAdd）</h2>
        <ol>
          <li><strong>检查编码范围</strong>：判断新值是否超出当前编码范围</li>
          <li><strong>二分查找位置</strong>：在有序数组中定位插入位置</li>
          <li><strong>移动元素</strong>：将插入位置后的元素向后移动</li>
          <li><strong>插入新值</strong>：在空出的位置插入元素</li>
        </ol>
        <p><strong>时间复杂度：</strong>O(n)</p>
      </section>

      <section>
        <h2>查找操作（intsetFind）</h2>
        <p>IntSet使用<strong>二分查找</strong>算法：</p>
        <CodeBlock 
          code={`// 伪代码
function binarySearch(value):
    left = 0
    right = length - 1
    
    while left <= right:
        mid = (left + right) / 2
        current = contents[mid]
        
        if current == value:
            return true       // 找到
        else if current < value:
            left = mid + 1
        else:
            right = mid - 1
    
    return false             // 未找到`}
          language="python"
          title="二分查找算法"
          showLineNumbers
        />
        <p><strong>时间复杂度：</strong>O(log n)</p>
      </section>

      <section>
        <h2>删除操作（intsetRemove）</h2>
        <p>删除过程与插入类似，但方向相反：</p>
        <ol>
          <li>二分查找要删除的元素位置</li>
          <li>将后续所有元素向前移动覆盖</li>
          <li>减少length，释放内存（如需要）</li>
        </ol>

        <Alert type="warning" title="注意">
          删除操作不会触发编码降级，即使删除后所有元素都在小范围内。
        </Alert>
      </section>
    </div>
  );
};

export default Operations;
