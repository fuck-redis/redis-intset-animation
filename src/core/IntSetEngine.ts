import {
  IntSetEncoding,
  IntSetState,
  MemoryBlock,
  SearchResult,
  AnimationStep,
  AnimationSequence,
  ENCODING_CONFIG,
} from '../types/intset';

const INTSET_HEADER_BYTES = 8;

interface StateFlags {
  searching?: number[];
  moving?: number[];
  deleting?: number[];
  upgrading?: number[];
  inserted?: number[];
}

export class IntSetEngine {
  static create(initialValues: number[] = []): IntSetState {
    if (initialValues.length === 0) {
      return this.buildState([], IntSetEncoding.INT16);
    }

    const sortedValues = Array.from(new Set(initialValues)).sort((a, b) => a - b);
    const encoding = this.determineEncoding(sortedValues);
    return this.buildState(sortedValues, encoding);
  }

  static determineEncoding(values: number[]): IntSetEncoding {
    if (values.length === 0) return IntSetEncoding.INT16;

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (
      min >= ENCODING_CONFIG[IntSetEncoding.INT16].min &&
      max <= ENCODING_CONFIG[IntSetEncoding.INT16].max
    ) {
      return IntSetEncoding.INT16;
    }

    if (
      min >= ENCODING_CONFIG[IntSetEncoding.INT32].min &&
      max <= ENCODING_CONFIG[IntSetEncoding.INT32].max
    ) {
      return IntSetEncoding.INT32;
    }

    return IntSetEncoding.INT64;
  }

  static fitsEncoding(value: number, encoding: IntSetEncoding): boolean {
    const config = ENCODING_CONFIG[encoding];
    return value >= config.min && value <= config.max;
  }

  static getNextEncoding(current: IntSetEncoding): IntSetEncoding | null {
    if (current === IntSetEncoding.INT16) return IntSetEncoding.INT32;
    if (current === IntSetEncoding.INT32) return IntSetEncoding.INT64;
    return null;
  }

  static resolveEncodingForValue(current: IntSetEncoding, value: number): IntSetEncoding {
    let encoding = current;
    while (!this.fitsEncoding(value, encoding)) {
      const next = this.getNextEncoding(encoding);
      if (!next) break;
      encoding = next;
    }
    return encoding;
  }

  static createMemoryLayout(values: number[], encoding: IntSetEncoding): MemoryBlock[] {
    const bytes = ENCODING_CONFIG[encoding].bytes;
    return values.map((value, index) => ({
      index,
      value,
      bytes,
      hexValue: this.toHexString(value, bytes),
    }));
  }

  static toHexString(value: number, bytes: number): string {
    const bits = BigInt(bytes * 8);
    const mask = (1n << bits) - 1n;

    let normalized = BigInt(Math.trunc(value));
    if (normalized < 0) {
      normalized = (normalized + (1n << bits)) & mask;
    } else {
      normalized = normalized & mask;
    }

    const hex = normalized.toString(16).toUpperCase().padStart(bytes * 2, '0');
    return `0x${hex}`;
  }

  static calculatePayloadSize(length: number, encoding: IntSetEncoding): number {
    return length * ENCODING_CONFIG[encoding].bytes;
  }

  static calculateByteSize(length: number, encoding: IntSetEncoding): number {
    return INTSET_HEADER_BYTES + this.calculatePayloadSize(length, encoding);
  }

  static binarySearch(state: IntSetState, value: number): SearchResult {
    const { contents } = state;
    let left = 0;
    let right = contents.length - 1;
    let comparisons = 0;
    const path: number[] = [];
    const traces: SearchResult['traces'] = [];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = contents[mid];
      path.push(mid);
      comparisons++;

      let relation: 'lt' | 'gt' | 'eq' = 'eq';
      if (midValue < value) relation = 'lt';
      if (midValue > value) relation = 'gt';

      traces.push({ left, right, mid, midValue, relation });

      if (midValue === value) {
        return { found: true, index: mid, comparisons, path, traces };
      }

      if (midValue < value) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return { found: false, index: left, comparisons, path, traces };
  }

