/**
 * IntSet核心逻辑引擎
 */

import {
  IntSetEncoding,
  IntSetState,
  MemoryBlock,
  SearchResult,
  AnimationStep,
  AnimationSequence,
  ENCODING_CONFIG,
} from '../types/intset';

export class IntSetEngine {
  /**
   * 创建新的IntSet
   */
  static create(initialValues: number[] = []): IntSetState {
    if (initialValues.length === 0) {
      return {
        encoding: IntSetEncoding.INT16,
        length: 0,
        contents: [],
        memoryLayout: [],
        byteSize: 0,
      };
    }

    // 排序并去重
    const sortedValues = Array.from(new Set(initialValues)).sort((a, b) => a - b);
    
    // 确定所需编码
    const encoding = this.determineEncoding(sortedValues);
    
    return {
      encoding,
      length: sortedValues.length,
      contents: sortedValues,
      memoryLayout: this.createMemoryLayout(sortedValues, encoding),
      byteSize: this.calculateByteSize(sortedValues.length, encoding),
    };
  }

  /**
   * 确定数组所需的编码
   */
  static determineEncoding(values: number[]): IntSetEncoding {
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min >= ENCODING_CONFIG[IntSetEncoding.INT16].min && 
        max <= ENCODING_CONFIG[IntSetEncoding.INT16].max) {
      return IntSetEncoding.INT16;
    }

    if (min >= ENCODING_CONFIG[IntSetEncoding.INT32].min && 
        max <= ENCODING_CONFIG[IntSetEncoding.INT32].max) {
      return IntSetEncoding.INT32;
    }

