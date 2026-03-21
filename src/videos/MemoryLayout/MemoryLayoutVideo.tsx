import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MemoryLayoutSchema, ENCODING_CONFIG } from '../types';
import type z from 'zod';

type Props = z.infer<typeof MemoryLayoutSchema>;

export const MemoryLayoutVideo: React.FC<Props> = ({
  encoding,
  length,
}) => {
  const frame = useCurrentFrame();

  const config = ENCODING_CONFIG[encoding as keyof typeof ENCODING_CONFIG];
  const bytesPerElement = config.bytes;
  const headerBytes = 8;
  const payloadBytes = length * bytesPerElement;
  const totalBytes = headerBytes + payloadBytes;

  const introDuration = 30;
  const headerDuration = 60;
  const dataDuration = 90;
  const calcDuration = 60;
  const outroDuration = 45;

  const phase1End = introDuration;
  const phase2End = phase1End + headerDuration;
  const phase3End = phase2End + dataDuration;
  const phase4End = phase3End + calcDuration;
  const totalDuration = phase4End + outroDuration;

  const headerProgress = interpolate(
    frame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const dataProgress = interpolate(
    frame,
    [phase2End, phase3End],
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
      <div style={{ position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 38, fontWeight: 700, margin: 0 }}>
          IntSet 内存布局 (Memory Layout)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          {config.label} 编码 · {length} 个元素 · {bytesPerElement} 字节/元素
        </p>
      </div>

      {/* Memory visualization */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 80,
          right: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Header section */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 8,
            padding: '16px 24px',
            borderLeft: `4px solid ${config.color}`,
            opacity: frame >= phase1End ? 1 : 0,
            transform: `translateX(${(1 - headerProgress) * -50}px)`,
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            头部 (Header) - {headerBytes} 字节
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'encoding', value: config.label, color: config.color },
              { label: 'length', value: String(length), color: '#22c55e' },
              { label: 'blob', value: `${payloadBytes}B`, color: '#8b5cf6' },
            ].map((field) => (
              <div
                key={field.label}
                style={{
                  backgroundColor: '#0f172a',
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: `2px solid ${field.color}`,
                }}
              >
                <div style={{ color: '#64748b', fontSize: 12 }}>{field.label}</div>
                <div
                  style={{
                    color: field.color,
                    fontSize: 18,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 20,
            opacity: headerProgress > 0 ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <span style={{ color: config.color, fontSize: 24 }}>↓</span>
          <div
            style={{
              flex: 1,
              height: 2,
              backgroundColor: config.color,
              opacity: 0.5,
            }}
          />
        </div>

        {/* Data section */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 8,
            padding: '16px 24px',
            borderLeft: '4px solid #22c55e',
            opacity: frame >= phase2End ? 1 : 0,
            transform: `translateX(${(1 - dataProgress) * -50}px)`,
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            数据区 (Contents) - {payloadBytes} 字节
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              maxWidth: '100%',
            }}
          >
            {Array.from({ length }).map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#0f172a',
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: '1px solid #334155',
                  opacity: dataProgress > i / length ? 1 : 0,
                  transform: `scale(${dataProgress > i / length ? 1 : 0.8})`,
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
              >
                <span style={{ color: '#64748b', fontSize: 11 }}>[{i}]</span>
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    marginLeft: 6,
                  }}
                >
                  {'???'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculation formula */}
      {frame >= phase3End && (
        <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '20px 40px',
              borderRadius: 12,
              gap: 20,
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 18 }}>总内存 =</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                }}
              >
                {headerBytes}
              </span>
              <span style={{ color: '#64748b' }}>+</span>
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                }}
              >
                {length} × {bytesPerElement}
              </span>
            </div>
            <span style={{ color: '#64748b' }}>=</span>
            <span
              style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 24,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {totalBytes}B
            </span>
          </div>
        </div>
      )}

      {/* Little endian note */}
      <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#1e293b',
            padding: '8px 20px',
            borderRadius: 6,
          }}
        >
          <span style={{ color: '#64748b', fontSize: 14 }}>
            💡 小端序 (Little Endian) 存储：低位字节在前
          </span>
        </div>
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
        {totalDuration} 帧
      </div>
    </AbsoluteFill>
  );
};

export default MemoryLayoutVideo;