  static insert(
    state: IntSetState,
    value: number,
  ): {
    newState: IntSetState;
    upgraded: boolean;
    position: number;
  } {
    const searchResult = this.binarySearch(state, value);
    if (searchResult.found) {
      return { newState: state, upgraded: false, position: searchResult.index };
    }

    const encoding = this.resolveEncodingForValue(state.encoding, value);
    const upgraded = encoding !== state.encoding;

    const newContents = [...state.contents];
    newContents.splice(searchResult.index, 0, value);

    return {
      newState: this.buildState(newContents, encoding),
      upgraded,
      position: searchResult.index,
    };
  }

  static delete(
    state: IntSetState,
    value: number,
  ): {
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

    return {
      newState: this.buildState(newContents, state.encoding),
      found: true,
      position: searchResult.index,
    };
  }

  static batchInsert(state: IntSetState, values: number[]): IntSetState {
    let currentState = state;
    for (const value of values) {
      const result = this.insert(currentState, value);
      currentState = result.newState;
    }
    return currentState;
  }

  static generateInsertAnimation(initialState: IntSetState, value: number): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(initialState, value);

    const pushStep = (step: AnimationStep) => {
      steps.push(step);
    };

    pushStep({
      type: 'message',
      phase: 'search-start',
      description: '开始二分查找插入位置',
      duration: 350,
      data: {
        message: `查找值 ${value} 的插入位置`,
        variables: {
          target: value,
          length: initialState.length,
        },
        state: this.cloneState(initialState),
      },
    });

