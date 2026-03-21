import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const StructVisualizationVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timing (12-15 seconds at 30fps = 360-450 frames)
  const totalDuration = 390; // 13 seconds

  // Phase durations
  const introDuration = 30;
  const encodingDuration = 90;
  const lengthDuration = 90;
  const contentsDuration = 90;

  const encodingStart = introDuration;
  const encodingEnd = encodingStart + encodingDuration;

  const lengthStart = encodingEnd;
  const lengthEnd = lengthStart + lengthDuration;

  const contentsStart = lengthEnd;
  const contentsEnd = contentsStart + contentsDuration;

  // Calculate progress for each field
  const encodingProgress = interpolate(
    frame,
    [encodingStart, encodingEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lengthProgress = interpolate(
    frame,
    [lengthStart, lengthEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const contentsProgress = interpolate(
    frame,
    [contentsStart, contentsEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const outroProgress = interpolate(
    frame,
    [contentsEnd, totalDuration],
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
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: frame < introDuration ? 1 : 0,
        }}
      >
        <h1 style={{ color: '#f8fafc', fontSize: 38, fontWeight: 700, margin: 0 }}>
          IntSet C语言结构定义
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          Redis IntSet 内存布局核心结构
        </p>
      </div>

      {/* Main content area */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 60,
          right: 60,
          display: 'flex',
          gap: 40,
        }}
      >
        {/* Left side - Code definition */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #334155',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
            结构体定义
          </div>
          <pre
            style={{
              color: '#f8fafc',
              fontSize: 16,
              fontFamily: 'monospace',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            <span style={{ color: '#c084fc' }}>typedef struct</span>{' '}
            <span style={{ color: '#fbbf24' }}>intset</span> {'{'}
            {'\n'}
            <span
              style={{
                opacity: frame >= encodingStart ? 1 : 0.3,
                color: '#60a5fa',
              }}
            >
              {'  '}uint32_t{' '}
              <span style={{ color: '#34d399' }}>encoding</span>;
            </span>
            <span
              style={{
                opacity: frame >= encodingStart ? 1 : 0.3,
                color: '#64748b',
                fontSize: 12,
              }}
            >
              {' // 编码类型'}
            </span>
            {'\n'}
            <span
              style={{
                opacity: frame >= lengthStart ? 1 : 0.3,
                color: '#60a5fa',
              }}
            >
              {'  '}uint32_t{' '}
              <span style={{ color: '#34d399' }}>length</span>;
            </span>
            <span
              style={{
                opacity: frame >= lengthStart ? 1 : 0.3,
                color: '#64748b',
                fontSize: 12,
              }}
            >
              {' // 元素数量'}
            </span>
            {'\n'}
            <span
              style={{
                opacity: frame >= contentsStart ? 1 : 0.3,
                color: '#60a5fa',
              }}
            >
              {'  '}int8_t{' '}
              <span style={{ color: '#34d399' }}>contents</span>
              <span style={{ color: '#fbbf24' }}>[]</span>;
            </span>
            <span
              style={{
                opacity: frame >= contentsStart ? 1 : 0.3,
                color: '#64748b',
                fontSize: 12,
              }}
            >
              {' // 柔性数组'}
            </span>
            {'\n'}
            {'}'}
          </pre>
        </div>

        {/* Right side - Memory visualization */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #334155',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
            内存布局 (Memory Layout)
          </div>

          {/* Memory block visualization */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* encoding field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: encodingProgress > 0 ? 1 : 0,
                transform: `translateX(${(1 - encodingProgress) * -30}px)`,
                transition: 'all 0.3s ease-out',
              }}
            >
              <div
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                encoding
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 40,
                      backgroundColor:
                        encodingProgress > i / 4 ? '#3b82f6' : '#1e293b',
                      borderRadius: 4,
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      opacity: encodingProgress > i / 4 ? 1 : 0.3,
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    {encodingProgress > i / 4 ? `${i}` : '-'}
                  </div>
                ))}
              </div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                偏移 0x00-0x03 (4字节)
              </div>
            </div>

            {/* length field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: lengthProgress > 0 ? 1 : 0,
                transform: `translateX(${(1 - lengthProgress) * -30}px)`,
                transition: 'all 0.3s ease-out',
              }}
            >
              <div
                style={{
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                length
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 40,
                      backgroundColor:
                        lengthProgress > i / 4 ? '#22c55e' : '#1e293b',
                      borderRadius: 4,
                      border: '2px solid #22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      opacity: lengthProgress > i / 4 ? 1 : 0.3,
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    {lengthProgress > i / 4 ? `${i + 4}` : '-'}
                  </div>
                ))}
              </div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                偏移 0x04-0x07 (4字节)
              </div>
            </div>

            {/* contents field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: contentsProgress > 0 ? 1 : 0,
                transform: `translateX(${(1 - contentsProgress) * -30}px)`,
                transition: 'all 0.3s ease-out',
              }}
            >
              <div
                style={{
                  backgroundColor: '#8b5cf6',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                contents
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 24,
                      height: 40,
                      backgroundColor:
                        contentsProgress > i / 8 ? '#8b5cf6' : '#1e293b',
                      borderRadius: 4,
                      border: '2px solid #8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      opacity: contentsProgress > i / 8 ? 1 : 0.3,
                      transition: 'all 0.15s ease-out',
                    }}
                  >
                    {contentsProgress > i / 8 ? `${i + 8}` : '-'}
                  </div>
                ))}
                <div
                  style={{
                    color: '#8b5cf6',
                    fontSize: 20,
                    fontWeight: 700,
                    marginLeft: 4,
                  }}
                >
                  ...
                </div>
              </div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                偏移 0x08+ (柔性数组)
              </div>
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: '#0f172a',
              borderRadius: 8,
              border: '1px solid #334155',
              opacity: contentsProgress > 0.5 ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
              头部总大小: 8字节 (固定)
            </div>
            <div
              style={{
                display: 'flex',
                gap: 12,
              }}
            >
              <div
                style={{
                  color: '#3b82f6',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                encoding: 4B
              </div>
              <span style={{ color: '#64748b' }}>+</span>
              <div
                style={{
                  color: '#22c55e',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                length: 4B
              </div>
              <span style={{ color: '#64748b' }}>=</span>
              <div
                style={{
                  color: '#f8fafc',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                Header: 8B
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field descriptions at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          opacity: outroProgress,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {[
          { color: '#3b82f6', name: 'encoding', desc: '编码类型' },
          { color: '#22c55e', name: 'length', desc: '元素数量' },
          { color: '#8b5cf6', name: 'contents', desc: '数据存储' },
        ].map((field) => (
          <div
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: field.color,
              }}
            />
            <span style={{ color: '#f8fafc', fontSize: 14 }}>
              {field.name}
            </span>
            <span style={{ color: '#64748b', fontSize: 14 }}>
              {field.desc}
            </span>
          </div>
        ))}
      </div>

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
        {totalDuration} 帧 (loop)
      </div>
    </AbsoluteFill>
  );
};

export default StructVisualizationVideo;
