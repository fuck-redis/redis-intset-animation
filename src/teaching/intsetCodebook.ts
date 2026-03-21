import { AnimationStep, CodeLanguage, IntSetOperation } from '../types/intset';

type SupportedOperation = 'insert' | 'search' | 'delete' | 'batchInsert';

type LanguageCode = Record<CodeLanguage, string>;

const OPERATION_SNIPPETS: Record<SupportedOperation, LanguageCode> = {
  insert: {
    java: `int insert(int[] arr, int value) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) >>> 1;
        if (arr[mid] == value) return arr.length; // already exists
        if (arr[mid] < value) left = mid + 1;
        else right = mid - 1;
    }
    int idx = left;
    // shift right
    for (int i = arr.length - 1; i >= idx; i--) {
        arr[i + 1] = arr[i];
    }
    arr[idx] = value;
    return idx;
}`,
    python: `def insert(arr: list[int], value: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == value:
            return len(arr)  # already exists
        if arr[mid] < value:
            left = mid + 1
        else:
            right = mid - 1

    idx = left
    for i in range(len(arr) - 1, idx - 1, -1):
        arr[i + 1] = arr[i]
    arr[idx] = value
    return idx`,
    golang: `func insert(arr []int, value int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == value {
            return len(arr) // already exists
        }
        if arr[mid] < value {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    idx := left
    for i := len(arr)-1; i >= idx; i-- {
        arr[i+1] = arr[i]
    }
    arr[idx] = value
    return idx
}`,
    javascript: `function insert(arr, value) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === value) return arr.length; // already exists
    if (arr[mid] < value) left = mid + 1;
    else right = mid - 1;
  }

  const idx = left;
  for (let i = arr.length - 1; i >= idx; i -= 1) {
    arr[i + 1] = arr[i];
  }
  arr[idx] = value;
  return idx;
}`,
  },
  search: {
    java: `int search(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) >>> 1;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    python: `def search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    golang: `func search(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}`,
    javascript: `function search(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}`,
  },
  delete: {
    java: `int remove(int[] arr, int target, int len) {
    int idx = search(arr, target);
    if (idx == -1) return len;

    for (int i = idx; i < len - 1; i++) {
        arr[i] = arr[i + 1];
    }
    return len - 1;
}`,
    python: `def remove(arr: list[int], target: int) -> int:
    idx = search(arr, target)
    if idx == -1:
        return len(arr)

    for i in range(idx, len(arr) - 1):
        arr[i] = arr[i + 1]
    return len(arr) - 1`,
    golang: `func remove(arr []int, target int, length int) int {
    idx := search(arr[:length], target)
    if idx == -1 {
        return length
    }

    for i := idx; i < length-1; i++ {
        arr[i] = arr[i+1]
    }
    return length - 1
}`,
    javascript: `function remove(arr, target, length) {
  const idx = search(arr.slice(0, length), target);
  if (idx === -1) return length;

  for (let i = idx; i < length - 1; i += 1) {
    arr[i] = arr[i + 1];
  }
  return length - 1;
}`,
  },
  batchInsert: {
    java: `for (int value : values) {
    insert(intset, value);
}`,
    python: `for value in values:
    insert(intset, value)`,
    golang: `for _, value := range values {
    insert(intset, value)
}`,
    javascript: `for (const value of values) {
  insert(intset, value);
}`,
  },
};

const PHASE_LINE_MAP: Record<SupportedOperation, Record<string, Record<CodeLanguage, number[]>>> = {
  insert: {
    'search-start': { java: [1, 2], python: [1, 2], golang: [1, 2], javascript: [1, 2] },
    compare: { java: [3, 4, 5, 6], python: [3, 4, 5, 7], golang: [3, 4, 7, 9], javascript: [5, 6, 7, 8] },
    'upgrade-detect': { java: [1], python: [1], golang: [1], javascript: [1] },
    'upgrade-exec': { java: [9, 10, 11], python: [10, 11], golang: [14, 15], javascript: [12, 13] },
    'shift-right': { java: [9, 10, 11], python: [10, 11], golang: [14, 15], javascript: [12, 13] },
    insert: { java: [13, 14], python: [12, 13], golang: [17, 18], javascript: [15, 16] },
    'result-found': { java: [4], python: [5], golang: [5], javascript: [7] },
    complete: { java: [15], python: [14], golang: [19], javascript: [17] },
  },
  search: {
    'search-start': { java: [1, 2], python: [1, 2], golang: [1, 2], javascript: [1, 2] },
    compare: { java: [3, 4, 5, 6], python: [3, 4, 6, 8], golang: [3, 4, 7, 9], javascript: [5, 6, 7, 8] },
    'result-found': { java: [4], python: [5], golang: [5], javascript: [6] },
    'result-miss': { java: [8], python: [10], golang: [12], javascript: [11] },
    complete: { java: [8], python: [10], golang: [12], javascript: [11] },
  },
  delete: {
    'search-start': { java: [1], python: [1], golang: [1], javascript: [1] },
    compare: { java: [1], python: [1], golang: [1], javascript: [1] },
    'result-miss': { java: [2, 3], python: [2, 3], golang: [2, 3], javascript: [2, 3] },
    'delete-mark': { java: [5], python: [6], golang: [7], javascript: [7] },
    'shift-left': { java: [5, 6, 7], python: [6, 7, 8], golang: [7, 8, 9], javascript: [7, 8, 9] },
    complete: { java: [8], python: [9], golang: [11], javascript: [11] },
  },
  batchInsert: {
    complete: { java: [1, 2], python: [1, 2], golang: [1, 2], javascript: [1, 2] },
  },
};

const toSupportedOperation = (operation: IntSetOperation | null): SupportedOperation => {
  if (operation === 'search') return 'search';
  if (operation === 'delete') return 'delete';
  if (operation === 'batchInsert') return 'batchInsert';
  return 'insert';
};

export const getCodeSnippet = (operation: IntSetOperation | null, language: CodeLanguage): string => {
  return OPERATION_SNIPPETS[toSupportedOperation(operation)][language];
};

export const getHighlightedLines = (
  operation: IntSetOperation | null,
  step: AnimationStep | null,
  language: CodeLanguage,
): number[] => {
  if (!step) return [];
  const op = toSupportedOperation(operation);
  return PHASE_LINE_MAP[op][step.phase]?.[language] || [];
};

export const buildDebugInfo = (
  step: AnimationStep | null,
  highlighted: number[],
): Record<number, string> => {
  if (!step || highlighted.length === 0) return {};

  const chunks: string[] = [];

  if (step.data?.comparison) chunks.push(step.data.comparison);
  if (step.data?.message) chunks.push(step.data.message);

  if (step.data?.pointers) {
    const { left, right, mid } = step.data.pointers;
    chunks.push(`L=${left}, R=${right}, M=${mid}`);
  }

  if (step.data?.variables) {
    const variableText = Object.entries(step.data.variables)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(', ');
    if (variableText) chunks.push(variableText);
  }

  if (!chunks.length) return {};

  return {
    [highlighted[highlighted.length - 1]]: chunks.join(' | '),
  };
};
