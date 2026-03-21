import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ENCODING_CONFIG } from '../types';
import { z } from 'zod';

// Schema - using default demo data
export const EncodingDowngradeSchema = z.object({});

type Props = z.infer<typeof EncodingDowngradeSchema>;

export const EncodingDowngradeVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  const encodingOrder: (keyof typeof ENCODING_CONFIG)[] = ['INT16', 'INT32', 'INT64'];

  // Animation timeline (15-20 seconds at 30fps = 450-600 frames)
  const introDuration = 45;           // Phase 1: Show INT16 set
  const insertBigValueDuration = 60;   // Phase 2: Insert big value, trigger upgrade
  const firstUpgradeDuration = 90;    // Phase 3: Show upgrade to INT32
  const insertBiggerDuration = 60;    // Phase 4: Insert even bigger value
  const secondUpgradeDuration = 90;   // Phase 5: Show upgrade to INT64
  const deleteBigValueDuration = 75;  // Phase 6: Delete big value, NO downgrade
  const costAnalysisDuration = 90;    // Phase 7: Explain cost of downgrade
  const outroDuration = 45;           // Phase 8: Conclusion

  const phase1End = introDuration;
  const phase2End = phase1End + insertBigValueDuration;
  const phase3End = phase2End + firstUpgradeDuration;
  const phase4End = phase3End + insertBiggerDuration;
  const phase5End = phase4End + secondUpgradeDuration;
  const phase6End = phase5End + deleteBigValueDuration;
  const phase7End = phase6End + costAnalysisDuration;
  const totalDuration = phase7End + outroDuration;

  // Current state based on phase
  let currentEncodingIndex = 0; // INT16
  let bigValue = 50000;
  let biggerValue = 2147483648; // INT32 max + 1

  if (frame >= phase2End) currentEncodingIndex = 1; // INT32 after first upgrade
  if (frame >= phase4End) currentEncodingIndex = 2; // INT64 after second upgrade

  const currentEncoding = encodingOrder[currentEncodingIndex];
  const currentConfig = ENCODING_CONFIG[currentEncoding];

  // Show delete animation after big value is deleted
  const showDelete = frame >= phase5End && frame < phase6End;
  const showNoDowngrade = frame >= phase6End;

  // Migration progress for upgrade animations
  const firstUpgradeProgress = interpolate(
    frame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const secondUpgradeProgress = interpolate(
    frame,
    [phase4End, phase5End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Cost analysis animation
  const costProgress = interpolate(
    frame,
    [phase6End, phase7End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Small values for the set
  const smallValues = [1, 2, 3, 100, 500];

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
          编码不可降级 (Encoding Cannot Downgrade)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          删除大值后编码不会降级 - Redis的设计权衡
        </p>
      </div>

      {/* Current encoding indicator */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            backgroundColor: '#1e293b',
            padding: '12px 32px',
            borderRadius: 12,
            border: `2px solid ${currentConfig.color}`,
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: 18 }}>当前编码:</span>
          <span
            style={{
              color: currentConfig.color,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {currentConfig.label}
          </span>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            ({currentConfig.bytes}字节/元素)
          </span>
        </div>
      </div>

      {/* Set visualization */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ color: '#64748b', fontSize: 16 }}>IntSet 内容:</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800 }}>
          {smallValues.map((v, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#1e293b',
                border: '2px solid #334155',
                borderRadius: 8,
                padding: '12px 20px',
                minWidth: 60,
                textAlign: 'center',
              }}
            >
              <span style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, fontFamily: 'monospace' }}>
                {v}
              </span>
            </div>
          ))}

          {/* Big value that triggers upgrade - shown until deleted */}
          {frame < phase6End && currentEncodingIndex >= 1 && (
            <div
              style={{
                backgroundColor: currentEncodingIndex >= 2 ? '#7c2d12' : '#1e3a5f',
                border: `2px solid ${currentEncodingIndex >= 2 ? '#ef4444' : '#3b82f6'}`,
                borderRadius: 8,
                padding: '12px 20px',
                minWidth: 60,
                textAlign: 'center',
                animation: frame >= phase2End && frame < phase3End ? 'pulse 0.5s infinite' : 'none',
              }}
            >
              <span
                style={{
                  color: currentEncodingIndex >= 2 ? '#ef4444' : '#60a5fa',
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {currentEncodingIndex >= 2 ? biggerValue : bigValue}
              </span>
            </div>
          )}

          {/* Deleted placeholder */}
          {showDelete && (
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '2px dashed #475569',
                borderRadius: 8,
                padding: '12px 20px',
                minWidth: 60,
                textAlign: 'center',
                opacity: 0.5,
              }}
            >
              <span style={{ color: '#64748b', fontSize: 20, fontFamily: 'monospace' }}>X</span>
            </div>
          )}
        </div>
      </div>

      {/* Phase indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: 160,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {[
          { label: 'INT16', active: frame < phase2End },
          { label: '插入大值', active: frame >= phase2End && frame < phase3End },
          { label: 'INT32', active: frame >= phase3End && frame < phase4End },
          { label: '插入更大值', active: frame >= phase4End && frame < phase5End },
          { label: 'INT64', active: frame >= phase5End && frame < phase6End },
          { label: '删除大值', active: frame >= phase6End && frame < phase7End },
          { label: '不降级!', active: frame >= phase7End },
        ].map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: step.active ? '#3b82f6' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.active ? '#fff' : '#64748b',
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                color: step.active ? '#f8fafc' : '#64748b',
                fontSize: 12,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Warning message - NO DOWNGRADE */}
      {showNoDowngrade && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [phase6End, phase6End + 20], [0, 1]),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#7c2d12',
              padding: '16px 40px',
              borderRadius: 12,
              border: '2px solid #ef4444',
              gap: 16,
            }}
          >
            <span style={{ color: '#fb923c', fontSize: 24 }}>X</span>
            <span style={{ color: '#f8fafc', fontSize: 22, fontWeight: 600 }}>
              删除大值后编码保持 INT64，不会降级
            </span>
          </div>
        </div>
      )}

      {/* Cost analysis panel */}
      {frame >= phase6End && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: costProgress,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '12px 24px',
              borderRadius: 8,
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>降级成本:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ef4444', fontSize: 14 }}>内存重分配</span>
              <span style={{ color: '#475569' }}>+</span>
              <span style={{ color: '#f97316', fontSize: 14 }}>移动所有元素</span>
              <span style={{ color: '#475569' }}>=</span>
              <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>O(n) 开销</span>
            </div>
          </div>
        </div>
      )}

      {/* Redis design choice callout */}
      {frame >= phase7End && (
        <div
          style={{
            position: 'absolute',
            top: 180,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [phase7End, phase7End + 30], [0, 1]),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1e3a5f',
              padding: '24px 48px',
              borderRadius: 16,
              border: '2px solid #3b82f6',
              gap: 12,
            }}
          >
            <span style={{ color: '#60a5fa', fontSize: 18, fontWeight: 600 }}>
              Redis 设计选择
            </span>
            <span style={{ color: '#f8fafc', fontSize: 24, fontWeight: 700 }}>
              为性能牺牲内存
            </span>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              避免每次删除后检查是否需要降级带来的开销
            </span>
          </div>
        </div>
      )}

      {/* Upgrade animation effects */}
      {frame >= phase2End && frame < phase3End && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at center, ${ENCODING_CONFIG.INT32.color}22 0%, transparent 50%)`,
            opacity: firstUpgradeProgress * 0.3,
          }}
        />
      )}

      {frame >= phase4End && frame < phase5End && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at center, ${ENCODING_CONFIG.INT64.color}22 0%, transparent 50%)`,
            opacity: secondUpgradeProgress * 0.3,
          }}
        />
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
        {totalDuration} 帧 @ 30fps
      </div>
    </AbsoluteFill>
  );
};

export default EncodingDowngradeVideo;
