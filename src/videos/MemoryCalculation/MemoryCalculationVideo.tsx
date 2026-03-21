import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ENCODING_CONFIG } from '../types';
import { z } from 'zod';

const MemoryCalculationSchema = z.object({
  length: z.number(),
  encoding: z.enum(['INT16', 'INT32', 'INT64']),
});

type Props = z.infer<typeof MemoryCalculationSchema>;

export const MemoryCalculationVideo: React.FC<Props> = ({
  encoding,
  length,
}) => {
  const frame = useCurrentFrame();

  const config = ENCODING_CONFIG[encoding as keyof typeof ENCODING_CONFIG];
  const bytesPerElement = config.bytes;
  const headerBytes = 8;
  const payloadBytes = length * bytesPerElement;
  const totalBytes = headerBytes + payloadBytes;
  const hashTableBytesPerNode = 40;
  const totalHashTableBytes = length * hashTableBytesPerNode;

  // Fixed example: [5, 10, 15] for demonstration
  const exampleElements = [5, 10, 15];
  const exampleLength = 3;
  const exampleEncoding = 'INT16';
  const exampleConfig = ENCODING_CONFIG.INT16;
  const exampleHeaderBytes = 8;
  const examplePayloadBytes = exampleLength * exampleConfig.bytes; // 3 * 2 = 6
  const exampleTotalBytes = exampleHeaderBytes + examplePayloadBytes; // 8 + 6 = 14

  // Animation phases (12-15 seconds at 30fps = 360-450 frames, using 390 frames ~13 seconds)
  const phase1Duration = 45;  // Intro
  const phase2Duration = 90;  // Header calculation
  const phase3Duration = 90;  // Contents calculation
  const phase4Duration = 90;  // Total and comparison
  const phase5Duration = 75;  // Outro

  const phase1End = phase1Duration;
  const phase2End = phase1End + phase2Duration;
  const phase3End = phase2End + phase3Duration;
  const phase4End = phase3End + phase4Duration;
  const totalDuration = phase4End + phase5Duration;

  // Progress interpolators
  const headerCalcProgress = interpolate(
    frame,
    [phase1End, phase2End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const contentsCalcProgress = interpolate(
    frame,
    [phase2End, phase3End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const totalCalcProgress = interpolate(
    frame,
    [phase3End, phase4End],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const comparisonProgress = interpolate(
    frame,
    [phase4End - 30, phase4End],
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
      {frame < phase1End && (
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center' }}>
          <h1 style={{ color: '#f8fafc', fontSize: 38, fontWeight: 700, margin: 0 }}>
            IntSet 内存计算
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
            内存布局拆解演示
          </p>
        </div>
      )}

      {/* Main content */}
      {frame >= phase1End && frame < phase4End && (
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center' }}>
          <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 700, margin: 0 }}>
            内存计算公式
          </h1>
        </div>
      )}

      {/* Formula visualization */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 80,
          right: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Header calculation */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 32px',
            borderLeft: `4px solid ${config.color}`,
            opacity: headerCalcProgress > 0 ? 1 : 0,
            transform: `translateY(${(1 - headerCalcProgress) * 30}px)`,
            transition: 'transform 0.3s, opacity 0.3s',
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            头部 (Header)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'encoding', value: config.label, color: config.color },
                { label: 'length', value: String(length), color: '#22c55e' },
              ].map((field) => (
                <div
                  key={field.label}
                  style={{
                    backgroundColor: '#0f172a',
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: `2px solid ${field.color}`,
                  }}
                >
                  <div style={{ color: '#64748b', fontSize: 11 }}>{field.label}</div>
                  <div
                    style={{
                      color: field.color,
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
            <span style={{ color: '#64748b', fontSize: 20 }}>=</span>
            <div
              style={{
                backgroundColor: config.bgColor,
                color: config.color,
                padding: '8px 20px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {headerBytes} 字节
            </div>
          </div>
        </div>

        {/* Plus sign */}
        <div
          style={{
            color: '#64748b',
            fontSize: 32,
            opacity: contentsCalcProgress > 0 ? 1 : 0,
          }}
        >
          +
        </div>

        {/* Contents calculation */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 32px',
            borderLeft: '4px solid #22c55e',
            opacity: contentsCalcProgress > 0 ? 1 : 0,
            transform: `translateY(${(1 - contentsCalcProgress) * 30}px)`,
            transition: 'transform 0.3s, opacity 0.3s',
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            数据区 (Contents)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 16 }}>length</span>
              <span style={{ color: '#64748b', fontSize: 20 }}>×</span>
              <span style={{ color: '#94a3b8', fontSize: 16 }}>bytes_per_element</span>
            </div>
            <span style={{ color: '#64748b', fontSize: 20 }}>=</span>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '8px 20px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {length} × {bytesPerElement}
            </div>
            <span style={{ color: '#64748b', fontSize: 20 }}>=</span>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '8px 20px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {payloadBytes} 字节
            </div>
          </div>
        </div>

        {/* Equals and Total */}
        {totalCalcProgress > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginTop: 10,
              opacity: totalCalcProgress,
              transform: `scale(${0.8 + totalCalcProgress * 0.2})`,
              transition: 'transform 0.3s, opacity 0.3s',
            }}
          >
            <span style={{ color: '#64748b', fontSize: 28 }}>=</span>
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                padding: '12px 32px',
                borderRadius: 8,
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              总内存 = {totalBytes} 字节
            </div>
          </div>
        )}
      </div>

      {/* Example section */}
      {frame >= phase2End && frame < phase4End && (
        <div
          style={{
            position: 'absolute',
            top: 420,
            left: 80,
            right: 80,
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '24px 32px',
            border: '2px solid #334155',
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            具体示例: 存储 {`[${exampleElements.join(', ')}]`}，{exampleEncoding} 编码
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: exampleConfig.bgColor,
                color: exampleConfig.color,
                padding: '8px 16px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 16,
              }}
            >
              Header = {exampleHeaderBytes}B
            </div>
            <span style={{ color: '#64748b' }}>+</span>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '8px 16px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 16,
              }}
            >
              Contents = {exampleLength} × {exampleConfig.bytes}B = {examplePayloadBytes}B
            </div>
            <span style={{ color: '#64748b' }}>=</span>
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                padding: '8px 20px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {exampleTotalBytes} 字节
            </div>
          </div>
        </div>
      )}

      {/* HashTable comparison */}
      {comparisonProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            right: 80,
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: '20px 32px',
            border: '2px solid #ef4444',
            opacity: comparisonProgress,
            transform: `translateY(${(1 - comparisonProgress) * 20}px)`,
            transition: 'transform 0.3s, opacity 0.3s',
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            对比: HashTable 节点内存
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>
              每个节点约 {hashTableBytesPerNode} 字节
            </div>
            <span style={{ color: '#64748b' }}>×</span>
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '6px 14px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {length} 节点
            </div>
            <span style={{ color: '#64748b' }}>=</span>
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '8px 20px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ~{totalHashTableBytes} 字节
            </div>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '6px 14px',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 14,
              }}
            >
              IntSet 节省 {Math.round((1 - totalBytes / totalHashTableBytes) * 100)}% 内存
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
          fontSize: 14,
        }}
      >
        {totalDuration} 帧 @ 30fps
      </div>
    </AbsoluteFill>
  );
};

export default MemoryCalculationVideo;
