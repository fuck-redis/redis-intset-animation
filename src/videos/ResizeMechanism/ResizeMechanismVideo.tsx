import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const ResizeMechanismSchema = z.object({});

type Props = z.infer<typeof ResizeMechanismSchema>;

export const ResizeMechanismVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases (total ~16 seconds = 480 frames @ 30fps)
  const introDuration = 45;
  const fullStateDuration = 60;
  const decisionDuration = 60;
  const allocateDuration = 75;
  const migrationDuration = 180; // The O(n) copy process
  const releaseDuration = 45;
  const completeDuration = 60;

  let phaseEnd = introDuration;
  phaseEnd += fullStateDuration;
  const fullStateEnd = phaseEnd;
  phaseEnd += decisionDuration;
  const decisionEnd = phaseEnd;
  phaseEnd += allocateDuration;
  const allocateEnd = phaseEnd;
  phaseEnd += migrationDuration;
  const migrationEnd = phaseEnd;
  phaseEnd += releaseDuration;
  const releaseEnd = phaseEnd;
  phaseEnd += completeDuration;
  const completeEnd = phaseEnd;
  const totalDuration = phaseEnd;

  // Data for demonstration
  const initialData = [10, 25, 38, 42, 55, 68, 72, 85, 93, 100];
  const oldCapacity = 8; // Full capacity
  const newCapacity = 16; // Doubled

  // Calculate progress values
  const decisionProgress = interpolate(frame, [fullStateEnd, decisionEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const allocateProgress = interpolate(frame, [decisionEnd, allocateEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const migrationProgress = interpolate(frame, [allocateEnd, migrationEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const releaseProgress = interpolate(frame, [migrationEnd, releaseEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const completeProgress = interpolate(frame, [releaseEnd, completeEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Migration animation - elements being copied one by one
  const migratingIndex = Math.floor(migrationProgress * initialData.length);
  const currentMigrationIndex = Math.min(migratingIndex, initialData.length);

  // Loop support
  const loopedFrame = frame % totalDuration;

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
          IntSet 内存扩容机制 (Resize Mechanism)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          当 capacity 不足时，如何分配新内存并迁移数据
        </p>
      </div>

      {/* Phase 1: Intro - Encoding thresholds */}
      {loopedFrame < fullStateEnd && (
        <div style={{
          position: 'absolute',
          top: 130,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
        }}>
          {[
            { encoding: 'INT16', bytes: 2, color: '#3b82f6', capacity: '4字节头 + 8元素×2字节 = 20字节' },
            { encoding: 'INT32', bytes: 4, color: '#8b5cf6', capacity: '4字节头 + 8元素×4字节 = 36字节' },
            { encoding: 'INT64', bytes: 8, color: '#ec4899', capacity: '4字节头 + 8元素×8字节 = 68字节' },
          ].map((item) => (
            <div
              key={item.encoding}
              style={{
                backgroundColor: '#1e293b',
                border: `2px solid ${item.color}`,
                borderRadius: 12,
                padding: '16px 24px',
                minWidth: 200,
              }}
            >
              <div style={{ color: item.color, fontSize: 20, fontWeight: 700 }}>{item.encoding}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{item.bytes} 字节/元素</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>{item.capacity}</div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 2: Full state visualization */}
      <div style={{
        position: 'absolute',
        top: 280,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Memory header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            borderRadius: 8,
            padding: '8px 16px',
          }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>encoding</span>
            <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, marginLeft: 12 }}>INT16</span>
          </div>
          <div style={{
            backgroundColor: '#1e293b',
            border: '2px solid #334155',
            borderRadius: 8,
            padding: '8px 16px',
          }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>length</span>
            <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600, marginLeft: 12 }}>{initialData.length}</span>
          </div>
          <div style={{
            backgroundColor: '#7c2d12',
            border: '2px solid #c2410c',
            borderRadius: 8,
            padding: '8px 16px',
          }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>capacity</span>
            <span style={{ color: '#fb923c', fontSize: 14, fontWeight: 600, marginLeft: 12 }}>{oldCapacity}</span>
          </div>
        </div>

        {/* Old memory block */}
        <div
          style={{
            position: 'relative',
            width: 700,
            height: 120,
            opacity: releaseProgress > 0 ? 1 - releaseProgress : 1,
            transition: 'opacity 0.3s',
          }}
        >
          {/* Memory block */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#1e293b',
            borderRadius: 12,
            border: '3px solid #475569',
            overflow: 'hidden',
          }}>
            {/* Header section */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 60,
              height: '100%',
              backgroundColor: '#0f172a',
              borderRight: '2px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ color: '#64748b', fontSize: 8 }}>encoding</span>
              <span style={{ color: '#64748b', fontSize: 8 }}>length</span>
              <span style={{ color: '#64748b', fontSize: 8 }}>contents</span>
            </div>

            {/* Data elements */}
            <div style={{
              position: 'absolute',
              left: 70,
              top: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingLeft: 20,
            }}>
              {initialData.map((val, i) => {
                const isMigrated = i < currentMigrationIndex && frame >= allocateEnd;
                const isHighlighted = i === currentMigrationIndex - 1 && frame >= allocateEnd && frame < releaseEnd;

                return (
                  <div
                    key={i}
                    style={{
                      width: 55,
                      height: 70,
                      backgroundColor: isMigrated ? '#166534' : '#0f172a',
                      borderRadius: 8,
                      border: `2px solid ${isHighlighted ? '#22c55e' : isMigrated ? '#22c55e' : '#334155'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isHighlighted ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
                      transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, fontFamily: 'monospace' }}>
                      {val}
                    </span>
                    <span style={{ color: '#64748b', fontSize: 10 }}>[{i}]</span>
                  </div>
                );
              })}

              {/* Empty slots indicator */}
              {frame < allocateEnd && (
                <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 55,
                        height: 70,
                        backgroundColor: '#1e293b',
                        borderRadius: 8,
                        border: '2px dashed #475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#475569', fontSize: 20 }}>?</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* "FULL" badge */}
          {frame >= fullStateEnd - 30 && frame < decisionEnd && (
            <div style={{
              position: 'absolute',
              top: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#7c2d12',
              padding: '4px 16px',
              borderRadius: 6,
              border: '1px solid #c2410c',
            }}>
              <span style={{ color: '#fb923c', fontSize: 14, fontWeight: 600 }}>容量已满!</span>
            </div>
          )}

          {/* Old memory label */}
          {frame < releaseEnd && (
            <div style={{
              position: 'absolute',
              bottom: -25,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#64748b',
              fontSize: 12,
            }}>
              旧内存 (capacity={oldCapacity})
            </div>
          )}
        </div>

        {/* Arrow and allocation */}
        {frame >= decisionEnd && frame < completeEnd && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 20,
          }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: `30px solid ${allocateProgress > 0 ? '#f97316' : '#3b82f6'}`,
              transition: 'border-color 0.3s',
            }} />

            {/* Allocation message */}
            {frame >= decisionEnd && frame < allocateEnd && (
              <div style={{
                marginTop: 15,
                backgroundColor: '#1e293b',
                padding: '12px 24px',
                borderRadius: 8,
                opacity: decisionProgress,
              }}>
                <span style={{ color: '#f97316', fontSize: 16 }}>📊 分配新内存: capacity = {newCapacity} (2x扩容)</span>
              </div>
            )}
          </div>
        )}

        {/* New memory block */}
        {frame >= allocateEnd && frame < completeEnd && (
          <div
            style={{
              marginTop: 10,
              width: 700,
              height: 120,
              opacity: completeProgress < 1 ? 1 : completeProgress,
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#1e293b',
              borderRadius: 12,
              border: '3px solid #22c55e',
              boxShadow: `0 0 ${30 * allocateProgress}px rgba(34, 197, 94, 0.4)`,
              overflow: 'hidden',
            }}>
              {/* Header section */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 60,
                height: '100%',
                backgroundColor: '#0f172a',
                borderRight: '2px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ color: '#64748b', fontSize: 8 }}>encoding</span>
                <span style={{ color: '#64748b', fontSize: 8 }}>length</span>
                <span style={{ color: '#64748b', fontSize: 8 }}>contents</span>
              </div>

              {/* Data elements - new block with migrated elements */}
              <div style={{
                position: 'absolute',
                left: 70,
                top: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 20,
              }}>
                {initialData.map((val, i) => {
                  const isMigrated = i < currentMigrationIndex;
                  const isBeingMigrated = i === currentMigrationIndex && frame < migrationEnd;

                  return (
                    <div
                      key={i}
                      style={{
                        width: 55,
                        height: 70,
                        backgroundColor: isMigrated ? '#166534' : isBeingMigrated ? '#1e3a5f' : '#0f172a',
                        borderRadius: 8,
                        border: `2px solid ${isMigrated ? '#22c55e' : isBeingMigrated ? '#3b82f6' : '#334155'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isBeingMigrated ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
                        transform: isBeingMigrated ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, fontFamily: 'monospace' }}>
                        {isMigrated || isBeingMigrated ? val : ''}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 10 }}>[{i}]</span>
                    </div>
                  );
                })}

                {/* Empty slots in new block */}
                {[...Array(newCapacity - initialData.length)].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    style={{
                      width: 55,
                      height: 70,
                      backgroundColor: '#1e293b',
                      borderRadius: 8,
                      border: '2px dashed #475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.5,
                    }}
                  >
                    <span style={{ color: '#475569', fontSize: 16 }}>?</span>
                  </div>
                ))}
              </div>
            </div>

            {/* New memory label */}
            <div style={{
              position: 'absolute',
              bottom: -25,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#22c55e',
              fontSize: 12,
            }}>
              新内存 (capacity={newCapacity})
            </div>
          </div>
        )}
      </div>

      {/* Migration progress bar */}
      {frame >= allocateEnd && frame < migrationEnd && (
        <div style={{
          position: 'absolute',
          bottom: 200,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '16px 32px',
            borderRadius: 12,
            border: '1px solid #334155',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ color: '#f97316', fontSize: 18 }}>📦</span>
              <span style={{ color: '#f8fafc', fontSize: 16 }}>数据迁移中...</span>
              <span style={{ color: '#f97316', fontSize: 14, fontWeight: 600 }}>
                {currentMigrationIndex}/{initialData.length} 元素
              </span>
            </div>

            {/* Progress bar */}
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
          </div>
        </div>
      )}

      {/* O(n) cost indicator */}
      {frame >= allocateEnd && frame < migrationEnd && (
        <div style={{
          position: 'absolute',
          bottom: 150,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#7c2d12',
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid #c2410c',
          }}>
            <span style={{ color: '#fb923c', fontSize: 14 }}>
              ⚠️ 扩容时间复杂度: <strong>O(n)</strong> - 需要复制所有元素到新内存
            </span>
          </div>
        </div>
      )}

      {/* Release old memory message */}
      {frame >= migrationEnd && frame < releaseEnd && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '12px 24px',
            borderRadius: 8,
            opacity: releaseProgress,
          }}>
            <span style={{ color: '#f8fafc', fontSize: 16 }}>🗑️ 释放旧内存</span>
          </div>
        </div>
      )}

      {/* Complete message */}
      {frame >= releaseEnd && (
        <div style={{
          position: 'absolute',
          bottom: 180,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#166534',
            padding: '16px 32px',
            borderRadius: 12,
            border: '1px solid #22c55e',
            opacity: completeProgress,
            transform: `scale(${0.8 + completeProgress * 0.2})`,
          }}>
            <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 600 }}>✓ 扩容完成!</span>
            <span style={{ color: '#bbf7d0', fontSize: 14, marginLeft: 16 }}>
              新 capacity: {newCapacity} | 可容纳更多元素
            </span>
          </div>
        </div>
      )}

      {/* Step indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {[
          { label: '初始状态', active: loopedFrame < fullStateEnd },
          { label: '检测满容', active: loopedFrame >= fullStateEnd && loopedFrame < decisionEnd },
          { label: '分配新内存', active: loopedFrame >= decisionEnd && loopedFrame < allocateEnd },
          { label: '迁移数据', active: loopedFrame >= allocateEnd && loopedFrame < migrationEnd },
          { label: '释放旧内存', active: loopedFrame >= migrationEnd && loopedFrame < releaseEnd },
          { label: '完成', active: loopedFrame >= releaseEnd },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: step.active ? '#3b82f6' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.active ? '#fff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                color: step.active ? '#f8fafc' : '#64748b',
                fontSize: 13,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Encoding upgrade thresholds info */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 40,
          backgroundColor: '#1e293b',
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #334155',
        }}
      >
        <span style={{ color: '#64748b', fontSize: 12 }}>
          扩容阈值: INT16→INT32当length≥512，或添加超范围值
        </span>
      </div>

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
        {totalDuration} 帧 @ 30fps | Loop
      </div>
    </AbsoluteFill>
  );
};

export default ResizeMechanismVideo;