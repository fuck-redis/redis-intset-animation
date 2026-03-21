/**
 * IntSet core types
 */

export enum IntSetEncoding {
  INT16 = 'int16',
  INT32 = 'int32',
  INT64 = 'int64',
}

export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

export const ENCODING_CONFIG = {
  [IntSetEncoding.INT16]: {
    bytes: 2,
    min: -32768,
    max: 32767,
    label: 'INT16',
    description: '2-byte signed integer',
  },
  [IntSetEncoding.INT32]: {
    bytes: 4,
    min: -2147483648,
    max: 2147483647,
    label: 'INT32',
    description: '4-byte signed integer',
  },
  [IntSetEncoding.INT64]: {
    bytes: 8,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    label: 'INT64',
    description: '8-byte signed integer',
  },
};

export interface MemoryBlock {
  index: number;
  value: number;
  bytes: number;
  hexValue: string;
  isNew?: boolean;
  isUpgrading?: boolean;
  isSearching?: boolean;
  isDeleting?: boolean;
  isMoving?: boolean;
}

export interface IntSetState {
  encoding: IntSetEncoding;
  length: number;
  contents: number[];
  memoryLayout: MemoryBlock[];
  headerByteSize: number;
  payloadByteSize: number;
  byteSize: number;
}

export type IntSetOperation =
  | 'create'
  | 'insert'
  | 'search'
  | 'delete'
  | 'upgrade'
  | 'batchInsert';

export interface OperationParams {
  value?: number;
  values?: number[];
  triggerUpgrade?: boolean;
}

export interface SearchTrace {
  left: number;
  right: number;
  mid: number;
  midValue: number;
  relation: 'lt' | 'gt' | 'eq';
}

export interface AnimationStepData {
  indices?: number[];
  values?: number[];
  comparison?: string;
  message?: string;
  oldEncoding?: IntSetEncoding;
  newEncoding?: IntSetEncoding;
  pointers?: {
    left: number;
    right: number;
    mid: number;
  };
  fromIndex?: number;
  toIndex?: number;
  variables?: Record<string, string | number | boolean>;
  state?: IntSetState;
}

export interface AnimationStep {
  type: 'highlight' | 'move' | 'insert' | 'delete' | 'compare' | 'upgrade' | 'message';
  phase:
    | 'search-start'
    | 'compare'
    | 'upgrade-detect'
    | 'upgrade-exec'
    | 'shift-right'
    | 'shift-left'
    | 'insert'
    | 'delete-mark'
    | 'result-found'
    | 'result-miss'
    | 'complete';
  description: string;
  duration: number;
  data?: AnimationStepData;
}

export interface AnimationSequence {
  operation: IntSetOperation;
  steps: AnimationStep[];
  initialState: IntSetState;
  finalState: IntSetState;
}

export interface SearchResult {
  found: boolean;
  index: number;
  comparisons: number;
  path: number[];
  traces: SearchTrace[];
}

export interface IntSetStats {
  elementCount: number;
  memoryUsage: number;
  headerUsage: number;
  payloadUsage: number;
  upgradeCount: number;
  averageSearchTime: number;
  memoryEfficiency: number;
}

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
