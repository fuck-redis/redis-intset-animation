import React from 'react';
import { ExternalLink, FileCode, FolderTree, BookOpen } from 'lucide-react';
import '../chapters/ChapterStyles.css';

const Overview: React.FC = () => {
  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">概览与结构</h1>
        <p className="chapter-subtitle">
          了解Redis IntSet的整体架构、文件组织和设计理念
        </p>
      </div>

      <section className="chapter-section">
        <h2 className="section-title">IntSet在Redis中的位置</h2>
        <div className="section-content">
          <p>
            IntSet是Redis内部使用的一种紧凑型数据结构，主要用于存储整数集合。
            在Redis的对象系统中，当一个Set对象满足以下两个条件时，会使用IntSet作为底层实现：
          </p>
          <ul>
            <li>集合中的所有元素都是整数</li>
            <li>集合的元素数量不超过配置的阈值（默认512个）</li>
          </ul>
          <p>
            一旦不满足这些条件，Redis会自动将IntSet转换为哈希表实现。
          </p>
        </div>

        <div className="info-box">
          <h3 className="info-box-title">
            <BookOpen size={20} />
            配置参数
          </h3>
          <div className="info-box-content">
            <p>在redis.conf中可以配置IntSet的使用阈值：</p>
            <code>set-max-intset-entries 512</code>
            <p>这个值越大，IntSet的使用场景越多，但转换开销也会增加。</p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">源码文件结构</h2>
        <div className="section-content">
          <p>IntSet的实现非常精简，只包含两个文件：</p>
        </div>

        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">
              <FileCode size={20} />
              intset.h
            </h3>
            <p className="feature-card-content">
              <strong>头文件</strong> - 包含数据结构定义、宏定义和函数声明。
              定义了IntSet的结构体、编码常量和所有对外API。
            </p>
            <a 
              href="https://github.com/redis/redis/blob/unstable/src/intset.h" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              style={{ marginTop: '0.5rem', display: 'inline-flex' }}
            >
              <ExternalLink size={14} />
              查看源码
            </a>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">
              <FileCode size={20} />
              intset.c
            </h3>
            <p className="feature-card-content">
              <strong>实现文件</strong> - 包含所有函数的具体实现。
              约500行代码实现了创建、查找、插入、删除、升级等核心功能。
            </p>
            <a 
              href="https://github.com/redis/redis/blob/unstable/src/intset.c" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              style={{ marginTop: '0.5rem', display: 'inline-flex' }}
            >
              <ExternalLink size={14} />
              查看源码
            </a>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">核心设计理念</h2>
        <div className="section-content">
          <p>IntSet的设计体现了Redis对性能和内存的极致追求：</p>
        </div>

        <div className="card-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">1. 紧凑内存布局</h3>
            <p className="feature-card-content">
              使用柔性数组成员（Flexible Array Member）直接在结构体后存储数据，
              避免了额外的指针开销，使整个IntSet在内存中连续存储。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">2. 自适应编码</h3>
            <p className="feature-card-content">
              根据存储的整数范围动态选择2字节、4字节或8字节编码，
              在保证功能的前提下最小化内存占用。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">3. 有序存储</h3>
            <p className="feature-card-content">
              元素按从小到大排序存储，使得查找可以使用二分搜索算法，
              时间复杂度为O(log n)。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">4. 单向升级</h3>
            <p className="feature-card-content">
              编码只会升级不会降级，避免频繁的类型转换。
              这是一个权衡：牺牲少量内存换取性能稳定性。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">5. 零拷贝操作</h3>
            <p className="feature-card-content">
              使用memmove等底层内存操作函数，直接操作内存块，
              避免逐个元素的复制操作。
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-card-title">6. 简单高效</h3>
            <p className="feature-card-content">
              整个实现不到500行代码，没有复杂的抽象层次，
              直接高效地完成核心功能。
            </p>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">代码组织结构</h2>
        <div className="section-content">
          <p>intset.c文件按照功能模块组织，结构清晰：</p>
        </div>

        <div className="info-box">
          <h3 className="info-box-title">
            <FolderTree size={20} />
            函数分类
          </h3>
          <div className="info-box-content">
            <ul>
              <li><strong>基础工具函数</strong>：字节序转换、编码判断等</li>
              <li><strong>内存操作函数</strong>：获取/设置元素、内存调整等</li>
              <li><strong>查找函数</strong>：二分查找实现</li>
              <li><strong>修改操作</strong>：插入、删除、升级等</li>
              <li><strong>公共API</strong>：对外暴露的接口函数</li>
              <li><strong>工具函数</strong>：随机获取、验证等辅助功能</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">关键实现特点</h2>
        
        <h3 className="section-subtitle">1. 字节序处理</h3>
        <div className="section-content">
          <p>
            Redis需要在不同架构的机器上运行，IntSet使用一系列宏来处理大端/小端字节序问题：
          </p>
        </div>
        <div className="code-block">
          <div className="code-header">
            <span className="code-filename">endianconv.h - 字节序转换宏</span>
          </div>
          <pre><code>{`#if (BYTE_ORDER == LITTLE_ENDIAN)
#define intrev32ifbe(v) (v)
#define intrev64ifbe(v) (v)
#else
#define intrev32ifbe(v) intrev32(v)
#define intrev64ifbe(v) intrev64(v)
#endif`}</code></pre>
        </div>

        <h3 className="section-subtitle">2. 内存分配策略</h3>
        <div className="section-content">
          <p>
            IntSet使用Redis的内存分配器zmalloc，它会记录分配的内存大小，
            便于统计Redis的总内存使用情况。每次添加或删除元素时，都会调用zrealloc调整内存大小。
          </p>
        </div>

        <h3 className="section-subtitle">3. 错误处理</h3>
        <div className="section-content">
          <p>
            IntSet的设计非常简洁，大部分函数不返回错误码。
            这是因为IntSet主要用于Redis内部，调用方能够保证参数的正确性。
            在极少数可能失败的情况（如内存分配失败），Redis会调用oom处理函数。
          </p>
        </div>
      </section>

      <section className="chapter-section">
        <h2 className="section-title">性能考量</h2>
        <div className="section-content">
          <p>IntSet的设计做了多方面的性能优化：</p>
        </div>

        <table className="comparison-table">
          <thead>
            <tr>
              <th>优化点</th>
              <th>具体实现</th>
              <th>效果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>内存连续性</td>
              <td>使用柔性数组成员</td>
              <td>提高CPU缓存命中率</td>
            </tr>
            <tr>
              <td>查找优化</td>
              <td>二分查找 + 边界检查</td>
              <td>O(log n)复杂度，常见情况更快</td>
            </tr>
            <tr>
              <td>批量操作</td>
              <td>使用memmove移动数据</td>
              <td>比逐元素操作快数倍</td>
            </tr>
            <tr>
              <td>升级优化</td>
              <td>新值必在边界，无需查找</td>
              <td>减少一次O(log n)操作</td>
            </tr>
            <tr>
              <td>位运算</td>
              <td>用位移代替除法</td>
              <td>指令级加速</td>
            </tr>
            <tr>
              <td>减少函数调用</td>
              <td>关键函数使用static内联</td>
              <td>减少函数调用开销</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="highlight-box">
        <div className="highlight-content">
          <strong>学习建议：</strong>
          IntSet是学习C语言数据结构实现的绝佳范例。建议先通读一遍源码，
          理解整体结构，然后结合本教程深入每个核心函数的实现细节。
          推荐使用GDB单步调试来观察实际运行过程。
        </div>
      </div>
    </div>
  );
};

export default Overview;
