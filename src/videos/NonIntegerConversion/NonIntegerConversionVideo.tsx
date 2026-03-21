import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const NonIntegerConversionSchema = z.object({});

type Props = z.infer<typeof NonIntegerConversionSchema>;

export const NonIntegerConversionVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Fixed data for this animation
  const intSetValues = [1, 2, 3];
  const stringValue = 'hello';

  // Animation phases (12-15 seconds = 360-450 frames at 30fps)
  const introDuration = 45;
  const showIntSetDuration = 75;
  const triggerPhaseDuration = 60;
  const conversionDuration = 90;
  const resultDuration = 75;
  const warningDuration = 45;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const showIntSetEnd = phaseEnd + showIntSetDuration;
  phaseEnd = showIntSetEnd;
  const triggerEnd = phaseEnd + triggerPhaseDuration;
  phaseEnd = triggerEnd;
  const conversionEnd = phaseEnd + conversionDuration;
  phaseEnd = conversionEnd;
  const resultEnd = phaseEnd + resultDuration;
  phaseEnd = resultEnd;
  const warningEnd = phaseEnd + warningDuration;
  const totalDuration = warningEnd + outroDuration;

  // Animation progress
  const conversionProgress = interpolate(
    frame,
    [triggerEnd, conversionEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const showIntSet = frame < triggerEnd;
  const isConverting = frame >= triggerEnd && frame < conversionEnd;
  const showResult = frame >= conversionEnd;

  // Determine which element is being highlighted during conversion
  const migratingIndex = Math.floor(conversionProgress * (intSetValues.length + 1));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 38, fontWeight: 700, margin: 0 }}>
          非整数元素触发转换
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          IntSet 只能存储整数，添加字符串会立即转换为 HashTable
        </p>
      </div>

      {/* Redis Command Terminal */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 40,
        right: 40,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: '16px 20px',
        fontFamily: 'monospace',
      }}>
        <div style={{ color: '#4a4a4a', fontSize: 14, marginBottom: 8 }}>
          # Redis Terminal
        </div>
        <div style={{ color: '#6b7280', fontSize: 16, marginBottom: 4 }}>
          127.0.0.1:6379&gt; SADD myset 1 2 3
        </div>
        <div style={{ color: '#22c55e', fontSize: 16, marginBottom: 12 }}>
          (integer) 3
        </div>

        {/* Before state */}
        {frame < triggerEnd && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ color: '#6b7280', fontSize: 16 }}>
              127.0.0.1:6379&gt; <span style={{ color: '#fbbf24' }}>SADD myset "{stringValue}"</span>
            </div>
            {frame >= showIntSetEnd && (
              <div style={{
                backgroundColor: '#7c2d12',
                color: '#fb923c',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 13,
                animation: 'pulse 0.5s infinite',
              }}>
                执行中...
              </div>
            )}
          </div>
        )}

        {/* After state */}
        {frame >= triggerEnd && (
          <>
            <div style={{ color: '#22c55e', fontSize: 16, marginBottom: 4 }}>
              (integer) 1
            </div>
            <div style={{ color: '#6b7280', fontSize: 16, marginBottom: 4 }}>
              127.0.0.1:6379&gt; OBJECT ENCODING myset
            </div>
            <div style={{
              color: frame >= conversionEnd ? '#a855f7' : '#6b7280',
              fontSize: 18,
              fontWeight: 600,
              transition: 'color 0.3s',
            }}>
              "{frame >= conversionEnd ? 'hashtable' : '...'}",
            </div>
          </>
        )}
      </div>

      {/* IntSet Visualization */}
      {showIntSet && (
        <div style={{
          position: 'absolute',
          top: 320,
          left: 40,
          width: 580,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #3b82f6',
            opacity: isConverting ? 0.4 : 1,
            transition: 'opacity 0.5s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ color: '#3b82f6', fontSize: 22, fontWeight: 600, margin: 0 }}>
                  IntSet
                </h2>
                <span style={{
                  backgroundColor: '#1e3a5f',
                  color: '#3b82f6',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  intset
                </span>
              </div>
              <span style={{ color: '#64748b', fontSize: 14 }}>
                {intSetValues.length} 元素 | {intSetValues.length * 4 + 8}B
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {intSetValues.map((val, i) => {
                const isMigrating = isConverting && i < migratingIndex;
                const isActive = isConverting && i === migratingIndex;

                return (
                  <div
                    key={i}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isActive ? '#3b82f6' : isMigrating ? '#1e3a5f' : '#0f172a',
                      borderRadius: 8,
                      border: `2px solid ${isActive ? '#60a5fa' : isMigrating ? '#3b82f6' : '#334155'}`,
                      transform: `scale(${isActive ? 1.1 : 1})`,
                      boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{
                      color: isActive || isMigrating ? '#f8fafc' : '#f8fafc',
                      fontSize: 16,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                类型: <span style={{ color: '#22c55e' }}>整数</span>
              </span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                编码: <span style={{ color: '#3b82f6' }}>int16/int32/int64</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Arrow or conversion indicator */}
      {isConverting && (
        <div style={{
          position: 'absolute',
          top: 500,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            fontSize: 32,
            animation: 'bounce 0.5s infinite',
          }}>
            ⬇️
          </div>
          <div style={{
            backgroundColor: '#f97316',
            padding: '8px 16px',
            borderRadius: 8,
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              转换为 HashTable...
            </span>
          </div>
        </div>
      )}

      {/* String value being added */}
      {frame >= showIntSetEnd && frame < conversionEnd && (
        <div style={{
          position: 'absolute',
          top: 340,
          right: 40,
          width: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: '#7c2d12',
            borderRadius: 12,
            padding: '16px 24px',
            border: '2px solid #f97316',
          }}>
            <div style={{ color: '#fb923c', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
              触发转换的值
            </div>
            <div style={{
              color: '#fbbf24',
              fontSize: 24,
              fontWeight: 700,
              fontFamily: 'monospace',
              textAlign: 'center',
            }}>
              "{stringValue}"
            </div>
            <div style={{ color: '#f87171', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              非整数类型!
            </div>
          </div>
        </div>
      )}

      {/* HashTable Result */}
      {showResult && (
        <div style={{
          position: 'absolute',
          top: 320,
          left: 40,
          right: 40,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: '4px solid #8b5cf6',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ color: '#8b5cf6', fontSize: 22, fontWeight: 600, margin: 0 }}>
                  HashTable
                </h2>
                <span style={{
                  backgroundColor: '#4c1d95',
                  color: '#a855f7',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  hashtable
                </span>
              </div>
              <span style={{ color: '#64748b', fontSize: 14 }}>
                {intSetValues.length + 1} 元素 | ~{(intSetValues.length + 1) * 40 + 120}B
              </span>
            </div>

            {/* Integer values */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {intSetValues.map((val, i) => {
                return (
                  <div
                    key={i}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#0f172a',
                      borderRadius: 8,
                      border: '2px solid #8b5cf6',
                    }}
                  >
                    <span style={{
                      color: '#f8fafc',
                      fontSize: 16,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* String value */}
            <div style={{
              display: 'flex',
              gap: 8,
              animation: 'fadeIn 0.5s',
            }}>
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4c1d95',
                  borderRadius: 8,
                  border: '2px solid #a855f7',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
                }}
              >
                <span style={{
                  color: '#fbbf24',
                  fontSize: 16,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}>
                  "{stringValue}"
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                类型: <span style={{ color: '#a855f7' }}>字符串/整数</span>
              </span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                编码: <span style={{ color: '#8b5cf6' }}>hashtable</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Result message */}
      {frame >= conversionEnd && frame < warningEnd && (
        <div style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#166534',
            padding: '16px 32px',
            borderRadius: 12,
            border: '1px solid #22c55e',
            gap: 12,
          }}>
            <span style={{ color: '#22c55e', fontSize: 20 }}>✓</span>
            <span style={{ color: '#f8fafc', fontSize: 16 }}>
              添加 "{stringValue}" 成功，编码已变为 hashtable
            </span>
          </div>
        </div>
      )}

      {/* Warning message - conversion is irreversible */}
      {frame >= warningEnd && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#7c2d12',
            padding: '14px 28px',
            borderRadius: 10,
            border: '1px solid #c2410c',
            gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ color: '#fb923c', fontSize: 15, fontWeight: 500 }}>
              转换是不可逆的! 删除 "{stringValue}" 后也不会转回 IntSet
            </span>
          </div>
        </div>
      )}

      {/* CSS Animation keyframes (injected via style) */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

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
        {totalDuration} 帧 @ 30fps (loop)
      </div>
    </AbsoluteFill>
  );
};

export default NonIntegerConversionVideo;
