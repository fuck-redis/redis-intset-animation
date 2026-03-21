import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const BatchOperationsSchema = z.object({
  values: z.array(z.number()).default([10, 20, 30, 40, 50]),
});

type Props = z.infer<typeof BatchOperationsSchema>;

const ENCODING_CONFIG = {
  INT16: { label: 'INT16', bytes: 2, min: -32768, max: 32767, color: '#3b82f6', bgColor: '#1e3a5f' },
  INT32: { label: 'INT32', bytes: 4, min: -2147483648, max: 2147483647, color: '#8b5cf6', bgColor: '#2d1f5e' },
  INT64: { label: 'INT64', bytes: 8, min: BigInt('-9223372036854775808'), max: BigInt('9223372036854775807'), color: '#ec4899', bgColor: '#4a1942' },
};

const getEncoding = (value: number): keyof typeof ENCODING_CONFIG => {
  if (value >= -32768 && value <= 32767) return 'INT16';
  if (value >= -2147483648 && value <= 2147483647) return 'INT32';
  return 'INT64';
};

export const BatchOperationsVideo: React.FC<Props> = ({ values = [10, 20, 30, 40, 50] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timing
  const introDuration = 25;
  const perValueDuration = 70; // Each value takes 70 frames to insert
  const outroDuration = 40;
  const totalDuration = introDuration + values.length * perValueDuration + outroDuration;

  // Calculate which value we're currently inserting
  const valueInsertProgress = Math.max(0, frame - introDuration);
  const currentValueIndex = Math.min(Math.floor(valueInsertProgress / perValueDuration), values.length - 1);
  const currentValueProgress = valueInsertProgress % perValueDuration;

  // Simulate the intset building process
  let currentEncoding: keyof typeof ENCODING_CONFIG = 'INT16';
  let needsUpgrade = false;
  let upgradeTriggerValue: number | null = null;
  const insertedValues: number[] = [];

  for (let i = 0; i <= currentValueIndex && i < values.length; i++) {
    const v = values[i];
    const enc = getEncoding(v);
    if (enc !== currentEncoding) {
      needsUpgrade = true;
      upgradeTriggerValue = v;
      currentEncoding = enc;
    }
    if (i < currentValueIndex || (i === currentValueIndex && frame >= introDuration)) {
      insertedValues.push(v);
    }
  }

  // For showing expansion animation
  const showExpansion = needsUpgrade && currentValueProgress > 30 && currentValueProgress < 55;

  // Insert animation
  const showInsert = currentValueProgress >= 40 && currentValueProgress < 70;

  // Build displayed values based on progress
  const displayValues: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < currentValueIndex) {
      displayValues.push(values[i]);
    } else if (i === currentValueIndex && frame >= introDuration) {
      displayValues.push(showInsert ? values[i] : null);
    } else {
      displayValues.push(null);
    }
  }

  const sortedDisplay = displayValues.filter(v => v !== null).sort((a, b) => (a as number) - (b as number));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ position: 'absolute', top: 25, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 36, fontWeight: 700, margin: 0 }}>
          批量操作 (Batch Operations)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 17, marginTop: 6 }}>
          SADD myset [values] - 批量插入多个元素
        </p>
      </div>

      {/* Command display */}
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#1e293b',
            padding: '10px 28px',
            borderRadius: 10,
            gap: 12,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: 16 }}>SADD myset</span>
          <span style={{ color: '#f97316', fontSize: 18, fontWeight: 600, fontFamily: 'monospace' }}>
            {values.join(' ')}
          </span>
        </div>
      </div>

      {/* Values to insert indicator */}
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {values.map((v, i) => {
          const isInserted = i < currentValueIndex || (i === currentValueIndex && frame >= introDuration && currentValueProgress >= 40);
          const isCurrent = i === currentValueIndex && frame >= introDuration;
          return (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                backgroundColor: isInserted ? '#22c55e' : isCurrent ? '#f97316' : '#1e293b',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isCurrent ? '2px solid #fbbf24' : '2px solid #334155',
                transform: isCurrent && currentValueProgress < 40 ? `scale(${1 + Math.sin(currentValueProgress * 0.2) * 0.05})` : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            >
              <span style={{ color: isInserted || isCurrent ? '#fff' : '#64748b', fontSize: 18, fontWeight: 600 }}>
                {v}
              </span>
            </div>
          );
        })}
      </div>

      {/* Arrow indicator */}
      <div style={{ position: 'absolute', top: 235, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: 24 }}>↓</div>
      </div>

      {/* Array visualization area */}
      <div
        style={{
          position: 'absolute',
          top: 270,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Encoding badge */}
        <div style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              backgroundColor: ENCODING_CONFIG[currentEncoding].bgColor,
              padding: '6px 16px',
              borderRadius: 6,
              border: `1px solid ${ENCODING_CONFIG[currentEncoding].color}`,
            }}
          >
            <span style={{ color: ENCODING_CONFIG[currentEncoding].color, fontSize: 14, fontWeight: 600 }}>
              {ENCODING_CONFIG[currentEncoding].label}
            </span>
          </div>
          {needsUpgrade && (
            <div
              style={{
                backgroundColor: '#7c2d12',
                padding: '6px 16px',
                borderRadius: 6,
                border: '1px solid #c2410c',
              }}
            >
              <span style={{ color: '#fb923c', fontSize: 14 }}>
                ⚠ 触发扩容: 值 {upgradeTriggerValue} 超出范围
              </span>
            </div>
          )}
        </div>

        {/* Main array container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 90,
          }}
        >
          {showExpansion ? (
            // Expansion animation
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#f97316', fontSize: 16, marginBottom: 10 }}>
                🔄 内存重新分配中...
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {sortedDisplay.map((v, i) => (
                  <div
                    key={`old-${i}`}
                    style={{
                      width: 60,
                      height: 70,
                      backgroundColor: '#1e293b',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #334155',
                    }}
                  >
                    <span style={{ color: '#64748b', fontSize: 16 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, height: 2, backgroundColor: '#f97316' }} />
                <span style={{ color: '#f97316', fontSize: 14 }}>→</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {[...sortedDisplay, ...Array(Math.max(0, 5 - sortedDisplay.length)).fill(null)].map((v, i) => (
                  <div
                    key={`new-${i}`}
                    style={{
                      width: 60,
                      height: 70,
                      backgroundColor: v !== null ? '#22c55e' : '#1e293b',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: v !== null ? '2px solid #4ade80' : '2px dashed #475569',
                    }}
                  >
                    {v !== null ? (
                      <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{v}</span>
                    ) : (
                      <span style={{ color: '#475569', fontSize: 14 }}>?</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Normal array display
            <div style={{ display: 'flex', gap: 10 }}>
              {[...Array(Math.max(5, sortedDisplay.length + 1))].map((_, i) => {
                const value = sortedDisplay[i];
                const isNew = i === sortedDisplay.length - 1 && frame >= introDuration && currentValueProgress >= 40;
                return (
                  <div
                    key={i}
                    style={{
                      width: 60,
                      height: 70,
                      backgroundColor: value !== undefined ? '#1e293b' : '#1e293b',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isNew ? '2px solid #22c55e' : value !== undefined ? '2px solid #334155' : '2px dashed #475569',
                      boxShadow: isNew ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none',
                      opacity: value !== undefined ? 1 : 0.5,
                    }}
                  >
                    {value !== undefined ? (
                      <span style={{ color: '#f8fafc', fontSize: 18, fontWeight: 600 }}>{value}</span>
                    ) : (
                      <span style={{ color: '#475569', fontSize: 14 }}>?</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Index labels */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {[...Array(Math.max(5, sortedDisplay.length + 1))].map((_, i) => (
            <div key={i} style={{ width: 60, textAlign: 'center' }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>[{i}]</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#64748b', fontSize: 13 }}>当前编码: </span>
          <span style={{ color: ENCODING_CONFIG[currentEncoding].color, fontSize: 15, fontWeight: 600 }}>
            {currentEncoding}
          </span>
        </div>
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#64748b', fontSize: 13 }}>已插入: </span>
          <span style={{ color: '#22c55e', fontSize: 15, fontWeight: 600 }}>
            {insertedValues.length} / {values.length}
          </span>
        </div>
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#64748b', fontSize: 13 }}>元素大小: </span>
          <span style={{ color: '#f97316', fontSize: 15, fontWeight: 600 }}>
            {ENCODING_CONFIG[currentEncoding].bytes} bytes
          </span>
        </div>
      </div>

      {/* Process steps */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        {[
          { label: '检查编码', active: currentValueProgress < 20 },
          { label: '查找位置', active: currentValueProgress >= 20 && currentValueProgress < 35 },
          { label: '扩容决策', active: currentValueProgress >= 35 && currentValueProgress < 50 },
          { label: '插入元素', active: currentValueProgress >= 50 },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: step.active ? '#3b82f6' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.active ? '#fff' : '#64748b',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <span style={{ color: step.active ? '#f8fafc' : '#64748b', fontSize: 13 }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom info */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div style={{ color: '#475569', fontSize: 13 }}>
          {totalDuration} 帧 @ {fps} fps | 约 {Math.round(totalDuration / fps)}s
        </div>
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '4px 12px',
            borderRadius: 4,
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#64748b', fontSize: 12 }}>循环播放</span>
        </div>
      </div>

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 25,
          color: '#475569',
          fontSize: 13,
        }}
      >
        帧: {frame}
      </div>
    </AbsoluteFill>
  );
};

export default BatchOperationsVideo;