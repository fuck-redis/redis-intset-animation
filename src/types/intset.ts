/**
 * IntSet核心类型定义
 */

// 编码类型枚举
export enum IntSetEncoding {
  INT16 = 'int16',  // 2字节有符号整数 (-32768 ~ 32767)
  INT32 = 'int32',  // 4字节有符号整数 (-2147483648 ~ 2147483647)
  INT64 = 'int64'   // 8字节有符号整数 (±9223372036854775807)
}

// 编码配置
export const ENCODING_CONFIG = {
  [IntSetEncoding.INT16]: {
    bytes: 2,
    min: -32768,
    max: 32767,
    label: 'INT16',
    description: '2字节有符号整数',
  },
  [IntSetEncoding.INT32]: {
    bytes: 4,
    min: -2147483648,
    max: 2147483647,
    label: 'INT32',
    description: '4字节有符号整数',
  },
  [IntSetEncoding.INT64]: {
    bytes: 8,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    label: 'INT64',
    description: '8字节有符号整数',
  },
};

// 内存块表示
export interface MemoryBlock {
  index: number;           // 在contents中的索引
  value: number;           // 整数值
  bytes: number;           // 占用字节数
  hexValue: string;        // 十六进制表示
  isNew?: boolean;         // 是否为新插入
  isUpgrading?: boolean;   // 是否在升级中
  isSearching?: boolean;   // 是否在查找中
  isDeleting?: boolean;    // 是否在删除中
  isMoving?: boolean;      // 是否在移动中
}

// IntSet完整状态
export interface IntSetState {
  encoding: IntSetEncoding;        // 当前编码
  length: number;                  // 元素数量
  contents: number[];              // 有序整数数组
  memoryLayout: MemoryBlock[];     // 内存块布局
  byteSize: number;                // 总字节大小
}

// 操作类型
export type IntSetOperation = 
  | 'create'           // 创建集合
  | 'insert'           // 插入元素
  | 'search'           // 查找元素  
  | 'delete'           // 删除元素
  | 'upgrade'          // 编码升级
  | 'batchInsert';     // 批量插入

// 操作参数
export interface OperationParams {
  value?: number;              // 单值操作
  values?: number[];           // 批量操作
  triggerUpgrade?: boolean;    // 强制触发升级
}

// 动画步骤
export interface AnimationStep {
  type: 'highlight' | 'move' | 'insert' | 'delete' | 'compare' | 'upgrade' | 'message';
  description: string;
  duration: number;              // 毫秒
  data?: {
    indices?: number[];          // 涉及的索引
    values?: number[];           // 涉及的值
    comparison?: string;         // 比较表达式
    message?: string;            // 提示信息
    oldEncoding?: IntSetEncoding;
    newEncoding?: IntSetEncoding;
  };
}

// 动画序列
export interface AnimationSequence {
  operation: IntSetOperation;
  steps: AnimationStep[];
  initialState: IntSetState;
  finalState: IntSetState;
}

// 查找结果
export interface SearchResult {
  found: boolean;
  index: number;           // 找到的索引或应插入的位置
  comparisons: number;     // 比较次数
  path: number[];          // 查找路径
}

// 统计信息
export interface IntSetStats {
  elementCount: number;
  memoryUsage: number;        // 字节
  upgradeCount: number;
  averageSearchTime: number;  // 毫秒
  memoryEfficiency: number;   // 百分比
}

// 操作组配置
export interface OperationGroup {
  name: string;
  operations: OperationConfig[];
}

export interface OperationConfig {
  id: IntSetOperation;
  label: string;
  icon: string;
  description: string;
}

// 学习场景
export interface LearningScenario {
  name: string;
  description: string;
  initialSet: number[];
  operations: {
    type: IntSetOperation;
    params: OperationParams;
  }[];
  expectedResult: string;
}
