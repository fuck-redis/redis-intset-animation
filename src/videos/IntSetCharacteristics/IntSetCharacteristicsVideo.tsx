import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const IntSetCharacteristicsSchema = z.object({
  // Use default demo data
});

type Props = z.infer<typeof IntSetCharacteristicsSchema>;

const IntSetCharacteristicsVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // Animation phases (in frames, 30fps)
  const phase1Duration = 90;  // Ordered explanation
  const phase2Duration = 120; // Compact storage
  const phase3Duration = 120; // Dynamic encoding
  const phase4Duration = 90; // Summary
  const totalDuration = phase1Duration + phase2Duration + phase3Duration + phase4Duration;

  // Sample data for visualization
  const smallValues = [1, 15, 23, 42, 56, 78, 89, 100];
  const mediumValues = [1000, 1500, 2300, 4200, 5600, 7800, 8900, 10000];
  const largeValues = [1000000, 1500000, 2300000, 4200000, 5600000, 7800000, 8900000, 10000000];

  // Phase transitions
  const phase2Start = phase1Duration;
  const phase3Start = phase1Duration + phase2Duration;
  const phase4Start = phase1Duration + phase2Duration + phase3Duration;

  // Progress for each phase
  const phase1Progress = interpolate(frame, [0, phase1Duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phase3Progress = interpolate(frame, [phase3Start, phase4Start], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Animation for elements appearing
  const elementAppear = (_index: number, delay: number) => {
    return interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // HashTable scattered positions
  const hashTablePositions = [
    { x: 80, y: 280 },
    { x: 250, y: 350 },
    { x: 180, y: 450 },
    { x: 400, y: 300 },
    { x: 500, y: 420 },
    { x: 350, y: 500 },
    { x: 600, y: 350 },
    { x: 700, y: 450 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title - always visible */}
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 700, margin: 0 }}>
          IntSet 核心特性
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
          有序 | 紧凑 | 动态编码
        </p>
      </div>

      {/* Phase 1: Ordered Storage */}
      {frame < phase2Start && (
        <div style={{ position: 'absolute', top: 90, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '20px 24px',
              borderLeft: '4px solid #3b82f6',
              opacity: frame < 20 ? interpolate(frame, [0, 20], [0, 1]) : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
              }}>
                1
              </div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, margin: 0 }}>
                  有序存储 (Ordered)
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  整数按升序排列，支持二分查找
                </p>
              </div>
            </div>

            {/* IntSet ordered array */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {smallValues.map((val, i) => {
                const appear = elementAppear(i, 30 + i * 10);
                const isHighlight = i === Math.floor(phase1Progress * smallValues.length) || i === Math.floor(phase1Progress * smallValues.length) - 1;

                return (
                  <div
                    key={i}
                    style={{
                      width: 60,
                      height: 50,
                      backgroundColor: '#0f172a',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${isHighlight ? '#3b82f6' : '#334155'}`,
                      opacity: appear,
                      transform: `scale(${isHighlight ? 1.1 : 1})`,
                      boxShadow: isHighlight ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: '#f8fafc', fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Arrow showing order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 200, height: 2, backgroundColor: '#3b82f6', borderRadius: 1 }} />
              <span style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600 }}>从小到大</span>
            </div>

            {/* Binary search indicator */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>搜索复杂度:</span>
              <span style={{ color: '#22c55e', fontSize: 16, fontWeight: 600 }}>O(log n)</span>
              <span style={{ color: '#64748b', fontSize: 13 }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>插入/删除:</span>
              <span style={{ color: '#f97316', fontSize: 16, fontWeight: 600 }}>O(n)</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Compact Storage */}
      {frame >= phase2Start && frame < phase3Start && (
        <div style={{ position: 'absolute', top: 90, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '20px 24px',
              borderLeft: '4px solid #8b5cf6',
              opacity: interpolate(frame, [phase2Start, phase2Start + 20], [0, 1]),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
              }}>
                2
              </div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, margin: 0 }}>
                  紧凑存储 (Compact)
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  内存连续排列，无指针开销
                </p>
              </div>
            </div>

            {/* Two-column comparison */}
            <div style={{ display: 'flex', gap: 40 }}>
              {/* IntSet - continuous */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>IntSet (连续内存)</span>
                  <span style={{ color: '#22c55e', fontSize: 12 }}>~{(8 + smallValues.length * 4)}B</span>
                </div>
                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  padding: 16,
                  border: '1px solid #334155',
                  display: 'flex',
                  gap: 4,
                }}>
                  {smallValues.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        width: 50,
                        height: 40,
                        backgroundColor: '#1e40af',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#f8fafc', fontSize: 12, fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 3, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                  <span style={{ color: '#64748b', fontSize: 10 }}>连续内存地址</span>
                </div>
              </div>

              {/* HashTable - scattered */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>HashTable (分散内存)</span>
                  <span style={{ color: '#ef4444', fontSize: 12 }}>~{(120 + smallValues.length * 40)}B</span>
                </div>
                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  padding: 16,
                  border: '1px solid #334155',
                  height: 160,
                  position: 'relative',
                }}>
                  {smallValues.map((val, i) => {
                    const pos = hashTablePositions[i];
                    const appear = interpolate(frame, [phase2Start + 20, phase2Start + 40 + i * 10], [0, 1]);
                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: pos.x,
                          top: pos.y,
                          width: 50,
                          height: 40,
                          backgroundColor: '#6d28d9',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: appear,
                          transition: 'all 0.3s',
                        }}
                      >
                        <span style={{ color: '#f8fafc', fontSize: 12, fontFamily: 'monospace' }}>{val}</span>
                      </div>
                    );
                  })}
                  {/* Connection lines (scattered) */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="105" y1="310" x2="275" y2="380" stroke="#64748b" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                    <line x1="275" y1="380" x2="205" y2="480" stroke="#64718b" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                    <line x1="205" y1="480" x2="425" y2="330" stroke="#64748b" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                    <line x1="425" y1="330" x2="525" y2="450" stroke="#64748b" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                  </svg>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 3, backgroundColor: '#8b5cf6', borderRadius: 2 }} />
                  <span style={{ color: '#64748b', fontSize: 10 }}>指针 + 桶数组</span>
                </div>
              </div>
            </div>

            {/* Memory savings indicator */}
            <div style={{
              marginTop: 16,
              backgroundColor: '#0f172a',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>内存节省:</span>
              <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 700 }}>
                {Math.round((1 - (8 + smallValues.length * 4) / (120 + smallValues.length * 40)) * 100)}%
              </span>
              <span style={{ color: '#64748b', fontSize: 13 }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>无指针开销:</span>
              <span style={{ color: '#22c55e', fontSize: 16, fontWeight: 600 }}>是</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Dynamic Encoding */}
      {frame >= phase3Start && frame < phase4Start && (
        <div style={{ position: 'absolute', top: 90, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '20px 24px',
              borderLeft: '4px solid #ec4899',
              opacity: interpolate(frame, [phase3Start, phase3Start + 20], [0, 1]),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
              }}>
                3
              </div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, margin: 0 }}>
                  动态编码 (Dynamic Encoding)
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  根据数值范围自动选择最小编码类型
                </p>
              </div>
            </div>

            {/* Three encoding types */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              {/* INT16 */}
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                border: `2px solid ${phase3Progress < 0.33 ? '#3b82f6' : '#334155'}`,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>INT16</span>
                  <span style={{ color: '#64748b', fontSize: 11 }}>2 bytes</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {smallValues.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: '#1e40af',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#f8fafc', fontSize: 9, fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#64748b', fontSize: 11 }}>
                  范围: -32,768 ~ 32,767
                </div>
                <div style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                  {smallValues.every(v => v >= -32768 && v <= 32767) ? '适用' : '不适用'}
                </div>
              </div>

              {/* INT32 */}
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                border: `2px solid ${phase3Progress >= 0.33 && phase3Progress < 0.66 ? '#8b5cf6' : '#334155'}`,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>INT32</span>
                  <span style={{ color: '#64748b', fontSize: 11 }}>4 bytes</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {mediumValues.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        width: 35,
                        height: 30,
                        backgroundColor: '#6d28d9',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#f8fafc', fontSize: 9, fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#64748b', fontSize: 11 }}>
                  范围: -2.1B ~ 2.1B
                </div>
                <div style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                  {mediumValues.every(v => v >= -2147483648 && v <= 2147483647) ? '适用' : '不适用'}
                </div>
              </div>

              {/* INT64 */}
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                border: `2px solid ${phase3Progress >= 0.66 ? '#ec4899' : '#334155'}`,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#ec4899', fontSize: 14, fontWeight: 600 }}>INT64</span>
                  <span style={{ color: '#64748b', fontSize: 11 }}>8 bytes</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {largeValues.map((val, i) => (
                    <div
                      key={i}
                      style={{
                        width: 40,
                        height: 30,
                        backgroundColor: '#9d174d',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#f8fafc', fontSize: 8, fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#64748b', fontSize: 11 }}>
                  范围: -9.2E ~ 9.2E
                </div>
                <div style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                  {largeValues.every(v => v >= -9223372036854775808n && v <= 9223372036854775807n) ? '适用' : '不适用'}
                </div>
              </div>
            </div>

            {/* Auto-upgrade indicator */}
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>编码升级路径:</span>
              <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>INT16</span>
              <span style={{ color: '#64748b' }}>-&gt;</span>
              <span style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>INT32</span>
              <span style={{ color: '#64748b' }}>-&gt;</span>
              <span style={{ color: '#ec4899', fontSize: 14, fontWeight: 600 }}>INT64</span>
              <span style={{ color: '#64748b', fontSize: 13 }}>|</span>
              <span style={{ color: '#f97316', fontSize: 13 }}>自动触发，不可逆</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase 4: Summary */}
      {frame >= phase4Start && (
        <div style={{ position: 'absolute', top: 90, left: 40, right: 40 }}>
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: '20px 24px',
              borderLeft: '4px solid #f97316',
              opacity: interpolate(frame, [phase4Start, phase4Start + 20], [0, 1]),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
              }}>
                !
              </div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, margin: 0 }}>
                  IntSet 设计思想
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  内存效率与性能的完美平衡
                </p>
              </div>
            </div>

            {/* Three feature cards */}
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                borderTop: '3px solid #3b82f6',
              }}>
                <div style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>有序存储</div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  整数按值排序存储，支持二分查找<br />
                  <span style={{ color: '#64748b' }}>O(log n) 查找复杂度</span>
                </div>
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                borderTop: '3px solid #8b5cf6',
              }}>
                <div style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>紧凑布局</div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  连续内存，无指针开销<br />
                  <span style={{ color: '#64748b' }}>显著节省内存空间</span>
                </div>
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                borderTop: '3px solid #ec4899',
              }}>
                <div style={{ color: '#ec4899', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>智能编码</div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  自动选择最小编码类型<br />
                  <span style={{ color: '#64748b' }}>INT16 &lt; INT32 &lt; INT64</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom info bar */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#3b82f6',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>有序</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#8b5cf6',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>紧凑</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#ec4899',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>动态编码</span>
        </div>
      </div>

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
          color: '#64748b',
          fontSize: 12,
        }}
      >
        {totalDuration} 帧 @ 30fps | Loop
      </div>
    </AbsoluteFill>
  );
};

export default IntSetCharacteristicsVideo;
