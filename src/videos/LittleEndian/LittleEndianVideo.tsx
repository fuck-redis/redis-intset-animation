import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const LittleEndianSchema = z.object({
  value: z.number(),
  encoding: z.enum(['INT16', 'INT32', 'INT64']),
});

type Props = z.infer<typeof LittleEndianSchema>;

export const LittleEndianVideo: React.FC<Props> = ({
  value,
  encoding,
}) => {
  const frame = useCurrentFrame();

  const bytesPerElement = encoding === 'INT16' ? 2 : encoding === 'INT32' ? 4 : 8;
  const totalBits = bytesPerElement * 8;

  // Animation phases
  const introDuration = 30;
  const valueDuration = 45;
  const binaryDuration = 60;
  const byteSplitDuration = 60;
  const memoryDuration = 75;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const valueEnd = phaseEnd + valueDuration;
  phaseEnd = valueEnd;
  const binaryEnd = phaseEnd + binaryDuration;
  phaseEnd = binaryEnd;
  const byteSplitEnd = phaseEnd + byteSplitDuration;
  phaseEnd = byteSplitEnd;
  const memoryEnd = phaseEnd + memoryDuration;
  const totalDuration = memoryEnd + outroDuration;

  // Convert value to binary representation
  const getBinaryString = (val: number, bits: number): string => {
    if (val < 0) {
      // Handle negative numbers using two's complement
      const absVal = Math.abs(val);
      const mask = BigInt((1 << bits) - 1);
      const unsignedVal = BigInt(absVal) ^ mask + BigInt(1);
      return (unsignedVal & mask).toString(2).padStart(bits, '0');
    }
    return val.toString(2).padStart(bits, '0');
  };

  const binaryString = getBinaryString(value, totalBits);
  const byteCount = bytesPerElement;

  // Split binary string into bytes (little endian - low byte first)
  const getBytes = (val: number, bytes: number): string[] => {
    const result: string[] = [];
    for (let i = 0; i < bytes; i++) {
      const byteVal = (val >> (i * 8)) & 0xff;
      result.push(byteVal.toString(2).padStart(8, '0'));
    }
    return result;
  };

  const bytes = getBytes(value, byteCount);

  const binaryProgress = interpolate(
    frame,
    [valueEnd, binaryEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const byteSplitProgress = interpolate(
    frame,
    [binaryEnd, byteSplitEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const memoryProgress = interpolate(
    frame,
    [byteSplitEnd, memoryEnd],
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
          小端序存储 (Little Endian)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          IntSet 如何在内存中存储整数 | 低位字节在前
        </p>
      </div>

      {/* Value display */}
      {frame >= introDuration && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '16px 40px',
              borderRadius: 12,
              gap: 20,
              opacity: frame < valueEnd ? 1 : 0.5,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 20 }}>十进制值:</span>
            <span
              style={{
                color: '#f97316',
                fontSize: 36,
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {value}
            </span>
            <span style={{ color: '#64748b', fontSize: 20 }}>({encoding})</span>
          </div>
        </div>
      )}

      {/* Binary representation */}
      {frame >= valueEnd && frame < byteSplitEnd && (
        <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#0f172a',
              padding: '20px 32px',
              borderRadius: 12,
              border: '2px solid #334155',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 16 }}>二进制: </span>
            <span
              style={{
                color: '#22c55e',
                fontSize: 22,
                fontWeight: 600,
                fontFamily: 'monospace',
                letterSpacing: 2,
              }}
            >
              {binaryString.slice(0, Math.floor(binaryProgress * totalBits))}
              {binaryProgress < 1 && '_'}
            </span>
          </div>
        </div>
      )}

      {/* Byte splitting visualization */}
      {frame >= binaryEnd && frame < memoryEnd && (
        <div style={{ position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>
              按字节拆分 ({byteCount} 字节, 小端序: 低位在前)
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {bytes.map((byte, i) => {
                const isActive = byteSplitProgress > i / byteCount;

                return (
                  <div
                    key={i}
                    style={{
                      width: 100,
                      padding: '12px 16px',
                      backgroundColor: isActive ? '#1e293b' : '#0f172a',
                      borderRadius: 8,
                      border: `2px solid ${isActive ? '#3b82f6' : '#334155'}`,
                      opacity: isActive ? 1 : 0.4,
                      transform: `scale(${isActive ? 1 : 0.95})`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                      Byte {i}
                    </div>
                    <div
                      style={{
                        color: '#3b82f6',
                        fontSize: 14,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {isActive ? byte : '________'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                      = {(parseInt(byte, 2) & 0xff)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Memory layout */}
      {frame >= byteSplitEnd && (
        <div style={{ position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: '#64748b', fontSize: 14 }}>
              内存地址 (低地址 → 高地址)
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {[...Array(byteCount)].map((_, i) => {
                const isActive = memoryProgress > i / byteCount;
                const byteIndex = i; // Little endian: byte 0 at lowest address

                return (
                  <React.Fragment key={i}>
                    <div
                      style={{
                        width: 80,
                        height: 50,
                        backgroundColor: isActive ? '#1e293b' : '#0f172a',
                        borderRadius: 6,
                        border: `2px solid ${isActive ? '#22c55e' : '#334155'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isActive ? 1 : 0.3,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ color: '#64748b', fontSize: 10 }}>
                        {isActive ? `0x${i}` : '-'}
                      </div>
                      <div
                        style={{
                          color: '#22c55e',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {isActive ? bytes[byteIndex] : '________'}
                      </div>
                    </div>
                    {i < byteCount - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', color: '#475569' }}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Key insight */}
      {frame >= memoryEnd && (
        <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e3a5f',
              padding: '16px 32px',
              borderRadius: 12,
              border: '1px solid #3b82f6',
              gap: 16,
            }}
          >
            <span style={{ color: '#3b82f6', fontSize: 20, fontWeight: 600 }}>!</span>
            <span style={{ color: '#f8fafc', fontSize: 16 }}>
              小端序: 最低有效字节存储在最低地址
            </span>
          </div>
        </div>
      )}

      {/* Example note */}
      {frame >= memoryEnd && (
        <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '8px 20px',
              borderRadius: 6,
            }}
          >
            <span style={{ color: '#64748b', fontSize: 13 }}>
              {encoding === 'INT16' ? '例如: 0x1234 存储为 [0x34, 0x12]' :
               encoding === 'INT32' ? '例如: 0x12345678 存储为 [0x78, 0x56, 0x34, 0x12]' :
               '例如: 0x12345678ABCD 保存为 [0xCD, 0xAB, 0x78, 0x56, 0x34, 0x12, 0x78, 0x56]'}
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
        {totalDuration} 帧
      </div>
    </AbsoluteFill>
  );
};

export default LittleEndianVideo;
