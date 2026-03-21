import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring } from 'remotion';
import { z } from 'zod';

export const EncodingScenarioSchema = z.object({});

type Props = z.infer<typeof EncodingScenarioSchema>;

// Scenario data
const SCENARIOS = [
  {
    id: 'user-id',
    name: '用户ID',
    description: '1-10000',
    value: 9527,
    encoding: 'INT16',
    bytes: 2,
    color: '#3b82f6',
    bgColor: '#1e3a5f',
    range: '-32,768 ~ 32,767',
    reason: '小范围正整数，2字节足够',
  },
  {
    id: 'timestamp',
    name: '时间戳',
    description: '-2147483648 ~ 2147483647',
    value: 1700000000,
    encoding: 'INT32',
    bytes: 4,
    color: '#8b5cf6',
    bgColor: '#2d1f5e',
    range: '-2.1B ~ 2.1B',
    reason: '秒级时间戳需要更大范围',
  },
  {
    id: 'large-id',
    name: '超大数值',
    description: '> 2^31',
    value: 99999999999,
    encoding: 'INT64',
    bytes: 8,
    color: '#ec4899',
    bgColor: '#4a1942',
    range: '±9.2 × 10^18',
    reason: '超出INT32范围，需要8字节',
  },
] as const;

export const EncodingScenarioVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation timing (14 seconds at 30fps = 420 frames)
  const introEnd = 30;
  const scenario1End = 120;
  const scenario2End = 210;
  const scenario3End = 300;
  const decisionEnd = 390;
  const totalDuration = 420;

  // Phase calculations
  const getCurrentPhase = () => {
    if (frame < introEnd) return -1;
    if (frame < scenario1End) return 0;
    if (frame < scenario2End) return 1;
    if (frame < scenario3End) return 2;
    if (frame < decisionEnd) return 3;
    return 4;
  };

  const currentPhase = getCurrentPhase();

  // Intro animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleScale = spring({ frame: Math.min(frame, 25), fps: 30, config: { damping: 200, stiffness: 100 } });

  // Scenario card animations
  const getScenarioProgress = (index: number) => {
    const starts = [introEnd, scenario1End, scenario2End];
    const ends = [scenario1End, scenario2End, scenario3End];

    if (frame < starts[index]) return 0;
    if (frame >= ends[index]) return 1;

    return (frame - starts[index]) / (ends[index] - starts[index]);
  };

  // Decision tree animation
  const decisionProgress = interpolate(frame, [scenario3End, decisionEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Colors
  const bgColor = '#0f172a';
  const cardBg = '#1e293b';
  const textMuted = '#94a3b8';
  const greenColor = '#22c55e';

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
          top: 25,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <h1 style={{ color: '#f8fafc', fontSize: 34, fontWeight: 700, margin: 0 }}>
          编码类型选择决策
        </h1>
        <p style={{ color: textMuted, fontSize: 16, marginTop: 6 }}>
          根据数值范围选择最合适的编码类型
        </p>
      </div>

      {/* Three scenario cards */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
          padding: '0 40px',
        }}
      >
        {SCENARIOS.map((scenario, index) => {
          const progress = getScenarioProgress(index);
          const isActive = currentPhase === index;
          const isPast = currentPhase > index;

          return (
            <div
              key={scenario.id}
              style={{
                width: 340,
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 20,
                border: `2px solid ${isActive ? scenario.color : isPast ? scenario.color : '#334155'}`,
                boxShadow: isActive
                  ? `0 0 30px ${scenario.color}40`
                  : isPast
                  ? `0 0 15px ${scenario.color}20`
                  : 'none',
                opacity: isActive || isPast ? 1 : 0.5,
                transform: `scale(${isActive ? 1.05 : 1}) translateY(${isActive ? -10 : 0}px)`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Scenario header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                  opacity: interpolate(progress, [0, 0.3], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 0.3], [-20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: scenario.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {index === 0 ? '👤' : index === 1 ? '⏰' : '🔢'}
                </div>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>
                    {scenario.name}
                  </div>
                  <div style={{ color: textMuted, fontSize: 12 }}>
                    {scenario.description}
                  </div>
                </div>
              </div>

              {/* Value display */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 12,
                  opacity: interpolate(progress, [0.2, 0.5], [0, 1]),
                }}
              >
                <div style={{ color: textMuted, fontSize: 11, marginBottom: 4 }}>
                  示例数值
                </div>
                <div
                  style={{
                    color: scenario.color,
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {scenario.value.toLocaleString()}
                </div>
              </div>

              {/* Encoding badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: interpolate(progress, [0.4, 0.7], [0, 1]),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      backgroundColor: scenario.bgColor,
                      color: scenario.color,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {scenario.encoding}
                  </span>
                  <span style={{ color: textMuted, fontSize: 12 }}>
                    {scenario.bytes} Bytes
                  </span>
                </div>
                <span style={{ color: greenColor, fontSize: 12 }}>✓</span>
              </div>

              {/* Reason */}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid #334155',
                  opacity: interpolate(progress, [0.6, 1], [0, 1]),
                }}
              >
                <span style={{ color: textMuted, fontSize: 12 }}>{scenario.reason}</span>
              </div>

              {/* Arrow to next (if active) */}
              {isActive && index < 2 && (
                <div
                  style={{
                    position: 'absolute',
                    right: -25,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: scenario.color,
                    fontSize: 20,
                    opacity: interpolate(progress, [0.5, 0.8], [0, 1]),
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision flow at bottom */}
      {frame >= scenario3End && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 15,
            opacity: decisionProgress,
            transform: `translateY(${interpolate(decisionProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          {/* Decision title */}
          <div
            style={{
              backgroundColor: cardBg,
              padding: '10px 24px',
              borderRadius: 10,
              border: '1px solid #f97316',
            }}
          >
            <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 600 }}>
              编码选择决策流程
            </span>
          </div>

          {/* Decision flow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Range check 1 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  backgroundColor: SCENARIOS[0].bgColor,
                  border: `2px solid ${SCENARIOS[0].color}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                }}
              >
                <span style={{ color: SCENARIOS[0].color, fontSize: 13, fontWeight: 600 }}>
                  数值 ≤ 32767?
                </span>
              </div>
              <span style={{ color: greenColor, fontSize: 12 }}>是 → INT16</span>
            </div>

            <span style={{ color: '#475569', fontSize: 18 }}>→</span>

            {/* Range check 2 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  backgroundColor: SCENARIOS[1].bgColor,
                  border: `2px solid ${SCENARIOS[1].color}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                }}
              >
                <span style={{ color: SCENARIOS[1].color, fontSize: 13, fontWeight: 600 }}>
                  数值 ≤ 2.1B?
                </span>
              </div>
              <span style={{ color: greenColor, fontSize: 12 }}>是 → INT32</span>
            </div>

            <span style={{ color: '#475569', fontSize: 18 }}>→</span>

            {/* Range check 3 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  backgroundColor: SCENARIOS[2].bgColor,
                  border: `2px solid ${SCENARIOS[2].color}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                }}
              >
                <span style={{ color: SCENARIOS[2].color, fontSize: 13, fontWeight: 600 }}>
                  超出范围?
                </span>
              </div>
              <span style={{ color: greenColor, fontSize: 12 }}>→ INT64</span>
            </div>
          </div>

          {/* Loop indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: 0.6,
            }}
          >
            <span style={{ color: '#64748b', fontSize: 11 }}>循环播放</span>
            <span style={{ color: '#64748b', fontSize: 11 }}>🔄</span>
          </div>
        </div>
      )}

      {/* Frame indicator */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: '#334155',
          fontSize: 11,
        }}
      >
        {totalDuration}帧 @ 30fps | Loop
      </div>
    </AbsoluteFill>
  );
};

export default EncodingScenarioVideo;
