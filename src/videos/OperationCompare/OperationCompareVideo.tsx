import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const OperationCompareSchema = z.object({});

type Props = z.infer<typeof OperationCompareSchema>;

export const OperationCompareVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Animation phases
  const introDuration = 30;
  const tableHeaderDuration = 40;
  const row1Duration = 35;
  const row2Duration = 35;
  const row3Duration = 35;
  const row4Duration = 35;
  const outroDuration = 50;
  const totalDuration = introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration + row4Duration + outroDuration;

  // Calculate animation progress for each row
  const headerProgress = interpolate(
    frame,
    [introDuration, introDuration + tableHeaderDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const row1Progress = interpolate(
    frame,
    [introDuration + tableHeaderDuration, introDuration + tableHeaderDuration + row1Duration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const row2Progress = interpolate(
    frame,
    [
      introDuration + tableHeaderDuration + row1Duration,
      introDuration + tableHeaderDuration + row1Duration + row2Duration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const row3Progress = interpolate(
    frame,
    [
      introDuration + tableHeaderDuration + row1Duration + row2Duration,
      introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const row4Progress = interpolate(
    frame,
    [
      introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration,
      introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration + row4Duration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const outroProgress = interpolate(
    frame,
    [
      introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration + row4Duration,
      introDuration + tableHeaderDuration + row1Duration + row2Duration + row3Duration + row4Duration + outroDuration
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const tableData = [
    { operation: '插入', intSet: 'O(n)', hashTable: 'O(1)', intSetColor: '#f97316', hashTableColor: '#22c55e' },
    { operation: '查找', intSet: 'O(log n)', hashTable: 'O(1)', intSetColor: '#3b82f6', hashTableColor: '#22c55e' },
    { operation: '删除', intSet: 'O(n)', hashTable: 'O(1)', intSetColor: '#f97316', hashTableColor: '#22c55e' },
    { operation: '内存占用', intSet: '极小', hashTable: '较大', intSetColor: '#22c55e', hashTableColor: '#f97316' },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 32, fontWeight: 700, margin: 0 }}>
          操作复杂度对比
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 8 }}>
          IntSet vs HashTable - 各项操作的时间复杂度和资源消耗
        </p>
      </div>

      {/* Table Container */}
      <div style={{
        position: 'absolute',
        top: 130,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        {/* Table */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: 12,
          padding: 24,
          border: '1px solid #334155',
          minWidth: 600,
        }}>
          {/* Header Row */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #3b82f6',
            paddingBottom: 12,
            marginBottom: 8,
            opacity: headerProgress,
            transform: `translateY(${(1 - headerProgress) * -20}px)`,
          }}>
            <div style={{ flex: 1.5, color: '#f8fafc', fontWeight: 700, fontSize: 16 }}>操作</div>
            <div style={{ flex: 1, color: '#3b82f6', fontWeight: 700, fontSize: 16, textAlign: 'center' }}>IntSet</div>
            <div style={{ flex: 1, color: '#8b5cf6', fontWeight: 700, fontSize: 16, textAlign: 'center' }}>HashTable</div>
          </div>

          {/* Data Rows */}
          {tableData.map((row, index) => {
            const progress = [row1Progress, row2Progress, row3Progress, row4Progress][index];
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  padding: '14px 0',
                  backgroundColor: isEven ? 'transparent' : 'rgba(30, 41, 59, 0.5)',
                  borderRadius: 8,
                  marginBottom: 4,
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 20}px)`,
                }}
              >
                <div style={{ flex: 1.5, color: '#f8fafc', fontWeight: 600, fontSize: 15 }}>{row.operation}</div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 600,
                  color: row.intSetColor,
                }}>
                  {row.intSet}
                </div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 600,
                  color: row.hashTableColor,
                }}>
                  {row.hashTable}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
        opacity: outroProgress,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 3 }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>O(1) - 常数时间</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 3 }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>O(log n) - 对数时间</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#f97316', borderRadius: 3 }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>O(n) - 线性时间</span>
        </div>
      </div>

      {/* Key insight */}
      <div style={{
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: outroProgress,
      }}>
        <div style={{
          backgroundColor: '#1e3a5f',
          padding: '10px 20px',
          borderRadius: 8,
          border: '1px solid #3b82f6',
        }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>提示</span>:
            当数据量 n ≤ 512 时，O(log n) 与 O(1) 实际差异微乎其微
          </span>
        </div>
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
        {totalDuration} 帧
      </div>
    </AbsoluteFill>
  );
};

export default OperationCompareVideo;