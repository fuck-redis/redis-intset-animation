import './chapter.css';
import React from 'react';
import VideoEmbed from '../../../components/VideoEmbed';
import { BinarySearchVideo, InsertOperationVideo, ComplexityCompareVideo, UseCaseRecommendationVideo, MemoryCompareVideo, OperationCompareVideo } from '../../../videos';

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

        <VideoEmbed
          title="操作复杂度对比动画"
          description="动态展示 IntSet 与 HashTable 在各项操作上的复杂度差异"
          component={OperationCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>复杂度可视化</h2>
        <p>
          下面的动画展示了<strong>O(1)</strong>、<strong>O(log n)</strong> 和 <strong>O(n)</strong> 三种复杂度随数据量增长时的性能差异。
          可以清晰地看到，当数据量较小时，各种复杂度的差异并不明显。
        </p>

        <VideoEmbed
          title="时间复杂度对比"
          description="动态展示 O(1)、O(log n)、O(n) 随数据量增长的性能差异"
          component={ComplexityCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <section>
        <h2>查找操作 - O(log n) vs O(1)</h2>
        <p>
          IntSet使用二分查找，时间复杂度为<strong>O(log n)</strong>。
          相比HashTable的O(1)查找，虽然略慢，但对于小数据量来说差异微乎其微。
        </p>

        <VideoEmbed
          title="二分查找演示"
          description="IntSet使用二分查找，查找效率随数据量增长呈对数增长"
          component={BinarySearchVideo}
          props={{ searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] }}
          autoplay={true}
        />
      </section>

      <section>
        <h2>插入操作 - O(n)</h2>
        <p>
          IntSet的插入操作需要<strong>移动元素</strong>来保持有序性，因此时间复杂度为O(n)。
          这也是IntSet适合"读多写少"场景的原因。
        </p>

        <VideoEmbed
          title="插入操作演示"
          description="插入时需要移动后续元素，为新元素腾出位置"
          component={InsertOperationVideo}
          props={{ operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] }}
          autoplay={true}
        />
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

        <VideoEmbed
          title="适用场景决策树"
          description="根据数据类型和规模选择合适的数据结构"
          component={UseCaseRecommendationVideo}
          props={{}}
          autoplay={true}
        />

        <VideoEmbed
          title="内存占用对比动画"
          description="IntSet相比HashTable可节省高达91%的内存"
          component={MemoryCompareVideo}
          props={{}}
          autoplay={true}
        />
      </section>
    </div>
  );
};

export default Performance;
