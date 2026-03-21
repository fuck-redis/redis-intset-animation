import React, { useMemo, useRef } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';
import './AnimationControls.css';

interface AnimationControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  animationSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onSeekToStep: (step: number) => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  isPaused,
  currentStep,
  totalSteps,
  animationSpeed,
  onPlay,
  onPause,
  onResume,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onSeekToStep,
  canStepForward,
  canStepBackward,
}) => {
  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    return (currentStep / totalSteps) * 100;
  }, [currentStep, totalSteps]);

  const dragRef = useRef<HTMLDivElement>(null);

  const seekByClientX = (clientX: number) => {
    if (!dragRef.current || totalSteps === 0) return;
    const rect = dragRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const targetStep = Math.round(ratio * totalSteps);
    onSeekToStep(targetStep);
  };

  const beginPointerDrag = (pointerId: number) => {
    const track = dragRef.current;
    if (!track) return;
    track.setPointerCapture(pointerId);

    const onMove = (event: PointerEvent) => seekByClientX(event.clientX);
    const onUp = () => {
      track.releasePointerCapture(pointerId);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
    };

    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
  };

  const handleProgressPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    seekByClientX(event.clientX);
    beginPointerDrag(event.pointerId);
  };

  const handlePlayControl = () => {
    if (!isPlaying) {
      onPlay();
      return;
    }

    if (isPaused) {
      onResume();
      return;
    }

    onPause();
  };

  return (
    <div className="animation-controls">
      <div className="controls-main">
        <div className="controls-left">
          <h4 className="controls-title">分步播放控制</h4>
          <div className="step-indicator">
            {currentStep}/{totalSteps}
          </div>
        </div>

        <div className="controls-buttons">
          <button className="control-btn" onClick={onStepBackward} disabled={!canStepBackward} title="上一步（←）">
            <StepBack size={16} />
            <span>上一步 (←)</span>
          </button>

          <button className="control-btn" onClick={() => onSeekToStep(0)} disabled={!canStepBackward} title="回到起点">
            <SkipBack size={16} />
            <span>起点</span>
          </button>

          <button
            className={`control-btn primary ${isPlaying && !isPaused ? 'pause' : ''}`}
            onClick={handlePlayControl}
            disabled={totalSteps === 0}
            title="播放/暂停（Space）"
          >
            {isPlaying && !isPaused ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying && !isPaused ? '暂停 (Space)' : '播放 (Space)'}</span>
          </button>

          <button className="control-btn" onClick={() => onSeekToStep(totalSteps)} disabled={!canStepForward} title="跳到终点">
            <SkipForward size={16} />
            <span>终点</span>
          </button>

          <button className="control-btn" onClick={onStepForward} disabled={!canStepForward} title="下一步（→）">
            <StepForward size={16} />
            <span>下一步 (→)</span>
          </button>

          <button className="control-btn" onClick={onReset} disabled={totalSteps === 0} title="重置（R）">
            <RotateCcw size={16} />
            <span>重置 (R)</span>
          </button>
        </div>

        <div className="speed-group">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`speed-chip ${animationSpeed === speed ? 'active' : ''}`}
              onClick={() => onSpeedChange(speed)}
            >
              {speed.toFixed(speed % 1 === 0 ? 0 : 2)}x
            </button>
          ))}
        </div>
      </div>

      <div className="progress-wrapper">
        <div
          className="progress-track"
          ref={dragRef}
          onPointerDown={handleProgressPointerDown}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          tabIndex={0}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <div className="progress-thumb" style={{ left: `${progress}%` }} />

          {totalSteps > 1 && (
            <div className="progress-ticks">
              {Array.from({ length: totalSteps + 1 }, (_, index) => (
                <span key={index} className="tick" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
