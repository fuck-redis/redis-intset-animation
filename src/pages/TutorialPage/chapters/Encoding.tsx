import './chapter.css';
import React from 'react';
import CodeBlock from '../../../components/CodeBlock/CodeBlock';
import Alert from '../../../components/Alert/Alert';
import VideoEmbed from '../../../components/VideoEmbed';
import { EncodingUpgradeVideo, EncodingDowngradeVideo, EncodingRangeVideo, EncodingScenarioVideo } from '../../../videos';

const Encoding: React.FC = () => {
  return (
    <div className="chapter-content">
      <h1>编码类型详解</h1>

      <section>
        <h2>三种编码类型</h2>
        <p>IntSet支持三种整数编码，会根据存储值的范围自动选择：</p>

        <div className="encoding-cards">
          <div className="encoding-card">
            <h3>INT16 (2字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>-32,768 ~ 32,767</li>
              <li><strong>内存占用：</strong>2字节/元素</li>
              <li><strong>适用场景：</strong>用户ID、小型标签ID</li>
            </ul>
          </div>

          <div className="encoding-card">
            <h3>INT32 (4字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>-2,147,483,648 ~ 2,147,483,647</li>
              <li><strong>内存占用：</strong>4字节/元素</li>
              <li><strong>适用场景：</strong>时间戳（秒级）、大型ID</li>
            </ul>
          </div>

          <div className="encoding-card">
            <h3>INT64 (8字节)</h3>
            <ul>
              <li><strong>取值范围：</strong>±9,223,372,036,854,775,807</li>
              <li><strong>内存占用：</strong>8字节/元素</li>
              <li><strong>适用场景：</strong>时间戳（毫秒级）、超大ID</li>
            </ul>
          </div>
        </div>

        <VideoEmbed
          title="编码适用场景决策"
          description="不同场景下如何选择编码类型：用户ID、时间戳、超大数值"
          component={EncodingScenarioVideo}
          props={{}}
          autoplay={true}
        />
      </section>

      <VideoEmbed
        title="编码数值范围对比"
        description="可视化展示 INT16、INT32、INT64 三种编码的取值范围差异"
        component={EncodingRangeVideo}
        props={{}}
        autoplay={true}
      />

      <VideoEmbed
        title="编码升级演示"
        description="点击查看 INT16 → INT32 → INT64 升级过程"
        component={EncodingUpgradeVideo}
        props={{ initialEncoding: 'INT16', triggerValue: 50000 }}
        autoplay={true}
      />

      <section>
        <h2>编码升级机制</h2>
        <p>
          当插入的值超出当前编码范围时，IntSet会自动升级到更大的编码。
          这是一个<strong>单向过程</strong>，即编码只能升级不能降级。
        </p>

        <Alert type="warning" title="重要特性：编码不可降级">
          即使删除了导致升级的大值元素，编码也不会降级回原来的类型。
          这是Redis的设计权衡，避免频繁的编码转换带来的性能开销。
        </Alert>

        <CodeBlock
          code={`# 示例
SADD myset 1 2 3          # INT16编码
SADD myset 100000         # 升级到INT32
SREM myset 100000         # 删除大值
OBJECT ENCODING myset     # 仍然是INT32，不会降级`}
          language="bash"
        />

        <VideoEmbed
          title="编码不可降级特性"
          description="演示删除大值后编码不会降级的现象，解释Redis的设计权衡"
          component={EncodingDowngradeVideo}
          props={{}}
          autoplay={true}
        />
      </section>
    </div>
  );
};

export default Encoding;
