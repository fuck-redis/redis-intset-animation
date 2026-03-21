import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { OperationSchema } from '../types';
import type z from 'zod';

type Props = z.infer<typeof OperationSchema>;

export const DeleteOperationVideo: React.FC<Props> = ({
  value,
  initialData,
}) => {
  const frame = useCurrentFrame();

  const sortedData = [...new Set(initialData)].sort((a: number, b: number) => a - b);

  // Find deletion position
  let deletePos = -1;
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i] === value) {
      deletePos = i;
      break;
    }
  }
  const found = deletePos !== -1;

  // Animation phases
  const introDuration = 30;
  const searchDuration = 45;
  const markDuration = 45;
  const shiftDuration = 60;
  const outroDuration = 30;

  let phaseEnd = introDuration;
  const searchEnd = phaseEnd + sortedData.length * searchDuration;
  phaseEnd = searchEnd;
  const markEnd = found ? phaseEnd + markDuration : phaseEnd;
  phaseEnd = markEnd;
  const shiftEnd = found && deletePos < sortedData.length - 1 ? phaseEnd + shiftDuration : phaseEnd;
  const totalDuration = shiftEnd + outroDuration;

  const searchProgress = interpolate(
    frame,
    [introDuration, searchEnd],
    [0, sortedData.length],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentSearchIndex = Math.floor(searchProgress);

  const shiftProgress = interpolate(
    frame,
    [markEnd, shiftEnd],
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
          删除操作 (Delete Operation)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          intsetRemove: 二分查找 → 标记删除 → 左移元素
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
          <span style={{ color: '#94a3b8', fontSize: 18 }}>删除值:</span>
          <span
            style={{
              color: '#ef4444',
              fontSize: 32,
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Array with animation */}
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
              const isMarked = found && i === deletePos && frame >= searchEnd;
              const isMoving =
                found && i > deletePos && i < sortedData.length && frame >= markEnd && frame < shiftEnd;

              const offsetX = isMoving ? -shiftProgress * 82 : 0;
              const scale = isSearching ? 1.1 : isMarked ? 0.5 : 1;

              const bgColor = isMarked ? '#ef4444' : isSearching ? '#3b82f6' : '#1e293b';

              return (
                <div
                  key={i}
                  style={{
                    width: 70,
                    height: 80,
                    backgroundColor: bgColor,
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translateX(${offsetX}px) scale(${scale})`,
                    boxShadow: isSearching
                      ? '0 0 20px rgba(59, 130, 246, 0.6)'
                      : isMarked
                      ? '0 0 20px rgba(239, 68, 68, 0.6)'
                      : 'none',
                    border:
                      isSearching
                        ? '2px solid #60a5fa'
                        : isMarked
                        ? '2px solid #f87171'
                        : '2px solid #334155',
                    opacity: isMarked && frame >= markEnd ? 0.3 : 1,
                    transition: 'opacity 0.2s',
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
          </div>

          {/* Delete position indicator */}
          {found && frame >= searchEnd && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ef4444', fontSize: 14 }}>删除位置: {deletePos}</span>
            </div>
          )}

          {/* Not found indicator */}
          {!found && frame >= searchEnd && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fbbf24', fontSize: 14 }}>未找到值 {value}，删除取消</span>
            </div>
          )}
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
          { label: '标记删除', active: frame >= searchEnd && frame < markEnd && found },
          { label: '左移元素', active: frame >= markEnd && frame < shiftEnd && found },
          { label: '完成', active: frame >= shiftEnd },
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

export default DeleteOperationVideo;
