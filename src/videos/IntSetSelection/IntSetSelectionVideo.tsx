import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const IntSetSelectionSchema = z.object({
  // Use default data
});

type Props = z.infer<typeof IntSetSelectionSchema>;

const IntSetSelectionVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases (in frames, 30fps) - total ~13 seconds
  const introDuration = 60;      // Title and question
  const condition1Duration = 90; // Condition 1: All integers
  const condition2Duration = 90; // Condition 2: Count <= 512
  const resultDuration = 90;     // Transformation results
  const outroDuration = 60;      // Summary
  const totalDuration = introDuration + condition1Duration + condition2Duration + resultDuration + outroDuration;

  // Phase transitions
  const condition1Start = introDuration;
  const condition2Start = introDuration + condition1Duration;
  const resultStart = introDuration + condition1Duration + condition2Duration;
  const outroStart = introDuration + condition1Duration + condition2Duration + resultDuration;

  // Progress for each phase
  const condition1Progress = interpolate(frame, [condition1Start, condition1Start + condition1Duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const condition2Progress = interpolate(frame, [condition2Start, condition2Start + condition2Duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const resultProgress = interpolate(frame, [resultStart, resultStart + resultDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Animation helpers
  const fadeIn = (start: number, duration: number = 30) => {
    return interpolate(frame, [start, start + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // Sample data for demonstrations
  const integerElements = [1, 15, 23, 42, 56, 78];
  const mixedElements = [1, 'hello', 23, 'world', 56];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title - always visible in first phase */}
      {frame < condition2Start && (
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', opacity: frame < 20 ? interpolate(frame, [0, 20], [0, 1]) : 1 }}>
          <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 700, margin: 0 }}>
            IntSet 选择条件
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            何时使用 IntSet 而非 HashTable
          </p>
        </div>
      )}

      {/* Intro Phase: The Decision Question */}
      {frame < condition1Start && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          opacity: fadeIn(30, 30),
        }}>
          <div style={{
            width: 300,
            height: 120,
            backgroundColor: '#1e293b',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #3b82f6',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600 }}>应该使用 IntSet 吗?</span>
            <span style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>检查以下两个条件...</span>
          </div>
        </div>
      )}

      {/* Condition 1: All elements are integers */}
      {frame >= condition1Start && frame < condition2Start && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: 40,
          right: 40,
          opacity: fadeIn(condition1Start, 20),
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #3b82f6',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
                  条件一: 所有元素必须是整数
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  IntSet 只能存储整数值，非整数会触发转换
                </p>
              </div>
            </div>

            {/* Flowchart visualization */}
            <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* Check input */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: '2px solid #334155',
                textAlign: 'center',
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>输入数据</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 200 }}>
                  {mixedElements.slice(0, 3).map((el, i) => (
                    <span key={i} style={{
                      color: typeof el === 'string' ? '#ef4444' : '#22c55e',
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}>
                      {typeof el === 'string' ? `"${el}"` : el}
                    </span>
                  ))}
                  <span style={{ color: '#64748b', fontSize: 12 }}>...</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ color: '#64748b', fontSize: 24 }}>-&gt;</div>

              {/* Decision diamond */}
              <div style={{
                width: 120,
                height: 120,
                transform: 'rotate(45deg)',
                backgroundColor: condition1Progress < 0.5 ? '#3b82f6' : '#22c55e',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
                transition: 'background-color 0.5s',
              }}>
                <span style={{
                  transform: 'rotate(-45deg)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  {condition1Progress < 0.5 ? '检查类型' : '全是整数?'}
                </span>
              </div>

              {/* Arrow */}
              <div style={{ color: '#64748b', fontSize: 24 }}>-&gt;</div>

              {/* Result */}
              <div style={{
                backgroundColor: condition1Progress >= 0.7 ? '#22c55e' : '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: `2px solid ${condition1Progress >= 0.7 ? '#22c55e' : '#ef4444'}`,
                textAlign: 'center',
                transition: 'all 0.3s',
              }}>
                <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600 }}>
                  {condition1Progress >= 0.7 ? '使用 IntSet' : '等待检查...'}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                  {condition1Progress >= 0.7 ? '全部为整数' : '进行中...'}
                </div>
              </div>
            </div>

            {/* Show violation case */}
            {condition1Progress >= 0.5 && (
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>违反条件:</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  检测到非整数元素 <span style={{ color: '#f97316' }}>"hello"</span>, <span style={{ color: '#f97316' }}>"world"</span>
                </span>
                <span style={{ color: '#64748b', fontSize: 12 }}>-&gt;</span>
                <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>转换为 HashTable</span>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: 16, height: 4, backgroundColor: '#334155', borderRadius: 2 }}>
              <div style={{
                width: `${condition1Progress * 100}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: 2,
                transition: 'width 0.1s',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Condition 2: Element count <= 512 */}
      {frame >= condition2Start && frame < resultStart && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: 40,
          right: 40,
          opacity: fadeIn(condition2Start, 20),
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #8b5cf6',
          }}>
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
                  条件二: 元素数量不超过 512
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  超过阈值后自动转换为 HashTable 以保持性能
                </p>
              </div>
            </div>

            {/* Flowchart visualization */}
            <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* Check input */}
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: '2px solid #334155',
                textAlign: 'center',
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>元素数量</div>
                <div style={{ color: '#f97316', fontSize: 18, fontWeight: 700 }}>600</div>
                <div style={{ color: '#ef4444', fontSize: 10 }}>超过 512</div>
              </div>

              {/* Arrow */}
              <div style={{ color: '#64748b', fontSize: 24 }}>-&gt;</div>

              {/* Decision diamond */}
              <div style={{
                width: 120,
                height: 120,
                transform: 'rotate(45deg)',
                backgroundColor: condition2Progress < 0.5 ? '#8b5cf6' : '#ef4444',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                transition: 'background-color 0.5s',
              }}>
                <span style={{
                  transform: 'rotate(-45deg)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  {condition2Progress < 0.5 ? '检查数量' : 'n <= 512?'}
                </span>
              </div>

              {/* Arrow */}
              <div style={{ color: '#64748b', fontSize: 24 }}>-&gt;</div>

              {/* Result */}
              <div style={{
                backgroundColor: '#ef4444',
                borderRadius: 8,
                padding: '12px 16px',
                border: '2px solid #ef4444',
                textAlign: 'center',
              }}>
                <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600 }}>
                  转换为 HashTable
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>
                  数量超限
                </div>
              </div>
            </div>

            {/* Show threshold info */}
            {condition2Progress >= 0.4 && (
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>IntSet 阈值</div>
                  <div style={{ color: '#8b5cf6', fontSize: 16, fontWeight: 700 }}>512</div>
                </div>
                <div style={{ width: 1, height: 30, backgroundColor: '#334155' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>配置项</div>
                  <div style={{ color: '#f8fafc', fontSize: 12 }}>set-max-intset-entries</div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: 16, height: 4, backgroundColor: '#334155', borderRadius: 2 }}>
              <div style={{
                width: `${condition2Progress * 100}%`,
                height: '100%',
                backgroundColor: '#8b5cf6',
                borderRadius: 2,
                transition: 'width 0.1s',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Result Phase: Transformation Examples */}
      {frame >= resultStart && frame < outroStart && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: 40,
          right: 40,
          opacity: fadeIn(resultStart, 20),
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #f97316',
          }}>
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
                  违反条件的结果
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  任一条件不满足时，IntSet 将自动转换为 HashTable
                </p>
              </div>
            </div>

            {/* Two transformation examples side by side */}
            <div style={{ display: 'flex', gap: 20 }}>
              {/* Example 1: Non-integer */}
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                border: `2px solid ${resultProgress > 0.2 ? '#ef4444' : '#334155'}`,
                transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>违反条件1: 非整数元素</span>
                  <span style={{ color: '#64748b', fontSize: 10 }}>类型转换</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#1e293b',
                    borderRadius: 6,
                    display: 'flex',
                    gap: 4,
                  }}>
                    {integerElements.slice(0, 4).map((v, i) => (
                      <span key={i} style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>
                    ))}
                    <span style={{ color: '#64748b', fontSize: 11 }}>+2 more</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: 16 }}>-&gt;</span>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#1e293b',
                    borderRadius: 6,
                    display: 'flex',
                    gap: 4,
                  }}>
                    <span style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>1</span>
                    <span style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace' }}>"a"</span>
                    <span style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>2</span>
                    <span style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace' }}>"b"</span>
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#1e293b',
                  borderRadius: 6,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#64748b', fontSize: 11 }}>编码:</span>
                  <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>intset</span>
                  <span style={{ color: '#64748b', fontSize: 11 }}>-&gt;</span>
                  <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>hashtable</span>
                </div>
              </div>

              {/* Example 2: Overflow */}
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                border: `2px solid ${resultProgress > 0.4 ? '#ef4444' : '#334155'}`,
                transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>违反条件2: 超过512个元素</span>
                  <span style={{ color: '#64748b', fontSize: 10 }}>容量转换</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#1e293b',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>512</span>
                    <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>elements</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: 16 }}>-&gt;</span>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#1e293b',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#f97316', fontSize: 11, fontFamily: 'monospace' }}>513</span>
                    <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>elements</span>
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#1e293b',
                  borderRadius: 6,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#64748b', fontSize: 11 }}>编码:</span>
                  <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>intset</span>
                  <span style={{ color: '#64748b', fontSize: 11 }}>-&gt;</span>
                  <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>hashtable</span>
                </div>
              </div>
            </div>

            {/* Transformation animation */}
            {resultProgress > 0.6 && (
              <div style={{
                marginTop: 16,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 60,
                  height: 40,
                  backgroundColor: '#22c55e',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>IntSet</span>
                </div>
                <span style={{ color: '#64748b', fontSize: 20 }}>-&gt;</span>
                <div style={{
                  width: 60,
                  height: 40,
                  backgroundColor: '#ef4444',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>HashTable</span>
                </div>
                <span style={{ color: '#f97316', fontSize: 12, marginLeft: 8 }}>自动转换</span>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ marginTop: 16, height: 4, backgroundColor: '#334155', borderRadius: 2 }}>
              <div style={{
                width: `${resultProgress * 100}%`,
                height: '100%',
                backgroundColor: '#f97316',
                borderRadius: 2,
                transition: 'width 0.1s',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Outro Phase: Summary */}
      {frame >= outroStart && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: 40,
          right: 40,
          opacity: fadeIn(outroStart, 20),
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #22c55e',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
              }}>
                ✓
              </div>
              <div>
                <h2 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, margin: 0 }}>
                  IntSet 选择决策
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                  同时满足以下两个条件时使用 IntSet
                </p>
              </div>
            </div>

            {/* Two conditions summary cards */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                borderTop: '3px solid #3b82f6',
              }}>
                <div style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  条件 1: 整数类型
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  所有元素必须是整数值<br />
                  <span style={{ color: '#64748b' }}>包含字符串将触发转换</span>
                </div>
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#0f172a',
                borderRadius: 8,
                padding: 16,
                borderTop: '3px solid #8b5cf6',
              }}>
                <div style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  条件 2: 数量限制
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  元素数量 &le; 512<br />
                  <span style={{ color: '#64748b' }}>默认阈值，可配置 set-max-intset-entries</span>
                </div>
              </div>
            </div>

            {/* Decision summary */}
            <div style={{
              backgroundColor: '#1e3a5f',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>决策流程:</span>
              <span style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600 }}>整数?</span>
              <span style={{ color: '#64748b' }}>+</span>
              <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 600 }}>n ≤ 512?</span>
              <span style={{ color: '#64748b' }}>=</span>
              <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>使用 IntSet</span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#ef4444', fontSize: 12 }}>否则用 HashTable</span>
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
          <span style={{ color: '#94a3b8', fontSize: 12 }}>整数类型</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#8b5cf6',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>数量限制</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: '#f97316',
          }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>转换结果</span>
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

export default IntSetSelectionVideo;
