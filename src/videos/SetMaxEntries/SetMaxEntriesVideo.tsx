import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

export const SetMaxEntriesSchema = z.object({
  threshold: z.number().default(512),
});

type Props = z.infer<typeof SetMaxEntriesSchema>;

export const SetMaxEntriesVideo: React.FC<Props> = ({
  threshold = 512,
}) => {
  const frame = useCurrentFrame();

  // Animation phases
  const introDuration = 45;
  const configShowDuration = 60;
  const elementAddDuration = 180;
  const triggerDuration = 90;
  const conversionDuration = 90;
  const outroDuration = 45;

  let phaseEnd = introDuration;
  const configShowEnd = phaseEnd + configShowDuration;
  phaseEnd = configShowEnd;
  const elementAddEnd = phaseEnd + elementAddDuration;
  phaseEnd = elementAddEnd;
  const triggerEnd = phaseEnd + triggerDuration;
  phaseEnd = triggerEnd;
  const conversionEnd = phaseEnd + conversionDuration;
  const totalDuration = conversionEnd + outroDuration;

  // Calculate how many elements to show based on frame
  const elementsToShow = interpolate(
    frame,
    [configShowEnd, elementAddEnd],
    [0, threshold],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentCount = Math.floor(elementsToShow);

  // Check if conversion is happening
  const isConverting = frame >= triggerEnd && frame < conversionEnd;
  const conversionComplete = frame >= conversionEnd;

  // Generate sample data
  const generateElements = (count: number): number[] => {
    const elements: number[] = [];
    for (let i = 0; i < count; i++) {
      // Generate integers within INT16 range for demo
      elements.push(Math.floor((i * 37) % 1000));
    }
    return elements;
  };

  const elements = generateElements(Math.min(currentCount, threshold + 10));

  // Threshold indicator positions
  const thresholdY = 400;

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
          set-max-intset-entries 配置演示
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18, marginTop: 6 }}>
          Redis IntSet 转换为 HashTable 的阈值设置
        </p>
      </div>

      {/* Config display */}
      {frame >= introDuration && frame < elementAddEnd && (
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '16px 40px',
              borderRadius: 12,
              gap: 20,
              opacity: frame < configShowEnd ? 1 : 0.6,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 20 }}>redis.conf 配置:</span>
            <span
              style={{
                color: '#22c55e',
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'monospace',
                backgroundColor: '#0f172a',
                padding: '4px 16px',
                borderRadius: 6,
              }}
            >
              set-max-intset-entries {threshold}
            </span>
          </div>
        </div>
      )}

      {/* Threshold line visualization */}
      <div
        style={{
          position: 'absolute',
          top: thresholdY - 30,
          left: 100,
          right: 100,
          height: 2,
          backgroundColor: '#ef4444',
          opacity: 0.6,
        }}
      />

      {/* Threshold label */}
      <div
        style={{
          position: 'absolute',
          top: thresholdY - 55,
          left: 100,
          right: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
          阈值: {threshold}
        </span>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          超过此值则转换为 HashTable
        </span>
      </div>

      {/* Element visualization */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          bottom: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Counter display */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#1e293b',
            padding: '12px 32px',
            borderRadius: 10,
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: 18 }}>元素数量:</span>
          <span
            style={{
              color: currentCount > threshold ? '#ef4444' : '#3b82f6',
              fontSize: 36,
              fontWeight: 700,
              fontFamily: 'monospace',
              transition: 'color 0.3s',
            }}
          >
            {currentCount}
          </span>
        </div>

        {/* Element grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            maxWidth: 900,
            maxHeight: 300,
            overflow: 'hidden',
          }}
        >
          {elements.slice(0, Math.min(elements.length, 600)).map((value, index) => {
            const row = Math.floor(index / 30);
            const col = index % 30;
            const isAboveThreshold = index >= threshold;

            // Animation delay for each element
            const delay = index / 10;
            const isVisible = frame >= configShowEnd + delay;

            return (
              <div
                key={index}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: isAboveThreshold
                    ? `rgba(239, 68, 68, ${Math.max(0.3, 1 - (index - threshold) / 100)})`
                    : '#3b82f6',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  color: '#fff',
                  fontFamily: 'monospace',
                  opacity: isVisible ? 1 : 0,
                  transform: `scale(${isVisible ? 1 : 0})`,
                  transition: 'all 0.1s',
                }}
              >
                {col === 0 && row < 10 ? value : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold exceeded warning */}
      {frame >= elementAddEnd && frame < conversionEnd && (
        <div style={{ position: 'absolute', bottom: 180, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#7c2d12',
              padding: '16px 40px',
              borderRadius: 12,
              border: '2px solid #ef4444',
              gap: 16,
              animation: 'pulse 0.5s infinite',
            }}
          >
            <span style={{ color: '#ef4444', fontSize: 24 }}>!</span>
            <span style={{ color: '#f8fafc', fontSize: 20, fontWeight: 600 }}>
              元素数量 ({currentCount}) 超过阈值 ({threshold})
            </span>
          </div>
        </div>
      )}

      {/* Conversion animation */}
      {isConverting && (
        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#1e293b',
              padding: '12px 32px',
              borderRadius: 8,
            }}
          >
            <span style={{ color: '#f97316', fontSize: 18 }}>
              🔄 IntSet → HashTable 转换中...
            </span>
          </div>
        </div>
      )}

      {/* Conversion complete */}
      {conversionComplete && (
        <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#14532d',
              padding: '12px 32px',
              borderRadius: 8,
              border: '1px solid #22c55e',
            }}
          >
            <span style={{ color: '#22c55e', fontSize: 18 }}>
              ✅ 转换完成! IntSet 已转换为 HashTable
            </span>
          </div>
        </div>
      )}

      {/* Key insight box */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#1e3a5f',
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid #3b82f6',
            gap: 12,
          }}
        >
          <span style={{ color: '#3b82f6', fontSize: 16, fontWeight: 600 }}>💡</span>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>
            调整 set-max-intset-entries 可以平衡内存使用与性能
          </span>
          <span style={{ color: '#f8fafc', fontSize: 14, fontFamily: 'monospace' }}>
            (默认: 512, 范围: 1-2147483647)
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
        {totalDuration} 帧 @ 30fps
      </div>
    </AbsoluteFill>
  );
};

export default SetMaxEntriesVideo;