    for (const trace of searchResult.traces) {
      const op = trace.midValue === value ? '==' : trace.midValue < value ? '<' : '>';
      pushStep({
        type: 'compare',
        phase: 'compare',
        description: '比较中点元素',
        duration: 550,
        data: {
          indices: [trace.mid],
          comparison: `${trace.midValue} ${op} ${value}`,
          pointers: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
          },
          variables: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
            midValue: trace.midValue,
            target: value,
          },
          state: this.withFlags(initialState, { searching: [trace.mid] }),
        },
      });
    }

    if (searchResult.found) {
      pushStep({
        type: 'highlight',
        phase: 'result-found',
        description: '元素已存在，无需重复插入',
        duration: 500,
        data: {
          indices: [searchResult.index],
          message: `值 ${value} 已存在于索引 ${searchResult.index}`,
          variables: {
            index: searchResult.index,
            comparisons: searchResult.comparisons,
          },
          state: this.withFlags(initialState, { searching: [searchResult.index] }),
        },
      });

      pushStep({
        type: 'message',
        phase: 'complete',
        description: '插入结束（无变化）',
        duration: 300,
        data: {
          state: this.cloneState(initialState),
          message: '集合保持不变',
        },
      });

      return {
        operation: 'insert',
        steps,
        initialState,
        finalState: initialState,
      };
    }

    const targetEncoding = this.resolveEncodingForValue(initialState.encoding, value);

    if (targetEncoding !== initialState.encoding) {
      pushStep({
        type: 'upgrade',
        phase: 'upgrade-detect',
        description: '检测到需要编码升级',
        duration: 500,
        data: {
          oldEncoding: initialState.encoding,
          newEncoding: targetEncoding,
          message: `值 ${value} 超出 ${initialState.encoding.toUpperCase()} 范围`,
          variables: {
            value,
            from: initialState.encoding,
            to: targetEncoding,
          },
          state: this.withFlags(initialState, {
            upgrading: initialState.memoryLayout.map((block) => block.index),
          }),
        },
      });

      const upgradedPreview = this.buildState(initialState.contents, targetEncoding);
      pushStep({
        type: 'upgrade',
        phase: 'upgrade-exec',
        description: '完成编码升级并迁移元素',
        duration: 1100,
        data: {
          oldEncoding: initialState.encoding,
          newEncoding: targetEncoding,
          variables: {
            oldBytes: ENCODING_CONFIG[initialState.encoding].bytes,
            newBytes: ENCODING_CONFIG[targetEncoding].bytes,
          },
          state: this.withFlags(upgradedPreview, {
            upgrading: upgradedPreview.memoryLayout.map((block) => block.index),
          }),
        },
      });
    }

    const compareBaseState =
      targetEncoding === initialState.encoding
        ? initialState
        : this.buildState(initialState.contents, targetEncoding);

    if (searchResult.index < compareBaseState.length) {
      pushStep({
        type: 'move',
        phase: 'shift-right',
        description: '元素右移腾出插入位置',
        duration: 850,
        data: {
          indices: Array.from(
            { length: compareBaseState.length - searchResult.index },
            (_, i) => searchResult.index + i,
          ),
          fromIndex: searchResult.index,
          toIndex: searchResult.index + 1,
          message: `索引 ${searchResult.index} 及其后续元素整体右移`,
          variables: {
            insertIndex: searchResult.index,
            movedCount: compareBaseState.length - searchResult.index,
          },
          state: this.withFlags(compareBaseState, {
            moving: Array.from(
              { length: compareBaseState.length - searchResult.index },
              (_, i) => searchResult.index + i,
            ),
          }),
        },
      });
    }

    const { newState } = this.insert(initialState, value);

    pushStep({
      type: 'insert',
      phase: 'insert',
      description: '写入新值',
      duration: 500,
      data: {
        indices: [searchResult.index],
        values: [value],
        variables: {
          insertIndex: searchResult.index,
          value,
        },
        state: this.withFlags(newState, { inserted: [searchResult.index] }),
      },
    });

    pushStep({
      type: 'message',
      phase: 'complete',
      description: '插入完成',
      duration: 350,
      data: {
        message: `插入成功，当前长度 ${newState.length}`,
        variables: {
          length: newState.length,
          encoding: newState.encoding.toUpperCase(),
        },
        state: this.cloneState(newState),
      },
    });

    return {
      operation: 'insert',
      steps,
      initialState,
      finalState: newState,
    };
  }

  static generateSearchAnimation(state: IntSetState, value: number): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(state, value);

    steps.push({
      type: 'message',
      phase: 'search-start',
      description: '开始二分查找',
      duration: 300,
      data: {
        message: `在有序数组中查找 ${value}`,
        variables: {
          target: value,
          length: state.length,
        },
        state: this.cloneState(state),
      },
    });

    for (const trace of searchResult.traces) {
      const op = trace.midValue === value ? '==' : trace.midValue < value ? '<' : '>';
      steps.push({
        type: 'compare',
        phase: 'compare',
        description: '执行中点比较',
        duration: 550,
        data: {
          indices: [trace.mid],
          comparison: `${trace.midValue} ${op} ${value}`,
          pointers: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
          },
          variables: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
            midValue: trace.midValue,
            target: value,
          },
          state: this.withFlags(state, { searching: [trace.mid] }),
        },
      });
    }

    if (searchResult.found) {
      steps.push({
        type: 'highlight',
        phase: 'result-found',
        description: '找到目标元素',
        duration: 800,
        data: {
          indices: [searchResult.index],
          message: `命中索引 ${searchResult.index}，比较 ${searchResult.comparisons} 次`,
          variables: {
            index: searchResult.index,
            comparisons: searchResult.comparisons,
          },
          state: this.withFlags(state, { searching: [searchResult.index] }),
        },
      });
    } else {
      steps.push({
        type: 'message',
        phase: 'result-miss',
        description: '查找失败',
        duration: 650,
        data: {
          message: `未找到 ${value}，可插入位置 ${searchResult.index}`,
          variables: {
            insertIndex: searchResult.index,
            comparisons: searchResult.comparisons,
          },
          state: this.cloneState(state),
        },
      });
    }

    steps.push({
      type: 'message',
      phase: 'complete',
      description: '查找结束',
      duration: 280,
      data: {
        state: this.cloneState(state),
      },
    });

    return {
      operation: 'search',
      steps,
      initialState: state,
      finalState: state,
    };
  }

  static generateDeleteAnimation(state: IntSetState, value: number): AnimationSequence {
    const steps: AnimationStep[] = [];
    const searchResult = this.binarySearch(state, value);

    steps.push({
      type: 'message',
      phase: 'search-start',
      description: '定位待删除元素',
      duration: 320,
      data: {
        message: `查找 ${value}`,
        variables: {
          target: value,
          length: state.length,
        },
        state: this.cloneState(state),
      },
    });

    for (const trace of searchResult.traces) {
      const op = trace.midValue === value ? '==' : trace.midValue < value ? '<' : '>';
      steps.push({
        type: 'compare',
        phase: 'compare',
        description: '二分查找比较',
        duration: 500,
        data: {
          indices: [trace.mid],
          comparison: `${trace.midValue} ${op} ${value}`,
          pointers: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
          },
          variables: {
            left: trace.left,
            right: trace.right,
            mid: trace.mid,
            target: value,
          },
          state: this.withFlags(state, { searching: [trace.mid] }),
        },
      });
    }

    if (!searchResult.found) {
      steps.push({
        type: 'message',
        phase: 'result-miss',
        description: '目标不存在，删除取消',
        duration: 600,
        data: {
          message: `值 ${value} 不存在`,
          variables: {
            comparisons: searchResult.comparisons,
          },
          state: this.cloneState(state),
        },
      });

      steps.push({
        type: 'message',
        phase: 'complete',
        description: '删除结束（无变化）',
        duration: 300,
        data: {
          state: this.cloneState(state),
        },
      });

      return {
        operation: 'delete',
        steps,
        initialState: state,
        finalState: state,
      };
    }

    steps.push({
      type: 'delete',
      phase: 'delete-mark',
      description: '标记删除节点',
      duration: 600,
      data: {
        indices: [searchResult.index],
        variables: {
          deleteIndex: searchResult.index,
          value,
        },
        state: this.withFlags(state, { deleting: [searchResult.index] }),
      },
    });

    if (searchResult.index < state.length - 1) {
      const movingIndices = Array.from(
        { length: state.length - searchResult.index - 1 },
        (_, i) => searchResult.index + i + 1,
      );

      steps.push({
        type: 'move',
        phase: 'shift-left',
        description: '后续元素左移填补空位',
        duration: 850,
        data: {
          indices: movingIndices,
          fromIndex: searchResult.index + 1,
          toIndex: searchResult.index,
          variables: {
            from: searchResult.index + 1,
            to: searchResult.index,
            movedCount: movingIndices.length,
          },
          state: this.withFlags(state, { moving: movingIndices }),
        },
      });
    }

    const { newState } = this.delete(state, value);

    steps.push({
      type: 'message',
      phase: 'complete',
      description: '删除完成',
      duration: 360,
      data: {
        message: `已删除 ${value}，当前长度 ${newState.length}`,
        variables: {
          length: newState.length,
          encoding: newState.encoding.toUpperCase(),
        },
        state: this.cloneState(newState),
      },
    });

    return {
      operation: 'delete',
      steps,
      initialState: state,
      finalState: newState,
    };
  }

  private static buildState(values: number[], encoding: IntSetEncoding): IntSetState {
    const payloadByteSize = this.calculatePayloadSize(values.length, encoding);
    const byteSize = this.calculateByteSize(values.length, encoding);
    return {
      encoding,
      length: values.length,
      contents: [...values],
      memoryLayout: this.createMemoryLayout(values, encoding),
      headerByteSize: INTSET_HEADER_BYTES,
      payloadByteSize,
      byteSize,
    };
  }

  private static cloneState(state: IntSetState): IntSetState {
    return {
      ...state,
      contents: [...state.contents],
      memoryLayout: state.memoryLayout.map((block) => ({ ...block })),
    };
  }

  private static withFlags(state: IntSetState, flags: StateFlags): IntSetState {
    const cloned = this.cloneState(state);
    const searchingSet = new Set(flags.searching || []);
    const movingSet = new Set(flags.moving || []);
    const deletingSet = new Set(flags.deleting || []);
    const upgradingSet = new Set(flags.upgrading || []);
    const insertedSet = new Set(flags.inserted || []);

    cloned.memoryLayout = cloned.memoryLayout.map((block) => ({
      ...block,
      isSearching: searchingSet.has(block.index),
      isMoving: movingSet.has(block.index),
      isDeleting: deletingSet.has(block.index),
      isUpgrading: upgradingSet.has(block.index),
      isNew: insertedSet.has(block.index),
    }));

    return cloned;
  }
}
