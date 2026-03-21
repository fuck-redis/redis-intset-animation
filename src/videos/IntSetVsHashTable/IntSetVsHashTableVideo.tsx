import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const IntSetVsHashTableSchema = z.object({
  intSetData: z.array(z.number()),
  hashTableData: z.array(z.number()),
  searchValue: z.number(),
});

type Props = z.infer<typeof IntSetVsHashTableSchema>;

export const IntSetVsHashTableVideo: React.FC<Props> = ({
  intSetData,
  hashTableData,
  searchValue,
}) => {
  const frame = useCurrentFrame();

  // Animation phases
  const introDuration = 30;
  const compareDuration = 90;
  const searchPhase1Duration = 75;
  const searchPhase2Duration = 75;
  const resultDuration = 60;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const compareEnd = phaseEnd + compareDuration;
  phaseEnd = compareEnd;
  const intSetSearchEnd = phaseEnd + searchPhase1Duration;
  phaseEnd = intSetSearchEnd;
  const hashTableSearchEnd = phaseEnd + searchPhase2Duration;
  phaseEnd = hashTableSearchEnd;
  const resultEnd = phaseEnd + resultDuration;
  const totalDuration = resultEnd + outroDuration;

  // Sort intSetData for binary search
  const sortedIntSet = [...new Set(intSetData)].sort((a, b) => a - b);
  const hashTableSet = new Set(hashTableData);
  const foundInIntSet = sortedIntSet.includes(searchValue);
  const foundInHashTable = hashTableSet.has(searchValue);

  // Calculate memory (rough estimate)
  const intSetMemory = 8 + sortedIntSet.length * 4; // header + 4 bytes per element (INT32 assumed)
  const hashTableMemory = 120 + hashTableData.length * 40; // overhead + nodes

  const intSetSearchProgress = interpolate(
    frame,
    [compareEnd, intSetSearchEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Simulate binary search steps
  const binarySearchSteps: { left: number; right: number; mid: number; result: string }[] = [];
  if (foundInIntSet) {
    let left = 0;
    let right = sortedIntSet.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = sortedIntSet[mid];
      let result = 'eq';
      if (midValue < searchValue) result = 'lt';
      if (midValue > searchValue) result = 'gt';
      binarySearchSteps.push({ left, right, mid, result });
      if (midValue === searchValue) break;
      if (midValue < searchValue) left = mid + 1;
      else right = mid - 1;
    }
  }

  const currentIntSetStep = Math.floor(intSetSearchProgress * (binarySearchSteps.length + 1));
  const currentIntSetTrace = binarySearchSteps[Math.min(currentIntSetStep, binarySearchSteps.length - 1)];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ position: 'absolute', top: 25, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 34, fontWeight: 700, margin: 0 }}>
          IntSet vs HashTable 对比
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 6 }}>
          两种底层实现的数据结构对比 | 搜索目标: {searchValue}
        </p>
      </div>

      {/* Left side - IntSet */}
      {frame >= introDuration && (
        <div style={{ position: 'absolute', top: 110, left: 40, width: 580 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '16px 20px',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ color: '#3b82f6', fontSize: 20, fontWeight: 600, margin: 0 }}>
                IntSet (整数集合)
              </h2>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                内存: ~{intSetMemory}B
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sortedIntSet.map((val, i) => {
                const isMid = currentIntSetTrace && i === currentIntSetTrace.mid && frame >= compareEnd && frame < intSetSearchEnd;
                const isFound = foundInIntSet && i === binarySearchSteps[binarySearchSteps.length - 1]?.mid && frame >= intSetSearchEnd;

                return (
                  <div
                    key={i}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: isFound ? '#22c55e' : isMid ? '#3b82f6' : '#0f172a',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${isFound ? '#22c55e' : isMid ? '#60a5fa' : '#334155'}`,
                      transform: `scale(${isMid ? 1.1 : 1})`,
                      boxShadow: isMid ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: '#f8fafc', fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                搜索: <span style={{ color: '#f97316' }}>O(log n)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                插入/删除: <span style={{ color: '#f97316' }}>O(n)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                有序: <span style={{ color: '#22c55e' }}>是</span>
              </div>
            </div>
          </div>

          {frame >= compareEnd && frame < intSetSearchEnd && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>
                二分查找中... 步骤 {currentIntSetStep + 1}/{binarySearchSteps.length + 1}
              </span>
            </div>
          )}

          {frame >= intSetSearchEnd && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{
                color: foundInIntSet ? '#22c55e' : '#ef4444',
                fontSize: 16,
                fontWeight: 600
              }}>
                {foundInIntSet ? `✓ 找到 ${searchValue}` : `✗ 未找到 ${searchValue}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Right side - HashTable */}
      {frame >= introDuration && (
        <div style={{ position: 'absolute', top: 110, right: 40, width: 580 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '16px 20px',
              borderLeft: '4px solid #8b5cf6',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ color: '#8b5cf6', fontSize: 20, fontWeight: 600, margin: 0 }}>
                HashTable (哈希表)
              </h2>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                内存: ~{hashTableMemory}B
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hashTableData.map((val, i) => {
                const isFound = foundInHashTable && i === hashTableData.indexOf(searchValue) && frame >= hashTableSearchEnd;

                return (
                  <div
                    key={i}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: isFound ? '#22c55e' : '#0f172a',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${isFound ? '#22c55e' : '#8b5cf6'}`,
                      opacity: isFound ? 1 : 0.7,
                      transform: `scale(${isFound ? 1.1 : 1})`,
                      boxShadow: isFound ? '0 0 15px rgba(34, 197, 94, 0.5)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: '#f8fafc', fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                搜索: <span style={{ color: '#22c55e' }}>O(1)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                插入/删除: <span style={{ color: '#22c55e' }}>O(1)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                有序: <span style={{ color: '#ef4444' }}>否</span>
              </div>
            </div>
          </div>

          {frame >= intSetSearchEnd && frame < hashTableSearchEnd && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>
                哈希查找中... O(1) 复杂度
              </span>
            </div>
          )}

          {frame >= hashTableSearchEnd && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{
                color: foundInHashTable ? '#22c55e' : '#ef4444',
                fontSize: 16,
                fontWeight: 600
              }}>
                {foundInHashTable ? `✓ 找到 ${searchValue}` : `✗ 未找到 ${searchValue}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* VS badge */}
      {frame >= introDuration && (
        <div style={{
          position: 'absolute',
          top: 200,
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
          }}>
            VS
          </div>
        </div>
      )}

      {/* Comparison summary */}
      {frame >= hashTableSearchEnd && (
        <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '20px 40px',
              borderRadius: 12,
              gap: 40,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#3b82f6', fontSize: 14, marginBottom: 4 }}>IntSet</div>
              <div style={{ color: '#f8fafc', fontSize: 13 }}>
                <span style={{ color: '#22c55e' }}>省内存</span> | 适合整数
              </div>
            </div>
            <div style={{ width: 1, backgroundColor: '#334155' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b5cf6', fontSize: 14, marginBottom: 4 }}>HashTable</div>
              <div style={{ color: '#f8fafc', fontSize: 13 }}>
                <span style={{ color: '#22c55e' }}>O(1)查找</span> | 通用类型
              </div>
            </div>
          </div>
        </div>
      )}

      {/* When to use */}
      {frame >= hashTableSearchEnd && (
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e3a5f',
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid #3b82f6',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              选择 IntSet: 整数集合 + 小数据集 + 内存敏感 | 选择 HashTable: 非整数 + 大数据集 + 写频繁
            </span>
          </div>
        </div>
      )}

      {/* Duration */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
          color: '#64748b',
          fontSize: 14,
        }}
      >
        {totalDuration} 帧
      </div>
    </AbsoluteFill>
  );
};

export default IntSetVsHashTableVideo;
