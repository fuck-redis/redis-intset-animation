import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { EncodingUpgradeSchema, ENCODING_CONFIG } from '../types';
import type z from 'zod';

type Props = z.infer<typeof EncodingUpgradeSchema>;

export const EncodingUpgradeVideo: React.FC<Props> = ({
  initialEncoding,
  triggerValue,
}) => {
  const frame = useCurrentFrame();

  const encodingOrder: (keyof typeof ENCODING_CONFIG)[] = ['INT16', 'INT32', 'INT64'];
  const initialIndex = encodingOrder.indexOf(initialEncoding);

  // Animation timeline
  const introDuration = 45;
  const highlightDuration = 60;
  const triggerDuration = 90;
  const upgradeDuration = 90;
  const migrationDuration = 90;
  const outroDuration = 45;

  const phase1End = introDuration;
  const phase2End = phase1End + highlightDuration;
  const phase3End = phase2End + triggerDuration;
  const phase4End = phase3End + upgradeDuration;
  const phase5End = phase4End + migrationDuration;
  const totalDuration = phase5End + outroDuration;

  // Determine upgrade
  let targetEncoding: keyof typeof ENCODING_CONFIG = initialEncoding;
  if (initialEncoding === 'INT16') {
    targetEncoding = triggerValue > 32767 || triggerValue < -32768 ? 'INT32' : 'INT16';
  } else if (initialEncoding === 'INT32') {
    targetEncoding = 'INT64';
  }

  const needsUpgrade = targetEncoding !== initialEncoding;
  const upgradeIndex = encodingOrder.indexOf(targetEncoding);

  const migrationProgress = interpolate(
    frame,
    [phase4End, phase5End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 42, fontWeight: 700, margin: 0 }}>
          编码升级机制 (Encoding Upgrade)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 20, marginTop: 8 }}>
          IntSet 如何自动选择最合适的整数编码
        </p>
      </div>

      {/* Encoding levels */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {encodingOrder.map((encoding, index) => {
          const config = ENCODING_CONFIG[encoding];
          const isUpgrading = index === upgradeIndex && frame >= phase3End;
          const isPast = index > upgradeIndex || (!needsUpgrade && index > initialIndex);

          const scale = isUpgrading ? 1 + migrationProgress * 0.1 : 1;

          return (
            <React.Fragment key={encoding}>
              {index > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    opacity: isPast ? 0.3 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 2,
                      backgroundColor: index <= upgradeIndex ? config.color : '#334155',
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: 20 }}>↓</span>
                  <div
                    style={{
                      width: 60,
                      height: 2,
                      backgroundColor: index <= upgradeIndex ? config.color : '#334155',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  backgroundColor: isPast ? '#1e293b' : config.bgColor,
                  border: `3px solid ${isPast ? '#475569' : config.color}`,
                  borderRadius: 16,
                  padding: '20px 40px',
                  transform: `scale(${scale})`,
                  boxShadow: isUpgrading
                    ? `0 0 ${30 * migrationProgress}px ${config.color}`
                    : 'none',
                  transition: 'box-shadow 0.1s',
                }}
              >
                <div
                  style={{
                    color: isPast ? '#64748b' : config.color,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {config.label}
                </div>
                <div
                  style={{
                    color: isPast ? '#475569' : '#64748b',
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  {config.bytes} 字节/元素
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Trigger explanation */}
      {frame >= phase2End && (
        <div style={{ position: 'absolute', bottom: 180, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '16px 40px',
              borderRadius: 12,
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 18 }}>触发升级的值:</span>
            <span
              style={{
                color: '#f97316',
                fontSize: 36,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {triggerValue}
            </span>
          </div>
        </div>
      )}

      {/* Upgrade animation */}
      {frame >= phase3End && frame < phase5End && (
        <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '12px 32px',
              borderRadius: 8,
              opacity: interpolate(
                frame,
                [phase3End, phase3End + 20, phase5End - 20, phase5End],
                [0, 1, 1, 0]
              ),
            }}
          >
            <span style={{ color: '#f97316', fontSize: 18 }}>
              {frame < phase4End ? '🔄 重新分配内存...' : '📦 迁移数据...'}
            </span>
          </div>
        </div>
      )}

      {/* Warning about no downgrade */}
      {frame >= phase5End && (
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#7c2d12',
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid #c2410c',
            }}
          >
            <span style={{ color: '#fb923c', fontSize: 16 }}>
              ⚠️ 编码升级是单向的，删除大值后也不会降级
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
        {totalDuration} 帧 @ 30fps
      </div>
    </AbsoluteFill>
  );
};

export default EncodingUpgradeVideo;
