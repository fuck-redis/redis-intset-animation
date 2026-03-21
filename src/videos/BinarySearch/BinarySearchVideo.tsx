import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BinarySearchSchema } from '../types';
import type z from 'zod';

type Props = z.infer<typeof BinarySearchSchema>;

export const BinarySearchVideo: React.FC<Props> = ({
  searchValue,
  data,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig(); // Required for Remotion composition

  const sortedData = [...data].sort((a: number, b: number) => a - b);
  const n = sortedData.length;

  // Animation phases (in frames)
  const introDuration = 30;
  const searchStart = introDuration;
  const searchEnd = searchStart + n * 45;
  const totalDuration = searchEnd + 45;

  // Calculate search state
  let left = 0;
  let right = n - 1;
  let mid = Math.floor((left + right) / 2);

  // Simulate search to get traces
  const traces: { left: number; right: number; mid: number; result: string }[] = [];
  while (left <= right) {
    mid = Math.floor((left + right) / 2);
    const midValue = sortedData[mid];
    let result = 'eq';
    if (midValue < searchValue) result = 'lt';
    if (midValue > searchValue) result = 'gt';
    traces.push({ left, right, mid, result });
    if (midValue === searchValue) break;
    if (midValue < searchValue) left = mid + 1;
    else right = mid - 1;
  }

  const searchProgress = interpolate(
    frame,
    [searchStart, searchEnd],
    [0, traces.length],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentTraceIndex = Math.floor(searchProgress);
  const currentTrace = traces[Math.min(currentTraceIndex, traces.length - 1)];
  const found = sortedData[mid] === searchValue;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#f8fafc', fontSize: 42, fontWeight: 700, margin: 0 }}>
          二分查找 (Binary Search)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 20, marginTop: 8 }}>
          在有序数组中高效查找元素 | 时间复杂度 O(log n)
        </p>
      </div>

      {/* Target value display */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '12px 32px',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: 18 }}>查找目标:</span>
          <span
            style={{
              color: '#f97316',
              fontSize: 32,
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {searchValue}
          </span>
        </div>
      </div>

      {/* Array visualization */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {sortedData.map((value, index) => {
            const isMid = currentTrace && index === currentTrace.mid;
            const isInRange = currentTrace && index >= currentTrace.left && index <= currentTrace.right;
            const isFound = found && index === mid;

            const scale = isMid ? 1.1 : 1;
            const bgColor = isFound
              ? '#22c55e'
              : isMid
              ? '#3b82f6'
              : isInRange
              ? '#1e40af'
              : '#334155';

            return (
              <div
                key={index}
                style={{
                  width: 70,
                  height: 80,
                  backgroundColor: bgColor,
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${scale})`,
                  boxShadow: isMid ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: 24,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  [{index}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Pointers */}
        {currentTrace && (
          <div style={{ marginTop: 40, display: 'flex', gap: 60, position: 'relative' }}>
            {(['left', 'mid', 'right'] as const).map((ptr) => {
              const idx =
                ptr === 'left'
                  ? currentTrace.left
                  : ptr === 'right'
                  ? currentTrace.right
                  : currentTrace.mid;
              const color =
                ptr === 'left'
                  ? '#3b82f6'
                  : ptr === 'right'
                  ? '#ef4444'
                  : '#22c55e';

              return (
                <div
                  key={ptr}
                  style={{
                    position: 'absolute',
                    left: idx * 82 + 35 - 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {ptr.toUpperCase()}
                  </span>
                  <div style={{ width: 2, height: 20, backgroundColor: color }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison result */}
      {currentTrace && frame >= searchStart && (
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '16px 40px',
              borderRadius: 12,
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 20 }}>比较结果:</span>
            <span
              style={{
                color:
                  currentTrace.result === 'eq'
                    ? '#22c55e'
                    : currentTrace.result === 'lt'
                    ? '#f97316'
                    : '#3b82f6',
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {sortedData[currentTrace.mid]}{' '}
              {currentTrace.result === 'eq'
                ? '=='
                : currentTrace.result === 'lt'
                ? '<'
                : '>'}{' '}
              {searchValue}
            </span>
          </div>
        </div>
      )}

      {/* Complexity display */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          backgroundColor: '#1e293b',
          padding: '12px 20px',
          borderRadius: 8,
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: 14 }}>时间复杂度: </span>
        <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 600 }}>
          O(log n)
        </span>
      </div>

      {/* Progress */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          color: '#64748b',
          fontSize: 14,
        }}
      >
        第 {frame} 帧 / 共 {totalDuration} 帧
      </div>
    </AbsoluteFill>
  );
};

export default BinarySearchVideo;
