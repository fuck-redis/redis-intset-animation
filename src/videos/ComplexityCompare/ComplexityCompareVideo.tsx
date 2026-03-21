import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const ComplexityCompareSchema = z.object({});

type Props = z.infer<typeof ComplexityCompareSchema>;

export const ComplexityCompareVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases
  const introDuration = 45;
  const curveDrawDuration = 120;
  const barChartDuration = 90;
  const summaryDuration = 90;
  const totalDuration = introDuration + curveDrawDuration + barChartDuration + summaryDuration + 30;

  // Data sizes to visualize
  const dataSizes = [8, 16, 32, 64, 128, 256, 512, 1024];

  // Calculate operations for each complexity at each data size
  const getOperations = (n: number, type: 'O(1)' | 'O(log n)' | 'O(n)') => {
    switch (type) {
      case 'O(1)':
        return 1; // Constant
      case 'O(log n)':
        return Math.ceil(Math.log2(n + 1)); // Log base 2
      case 'O(n)':
        return n; // Linear
      default:
        return 1;
    }
  };

  // Animation progress for curve drawing
  const curveProgress = interpolate(
    frame,
    [introDuration, introDuration + curveDrawDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Bar chart animation
  const barProgress = interpolate(
    frame,
    [introDuration + curveDrawDuration, introDuration + curveDrawDuration + barChartDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Summary animation
  const summaryProgress = interpolate(
    frame,
    [
      introDuration + curveDrawDuration + barChartDuration,
      introDuration + curveDrawDuration + barChartDuration + summaryDuration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Max operations for scaling (use O(n) at max size)
  const maxOps = getOperations(1024, 'O(n)');
  const chartHeight = 200;
  const chartWidth = 600;
  const chartX = 100;
  const chartY = 350;

  // Curve points for SVG path
  const createCurvePoints = (type: 'O(1)' | 'O(log n)' | 'O(n)') => {
    return dataSizes.map((size, i) => {
      const x = chartX + (i / (dataSizes.length - 1)) * chartWidth;
      const ops = getOperations(size, type);
      const normalizedY = (ops / maxOps) * chartHeight;
      const y = chartY + chartHeight - normalizedY;
      return { x, y, size, ops };
    });
  };

  const o1Points = createCurvePoints('O(1)');
  const logNPoints = createCurvePoints('O(log n)');
  const oNPoints = createCurvePoints('O(n)');

  // Create SVG path string
  const createPath = (points: typeof o1Points) => {
    return points.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      return `L ${p.x} ${p.y}`;
    }).join(' ');
  };

  // Calculate bar chart data at a specific data size index
  const getBarHeight = (type: 'O(1)' | 'O(log n)' | 'O(n)', dataIndex: number, progress: number) => {
    const size = dataSizes[dataIndex];
    const ops = getOperations(size, type);
    const normalizedHeight = (ops / maxOps) * 180;
    const animatedHeight = normalizedHeight * progress;
    return Math.min(animatedHeight, normalizedHeight);
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      {frame >= 0 && (
        <div style={{ position: 'absolute', top: 25, left: 0, right: 0, textAlign: 'center' }}>
          <h1 style={{ color: '#f8fafc', fontSize: 36, fontWeight: 700, margin: 0 }}>
            时间复杂度对比
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
            O(1) vs O(log n) vs O(n) - 随数据量增长的性能差异
          </p>
        </div>
      )}

      {/* Legend */}
      {frame >= introDuration && (
        <div style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
        }}>
          {[
            { label: 'O(1) - 常数时间', color: '#22c55e', desc: '哈希查找' },
            { label: 'O(log n) - 对数时间', color: '#3b82f6', desc: '二分查找' },
            { label: 'O(n) - 线性时间', color: '#f97316', desc: '元素移动' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: item.color,
              }} />
              <div>
                <span style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Curve Chart - shown during curveDrawDuration */}
      {frame >= introDuration && frame < introDuration + curveDrawDuration + barChartDuration && (
        <div style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <svg width={800} height={320} style={{ overflow: 'visible' }}>
            {/* Chart area background */}
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
                  x={chartX - 10}
                  y={chartY + chartHeight * (1 - tick) + 4}
                  fill="#64748b"
                  fontSize={11}
                  textAnchor="end"
                >
                  {Math.round(maxOps * tick)}
                </text>
              </g>
            ))}

            {/* X-axis labels (data sizes) */}
            {dataSizes.map((size, i) => {
              const x = chartX + (i / (dataSizes.length - 1)) * chartWidth;
              return (
                <text
                  key={i}
                  x={x}
                  y={chartY + chartHeight + 20}
                  fill="#64748b"
                  fontSize={11}
                  textAnchor="middle"
                >
                  n={size}
                </text>
              );
            })}

            {/* O(n) curve - Orange */}
            <path
              d={createPath(oNPoints)}
              fill="none"
              stroke="#f97316"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: oNPoints.length * 10,
                strokeDashoffset: interpolate(curveProgress, [0, 1], [oNPoints.length * 10, 0]),
              }}
            />

            {/* O(log n) curve - Blue */}
            <path
              d={createPath(logNPoints)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: logNPoints.length * 10,
                strokeDashoffset: interpolate(curveProgress, [0, 0.7], [logNPoints.length * 10, 0]),
              }}
            />

            {/* O(1) line - Green (constant) */}
            <path
              d={createPath(o1Points)}
              fill="none"
              stroke="#22c55e"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: o1Points.length * 10,
                strokeDashoffset: interpolate(curveProgress, [0, 0.4], [o1Points.length * 10, 0]),
              }}
            />

            {/* Data points on curves */}
            {curveProgress > 0.5 && dataSizes.map((size, i) => {
              const x = chartX + (i / (dataSizes.length - 1)) * chartWidth;
              const y1 = chartY + chartHeight - (1 / maxOps) * chartHeight;
              const y2 = chartY + chartHeight - (Math.ceil(Math.log2(size + 1)) / maxOps) * chartHeight;
              const y3 = chartY + chartHeight - (size / maxOps) * chartHeight;

              return (
                <g key={i}>
                  <circle cx={x} cy={y1} r={4} fill="#22c55e" opacity={interpolate(curveProgress, [0.5, 0.7], [0, 1])} />
                  <circle cx={x} cy={y2} r={4} fill="#3b82f6" opacity={interpolate(curveProgress, [0.5, 0.8], [0, 1])} />
                  <circle cx={x} cy={y3} r={4} fill="#f97316" opacity={interpolate(curveProgress, [0.5, 0.9], [0, 1])} />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Bar Chart Comparison - shown during barChartDuration */}
      {frame >= introDuration + curveDrawDuration && (
        <div style={{
          position: 'absolute',
          top: 160,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ color: '#94a3b8', fontSize: 16, marginBottom: 16 }}>
            数据量增长时各复杂度的操作次数对比
          </div>

          {/* Bar groups */}
          <div style={{ display: 'flex', gap: 60, alignItems: 'flex-end' }}>
            {[4, 6, 8].map((dataIndex) => {
              const size = dataSizes[dataIndex];
              const o1Height = getBarHeight('O(1)', dataIndex, barProgress);
              const logNHeight = getBarHeight('O(log n)', dataIndex, barProgress);
              const oNHeight = getBarHeight('O(n)', dataIndex, barProgress);

              return (
                <div key={dataIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>n = {size}</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 200 }}>
                    {/* O(1) bar */}
                    <div style={{
                      width: 50,
                      height: Math.max(o1Height, 2),
                      backgroundColor: '#22c55e',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s',
                      boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
                    }}>
                      <div style={{
                        position: 'relative',
                        top: -24,
                        textAlign: 'center',
                        color: '#22c55e',
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: barProgress > 0.5 ? 1 : 0,
                      }}>
                        {getOperations(size, 'O(1)')}步
                      </div>
                    </div>

                    {/* O(log n) bar */}
                    <div style={{
                      width: 50,
                      height: Math.max(logNHeight, 2),
                      backgroundColor: '#3b82f6',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                    }}>
                      <div style={{
                        position: 'relative',
                        top: -24,
                        textAlign: 'center',
                        color: '#3b82f6',
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: barProgress > 0.5 ? 1 : 0,
                      }}>
                        {getOperations(size, 'O(log n)')}步
                      </div>
                    </div>

                    {/* O(n) bar */}
                    <div style={{
                      width: 50,
                      height: Math.max(oNHeight, 2),
                      backgroundColor: '#f97316',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s',
                      boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
                    }}>
                      <div style={{
                        position: 'relative',
                        top: -24,
                        textAlign: 'center',
                        color: '#f97316',
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: barProgress > 0.5 ? 1 : 0,
                      }}>
                        {getOperations(size, 'O(n)')}步
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar legend */}
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 2 }} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>O(1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 2 }} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>O(log n)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: '#f97316', borderRadius: 2 }} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>O(n)</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {frame >= introDuration + curveDrawDuration + barChartDuration && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: summaryProgress,
          transform: `translateY(${(1 - summaryProgress) * 20}px)`,
        }}>
          <div style={{
            display: 'flex',
            gap: 40,
            backgroundColor: '#1e293b',
            padding: '24px 40px',
            borderRadius: 12,
          }}>
            {/* IntSet column */}
            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              borderRadius: 8,
              backgroundColor: '#0f172a',
              border: '2px solid #3b82f6',
            }}>
              <div style={{ color: '#3b82f6', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                IntSet
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                查找: <span style={{ color: '#3b82f6', fontWeight: 600 }}>O(log n)</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                插入: <span style={{ color: '#f97316', fontWeight: 600 }}>O(n)</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                删除: <span style={{ color: '#f97316', fontWeight: 600 }}>O(n)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                内存占用小 | 有序存储
              </div>
            </div>

            {/* VS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: 20,
              fontWeight: 700,
            }}>
              vs
            </div>

            {/* HashTable column */}
            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              borderRadius: 8,
              backgroundColor: '#0f172a',
              border: '2px solid #8b5cf6',
            }}>
              <div style={{ color: '#8b5cf6', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                HashTable
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                查找: <span style={{ color: '#22c55e', fontWeight: 600 }}>O(1)</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
                插入: <span style={{ color: '#22c55e', fontWeight: 600 }}>O(1)</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                删除: <span style={{ color: '#22c55e', fontWeight: 600 }}>O(1)</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                内存占用大 | 无序存储
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key insight box */}
      {frame >= introDuration + curveDrawDuration + barChartDuration + 30 && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(summaryProgress, [0.6, 1], [0, 1]),
        }}>
          <div style={{
            backgroundColor: '#1e3a5f',
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid #3b82f6',
          }}>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>关键洞察</span>:
              当 n ≤ 512 时，O(log n) 与 O(1) 的差异可以忽略不计，但 IntSet 节省了大量内存
            </span>
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

export default ComplexityCompareVideo;