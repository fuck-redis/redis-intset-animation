import React from 'react';
import { IntSetState, IntSetOperation, OperationParams, IntSetStats, LearningScenario } from '../../types/intset';
import VisualizationArea from '../VisualizationArea/VisualizationArea';
import ControlPanel from '../ControlPanel/ControlPanel';
import AnimationControls from '../AnimationControls/AnimationControls';
import './MainLayout.css';

interface AnimationPlayer {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  play: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

interface MainLayoutProps {
  intSetState: IntSetState;
  stats: IntSetStats;
  isAnimating: boolean;
  animationSpeed: number;
  animationPlayer: AnimationPlayer;
  onOperation: (operation: IntSetOperation, params: OperationParams) => void;
  onSpeedChange: (speed: number) => void;
  onExecuteScenario: (scenario: LearningScenario) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  intSetState,
  stats,
  isAnimating,
  animationSpeed,
  animationPlayer,
  onOperation,
  onSpeedChange,
  onExecuteScenario,
}) => {
  return (
    <div className="main-layout">
      <div className="main-container">
        <section className="visualization-section">
          <VisualizationArea 
            intSetState={intSetState}
            isAnimating={isAnimating}
          />
        </section>
        
        <aside className="control-panel">
          <ControlPanel 
            stats={stats}
            isAnimating={isAnimating}
            animationSpeed={animationSpeed}
            animationPlayer={animationPlayer}
            currentEncoding={intSetState.encoding}
            onOperation={onOperation}
            onSpeedChange={onSpeedChange}
            onExecuteScenario={onExecuteScenario}
          />
        </aside>
      </div>
      
      <div className="animation-controls-bottom">
        <AnimationControls
          isPlaying={animationPlayer.isPlaying}
          isPaused={animationPlayer.isPaused}
          currentStep={animationPlayer.currentStep}
          totalSteps={animationPlayer.totalSteps}
          canStepForward={animationPlayer.canStepForward}
          canStepBackward={animationPlayer.canStepBackward}
          animationSpeed={animationSpeed}
          onPlay={animationPlayer.play}
          onPause={animationPlayer.pause}
          onResume={animationPlayer.resume}
          onStepForward={animationPlayer.stepForward}
          onStepBackward={animationPlayer.stepBackward}
          onReset={animationPlayer.reset}
          onSpeedChange={onSpeedChange}
        />
      </div>
    </div>
  );
};

export default MainLayout;
