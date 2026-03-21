import React from 'react';
import {
  AnimationStep,
  CodeLanguage,
  IntSetOperation,
  IntSetState,
  IntSetStats,
  LearningScenario,
  OperationParams,
} from '../../types/intset';
import VisualizationArea from '../VisualizationArea/VisualizationArea';
import ControlPanel from '../ControlPanel/ControlPanel';
import AnimationControls from '../AnimationControls/AnimationControls';
import CodeDebugger from '../CodeDebugger/CodeDebugger';
import StepInsights from '../StepInsights/StepInsights';
import './MainLayout.css';

interface AnimationPlayer {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: AnimationStep | null;
  currentOperation: IntSetOperation | null;
  play: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  seekToStep: (step: number) => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

interface MainLayoutProps {
  intSetState: IntSetState;
  stats: IntSetStats;
  isAnimating: boolean;
  animationSpeed: number;
  animationPlayer: AnimationPlayer;
  codeLanguage: CodeLanguage;
  onCodeLanguageChange: (language: CodeLanguage) => void;
  onOperation: (operation: IntSetOperation, params: OperationParams) => Promise<void>;
  onSpeedChange: (speed: number) => void;
  onExecuteScenario: (scenario: LearningScenario) => Promise<void>;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  intSetState,
  stats,
  isAnimating,
  animationSpeed,
  animationPlayer,
  codeLanguage,
  onCodeLanguageChange,
  onOperation,
  onSpeedChange,
  onExecuteScenario,
}) => {
  return (
    <div className="main-layout">
      <div className="main-container">
        <section className="visualization-section">
          <VisualizationArea intSetState={intSetState} currentStepData={animationPlayer.currentStepData} />
        </section>

        <aside className="control-panel">
          <ControlPanel
            stats={stats}
            isAnimating={isAnimating}
            currentEncoding={intSetState.encoding}
            onOperation={onOperation}
            onExecuteScenario={onExecuteScenario}
          />

          <CodeDebugger
            operation={animationPlayer.currentOperation}
            step={animationPlayer.currentStepData}
            language={codeLanguage}
            onLanguageChange={onCodeLanguageChange}
          />

          <StepInsights
            operation={animationPlayer.currentOperation}
            currentStep={animationPlayer.currentStep}
            totalSteps={animationPlayer.totalSteps}
            step={animationPlayer.currentStepData}
            state={intSetState}
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
          onSeekToStep={animationPlayer.seekToStep}
        />
      </div>
    </div>
  );
};

export default MainLayout;
