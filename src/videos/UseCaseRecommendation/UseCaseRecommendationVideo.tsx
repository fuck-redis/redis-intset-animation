import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring } from 'remotion';
import { z } from 'zod';

export const UseCaseRecommendationSchema = z.object({});

type Props = z.infer<typeof UseCaseRecommendationSchema>;

export const UseCaseRecommendationVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases (16 seconds at 30fps = 480 frames)
  const introEnd = 45;
  const treeAppearEnd = 120;
  const intSetPathEnd = 300;
  const hashTablePathEnd = 420;
  const totalDuration = 480;

  // Decision tree nodes positions
  const centerX = 640;
  const startY = 80;
  const level1Y = 180;
  const level2Y = 300;
  const level3Y = 420;

  // Colors
  const intSetColor = '#3b82f6';
  const hashTableColor = '#8b5cf6';
  const greenColor = '#22c55e';
  const orangeColor = '#f97316';
  const bgColor = '#0f172a';
  const cardBg = '#1e293b';
  const textMuted = '#94a3b8';

  // Intro animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleScale = spring({ frame: Math.min(frame, 30), fps: 30, config: { damping: 200, stiffness: 100 } });

  // Tree appear animation
  const treeProgress = interpolate(frame, [introEnd, treeAppearEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // IntSet path highlight
  const intSetHighlight = interpolate(frame, [treeAppearEnd, intSetPathEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // HashTable path highlight
  const hashTableHighlight = interpolate(frame, [intSetPathEnd, hashTablePathEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Final recommendation appear
  const finalAppear = interpolate(frame, [hashTablePathEnd, totalDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 700, margin: 0 }}>
          IntSet vs HashTable 适用场景决策
        </h1>
        <p style={{ color: textMuted, fontSize: 15, marginTop: 6 }}>
          根据数据特征选择合适的数据结构
        </p>
      </div>

      {/* Decision Tree Root Node - "选择数据结构" */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: startY,
            left: centerX,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0, 0.5], [0, 1])})`,
            opacity: interpolate(treeProgress, [0, 0.3], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid #f97316',
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
            }}
          >
            <span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>
              选择数据结构
            </span>
          </div>
        </div>
      )}

      {/* Lines from root to level 1 */}
      {frame >= introEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: interpolate(treeProgress, [0.2, 0.5], [0, 1]),
          }}
        >
          {/* Root to "数据类型是整数?" */}
          <line
            x1={centerX}
            y1={startY + 40}
            x2={centerX}
            y2={level1Y - 30}
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Branch to YES (left) */}
          <line
            x1={centerX}
            y1={level1Y - 10}
            x2={300}
            y2={level2Y - 30}
            stroke={intSetColor}
            strokeWidth="2"
          />
          {/* Branch to NO (right) */}
          <line
            x1={centerX}
            y1={level1Y - 10}
            x2={980}
            y2={level2Y - 30}
            stroke={hashTableColor}
            strokeWidth="2"
          />
        </svg>
      )}

      {/* Level 1 Decision Node - "数据类型是整数?" */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level1Y,
            left: centerX,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.3, 0.6], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.3, 0.5], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 20px',
              borderRadius: 8,
              border: '2px solid #64748b',
            }}
          >
            <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 500 }}>
              数据类型是整数?
            </span>
          </div>
        </div>
      )}

      {/* YES Label */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level1Y - 20,
            left: centerX - 140,
            opacity: interpolate(treeProgress, [0.4, 0.7], [0, 1]),
          }}
        >
          <span style={{ color: greenColor, fontSize: 13, fontWeight: 600 }}>是</span>
        </div>
      )}

      {/* NO Label */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level1Y - 20,
            left: centerX + 120,
            opacity: interpolate(treeProgress, [0.4, 0.7], [0, 1]),
          }}
        >
          <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>否</span>
        </div>
      )}

      {/* Lines from level 1 to level 2 */}
      {frame >= introEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: interpolate(treeProgress, [0.5, 0.8], [0, 1]),
          }}
        >
          {/* Left branch: YES -> "数据规模?" */}
          <line
            x1={300}
            y1={level1Y + 25}
            x2={200}
            y2={level2Y - 30}
            stroke={intSetColor}
            strokeWidth="2"
          />
          {/* Left branch: YES -> "HashTable" (if non-integer at any point) */}
          <line
            x1={300}
            y1={level1Y + 25}
            x2={400}
            y2={level2Y - 30}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* Right branch: NO -> "HashTable" */}
          <line
            x1={980}
            y1={level1Y + 25}
            x2={880}
            y2={level2Y - 30}
            stroke={hashTableColor}
            strokeWidth="2"
          />
          <line
            x1={980}
            y1={level1Y + 25}
            x2={1080}
            y2={level2Y - 30}
            stroke={hashTableColor}
            strokeWidth="2"
          />
        </svg>
      )}

      {/* Level 2 Left - "数据规模?" */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level2Y,
            left: 200,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.5, 0.8], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.5, 0.7], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 20px',
              borderRadius: 8,
              border: '2px solid #64748b',
            }}
          >
            <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 500 }}>
              数据规模?
            </span>
          </div>
        </div>
      )}

      {/* Level 2 Right - HashTable Result */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level2Y,
            left: 880,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.5, 0.8], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.5, 0.7], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 20px',
              borderRadius: 8,
              border: `2px solid ${hashTableColor}`,
              boxShadow: frame >= intSetPathEnd ? `0 0 15px rgba(139, 92, 246, 0.4)` : 'none',
            }}
          >
            <span style={{ color: hashTableColor, fontSize: 14, fontWeight: 600 }}>
              HashTable
            </span>
          </div>
        </div>
      )}

      {/* Level 2 Right - HashTable Result 2 */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level2Y,
            left: 1080,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.5, 0.8], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.5, 0.7], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 20px',
              borderRadius: 8,
              border: `2px solid ${hashTableColor}`,
              boxShadow: frame >= intSetPathEnd ? `0 0 15px rgba(139, 92, 246, 0.4)` : 'none',
            }}
          >
            <span style={{ color: hashTableColor, fontSize: 14, fontWeight: 600 }}>
              HashTable
            </span>
          </div>
        </div>
      )}

      {/* Lines from level 2 left to level 3 */}
      {frame >= introEnd && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: interpolate(treeProgress, [0.6, 0.9], [0, 1]),
          }}
        >
          {/* Small data -> IntSet */}
          <line
            x1={200}
            y1={level2Y + 25}
            x2={120}
            y2={level3Y - 30}
            stroke={intSetColor}
            strokeWidth="2"
          />
          {/* Large data -> HashTable */}
          <line
            x1={200}
            y1={level2Y + 25}
            x2={280}
            y2={level3Y - 30}
            stroke={hashTableColor}
            strokeWidth="2"
          />
        </svg>
      )}

      {/* Small/Large labels */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level2Y + 5,
            left: 150,
            opacity: interpolate(treeProgress, [0.6, 0.9], [0, 1]),
          }}
        >
          <span style={{ color: '#22c55e', fontSize: 11 }}>小(≤512)</span>
        </div>
      )}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level2Y + 5,
            left: 235,
            opacity: interpolate(treeProgress, [0.6, 0.9], [0, 1]),
          }}
        >
          <span style={{ color: orangeColor, fontSize: 11 }}>大(&gt;512)</span>
        </div>
      )}

      {/* Level 3 - Final Results */}
      {/* IntSet Result - Small Integer Data */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level3Y,
            left: 120,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.7, 1], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.7, 0.9], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: '#1e3a5f',
              padding: '10px 16px',
              borderRadius: 8,
              border: `2px solid ${intSetColor}`,
              boxShadow: frame >= intSetPathEnd ? `0 0 20px rgba(59, 130, 246, 0.5)` : 'none',
            }}
          >
            <span style={{ color: intSetColor, fontSize: 14, fontWeight: 700 }}>
              IntSet
            </span>
          </div>
        </div>
      )}

      {/* HashTable Result - Large Integer Data */}
      {frame >= introEnd && (
        <div
          style={{
            position: 'absolute',
            top: level3Y,
            left: 280,
            transform: `translateX(-50%) scale(${interpolate(treeProgress, [0.7, 1], [0, 1])})`,
            opacity: interpolate(treeProgress, [0.7, 0.9], [0, 1]),
          }}
        >
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 16px',
              borderRadius: 8,
              border: `2px solid ${hashTableColor}`,
              boxShadow: frame >= intSetPathEnd ? `0 0 15px rgba(139, 92, 246, 0.4)` : 'none',
            }}
          >
            <span style={{ color: hashTableColor, fontSize: 14, fontWeight: 600 }}>
              HashTable
            </span>
          </div>
        </div>
      )}

      {/* IntSet Suitable Scenarios Panel - Left Side */}
      {frame >= treeAppearEnd && (
        <div
          style={{
            position: 'absolute',
            top: 120,
            left: 40,
            width: 260,
            backgroundColor: cardBg,
            borderRadius: 12,
            padding: 16,
            border: `2px solid ${intSetColor}`,
            opacity: interpolate(intSetHighlight, [0, 0.5], [0, 1]),
            transform: `translateX(${-20 - interpolate(intSetHighlight, [0, 0.5], [30, 0])}px)`,
            boxShadow: frame >= intSetPathEnd ? `0 0 25px rgba(59, 130, 246, 0.4)` : 'none',
          }}
        >
          <h3 style={{ color: intSetColor, fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
            IntSet 适用场景
          </h3>
          <ul style={{ color: '#f8fafc', fontSize: 13, margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>整数集合</li>
            <li>小数据集 (≤512)</li>
            <li>内存敏感场景</li>
            <li>读多写少</li>
            <li>需要范围查询</li>
          </ul>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155' }}>
            <span style={{ color: '#22c55e', fontSize: 12 }}>
              优势: 省内存 | O(log n)查找
            </span>
          </div>
        </div>
      )}

      {/* HashTable Suitable Scenarios Panel - Right Side */}
      {frame >= intSetPathEnd && (
        <div
          style={{
            position: 'absolute',
            top: 120,
            right: 40,
            width: 260,
            backgroundColor: cardBg,
            borderRadius: 12,
            padding: 16,
            border: `2px solid ${hashTableColor}`,
            opacity: interpolate(hashTableHighlight, [0, 0.5], [0, 1]),
            transform: `translateX(${20 + interpolate(hashTableHighlight, [0, 0.5], [-30, 0])}px)`,
            boxShadow: `0 0 25px rgba(139, 92, 246, 0.4)`,
          }}
        >
          <h3 style={{ color: hashTableColor, fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
            HashTable 适用场景
          </h3>
          <ul style={{ color: '#f8fafc', fontSize: 13, margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>非整数元素</li>
            <li>大数据集 (&gt;512)</li>
            <li>写操作频繁</li>
            <li>追求极致查询速度</li>
            <li>无序即可</li>
          </ul>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155' }}>
            <span style={{ color: '#22c55e', fontSize: 12 }}>
              优势: O(1)查找 | 通用类型
            </span>
          </div>
        </div>
      )}

      {/* Final Decision Summary */}
      {frame >= hashTablePathEnd && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: finalAppear,
            transform: `translateY(${interpolate(finalAppear, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e3a5f',
              padding: '16px 32px',
              borderRadius: 12,
              border: '1px solid #3b82f6',
              gap: 40,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: intSetColor, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                IntSet
              </div>
              <div style={{ color: textMuted, fontSize: 12 }}>
                整数 + 小数据 → 内存优先
              </div>
            </div>
            <div style={{ width: 1, backgroundColor: '#334155' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: hashTableColor, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                HashTable
              </div>
              <div style={{ color: textMuted, fontSize: 12 }}>
                非整数 + 大数据 → 性能优先
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duration indicator */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
          color: '#64748b',
          fontSize: 12,
        }}
      >
        {totalDuration} 帧 | Loop
      </div>
    </AbsoluteFill>
  );
};

export default UseCaseRecommendationVideo;