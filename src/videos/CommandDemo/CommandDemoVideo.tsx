import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { z } from 'zod';

type Props = z.infer<typeof CommandDemoSchema>;

// Default schema - uses demo data
export const CommandDemoSchema = z.object({
  // Using default demo data
});

const CommandDemoVideo: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  // Timeline (in frames, 30fps)
  const totalDuration = 480;    // 16 seconds

  // Terminal lines animation
  const line1Visible = frame >= 20;
  const line1Complete = frame >= 70;
  const line2Visible = frame >= 90;
  const line2Complete = frame >= 150;
  const line3Visible = frame >= 170;
  const line3Complete = frame >= 230;
  const line4Visible = frame >= 250;
  const line5Visible = frame >= 290;
  const line5Complete = frame >= 360;
  const line6Visible = frame >= 370;
  const line6Complete = frame >= 440;

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Text typing animation helper
  const getTypingProgress = (start: number, end: number) => {
    return interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // Fade in animation helper
  const getFadeIn = (start: number) => {
    return interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        overflow: 'hidden',
      }}
    >
      {/* Terminal header bar */}
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27ca40' }} />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#666',
            fontSize: 13,
          }}
        >
          redis-cli
        </div>
      </div>

      {/* Terminal content */}
      <div
        style={{
          padding: '24px 32px',
          color: '#e0e0e0',
          fontSize: 15,
          lineHeight: 1.8,
        }}
      >
        {/* Welcome message */}
        <div style={{ color: '#888', marginBottom: 16 }}>
          Redis 7.0.11 (Powered by RedisIntSet Visualization)
        </div>

        {/* Command 1: SADD for intset */}
        {line1Visible && (
          <div style={{ opacity: getFadeIn(20) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>
              {'SADD numbers '.slice(0, Math.floor(getTypingProgress(20, 60) * 14))}
            </span>
            {frame < 60 && cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
        {line1Complete && (
          <div style={{ opacity: getFadeIn(70) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>SADD numbers 1 2 3 4 5</span>
          </div>
        )}

        {/* Result 1 */}
        {line1Complete && (
          <div style={{ opacity: getFadeIn(75), color: '#27ca40', marginLeft: 20 }}>
            (integer) 5
          </div>
        )}

        {/* Empty line */}
        <div style={{ height: 12 }} />

        {/* Command 2: OBJECT ENCODING for intset */}
        {line2Visible && (
          <div style={{ opacity: getFadeIn(90) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>
              {'OBJECT ENCODING numbers'.slice(0, Math.floor(getTypingProgress(90, 130) * 21))}
            </span>
            {frame < 130 && cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
        {line2Complete && (
          <div style={{ opacity: getFadeIn(150) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>OBJECT ENCODING numbers</span>
          </div>
        )}

        {/* Result 2: intset */}
        {line2Complete && (
          <div style={{ opacity: getFadeIn(155), color: '#8b5cf6', marginLeft: 20 }}>
            "intset"
          </div>
        )}

        {/* Empty line */}
        <div style={{ height: 12 }} />

        {/* Command 3: MEMORY USAGE for intset */}
        {line3Visible && (
          <div style={{ opacity: getFadeIn(170) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>
              {'MEMORY USAGE numbers'.slice(0, Math.floor(getTypingProgress(170, 210) * 20))}
            </span>
            {frame < 210 && cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
        {line3Complete && (
          <div style={{ opacity: getFadeIn(230) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>MEMORY USAGE numbers</span>
          </div>
        )}

        {/* Result 3: memory usage for intset */}
        {line3Complete && (
          <div style={{ opacity: getFadeIn(235), color: '#22c55e', marginLeft: 20 }}>
            (integer) 94
            <span style={{ color: '#666', fontSize: 13 }}>  # 5个整数的IntSet内存占用</span>
          </div>
        )}

        {/* Separator comment */}
        {line4Visible && (
          <div style={{ opacity: getFadeIn(250), color: '#666', marginTop: 20, fontStyle: 'italic' as const }}>
            {/* --- HashTable comparison --- */}
          </div>
        )}

        {/* Empty line */}
        {line4Visible && <div style={{ height: 12 }} />}

        {/* Command 4: SADD for hashtable (with string element) */}
        {line5Visible && (
          <div style={{ opacity: getFadeIn(290) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>
              {'SADD mixedset 1 2 3 "hello"'.slice(0, Math.floor(getTypingProgress(290, 340) * 26))}
            </span>
            {frame < 340 && cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
        {line5Complete && (
          <div style={{ opacity: getFadeIn(360) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>SADD mixedset 1 2 3 "hello"</span>
          </div>
        )}

        {/* Result 4 */}
        {line5Complete && (
          <div style={{ opacity: getFadeIn(365), color: '#27ca40', marginLeft: 20 }}>
            (integer) 4
          </div>
        )}

        {/* Empty line */}
        <div style={{ height: 12 }} />

        {/* Command 5: OBJECT ENCODING for hashtable */}
        {line6Visible && (
          <div style={{ opacity: getFadeIn(370) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>
              {'OBJECT ENCODING mixedset'.slice(0, Math.floor(getTypingProgress(370, 410) * 22))}
            </span>
            {frame < 410 && cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
        {line6Complete && (
          <div style={{ opacity: getFadeIn(440) }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            <span style={{ color: '#e0e0e0' }}>OBJECT ENCODING mixedset</span>
          </div>
        )}

        {/* Result 5: hashtable */}
        {line6Complete && (
          <div style={{ opacity: getFadeIn(445), color: '#f97316', marginLeft: 20 }}>
            "hashtable"
            <span style={{ color: '#666', fontSize: 13 }}>  # 包含字符串元素，触发转换</span>
          </div>
        )}

        {/* Final cursor */}
        {line6Complete && (
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#27ca40' }}>redis-cli&gt; </span>
            {cursorVisible && (
              <span style={{ backgroundColor: '#27ca40', color: '#0a0a0a' }}>|</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1a1a',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #2a2a2a',
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ color: '#27ca40', fontSize: 12 }}>
            <span style={{ color: '#666' }}>IntSet: </span>intset
          </span>
          <span style={{ color: '#f97316', fontSize: 12 }}>
            <span style={{ color: '#666' }}>HashTable: </span>hashtable
          </span>
        </div>
        <div style={{ color: '#666', fontSize: 12 }}>
          OBJECT ENCODING | MEMORY USAGE
        </div>
      </div>

      {/* Frame counter (for debugging) */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          right: 15,
          color: '#333',
          fontSize: 11,
        }}
      >
        {frame}/{totalDuration}
      </div>
    </AbsoluteFill>
  );
};

export default CommandDemoVideo;
