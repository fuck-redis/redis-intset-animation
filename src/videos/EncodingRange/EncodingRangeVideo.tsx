import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const EncodingRangeSchema = z.object({});

type Props = z.infer<typeof EncodingRangeSchema>;

// Encoding data
const ENCODINGS = [
  {
    label: 'INT16',
    bytes: 2,
    min: -32768,
    max: 32767,
    color: '#3b82f6',
    bgColor: '#1e3a5f',
    rangeLabel: '-32,768 ~ 32,767',
    exponent: 4, // For visualization scale
  },
  {
    label: 'INT32',
    bytes: 4,
    min: -2147483648,
    max: 2147483647,
    color: '#8b5cf6',
    bgColor: '#2d1f5e',
    rangeLabel: '-2,147,483,648 ~ 2,147,483,647',
    exponent: 9,
  },
  {
    label: 'INT64',
    bytes: 8,
    min: BigInt('-9223372036854775808'),
    max: BigInt('9223372036854775807'),
    color: '#ec4899',
    bgColor: '#4a1942',
    rangeLabel: '±9.22 × 10^18',
    exponent: 18,
  },
] as const;

export const EncodingRangeVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // Animation timing (in frames at 30fps)
  const introDuration = 45; // 1.5s
  const encodingDuration = 90; // 3s per encoding
  const totalDuration = introDuration + encodingDuration * 3 + 45; // ~15s

  // Calculate which encoding is currently being highlighted
  const getCurrentPhase = () => {
    if (frame < introDuration) return -1; // Intro
    const elapsed = frame - introDuration;
    return Math.min(Math.floor(elapsed / encodingDuration), 2);
  };

  const currentPhase = getCurrentPhase();

  // Animation progress for each encoding
  const getEncodingProgress = (index: number) => {
    if (frame < introDuration) return 0;
    const encodingStart = index * encodingDuration;
    const encodingEnd = encodingStart + encodingDuration;

    if (frame < encodingStart) return 0;
    if (frame >= encodingEnd) return 1;

    return (frame - encodingStart) / encodingDuration;
  };

  // Number line tick marks
  const renderTickMarks = (
    encoding: typeof ENCODINGS[number],
    progress: number,
    isActive: boolean
  ) => {
    const numTicks = 9;
    const ticks = [];

    for (let i = 0; i < numTicks; i++) {
      const t = i / (numTicks - 1); // 0 to 1
      // Convert BigInt to Number for calculation if needed
      const minVal = typeof encoding.min === 'bigint' ? Number(encoding.min) : encoding.min;
      const maxVal = typeof encoding.max === 'bigint' ? Number(encoding.max) : encoding.max;
      const value = minVal + (maxVal - minVal) * t;

      // Determine tick position based on scale
      const scale = encoding.exponent;
      const displayValue = (() => {
        if (typeof value === 'bigint') {
          return Number(value) < 0 ? '-' + '9'.repeat(Math.min(scale - 1, 18)) : '9'.repeat(Math.min(scale, 18));
        }
        const abs = Math.abs(value);
        if (abs >= 1e18) return (value / 1e18).toFixed(1) + '×10^18';
        if (abs >= 1e15) return (value / 1e15).toFixed(1) + '×10^15';
        if (abs >= 1e12) return (value / 1e12).toFixed(1) + '×10^12';
        if (abs >= 1e9) return (value / 1e9).toFixed(1) + '×10^9';
        if (abs >= 1e6) return (value / 1e6).toFixed(1) + '×10^6';
        if (abs >= 1e3) return (value / 1e3).toFixed(1) + '×10^3';
        return value.toString();
      })();

      const xOffset = t * 900 - 450; // Centered range line
      const tickHeight = i === 0 || i === numTicks - 1 ? 30 : 15;

      ticks.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: `translateX(${xOffset}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: isActive ? interpolate(progress, [0.3, 0.5], [0, 1]) : 0.3,
          }}
        >
          <div
            style={{
              width: 2,
              height: tickHeight,
              backgroundColor: encoding.color,
              opacity: isActive ? 1 : 0.4,
            }}
          />
          <span
            style={{
              color: '#94a3b8',
              fontSize: 11,
              marginTop: 4,
              fontFamily: 'monospace',
            }}
          >
            {i === 0 ? 'MIN' : i === numTicks - 1 ? 'MAX' : displayValue}
          </span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1]),
          transform: `translateY(${interpolate(frame, [0, 20], [20, 0])}px)`,
        }}
      >
        <h1 style={{ color: '#f8fafc', fontSize: 38, fontWeight: 700, margin: 0 }}>
          整数编码的数值范围对比
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 8 }}>
          Integer Encoding Range Comparison | INT16 vs INT32 vs INT64
        </p>
      </div>

      {/* Encoding range visualizations */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          bottom: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '20px 100px',
        }}
      >
        {ENCODINGS.map((encoding, index) => {
          const progress = getEncodingProgress(index);
          const isActive = currentPhase === index;
          const isPast = currentPhase > index;
          const showFull = isActive || isPast;

          return (
            <div
              key={encoding.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                opacity: showFull ? 1 : 0.3,
                transform: `scale(${showFull ? 1 : 0.95})`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Encoding header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: interpolate(progress, [0, 0.3], [0, 1]),
                  transform: `translateX(${interpolate(progress, [0, 0.3], [-50, 0])}px)`,
                }}
              >
                <span
                  style={{
                    color: encoding.color,
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {encoding.label}
                </span>
                <span
                  style={{
                    backgroundColor: encoding.bgColor,
                    color: encoding.color,
                    padding: '4px 16px',
                    borderRadius: 20,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {encoding.bytes} Bytes
                </span>
              </div>

              {/* Range label */}
              <div
                style={{
                  opacity: interpolate(progress, [0.3, 0.6], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0.3, 0.6], [10, 0])}px)`,
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: 18,
                    fontFamily: 'monospace',
                    backgroundColor: '#1e293b',
                    padding: '8px 24px',
                    borderRadius: 8,
                  }}
                >
                  {encoding.rangeLabel}
                </span>
              </div>

              {/* Number line */}
              <div
                style={{
                  width: '100%',
                  height: 60,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Main line */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${interpolate(progress, [0.2, 0.8], [0, 100])}%`,
                    height: 4,
                    backgroundColor: encoding.color,
                    borderRadius: 2,
                    opacity: showFull ? 0.8 : 0.3,
                  }}
                />

                {/* Tick marks */}
                {renderTickMarks(encoding, progress, isActive)}

                {/* Range indicator arrows */}
                <div
                  style={{
                    position: 'absolute',
                    left: 50,
                    right: 50,
                    display: 'flex',
                    justifyContent: 'space-between',
                    opacity: interpolate(progress, [0.5, 0.8], [0, 1]),
                  }}
                >
                  <span style={{ color: encoding.color, fontSize: 24 }}>←</span>
                  <span style={{ color: encoding.color, fontSize: 24 }}>→</span>
                </div>
              </div>

              {/* Value visualization bars */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                  opacity: interpolate(progress, [0.6, 1], [0, 1]),
                }}
              >
                {encoding.exponent === 4 && (
                  <>
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.3 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.5 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.7 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.7 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.5 }} />
                    <div style={{ width: 60, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.3 }} />
                  </>
                )}
                {encoding.exponent === 9 && (
                  <>
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.3 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.4 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.5 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.6 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.7 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.8 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.8 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.7 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.6 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.5 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.4 }} />
                    <div style={{ width: 20, height: 30, backgroundColor: encoding.color, borderRadius: 4, opacity: 0.3 }} />
                  </>
                )}
                {encoding.exponent === 18 && (
                  <>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 20,
                          height: 30,
                          backgroundColor: encoding.color,
                          borderRadius: 4,
                          opacity: 0.3 + (i / 18) * 0.7,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison summary at the end */}
      {currentPhase >= 2 && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            opacity: interpolate(getEncodingProgress(2), [0.8, 1], [0, 1]),
          }}
        >
          {ENCODINGS.map((encoding) => (
            <div
              key={encoding.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ color: encoding.color, fontSize: 16, fontWeight: 700 }}>
                {encoding.label}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>
                {encoding.bytes} bytes
              </span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                10^{encoding.exponent}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Frame indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 20,
          color: '#334155',
          fontSize: 12,
        }}
      >
        {frame % totalDuration} / {totalDuration}
      </div>
    </AbsoluteFill>
  );
};

export default EncodingRangeVideo;