    return IntSetEncoding.INT64;
  }

  /**
   * 检查值是否适合当前编码
   */
  static fitsEncoding(value: number, encoding: IntSetEncoding): boolean {
    const config = ENCODING_CONFIG[encoding];
    return value >= config.min && value <= config.max;
  }

  /**
   * 获取下一级编码
   */
  static getNextEncoding(current: IntSetEncoding): IntSetEncoding | null {
    if (current === IntSetEncoding.INT16) return IntSetEncoding.INT32;
    if (current === IntSetEncoding.INT32) return IntSetEncoding.INT64;
    return null;
  }

  /**
   * 创建内存布局
   */
  static createMemoryLayout(values: number[], encoding: IntSetEncoding): MemoryBlock[] {
    const bytes = ENCODING_CONFIG[encoding].bytes;
    return values.map((value, index) => ({
      index,
      value,
      bytes,
      hexValue: this.toHexString(value, bytes),
    }));
  }

  /**
   * 转换为十六进制字符串
   */
  static toHexString(value: number, bytes: number): string {
    const hex = (value >>> 0).toString(16).toUpperCase().padStart(bytes * 2, '0');
    return `0x${hex}`;
  }

  /**
   * 计算字节大小
   */
  static calculateByteSize(length: number, encoding: IntSetEncoding): number {
    return length * ENCODING_CONFIG[encoding].bytes;
  }

  /**
   * 二分查找
   */
  static binarySearch(state: IntSetState, value: number): SearchResult {
    const { contents } = state;
    let left = 0;
    let right = contents.length - 1;
    let comparisons = 0;
    const path: number[] = [];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      path.push(mid);
      comparisons++;

      if (contents[mid] === value) {
        return { found: true, index: mid, comparisons, path };
      }

      if (contents[mid] < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return { found: false, index: left, comparisons, path };
  }

  /**
   * 插入元素
   */
  static insert(state: IntSetState, value: number): { 
    newState: IntSetState; 
    upgraded: boolean;
    position: number;
  } {
    // 检查是否已存在
    const searchResult = this.binarySearch(state, value);
    if (searchResult.found) {
      return { newState: state, upgraded: false, position: searchResult.index };
    }

    // 检查是否需要升级编码
    let encoding = state.encoding;
    let upgraded = false;

    if (!this.fitsEncoding(value, encoding)) {
      const nextEncoding = this.getNextEncoding(encoding);
      if (nextEncoding) {
        encoding = nextEncoding;
        upgraded = true;
      }
    }

    // 插入值
    const newContents = [...state.contents];
    newContents.splice(searchResult.index, 0, value);

    const newState: IntSetState = {
      encoding,
      length: newContents.length,
      contents: newContents,
      memoryLayout: this.createMemoryLayout(newContents, encoding),
      byteSize: this.calculateByteSize(newContents.length, encoding),
    };

    return { newState, upgraded, position: searchResult.index };
  }

  /**
   * 删除元素
   */
  static delete(state: IntSetState, value: number): {
    newState: IntSetState;
    found: boolean;
    position: number;
  } {
    const searchResult = this.binarySearch(state, value);
    
    if (!searchResult.found) {
      return { newState: state, found: false, position: -1 };
    }

    const newContents = [...state.contents];
    newContents.splice(searchResult.index, 1);

    const newState: IntSetState = {
      ...state,
      length: newContents.length,
      contents: newContents,
      memoryLayout: this.createMemoryLayout(newContents, state.encoding),
      byteSize: this.calculateByteSize(newContents.length, state.encoding),
    };

    return { newState, found: true, position: searchResult.index };
  }

  /**
   * 批量插入
   */
  static batchInsert(state: IntSetState, values: number[]): IntSetState {
    let currentState = state;
    
    for (const value of values) {
      const result = this.insert(currentState, value);
      currentState = result.newState;
    }

    return currentState;
  }

  /**
   * 生成插入动画序列
   */
  static generateInsertAnimation(
    initialState: IntSetState, 
    value: number
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(initialState, value);

    // 阶段1: 查找插入位置
    steps.push({
      type: 'message',
      description: '开始二分查找插入位置',
      duration: 300,
      data: { message: `查找值 ${value} 的插入位置` },
    });

    // 显示查找过程
    searchResult.path.forEach((mid) => {
      const comparison = initialState.contents[mid];
      const op = comparison === value ? '==' : comparison < value ? '<' : '>';
      
      steps.push({
        type: 'highlight',
        description: `比较中点元素`,
        duration: 400,
        data: { 
          indices: [mid],
          comparison: `${comparison} ${op} ${value}`,
        },
      });
    });

    // 检查是否需要升级
    const needsUpgrade = !this.fitsEncoding(value, initialState.encoding);
    
    if (needsUpgrade) {
      const nextEncoding = this.getNextEncoding(initialState.encoding);
      
      steps.push({
        type: 'upgrade',
        description: '检测到需要编码升级',
        duration: 500,
        data: {
          message: `值 ${value} 超出 ${initialState.encoding} 范围`,
          oldEncoding: initialState.encoding,
          newEncoding: nextEncoding!,
        },
      });

      steps.push({
        type: 'upgrade',
        description: '执行编码升级',
        duration: 1500,
        data: {
          oldEncoding: initialState.encoding,
          newEncoding: nextEncoding!,
        },
      });
    }

    // 阶段2: 移动元素腾出空间
    if (!searchResult.found && searchResult.index < initialState.length) {
      steps.push({
        type: 'message',
        description: '移动元素腾出插入空间',
        duration: 300,
        data: { message: `在位置 ${searchResult.index} 插入` },
      });

      steps.push({
        type: 'move',
        description: '元素向右移动',
        duration: 800,
        data: { indices: Array.from({ length: initialState.length - searchResult.index }, (_, i) => searchResult.index + i) },
      });
    }

    // 阶段3: 插入新元素
    steps.push({
      type: 'insert',
      description: '插入新元素',
      duration: 400,
      data: { 
        indices: [searchResult.index],
        values: [value],
      },
    });

    const { newState } = this.insert(initialState, value);

    return {
      operation: 'insert',
      steps,
      initialState,
      finalState: newState,
    };
  }

  /**
   * 生成查找动画序列
   */
  static generateSearchAnimation(
    state: IntSetState, 
    value: number
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(state, value);

    steps.push({
      type: 'message',
      description: '开始二分查找',
      duration: 300,
      data: { message: `查找值 ${value}` },
    });

    // 显示查找过程
    searchResult.path.forEach((mid) => {
      const comparison = state.contents[mid];
      const op = comparison === value ? '==' : comparison < value ? '<' : '>';
      
      steps.push({
        type: 'compare',
        description: `比较元素`,
        duration: 600,
        data: { 
          indices: [mid],
          comparison: `${comparison} ${op} ${value}`,
        },
      });
    });

    // 显示结果
    if (searchResult.found) {
      steps.push({
        type: 'highlight',
        description: '找到目标元素',
        duration: 800,
        data: { 
          indices: [searchResult.index],
          message: `找到! 位置: ${searchResult.index}, 比较次数: ${searchResult.comparisons}`,
        },
      });
    } else {
      steps.push({
        type: 'message',
        description: '未找到元素',
        duration: 500,
        data: { message: `未找到值 ${value}, 比较次数: ${searchResult.comparisons}` },
      });
    }

    return {
      operation: 'search',
      steps,
      initialState: state,
      finalState: state,
    };
  }

  /**
   * 生成删除动画序列
   */
  static generateDeleteAnimation(
    state: IntSetState, 
    value: number
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(state, value);

    // 查找元素
    steps.push({
      type: 'message',
      description: '查找要删除的元素',
      duration: 300,
      data: { message: `查找值 ${value}` },
    });

    searchResult.path.forEach((mid) => {
      steps.push({
        type: 'highlight',
        description: '查找中',
        duration: 400,
        data: { indices: [mid] },
      });
    });

    if (!searchResult.found) {
      steps.push({
        type: 'message',
        description: '未找到要删除的元素',
        duration: 500,
        data: { message: `值 ${value} 不存在` },
      });

      return {
        operation: 'delete',
        steps,
        initialState: state,
        finalState: state,
      };
    }

    // 高亮要删除的元素
    steps.push({
      type: 'delete',
      description: '标记删除元素',
      duration: 700,
      data: { indices: [searchResult.index] },
    });

    // 移动元素填补空隙
    if (searchResult.index < state.length - 1) {
      steps.push({
        type: 'move',
        description: '元素向左移动填补空隙',
        duration: 800,
        data: { indices: Array.from({ length: state.length - searchResult.index - 1 }, (_, i) => searchResult.index + i + 1) },
      });
    }

    steps.push({
      type: 'message',
      description: '删除完成',
      duration: 300,
      data: { message: `已删除值 ${value}` },
    });

    const { newState } = this.delete(state, value);

    return {
      operation: 'delete',
      steps,
      initialState: state,
      finalState: newState,
    };
  }
}
