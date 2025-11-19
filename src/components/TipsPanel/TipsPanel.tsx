import React, { useState, useEffect } from 'react';
import { IntSetOperation, IntSetEncoding } from '../../types/intset';
import { Info, X } from 'lucide-react';
import './TipsPanel.css';

interface TipsPanelProps {
  currentOperation?: IntSetOperation;
  currentEncoding: IntSetEncoding;
  elementCount: number;
}

interface Tip {
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning';
}

const TipsPanel: React.FC<TipsPanelProps> = ({
  currentOperation,
  currentEncoding,
  elementCount,
}) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tip = getTipForContext(currentOperation, currentEncoding, elementCount);
    setCurrentTip(tip);
    setIsVisible(true);
  }, [currentOperation, currentEncoding, elementCount]);

  const getTipForContext = (
    operation?: IntSetOperation,
    encoding?: IntSetEncoding,
    count?: number
  ): Tip | null => {
    // 基于操作的提示
    if (operation === 'insert') {
      return {
        title: '💡 插入操作详解',
        content: `IntSet保持元素有序，插入需要O(n)时间复杂度。查找插入位置使用二分查找O(log n)，但移动元素需要O(n)。在Redis中，当Set满足条件（所有元素为整数且数量≤512）时自动使用IntSet。如果插入值超出当前编码范围，将自动升级编码以容纳更大的值。`,
        type: 'info',
      };
    }

    if (operation === 'search') {
      return {
        title: '🔍 二分查找算法',
        content: `IntSet利用有序性使用二分查找，时间复杂度O(log n)。当前${count}个元素，最多需要${Math.ceil(Math.log2(count || 1))}次比较。相比线性查找O(n)，在大数据集上效率提升显著。Redis的SISMEMBER命令在IntSet编码下即使用此算法，查询性能优秀。`,
        type: 'success',
      };
    }

    if (operation === 'delete') {
      return {
        title: '🗑️ 删除操作机制',
        content: '删除元素需要：1）二分查找定位O(log n) 2）移动后续元素填补空隙O(n)。虽然删除开销大，但内存布局保持紧凑连续，无碎片。注意：删除大值元素不会导致编码降级，这是Redis的设计权衡。',
        type: 'info',
      };
    }

    if (operation === 'upgrade') {
      return {
        title: '⚡ 编码升级机制',
        content: '升级过程：1）分配新编码的内存空间 2）逐个迁移元素到新编码 3）释放旧内存。虽然升级是O(n)操作，但仅发生一次。Redis设计为单向升级，避免频繁转换开销。升级对用户完全透明，无需手动干预。',
        type: 'warning',
      };
    }

    if (operation === 'batchInsert') {
      return {
        title: '📦 批量插入优化',
        content: '批量插入多个整数时，每个插入都是O(n)操作。在Redis实际使用中，如果预知要插入大量数据，建议评估是否使用IntSet。当元素超过512个（默认阈值），Redis会自动转换为hashtable编码以优化性能。',
        type: 'info',
      };
    }

    // 基于编码的提示
    if (encoding === IntSetEncoding.INT16) {
      return {
        title: '🎯 INT16编码 - 最优内存效率',
        content: '当前使用最紧凑的2字节编码，每个元素仅占2字节。范围：-32,768 ~ 32,767（±3万）。适合存储用户ID、小型标签ID等。这是IntSet的默认编码，内存效率最高。在Redis中，新创建的整数Set会优先使用此编码。',
        type: 'success',
      };
    }

    if (encoding === IntSetEncoding.INT32) {
      return {
        title: '📊 INT32编码 - 平衡性能',
        content: '已升级到4字节编码，每个元素占4字节，内存增加100%。范围：±21亿。适合存储时间戳、大型ID等。升级是不可逆的，即使后续只存储小整数也不会降级回INT16。在实际应用中，这种编码最常见。',
        type: 'info',
      };
    }

    if (encoding === IntSetEncoding.INT64) {
      return {
        title: '⚠️ INT64编码 - 最大范围',
        content: '最大的8字节编码，每个元素占8字节。范围：±922亿亿（JavaScript安全整数范围）。适合存储超大ID或时间戳（毫秒级）。内存占用是INT16的4倍，建议评估是否真的需要如此大的范围，或考虑使用其他Redis数据结构。',
        type: 'warning',
      };
    }

    // 基于元素数量的提示
    if (count !== undefined && count > 100) {
      return {
        title: '📈 性能优化建议',
        content: `当前${count}个元素，插入/删除操作开销较大O(n)。在Redis中，当元素超过512个（set-max-intset-entries配置），会自动转换为hashtable编码。Hashtable虽然内存占用更大，但插入/删除都是O(1)。如果频繁修改，可考虑调整阈值或使用其他数据结构。`,
        type: 'warning',
      };
    }

    // 默认提示
    return {
      title: '🎓 IntSet数据结构',
      content: 'IntSet是Redis用于存储整数Set的底层实现之一。核心优势：1）有序存储，支持二分查找 2）紧凑编码，节省内存 3）自动升级，无缝扩展。适合小规模（<512）整数集合。Redis会在满足条件时自动选择IntSet，无需手动指定。',
      type: 'info',
    };
  };

  if (!isVisible || !currentTip) return null;

  return (
    <div className={`tips-panel tips-${currentTip.type}`}>
      <div className="tips-header">
        <Info size={16} />
        <span className="tips-title">{currentTip.title}</span>
        <button 
          className="tips-close"
          onClick={() => setIsVisible(false)}
          aria-label="关闭提示"
        >
          <X size={14} />
        </button>
      </div>
      <p className="tips-content">{currentTip.content}</p>
    </div>
  );
};

export default TipsPanel;
