import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationSequence, AnimationStep, IntSetState } from '../types/intset';

interface AnimationPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentState: IntSetState | null;
  currentStepData: AnimationStep | null;
}

export const useAnimationPlayer = (animationSpeed: number) => {
  const [state, setState] = useState<AnimationPlayerState>({
    isPlaying: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    currentState: null,
    currentStepData: null,
  });

  const animationRef = useRef<AnimationSequence | null>(null);
  const timerRef = useRef<number | null>(null);

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 加载新动画
  const loadAnimation = useCallback((animation: AnimationSequence) => {
    clearTimer();
    animationRef.current = animation;
    setState({
      isPlaying: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: animation.steps.length,
      currentState: animation.initialState,
      currentStepData: null,
    });
  }, [clearTimer]);

  // 执行单个步骤
  const executeStep = useCallback((stepIndex: number) => {
    if (!animationRef.current) return null;

    const animation = animationRef.current;
    if (stepIndex < 0 || stepIndex >= animation.steps.length) return null;

    const step = animation.steps[stepIndex];
    
    // 根据步骤更新状态
    let newState = state.currentState || animation.initialState;
    
    // 如果是最后一步，使用最终状态
    if (stepIndex === animation.steps.length - 1) {
      newState = animation.finalState;
    }

    return {
      state: newState,
      stepData: step,
    };
  }, [state.currentState]);

  // 前进一步
  const stepForward = useCallback(() => {
    if (!animationRef.current) return;
    if (state.currentStep >= state.totalSteps) return;

    const result = executeStep(state.currentStep);
    if (result) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        currentState: result.state,
        currentStepData: result.stepData,
      }));
    }
  }, [state.currentStep, state.totalSteps, executeStep]);

  // 后退一步
  const stepBackward = useCallback(() => {
    if (!animationRef.current) return;
    if (state.currentStep <= 0) return;

    const newStep = state.currentStep - 1;
    const result = executeStep(newStep - 1);
    
    setState(prev => ({
      ...prev,
      currentStep: newStep,
      currentState: result?.state || animationRef.current!.initialState,
      currentStepData: result?.stepData || null,
    }));
  }, [state.currentStep, executeStep]);

  // 播放动画
  const play = useCallback(() => {
    if (!animationRef.current) return;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));

    const playNextStep = () => {
      setState(prev => {
        if (prev.currentStep >= prev.totalSteps) {
          // 动画结束
          return {
            ...prev,
            isPlaying: false,
            isPaused: false,
          };
        }

        const result = executeStep(prev.currentStep);
        if (!result) {
          return {
            ...prev,
            isPlaying: false,
            isPaused: false,
          };
        }

        const step = result.stepData;
        const delay = step.duration / animationSpeed;

        // 安排下一步
        timerRef.current = setTimeout(playNextStep, delay);

        return {
          ...prev,
          currentStep: prev.currentStep + 1,
          currentState: result.state,
          currentStepData: step,
        };
      });
    };

    playNextStep();
  }, [animationSpeed, executeStep]);

  // 暂停
  const pause = useCallback(() => {
    clearTimer();
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [clearTimer]);

  // 继续播放
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
    play();
  }, [play]);

  // 重置
  const reset = useCallback(() => {
    clearTimer();
    if (animationRef.current) {
      setState({
        isPlaying: false,
        isPaused: false,
        currentStep: 0,
        totalSteps: animationRef.current.steps.length,
        currentState: animationRef.current.initialState,
        currentStepData: null,
      });
    }
  }, [clearTimer]);

  // 清理
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    ...state,
    loadAnimation,
    play,
    pause,
    resume,
    reset,
    stepForward,
    stepBackward,
    canStepForward: state.currentStep < state.totalSteps,
    canStepBackward: state.currentStep > 0,
  };
};
