import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { OperationSchema } from '../types';
import type z from 'zod';

type Props = z.infer<typeof OperationSchema>;

export const InsertOperationVideo: React.FC<Props> = ({
  value,
  initialData,
}) => {
  const frame = useCurrentFrame();

  const sortedData = [...new Set(initialData)].sort((a: number, b: number) => a - b);

  // Find insertion position
  let insertPos = 0;
  for (let i = 0; i < sortedData.length; i++) {
    if ((sortedData[i] as number) < value) insertPos = i + 1;
  }
  const hasDuplicate = sortedData.includes(value);

  // Animation phases
  const introDuration = 30;
  const searchDuration = 45;
  const shiftDuration = 60;
  const insertDuration = 45;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const searchEnd = phaseEnd + sortedData.length * searchDuration;
  phaseEnd = searchEnd;
  const shiftEnd = hasDuplicate ? phaseEnd : phaseEnd + shiftDuration;
  phaseEnd = shiftEnd;
  const insertEnd = hasDuplicate ? phaseEnd : phaseEnd + insertDuration;
  const totalDuration = insertEnd + outroDuration;

  const searchProgress = interpolate(
    frame,
    [introDuration, searchEnd],
    [0, sortedData.length],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const shiftProgress = interpolate(
    frame,
    [searchEnd, shiftEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const insertProgress = interpolate(
    frame,
    [shiftEnd, insertEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentSearchIndex = Math.floor(searchProgress);

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
          插入操作 (Insert Operation)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          intsetAdd: 二分查找 → 移动元素 → 插入新值
        </p>
      </div>

      {/* Target value */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#1e293b',
            padding: '12px 32px',
            borderRadius: 12,
            gap: 16,
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: 18 }}>插入值:</span>
          <span
            style={{
              color: '#f97316',
              fontSize: 32,
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Array visualization */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Elements row */}
          <div style={{ display: 'flex', gap: 12 }}>
            {sortedData.map((v, i) => {
              const isSearching = i === currentSearchIndex && frame < searchEnd;
              const isMoving = i >= insertPos && !hasDuplicate && frame >= searchEnd && frame < shiftEnd;

              const offsetX = isMoving ? shiftProgress * 82 : 0;
              const scale = isSearching ? 1.1 : 1;

              return (
                <div
                  key={i}
                  style={{
                    width: 70,
                    height: 80,
                    backgroundColor: isSearching ? '#3b82f6' : '#1e293b',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translateX(${offsetX}px) scale(${scale})`,
                    boxShadow: isSearching ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
                    border: isSearching ? '2px solid #60a5fa' : '2px solid #334155',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <span
                    style={{
                      color: '#f8fafc',
                      fontSize: 22,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  >
                    {v}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>[{i}]</span>
                </div>
              );
            })}

            {/* New element */}
            {!hasDuplicate && frame >= shiftEnd && (
              <div
                style={{
                  width: 70,
                  height: 80,
                  backgroundColor: '#22c55e',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: insertProgress,
                  transform: `scale(${insertProgress})`,
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: 22,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                  }}
                >
                  {value}
                </span>
                <span style={{ color: '#bbf7d0', fontSize: 12, marginTop: 4 }}>
                  [{insertPos}]
                </span>
              </div>
            )}

            {/* Empty slot */}
            {!hasDuplicate && frame < shiftEnd && (
              <div
                style={{
                  width: 70,
                  height: 80,
                  backgroundColor: '#1e293b',
                  borderRadius: 10,
                  border: '2px dashed #475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#475569', fontSize: 24 }}>?</span>
              </div>
            )}
          </div>

          {/* Insert position indicator */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 70,
                height: 2,
                backgroundColor: '#22c55e',
              }}
            />
            <span style={{ color: '#22c55e', fontSize: 14 }}>插入位置: {insertPos}</span>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {[
          { label: '二分查找', active: frame >= introDuration && frame < searchEnd },
          { label: '移动元素', active: frame >= searchEnd && frame < shiftEnd },
          { label: '写入新值', active: frame >= shiftEnd && frame < insertEnd },
          { label: '完成', active: frame >= insertEnd },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: step.active ? '#3b82f6' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.active ? '#fff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <span
              style={{
                color: step.active ? '#f8fafc' : '#64748b',
                fontSize: 14,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Complexity */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 40,
          backgroundColor: '#1e293b',
          padding: '8px 16px',
          borderRadius: 6,
        }}
      >
        <span style={{ color: '#64748b', fontSize: 13 }}>时间复杂度: </span>
        <span style={{ color: '#f97316', fontSize: 15, fontWeight: 600 }}>O(n)</span>
      </div>

      {/* Duplicate warning */}
      {hasDuplicate && frame >= searchEnd && (
        <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center' }}>
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
              ⚠️ 元素已存在，插入取消（IntSet 保证元素唯一）
            </span>
          </div>
        </div>
      )}

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

export default InsertOperationVideo;
