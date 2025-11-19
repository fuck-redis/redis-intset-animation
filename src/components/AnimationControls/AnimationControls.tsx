import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  StepBack,
  StepForward,
  RotateCcw,
} from 'lucide-react';
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
  canStepForward: boolean;
  canStepBackward: boolean;
}

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
  canStepForward,
  canStepBackward,
}) => {
  return (
    <div className="animation-controls">
      <div className="controls-header">
        <h4 className="controls-title">动画控制</h4>
        {totalSteps > 0 && (
          <div className="step-indicator">
            步骤 {currentStep}/{totalSteps}
          </div>
        )}
      </div>

      <div className="controls-buttons">
        {/* 重置按钮 */}
        <button
          className="control-btn reset-btn"
          onClick={onReset}
          disabled={totalSteps === 0 || (currentStep === 0 && !isPlaying)}
          title="重置动画"
        >
          <RotateCcw size={18} />
        </button>

        {/* 后退一步 */}
        <button
          className="control-btn"
          onClick={onStepBackward}
          disabled={!canStepBackward}
          title="后退一步"
        >
          <StepBack size={18} />
        </button>

        {/* 快退到开始 */}
        <button
          className="control-btn"
          onClick={onReset}
          disabled={!canStepBackward}
          title="回到开始"
        >
          <SkipBack size={18} />
        </button>

        {/* 播放/暂停/继续 */}
        {!isPlaying ? (
          <button
            className="control-btn play-btn"
            onClick={onPlay}
            disabled={totalSteps === 0}
            title="播放动画"
          >
            <Play size={20} />
          </button>
        ) : isPaused ? (
          <button
            className="control-btn play-btn"
            onClick={onResume}
            title="继续播放"
          >
            <Play size={20} />
          </button>
        ) : (
          <button
            className="control-btn pause-btn"
            onClick={onPause}
            title="暂停播放"
          >
            <Pause size={20} />
          </button>
        )}

        {/* 快进到结束 */}
        <button
          className="control-btn"
          onClick={() => {
            // 跳到最后一步
            while (canStepForward) {
              onStepForward();
            }
          }}
          disabled={!canStepForward}
          title="快进到结束"
        >
          <SkipForward size={18} />
        </button>

        {/* 前进一步 */}
        <button
          className="control-btn"
          onClick={onStepForward}
          disabled={!canStepForward}
          title="前进一步"
        >
          <StepForward size={18} />
        </button>
      </div>

      {/* 速度控制 */}
      <div className="speed-control">
        <label className="speed-label">播放速度</label>
        <div className="speed-slider-container">
          <span className="speed-mark">0.5x</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animationSpeed}
            onChange={e => onSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <span className="speed-mark">2.0x</span>
        </div>
        <div className="speed-value">{animationSpeed.toFixed(1)}x</div>
      </div>

      {/* 进度条 */}
      {totalSteps > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            {Math.round((currentStep / totalSteps) * 100)}% 完成
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationControls;
