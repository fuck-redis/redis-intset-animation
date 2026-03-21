import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import Alert from '../../../components/Alert/Alert';
import VideoEmbed from '../../../components/VideoEmbed';
import { BinarySearchVideo, BinarySearchStepVideo, IntSetVsHashTableVideo, IntSetCharacteristicsVideo, IntSetSelectionVideo, DataStructureOverviewVideo } from '../../../videos';
import './chapter.css';

const WhatIsIntSet: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>IntSet是什么？</h1>

      <VideoEmbed
        title="Redis 数据结构全景"
        description="了解 IntSet 在 Redis 数据结构家族中的位置"
        component={DataStructureOverviewVideo}
        props={{}}
        autoplay={true}
      />

      <section>
        <h2>定义</h2>
        <p>
          IntSet（Integer Set，整数集合）是Redis用于存储<strong>整数类型Set集合</strong>的底层数据结构之一。
          它是一个<strong>有序的</strong>、<strong>紧凑的</strong>整数数组，专门为了节省内存而设计。
        </p>

        <Alert type="tip" title="核心思想">
          IntSet通过<strong>动态编码</strong>和<strong>有序存储</strong>实现了内存和性能的平衡。
          它会根据存储的整数范围自动选择最小的编码类型，从而最大化内存利用率。
        </Alert>

        <VideoEmbed
          title="IntSet 核心特性"
          description="了解 IntSet 的有序性、紧凑存储和动态编码机制"
          component={IntSetCharacteristicsVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <VideoEmbed
        title="IntSet 工作演示"
        description="点击查看 IntSet 如何进行二分查找操作"
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
        <h2>为什么需要IntSet？</h2>
        <p>在Redis中，Set类型可以用两种底层实现：</p>
        <ul>
          <li><strong>HashTable</strong>：通用哈希表，查找O(1)但内存开销大</li>
          <li><strong>IntSet</strong>：整数专用，内存高效但插入删除O(n)</li>
        </ul>

        <p>当Set满足以下条件时，Redis会自动选择IntSet：</p>
        <ul>
          <li>所有元素都是<strong>整数值</strong></li>
          <li>元素数量不超过<code>set-max-intset-entries</code>（默认512）</li>
        </ul>

        <CodeBlock
          code={`# redis.conf配置项
set-max-intset-entries 512  # 超过此值自动转为hashtable`}
          language="bash"
          title="Redis配置"
        />

        <VideoEmbed
          title="IntSet 选择条件"
          description="动画演示 IntSet 的两个选择条件及决策流程"
          component={IntSetSelectionVideo}
          props={{}}
          autoplay={true}
        />

        <VideoEmbed
          title="HashTable vs IntSet 对比"
          description="点击查看 IntSet 与 HashTable 的内存布局和查找效率对比"
          component={IntSetVsHashTableVideo}
          props={{ intSetData: [1, 15, 23, 42, 56], hashTableData: [1, 15, 23, 42, 56], searchValue: 42 }}
          autoplay={true}
        />
      </section>
    </div>
  );
};

export default WhatIsIntSet;
