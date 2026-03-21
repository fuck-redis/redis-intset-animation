import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { z } from 'zod';

export const BinarySearchStepSchema = z.object({
  searchValue: z.number(),
  data: z.array(z.number()),
});

type Props = z.infer<typeof BinarySearchStepSchema>;

export const BinarySearchStepVideo: React.FC<Props> = ({
  searchValue,
  data,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig();

  const sortedData = [...data].sort((a: number, b: number) => a - b);
  const n = sortedData.length;

  // Calculate all search traces first
  const traces: { left: number; right: number; mid: number; midValue: number; action: string }[] = [];
  let left = 0;
  let right = n - 1;
  let step = 0;

  while (left <= right && step < 10) {
    const mid = Math.floor((left + right) / 2);
    const midValue = sortedData[mid];
    let action = '';

    if (midValue === searchValue) {
      action = `找到目标！${midValue} == ${searchValue}`;
    } else if (midValue < searchValue) {
      action = `${midValue} < ${searchValue}，搜索右半部分`;
    } else {
      action = `${midValue} > ${searchValue}，搜索左半部分`;
    }

    traces.push({ left, right, mid, midValue, action });

    if (midValue === searchValue) break;
    if (midValue < searchValue) left = mid + 1;
    else right = mid - 1;
    step++;
  }

  const found = traces.some(t => t.midValue === searchValue);

  // Animation timing
  const introDuration = 45;
  const stepDuration = 90;
  const stepsStart = introDuration;
  const totalSteps = traces.length;
  const totalDuration = stepsStart + totalSteps * stepDuration + 60;

  // Determine current step based on frame
  const stepProgress = interpolate(
    frame,
    [stepsStart, stepsStart + totalSteps * stepDuration],
    [0, totalSteps],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentStepIndex = Math.min(Math.floor(stepProgress), totalSteps - 1);
  const currentTrace = traces[currentStepIndex] || traces[0];
  const localProgress = stepProgress - Math.floor(stepProgress);

  // Step animation - fade in/out
  const stepFadeIn = interpolate(localProgress, [0, 0.2], [0, 1]);
  const stepFadeOut = interpolate(localProgress, [0.8, 1], [1, 0]);
  const stepOpacity = localProgress < 0.2 ? stepFadeIn : stepFadeOut;

  // Pointer animation
  const pointerScale = interpolate(localProgress, [0.2, 0.4], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Highlight animation for comparison
  const highlightPulse = interpolate(localProgress, [0.3, 0.5, 0.7], [1, 1.2, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title Section */}
      {frame < introDuration && (
        <Sequence from={0} durationInFrames={introDuration}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
            }}
          >
            <h1
              style={{
                color: '#f8fafc',
                fontSize: 52,
                fontWeight: 700,
                margin: 0,
                textAlign: 'center',
              }}
            >
              二分查找分步演示
            </h1>
            <p
              style={{
                color: '#94a3b8',
                fontSize: 24,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Binary Search Step by Step
            </p>
            <div
              style={{
                marginTop: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                backgroundColor: '#1e293b',
                padding: '16px 40px',
                borderRadius: 12,
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 20 }}>搜索目标:</span>
              <span
                style={{
                  color: '#f97316',
                  fontSize: 40,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {searchValue}
              </span>
            </div>
          </div>
        </Sequence>
      )}

      {/* Main Content - Search Steps */}
      {frame >= introDuration && (
        <div style={{ opacity: stepOpacity }}>
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#f8fafc',
                fontSize: 36,
                fontWeight: 700,
                margin: 0,
              }}
            >
              二分查找 - 第 {currentStepIndex + 1} / {totalSteps} 步
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 8 }}>
              {currentTrace.action}
            </p>
          </div>

          {/* Target Value Banner */}
          <div
            style={{
              position: 'absolute',
              top: 130,
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
                border: '2px solid #f97316',
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 18 }}>目标值:</span>
              <span
                style={{
                  color: '#f97316',
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {searchValue}
              </span>
            </div>
          </div>

          {/* Array Visualization */}
          <div
            style={{
              position: 'absolute',
              top: 220,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Index row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              {sortedData.map((_, index) => (
                <div
                  key={`idx-${index}`}
                  style={{
                    width: 70,
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: 14,
                    fontFamily: 'monospace',
                  }}
                >
                  {index}
                </div>
              ))}
            </div>

            {/* Values row */}
            <div style={{ display: 'flex', gap: 12 }}>
              {sortedData.map((value, index) => {
                const isMid = index === currentTrace.mid;
                const isInRange = index >= currentTrace.left && index <= currentTrace.right;
                const isFound = value === searchValue && found;
                const isEliminated = index < currentTrace.left || index > currentTrace.right;

                const scale = isMid ? highlightPulse : 1;
                const bgColor = isFound
                  ? '#22c55e'
                  : isMid
                  ? '#3b82f6'
                  : isInRange
                  ? '#1e40af'
                  : isEliminated
                  ? '#1e293b'
                  : '#334155';

                return (
                  <div
                    key={`val-${index}`}
                    style={{
                      width: 70,
                      height: 70,
                      backgroundColor: bgColor,
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${scale})`,
                      boxShadow: isMid ? '0 0 30px rgba(59, 130, 246, 0.7)' : 'none',
                      border: isMid ? '3px solid #60a5fa' : 'none',
                      opacity: isEliminated ? 0.3 : 1,
                      transition: 'all 0.3s ease',
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
                  </div>
                );
              })}
            </div>

            {/* Pointers */}
            <div
              style={{
                marginTop: 20,
                position: 'relative',
                height: 80,
                width: n * 82,
              }}
            >
              {/* Left pointer */}
              <div
                style={{
                  position: 'absolute',
                  left: currentTrace.left * 82 + 35 - 30,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: pointerScale,
                  transform: `scale(${pointerScale})`,
                }}
              >
                <span
                  style={{
                    color: '#3b82f6',
                    fontWeight: 700,
                    fontSize: 18,
                    backgroundColor: '#1e293b',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  L:{currentTrace.left}
                </span>
                <div
                  style={{
                    width: 3,
                    height: 25,
                    backgroundColor: '#3b82f6',
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Right pointer */}
              <div
                style={{
                  position: 'absolute',
                  left: currentTrace.right * 82 + 35 - 30,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: pointerScale,
                  transform: `scale(${pointerScale})`,
                }}
              >
                <span
                  style={{
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: 18,
                    backgroundColor: '#1e293b',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  R:{currentTrace.right}
                </span>
                <div
                  style={{
                    width: 3,
                    height: 25,
                    backgroundColor: '#ef4444',
                    marginTop: 4,
                  }}
                />
              </div>

              {/* Mid pointer */}
              <div
                style={{
                  position: 'absolute',
                  left: currentTrace.mid * 82 + 35 - 30,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: pointerScale,
                  transform: `scale(${pointerScale})`,
                }}
              >
                <span
                  style={{
                    color: '#22c55e',
                    fontWeight: 700,
                    fontSize: 18,
                    backgroundColor: '#1e293b',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  M:{currentTrace.mid}
                </span>
                <div
                  style={{
                    width: 3,
                    height: 25,
                    backgroundColor: '#22c55e',
                    marginTop: 4,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Comparison Result Box */}
          <div
            style={{
              position: 'absolute',
              bottom: 140,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px 48px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                border: '2px solid #334155',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>
                  当前中间值
                </div>
                <div
                  style={{
                    color: '#3b82f6',
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  contents[{currentTrace.mid}] = {currentTrace.midValue}
                </div>
              </div>

              <div
                style={{
                  width: 2,
                  height: 50,
                  backgroundColor: '#334155',
                }}
              />

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>
                  比较结果
                </div>
                <div
                  style={{
                    color:
                      currentTrace.midValue === searchValue
                        ? '#22c55e'
                        : currentTrace.midValue < searchValue
                        ? '#f97316'
                        : '#3b82f6',
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {currentTrace.midValue}{' '}
                  {currentTrace.midValue === searchValue
                    ? '=='
                    : currentTrace.midValue < searchValue
                    ? '<'
                    : '>'}{' '}
                  {searchValue}
                </div>
              </div>
            </div>
          </div>

          {/* Range Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 80,
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
                borderRadius: 8,
                display: 'flex',
                gap: 32,
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 16 }}>
                搜索范围:{' '}
                <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>
                  [{currentTrace.left} ~ {currentTrace.right}]
                </span>
              </span>
              <span style={{ color: '#94a3b8', fontSize: 16 }}>
                中间位置:{' '}
                <span style={{ color: '#22c55e', fontFamily: 'monospace' }}>
                  mid = [{currentTrace.left} + {currentTrace.right}] / 2 = {currentTrace.mid}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Final Result */}
      {frame >= stepsStart + totalSteps * stepDuration && (
        <Sequence from={stepsStart + totalSteps * stepDuration}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
            }}
          >
            <div
              style={{
                backgroundColor: found ? '#166534' : '#7f1d1d',
                padding: '40px 80px',
                borderRadius: 16,
                textAlign: 'center',
                border: `3px solid ${found ? '#22c55e' : '#ef4444'}`,
              }}
            >
              <h2
                style={{
                  color: found ? '#22c55e' : '#ef4444',
                  fontSize: 48,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {found ? '找到目标！' : '未找到目标'}
              </h2>
              <p
                style={{
                  color: '#f8fafc',
                  fontSize: 24,
                  marginTop: 16,
                }}
              >
                {found
                  ? `${searchValue} 位于索引 ${currentTrace.mid}`
                  : `${searchValue} 不在数组中`}
              </p>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 18,
                  marginTop: 12,
                }}
              >
                共进行了 {totalSteps} 次比较 | 时间复杂度 O(log n)
              </p>
            </div>
          </div>
        </Sequence>
      )}

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          color: '#475569',
          fontSize: 12,
        }}
      >
        {frame} / {totalDuration}
      </div>
    </AbsoluteFill>
  );
};

export default BinarySearchStepVideo;