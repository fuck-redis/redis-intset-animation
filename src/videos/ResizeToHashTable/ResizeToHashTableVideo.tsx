import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const ResizeToHashTableSchema = z.object({
  triggerType: z.enum(['overflow', 'non_integer']),
  initialData: z.array(z.number()),
  maxEntries: z.number().default(512),
});

type Props = z.infer<typeof ResizeToHashTableSchema>;

export const ResizeToHashTableVideo: React.FC<Props> = ({
  triggerType,
  initialData,
  maxEntries,
}) => {
  const frame = useCurrentFrame();

  const sortedData = [...new Set(initialData)].sort((a, b) => a - b);

  // Animation phases
  const introDuration = 30;
  const showIntSetDuration = 60;
  const triggerDuration = 60;
  const convertStartDuration = 90;
  const migrationDuration = 120;
  const completeDuration = 45;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const showIntSetEnd = phaseEnd + showIntSetDuration;
  phaseEnd = showIntSetEnd;
  const triggerEnd = phaseEnd + triggerDuration;
  phaseEnd = triggerEnd;
  const convertStartEnd = phaseEnd + convertStartDuration;
  phaseEnd = convertStartEnd;
  const migrationEnd = phaseEnd + migrationDuration;
  phaseEnd = migrationEnd;
  const completeEnd = phaseEnd + completeDuration;
  const totalDuration = completeEnd + outroDuration;

  const triggerProgress = interpolate(
    frame,
    [showIntSetEnd, triggerEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const convertProgress = interpolate(
    frame,
    [triggerEnd, convertStartEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const migrationProgress = interpolate(
    frame,
    [convertStartEnd, migrationEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const isConverting = frame >= triggerEnd && frame < migrationEnd;

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
          IntSet 转换为 HashTable
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          触发条件: {triggerType === 'overflow'
            ? `元素数量超过 ${maxEntries}`
            : '添加非整数元素'}
        </p>
      </div>

      {/* IntSet state */}
      <div style={{ position: 'absolute', top: 140, left: 40, right: 40 }}>
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 24px',
            borderLeft: `4px solid ${isConverting ? '#64748b' : '#3b82f6'}`,
            opacity: isConverting ? 0.4 : 1,
            transition: 'opacity 0.5s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{
                color: isConverting ? '#64748b' : '#3b82f6',
                fontSize: 22,
                fontWeight: 600,
                margin: 0
              }}>
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
              {sortedData.length} 元素 | {sortedData.length * 4 + 8}B 内存
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sortedData.slice(0, 20).map((val, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0f172a',
                  borderRadius: 6,
                  border: '1px solid #334155',
                }}
              >
                <span style={{ color: '#f8fafc', fontSize: 14, fontFamily: 'monospace' }}>
                  {val}
                </span>
              </div>
            ))}
            {sortedData.length > 20 && (
              <div style={{
                padding: '8px 14px',
                color: '#64748b',
                fontSize: 14,
              }}>
                ... +{sortedData.length - 20} 更多
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arrow down */}
      {frame >= showIntSetEnd && (
        <div style={{
          position: 'absolute',
          top: 340,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: `30px solid ${triggerProgress > 0.5 ? '#f97316' : '#3b82f6'}`,
            transition: 'border-color 0.3s',
          }} />
        </div>
      )}

      {/* Trigger message */}
      {frame >= showIntSetEnd && frame < triggerEnd && (
        <div style={{
          position: 'absolute',
          top: 380,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#7c2d12',
            padding: '16px 32px',
            borderRadius: 12,
            border: '1px solid #c2410c',
          }}>
            <span style={{ color: '#fb923c', fontSize: 18, fontWeight: 600 }}>
              {triggerType === 'overflow'
                ? `⚠️ 元素数量 (${sortedData.length}) > 阈值 (${maxEntries})`
                : '⚠️ 添加了非整数元素 "hello"'}
            </span>
          </div>
        </div>
      )}

      {/* Conversion process */}
      {frame >= triggerEnd && (
        <div style={{
          position: 'absolute',
          top: 450,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* Converting label */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#1e293b',
              padding: '12px 24px',
              borderRadius: 8,
              opacity: convertProgress,
            }}>
              <span style={{ color: '#f97316', fontSize: 18 }}>🔄</span>
              <span style={{ color: '#f8fafc', fontSize: 16 }}>
                分配新的 HashTable 内存...
              </span>
            </div>

            {/* Migration progress */}
            {frame >= convertStartEnd && (
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 8,
                backgroundColor: '#1e293b',
                padding: '16px 32px',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>迁移进度</span>
                  <span style={{ color: '#f97316', fontSize: 14, fontWeight: 600 }}>
                    {Math.floor(migrationProgress * 100)}%
                  </span>
                </div>
                <div style={{
                  width: 300,
                  height: 8,
                  backgroundColor: '#0f172a',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${migrationProgress * 100}%`,
                    height: '100%',
                    backgroundColor: '#f97316',
                    transition: 'width 0.1s',
                  }} />
                </div>
                <span style={{ color: '#64748b', fontSize: 12 }}>
                  迁移 {Math.floor(migrationProgress * sortedData.length)}/{sortedData.length} 元素
                </span>
              </div>
            )}

            {/* New HashTable */}
            {frame >= convertStartEnd && (
              <div style={{
                marginTop: 8,
                backgroundColor: '#1e293b',
                borderRadius: 8,
                padding: '12px 20px',
                borderLeft: '4px solid #8b5cf6',
              }}>
                <span style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600 }}>
                  HashTable
                </span>
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 12 }}>
                  ~{sortedData.length * 40 + 120}B 内存
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete message */}
      {frame >= migrationEnd && (
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
              转换完成，编码已变为 hashtable
            </span>
          </div>
        </div>
      )}

      {/* Warning */}
      {frame >= migrationEnd && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#7c2d12',
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid #c2410c',
          }}>
            <span style={{ color: '#fb923c', fontSize: 13 }}>
              ⚠️ 转换是不可逆的，转为 HashTable 后不会再转回 IntSet
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

export default ResizeToHashTableVideo;
