import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const MemoryCompareSchema = z.object({});

type Props = z.infer<typeof MemoryCompareSchema>;

export const MemoryCompareVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases (12-15 seconds at 30fps = 360-450 frames)
  const introDuration = 30;
  const barChartDuration = 150;
  const comparisonDuration = 90;
  const savingsDuration = 60;
  const totalDuration = introDuration + barChartDuration + comparisonDuration + savingsDuration + 30;

  // Data points to show
  const dataPoints = [
    { elements: 10, intSetBytes: 48, hashTableBytes: 480 },
    { elements: 50, intSetBytes: 208, hashTableBytes: 2400 },
    { elements: 100, intSetBytes: 408, hashTableBytes: 4800 },
    { elements: 500, intSetBytes: 2008, hashTableBytes: 24000 },
  ];

  const maxHashTableBytes = 24000;
  const chartHeight = 280;
  const chartWidth = 700;
  const chartX = 100;
  const chartY = 200;
  const barWidth = 60;
  const groupGap = 140;

  // Animation progress for each phase
  const barChartProgress = interpolate(
    frame,
    [introDuration, introDuration + barChartDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const comparisonProgress = interpolate(
    frame,
    [introDuration + barChartDuration, introDuration + barChartDuration + comparisonDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const savingsProgress = interpolate(
    frame,
    [
      introDuration + barChartDuration + comparisonDuration,
      introDuration + barChartDuration + comparisonDuration + savingsDuration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Calculate bar heights with spring animation
  const getBarHeight = (bytes: number, index: number, progress: number) => {
    const normalizedHeight = (bytes / maxHashTableBytes) * chartHeight;
    const pointProgress = interpolate(progress, [index * 0.2, index * 0.2 + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return normalizedHeight * pointProgress;
  };

  // Savings percentage at different scales
  const savings = [
    { elements: 10, percent: 90 },
    { elements: 50, percent: 91 },
    { elements: 100, percent: 91 },
    { elements: 500, percent: 91 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      {frame >= 0 && (
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center' }}>
          <h1 style={{ color: '#f8fafc', fontSize: 36, fontWeight: 700, margin: 0 }}>
            内存占用对比
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
            IntSet vs HashTable - 存储相同数据的内存消耗
          </p>
        </div>
      )}

      {/* Legend */}
      {frame >= introDuration && (
        <div style={{
          position: 'absolute',
          top: 95,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: '#3b82f6',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            }} />
            <span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>IntSet</span>
            <span style={{ color: '#64748b', fontSize: 14 }}>紧凑数组</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: '#8b5cf6',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }} />
            <span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>HashTable</span>
            <span style={{ color: '#64748b', fontSize: 14 }}>字典结构</span>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {frame >= introDuration && frame < introDuration + barChartDuration + comparisonDuration && (
        <div style={{
          position: 'absolute',
          top: 130,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <svg width={900} height={400} style={{ overflow: 'visible' }}>
            {/* Chart background */}
            <rect
              x={chartX}
              y={chartY}
              width={chartWidth}
              height={chartHeight}
              fill="#1e293b"
              rx={8}
            />

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
              <g key={i}>
                <line
                  x1={chartX}
                  y1={chartY + chartHeight * (1 - tick)}
                  x2={chartX + chartWidth}
                  y2={chartY + chartHeight * (1 - tick)}
                  stroke="#334155"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <text
                  x={chartX - 15}
                  y={chartY + chartHeight * (1 - tick) + 5}
                  fill="#64748b"
                  fontSize={12}
                  textAnchor="end"
                >
                  {Math.round(maxHashTableBytes * tick / 1000)}KB
                </text>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x={chartX - 50}
              y={chartY + chartHeight / 2}
              fill="#64748b"
              fontSize={13}
              textAnchor="middle"
              transform={`rotate(-90, ${chartX - 50}, ${chartY + chartHeight / 2})`}
            >
              内存占用
            </text>

            {/* Bar groups */}
            {dataPoints.map((data, index) => {
              const groupX = chartX + 60 + index * groupGap;
              const intSetHeight = getBarHeight(data.intSetBytes, index, barChartProgress);
              const hashTableHeight = getBarHeight(data.hashTableBytes, index, barChartProgress);

              return (
                <g key={index}>
                  {/* HashTable bar (behind, taller) */}
                  <rect
                    x={groupX - barWidth / 2}
                    y={chartY + chartHeight - hashTableHeight}
                    width={barWidth}
                    height={Math.max(hashTableHeight, 2)}
                    fill="#8b5cf6"
                    rx={4}
                    opacity={0.8}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))',
                    }}
                  />

                  {/* IntSet bar (front, shorter) */}
                  <rect
                    x={groupX + barWidth / 2 + 10}
                    y={chartY + chartHeight - intSetHeight}
                    width={barWidth}
                    height={Math.max(intSetHeight, 2)}
                    fill="#3b82f6"
                    rx={4}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))',
                    }}
                  />

                  {/* Element count label */}
                  <text
                    x={groupX + barWidth / 2 + 10}
                    y={chartY + chartHeight + 25}
                    fill="#94a3b8"
                    fontSize={14}
                    textAnchor="middle"
                    fontWeight={600}
                  >
                    {data.elements}
                  </text>
                  <text
                    x={groupX + barWidth / 2 + 10}
                    y={chartY + chartHeight + 42}
                    fill="#64748b"
                    fontSize={11}
                    textAnchor="middle"
                  >
                    元素
                  </text>

                  {/* Memory labels on bars */}
                  {barChartProgress > 0.5 && (
                    <>
                      <text
                        x={groupX - barWidth / 2}
                        y={chartY + chartHeight - hashTableHeight - 10}
                        fill="#c4b5fd"
                        fontSize={11}
                        textAnchor="middle"
                        fontWeight={600}
                      >
                        {(data.hashTableBytes / 1000).toFixed(1)}KB
                      </text>
                      <text
                        x={groupX + barWidth / 2 + 10}
                        y={chartY + chartHeight - intSetHeight - 10}
                        fill="#93c5fd"
                        fontSize={11}
                        textAnchor="middle"
                        fontWeight={600}
                      >
                        {(data.intSetBytes / 1000).toFixed(1)}KB
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* X-axis baseline */}
            <line
              x1={chartX}
              y1={chartY + chartHeight}
              x2={chartX + chartWidth}
              y2={chartY + chartHeight}
              stroke="#475569"
              strokeWidth={2}
            />
          </svg>
        </div>
      )}

      {/* Savings highlight section */}
      {frame >= introDuration + barChartDuration && (
        <div style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: comparisonProgress,
          transform: `translateY(${(1 - comparisonProgress) * 30}px)`,
        }}>
          <div style={{
            display: 'flex',
            gap: 30,
            backgroundColor: '#1e293b',
            padding: '20px 40px',
            borderRadius: 12,
          }}>
            {savings.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '12px 20px',
                borderRadius: 8,
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                opacity: interpolate(comparisonProgress, [i * 0.2, i * 0.2 + 0.5], [0, 1]),
              }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                  {s.elements} 元素
                </div>
                <div style={{
                  color: '#22c55e',
                  fontSize: 28,
                  fontWeight: 700,
                }}>
                  {s.percent}%
                </div>
                <div style={{ color: '#64748b', fontSize: 11 }}>
                  节省内存
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key insight box */}
      {frame >= introDuration + barChartDuration + comparisonDuration && (
        <div style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: savingsProgress,
          transform: `translateY(${(1 - savingsProgress) * 20}px)`,
        }}>
          <div style={{
            backgroundColor: '#064e3b',
            padding: '16px 32px',
            borderRadius: 12,
            border: '1px solid #22c55e',
            textAlign: 'center',
          }}>
            <div style={{
              color: '#f8fafc',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
            }}>
              节省高达 91% 内存
            </div>
            <div style={{ color: '#86efac', fontSize: 14 }}>
              IntSet 采用紧凑的连续内存布局，仅存储实际数据，无哈希冲突和指针开销
            </div>
          </div>
        </div>
      )}

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
          color: '#64748b',
          fontSize: 14,
        }}
      >
        {totalDuration} 帧 (loop)
      </div>
    </AbsoluteFill>
  );
};

export default MemoryCompareVideo;
