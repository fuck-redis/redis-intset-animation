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
        <ol>
          <li><strong>检查编码范围</strong>：判断新值是否超出当前编码范围</li>
          <li><strong>二分查找位置</strong>：在有序数组中定位插入位置</li>
          <li><strong>移动元素</strong>：将插入位置后的元素向后移动</li>
          <li><strong>插入新值</strong>：在空出的位置插入元素</li>
        </ol>
        <p><strong>时间复杂度：</strong>O(n)</p>
      </section>

      <VideoEmbed
        title="插入操作演示"
        description="点击查看插入操作的完整过程"
        component={InsertOperationVideo}
        props={{ operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] }}
        autoplay={true}
      />

      <VideoEmbed
        title="批量插入操作演示"
        description="点击查看批量插入多个元素的过程，包括扩容决策"
        component={BatchOperationsVideo}
        props={{ values: [10, 20, 30, 40, 50] }}
        autoplay={true}
      />

      <section>
        <h2>内存扩容机制（intsetResize）</h2>
        <p>
          当 IntSet 的容量不足时，需要进行<strong>内存扩容</strong>：
        </p>
        <ol>
          <li><strong>检测容量</strong>：当 length == capacity 时需要扩容</li>
          <li><strong>分配新内存</strong>：分配 2x 大小的连续内存空间</li>
          <li><strong>数据迁移</strong>：将所有元素复制到新内存（O(n) 成本）</li>
          <li><strong>释放旧内存</strong>：释放原有的内存空间</li>
        </ol>

        <Alert type="info" title="扩容阈值">
          <ul>
            <li>INT16→INT32：当 length ≥ 512 时触发编码升级扩容</li>
            <li>INT32→INT64：添加超出 INT32 范围的元素时触发</li>
            <li>容量翻倍：通常是 8→16→32→64...</li>
          </ul>
        </Alert>

        <p><strong>时间复杂度：</strong>O(n)，因为需要复制所有现有元素</p>
      </section>

      <VideoEmbed
        title="内存扩容机制演示"
        description="点击查看 IntSet 内存扩容的详细过程，包括数据迁移"
        component={ResizeMechanismVideo}
        props={{}}
        autoplay={true}
      />

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

      <VideoEmbed
        title="删除操作演示"
        description="点击查看删除操作的完整过程"
        component={DeleteOperationVideo}
        props={{ operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] }}
        autoplay={true}
      />
    </div>
  );
};

export default Operations;
