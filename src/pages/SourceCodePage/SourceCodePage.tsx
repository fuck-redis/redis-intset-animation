import React from 'react';
import { ExternalLink } from 'lucide-react';
import './SourceCodePage.css';

const SourceCodePage: React.FC = () => {
  return (
    <div className="source-code-page">
      <div className="source-container">
        <div className="source-header">
          <h1>源码分析</h1>
          <p className="source-subtitle">
            深入Redis源码，理解IntSet的C语言实现
          </p>
        </div>

        <div className="source-content">
          <section className="source-section">
            <h2>Redis IntSet 源码结构</h2>
            <p>
              IntSet的实现位于Redis源码的 <code>src/intset.c</code> 和 <code>src/intset.h</code> 文件中。
              让我们逐步分析其核心实现。
            </p>

            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.h - 结构定义</span>
                <a 
                  href="https://github.com/redis/redis/blob/unstable/src/intset.h" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="github-link"
                >
                  <ExternalLink size={16} />
                  在GitHub查看
                </a>
              </div>
              <pre><code>{`typedef struct intset {
    uint32_t encoding;  // 编码类型
    uint32_t length;    // 元素数量  
    int8_t contents[];  // 柔性数组成员
} intset;

/* 编码常量定义 */
#define INTSET_ENC_INT16 (sizeof(int16_t))  // 2
#define INTSET_ENC_INT32 (sizeof(int32_t))  // 4
#define INTSET_ENC_INT64 (sizeof(int64_t))  // 8`}</code></pre>
            </div>

            <div className="explanation-box">
              <h3>结构体字段解析</h3>
              <ul>
                <li>
                  <strong>encoding</strong>: 记录当前使用的编码类型（2/4/8字节）
                </li>
                <li>
                  <strong>length</strong>: 记录集合中的元素数量
                </li>
                <li>
                  <strong>contents[]</strong>: 柔性数组成员（C99特性），实际存储整数数据。
                  这种设计避免了额外的指针开销，使内存布局更紧凑。
                </li>
              </ul>
            </div>
          </section>

          <section className="source-section">
            <h2>核心函数实现</h2>

            <h3>1. 创建IntSet</h3>
            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.c - intsetNew</span>
              </div>
              <pre><code>{`intset *intsetNew(void) {
    intset *is = zmalloc(sizeof(intset));
    is->encoding = intrev32ifbe(INTSET_ENC_INT16);
    is->length = 0;
    return is;
}`}</code></pre>
            </div>
            <p>
              新创建的IntSet默认使用INT16编码，这是最节省内存的选择。
              <code>intrev32ifbe</code> 函数用于处理字节序（大端/小端）问题。
            </p>

            <h3>2. 获取元素值</h3>
            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.c - _intsetGet</span>
              </div>
              <pre><code>{`static int64_t _intsetGet(intset *is, int pos) {
    return _intsetGetEncoded(is, pos, intrev32ifbe(is->encoding));
}

static int64_t _intsetGetEncoded(intset *is, int pos, uint8_t enc) {
    int64_t v64;
    int32_t v32;
    int16_t v16;

    if (enc == INTSET_ENC_INT64) {
        memcpy(&v64,((int64_t*)is->contents)+pos,sizeof(v64));
        memrev64ifbe(&v64);
        return v64;
    } else if (enc == INTSET_ENC_INT32) {
        memcpy(&v32,((int32_t*)is->contents)+pos,sizeof(v32));
        memrev32ifbe(&v32);
        return v32;
    } else {
        memcpy(&v16,((int16_t*)is->contents)+pos,sizeof(v16));
        memrev16ifbe(&v16);
        return v16;
    }
}`}</code></pre>
            </div>
            <p>
              根据不同的编码类型，将contents数组转换为相应的指针类型，然后读取对应位置的值。
              这展示了如何在C语言中实现多态行为。
            </p>

            <h3>3. 二分查找</h3>
            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.c - intsetSearch</span>
              </div>
              <pre><code>{`static uint8_t intsetSearch(intset *is, int64_t value, uint32_t *pos) {
    int min = 0, max = intrev32ifbe(is->length)-1, mid = -1;
    int64_t cur = -1;

    /* 空集合的特殊处理 */
    if (intrev32ifbe(is->length) == 0) {
        if (pos) *pos = 0;
        return 0;
    } else {
        /* 检查值是否超出范围 */
        if (value > _intsetGet(is,max)) {
            if (pos) *pos = intrev32ifbe(is->length);
            return 0;
        } else if (value < _intsetGet(is,0)) {
            if (pos) *pos = 0;
            return 0;
        }
    }

    /* 二分查找主循环 */
    while(max >= min) {
        mid = ((unsigned int)min + (unsigned int)max) >> 1;
        cur = _intsetGet(is,mid);
        if (value > cur) {
            min = mid+1;
        } else if (value < cur) {
            max = mid-1;
        } else {
            break;
        }
    }

    if (value == cur) {
        if (pos) *pos = mid;
        return 1;  /* 找到 */
    } else {
        if (pos) *pos = min;
        return 0;  /* 未找到，pos指向应插入位置 */
    }
}`}</code></pre>
            </div>
            <div className="explanation-box">
              <h3>算法亮点</h3>
              <ul>
                <li>先检查边界情况，提前返回</li>
                <li>使用位运算 <code>&gt;&gt; 1</code> 代替除法，性能更好</li>
                <li>未找到时返回应插入的位置，避免重复查找</li>
                <li>使用unsigned防止整数溢出</li>
              </ul>
            </div>

            <h3>4. 插入元素</h3>
            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.c - intsetAdd</span>
              </div>
              <pre><code>{`intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 1;

    /* 判断是否需要升级编码 */
    if (valenc > intrev32ifbe(is->encoding)) {
        return intsetUpgradeAndAdd(is,value);
    } else {
        /* 查找插入位置 */
        if (intsetSearch(is,value,&pos)) {
            if (success) *success = 0;
            return is;  /* 已存在，不插入 */
        }

        /* 扩展内存 */
        is = intsetResize(is,intrev32ifbe(is->length)+1);
        
        /* 移动元素 */
        if (pos < intrev32ifbe(is->length))
            intsetMoveTail(is,pos,pos+1);
    }

    /* 设置新值 */
    _intsetSet(is,pos,value);
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}`}</code></pre>
            </div>

            <h3>5. 编码升级</h3>
            <div className="code-file">
              <div className="file-header">
                <span className="file-name">intset.c - intsetUpgradeAndAdd</span>
              </div>
              <pre><code>{`static intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    uint8_t curenc = intrev32ifbe(is->encoding);
    uint8_t newenc = _intsetValueEncoding(value);
    int length = intrev32ifbe(is->length);
    
    /* 新值要么最大要么最小 */
    int prepend = value < 0 ? 1 : 0;

    /* 更新编码并调整大小 */
    is->encoding = intrev32ifbe(newenc);
    is = intsetResize(is,intrev32ifbe(is->length)+1);

    /* 从后往前迁移元素，避免覆盖 */
    while(length--)
        _intsetSet(is,length+prepend,_intsetGetEncoded(is,length,curenc));

    /* 插入新值（在开头或结尾） */
    if (prepend)
        _intsetSet(is,0,value);
    else
        _intsetSet(is,intrev32ifbe(is->length),value);
        
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}`}</code></pre>
            </div>
            <div className="explanation-box">
              <h3>升级优化</h3>
              <ul>
                <li>
                  <strong>关键观察</strong>：触发升级的值必然是当前最大或最小值
                </li>
                <li>
                  <strong>优化手段</strong>：新值直接放在头部或尾部，不需要查找位置
                </li>
                <li>
                  <strong>迁移方向</strong>：从后往前迁移，避免数据被覆盖
                </li>
              </ul>
            </div>
          </section>

          <section className="source-section">
            <h2>性能优化技巧</h2>
            <div className="optimization-grid">
              <div className="optimization-card">
                <h3>1. 紧凑内存布局</h3>
                <p>使用柔性数组成员，避免额外指针开销，提高缓存命中率</p>
              </div>
              <div className="optimization-card">
                <h3>2. 位运算优化</h3>
                <p>使用 <code>&gt;&gt; 1</code> 代替 <code>/ 2</code>，性能提升明显</p>
              </div>
              <div className="optimization-card">
                <h3>3. 边界检查优先</h3>
                <p>先检查边界再进入二分查找，减少不必要的循环</p>
              </div>
              <div className="optimization-card">
                <h3>4. 单次查找</h3>
                <p>查找失败时返回插入位置，避免插入时重复查找</p>
              </div>
              <div className="optimization-card">
                <h3>5. 批量内存操作</h3>
                <p>使用 <code>memmove</code> 批量移动元素，比逐个移动快</p>
              </div>
              <div className="optimization-card">
                <h3>6. 升级位置优化</h3>
                <p>升级时新值必在边界，直接插入无需查找</p>
              </div>
            </div>
          </section>

          <section className="source-section">
            <h2>完整API列表</h2>
            <table className="api-table">
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

          <section className="source-section">
            <h2>学习建议</h2>
            <div className="learning-tips">
              <div className="tip-card">
                <h3>📖 阅读源码</h3>
                <p>克隆Redis仓库，仔细阅读intset.c的完整实现</p>
                <a 
                  href="https://github.com/redis/redis/blob/unstable/src/intset.c" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tip-link"
                >
                  查看完整源码 →
                </a>
              </div>
              <div className="tip-card">
                <h3>🔬 单步调试</h3>
                <p>使用GDB调试Redis，观察IntSet的实际运行过程</p>
              </div>
              <div className="tip-card">
                <h3>✍️ 自己实现</h3>
                <p>尝试用你熟悉的语言实现一个简化版IntSet</p>
              </div>
              <div className="tip-card">
                <h3>📊 性能测试</h3>
                <p>编写benchmark对比IntSet和HashTable的性能差异</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SourceCodePage;
