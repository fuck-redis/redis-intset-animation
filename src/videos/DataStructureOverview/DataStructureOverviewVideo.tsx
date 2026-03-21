import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

export const DataStructureOverviewVideo: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // Animation phases
  const phase1Duration = 60;  // Title intro
  const phase2Duration = 90;  // Redis data structures overview
  const phase3Duration = 90;  // IntSet highlight
  const phase4Duration = 90;  // Comparison
  const totalDuration = phase1Duration + phase2Duration + phase3Duration + phase4Duration + 30;

  const phase1End = phase1Duration;
  const phase2End = phase1Duration + phase2Duration;
  const phase3End = phase1Duration + phase2Duration + phase3Duration;
  const phase4End = phase1Duration + phase2Duration + phase3Duration + phase4Duration;

  // Overall progress
  const overallProgress = interpolate(frame, [0, totalDuration], [0, 1]);

  // Phase-specific progress
  const phase2Progress = interpolate(frame, [phase1Duration, phase2End], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phase3Progress = interpolate(frame, [phase2End, phase3End], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phase4Progress = interpolate(frame, [phase3End, phase4End], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Data structure items
  const redisStructures = [
    { name: 'String', icon: 'S', color: '#22c55e', desc: '字符串', y: 0 },
    { name: 'List', icon: 'L', color: '#3b82f6', desc: '列表', y: 1 },
    { name: 'Hash', icon: 'H', color: '#f97316', desc: '哈希表', y: 2 },
    { name: 'Set', icon: 'S', color: '#8b5cf6', desc: '集合', y: 3 },
    { name: 'Sorted Set', icon: 'Z', color: '#ec4899', desc: '有序集合', y: 4 },
  ];

  // IntSet details
  const intsetFeatures = [
    { label: '内存高效', desc: '紧凑二进制存储', icon: '⚡' },
    { label: '有序数组', desc: '二分查找 O(log n)', icon: '🔍' },
    { label: '动态编码', desc: 'INT16/32/64 自动切换', icon: '🔄' },
    { label: '整数专用', desc: '只存储整数值', icon: '🔢' },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Phase 1: Title */}
      {frame < phase1Duration && (
        <Sequence from={0} durationInFrames={phase1Duration}>
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
                backgroundColor: '#1e293b',
                padding: '40px 80px',
                borderRadius: 20,
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  color: '#f8fafc',
                  fontSize: 48,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Redis 数据结构全景
              </h1>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 24,
                  marginTop: 12,
                }}
              >
                Redis Data Structures Overview
              </p>
            </div>

            <div
              style={{
                marginTop: 40,
                color: '#64748b',
                fontSize: 18,
              }}
            >
              探索 Redis 内部数据结构
            </div>
          </div>
        </Sequence>
      )}

      {/* Phase 2: Redis Data Structures Overview */}
      {frame >= phase1End && frame < phase2End && (
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
            paddingTop: 60,
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
            Redis 五种主要数据结构
          </h2>

          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 40,
            }}
          >
            {redisStructures.map((struct, idx) => {
              const itemProgress = interpolate(phase2Progress, [idx * 0.15, idx * 0.15 + 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const scale = interpolate(itemProgress, [0, 0.5], [0.8, 1]);
              const opacity = interpolate(itemProgress, [0, 0.3], [0, 1]);

              return (
                <div
                  key={struct.name}
                  style={{
                    width: 180,
                    height: 220,
                    backgroundColor: '#1e293b',
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${scale})`,
                    opacity,
                    border: '2px solid #334155',
                  }}
                >
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      backgroundColor: struct.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {struct.icon}
                  </div>
                  <h3
                    style={{
                      color: '#f8fafc',
                      fontSize: 20,
                      fontWeight: 600,
                      marginTop: 16,
                    }}
                  >
                    {struct.name}
                  </h3>
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {struct.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 50,
              color: '#64748b',
              fontSize: 18,
            }}
          >
            每种数据结构都有多种底层实现
          </div>
        </div>
      )}

      {/* Phase 3: IntSet Highlight */}
      {frame >= phase2End && frame < phase3End && (
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
            paddingTop: 40,
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
            Set 的底层实现
          </h2>

          <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
            {/* HashTable branch */}
            <div
              style={{
                opacity: interpolate(phase3Progress, [0, 0.3], [0, 1]),
                transform: `translateX(${interpolate(phase3Progress, [0, 0.3], [-50, 0])})`,
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 100,
                  backgroundColor: '#7f1d1d',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ef4444',
                }}
              >
                <span style={{ color: '#ef4444', fontSize: 24, fontWeight: 700 }}>
                  HashTable
                </span>
                <span style={{ color: '#fca5a5', fontSize: 14, marginTop: 4 }}>
                  O(1) 查找
                </span>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, color: '#64748b' }}>
                通用实现
              </div>
            </div>

            {/* IntSet branch */}
            <div
              style={{
                opacity: interpolate(phase3Progress, [0.2, 0.5], [0, 1]),
                transform: `scale(${interpolate(phase3Progress, [0.2, 0.5], [0.9, 1])})`,
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 100,
                  backgroundColor: '#166534',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #22c55e',
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
                }}
              >
                <span style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>
                  IntSet
                </span>
                <span style={{ color: '#86efac', fontSize: 14, marginTop: 4 }}>
                  O(log n) 查找
                </span>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, color: '#22c55e', fontWeight: 600 }}>
                整数专用
              </div>
            </div>
          </div>

          {/* IntSet Features */}
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 20,
              opacity: interpolate(phase3Progress, [0.4, 0.7], [0, 1]),
            }}
          >
            {intsetFeatures.map((feature, idx) => (
              <div
                key={feature.label}
                style={{
                  backgroundColor: '#1e293b',
                  padding: '16px 24px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transform: `translateY(${interpolate(phase3Progress, [0.4 + idx * 0.1, 0.6 + idx * 0.1], [20, 0])})`,
                }}
              >
                <span style={{ fontSize: 24 }}>{feature.icon}</span>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>
                    {feature.label}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 4: When to use IntSet */}
      {frame >= phase3End && frame < phase4End && (
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
            paddingTop: 40,
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
            IntSet 适用条件
          </h2>

          <div
            style={{
              marginTop: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              width: 600,
            }}
          >
            {/* Condition 1 */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px 32px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: interpolate(phase4Progress, [0, 0.25], [0, 1]),
                transform: `translateX(${interpolate(phase4Progress, [0, 0.25], [-30, 0])})`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                1
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600 }}>
                  所有元素都是整数
                </div>
                <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  IntSet 只能存储整数值，字符串会自动转为 HashTable
                </div>
              </div>
            </div>

            {/* Condition 2 */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px 32px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: interpolate(phase4Progress, [0.25, 0.5], [0, 1]),
                transform: `translateX(${interpolate(phase4Progress, [0.25, 0.5], [-30, 0])})`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                2
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600 }}>
                  元素数量 ≤ 512
                </div>
                <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  超过 set-max-intset-entries 配置会转为 HashTable
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div
              style={{
                backgroundColor: '#166534',
                padding: '20px 32px',
                borderRadius: 12,
                border: '2px solid #22c55e',
                opacity: interpolate(phase4Progress, [0.5, 0.75], [0, 1]),
                marginTop: 16,
              }}
            >
              <div style={{ color: '#22c55e', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                选择 IntSet 的优势
              </div>
              <div style={{ color: '#86efac', fontSize: 16 }}>
                ⚡ 内存占用减少高达 91% | 🔍 查找效率 O(log n) | 📦 紧凑存储
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Summary */}
      {frame >= phase4End && (
        <Sequence from={phase4End}>
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
            }}
          >
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '40px 80px',
                borderRadius: 20,
                textAlign: 'center',
                border: '2px solid #22c55e',
              }}
            >
              <h2
                style={{
                  color: '#22c55e',
                  fontSize: 36,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                IntSet: 内存与性能的完美平衡
              </h2>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 20,
                  marginTop: 16,
                  maxWidth: 500,
                }}
              >
                专为小规模整数集合设计的紧凑数据结构
              </p>
            </div>
          </div>
        </Sequence>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: '#1e293b',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${overallProgress * 100}%`,
            backgroundColor: '#22c55e',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

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

export default DataStructureOverviewVideo;