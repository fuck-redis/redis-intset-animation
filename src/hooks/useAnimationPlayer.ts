import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationSequence, AnimationStep, IntSetOperation, IntSetState } from '../types/intset';

interface AnimationPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentState: IntSetState | null;
  currentStepData: AnimationStep | null;
  currentOperation: IntSetOperation | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useAnimationPlayer = (animationSpeed: number) => {
  const [state, setState] = useState<AnimationPlayerState>({
    isPlaying: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    currentState: null,
    currentStepData: null,
    currentOperation: null,
  });

  const stateRef = useRef(state);
  const animationRef = useRef<AnimationSequence | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getSnapshotForStepCount = useCallback((stepCount: number) => {
    const animation = animationRef.current;
    if (!animation) return null;

    const clamped = clamp(stepCount, 0, animation.steps.length);
    if (clamped === 0) {
      return {
        currentStep: 0,
        currentStepData: null,
        currentState: animation.initialState,
      };
    }

    const activeStep = animation.steps[clamped - 1];
    const currentState =
      activeStep.data?.state ||
      (clamped === animation.steps.length ? animation.finalState : animation.initialState);

    return {
      currentStep: clamped,
      currentStepData: activeStep,
      currentState,
    };
  }, []);

  const loadAnimation = useCallback(
    (animation: AnimationSequence) => {
      clearTimer();
      animationRef.current = animation;
      setState({
        isPlaying: false,
        isPaused: false,
        currentStep: 0,
        totalSteps: animation.steps.length,
        currentState: animation.initialState,
        currentStepData: null,
        currentOperation: animation.operation,
      });
    },
    [clearTimer],
  );

  const stepForward = useCallback(() => {
    const animation = animationRef.current;
    if (!animation) return;

    const nextStepCount = stateRef.current.currentStep + 1;
    const snapshot = getSnapshotForStepCount(nextStepCount);
    if (!snapshot) return;

    setState((prev) => ({
      ...prev,
      ...snapshot,
    }));
  }, [getSnapshotForStepCount]);

  const stepBackward = useCallback(() => {
    const animation = animationRef.current;
    if (!animation) return;

    const nextStepCount = stateRef.current.currentStep - 1;
    const snapshot = getSnapshotForStepCount(nextStepCount);
    if (!snapshot) return;

    setState((prev) => ({
      ...prev,
      ...snapshot,
    }));
  }, [getSnapshotForStepCount]);

  const seekToStep = useCallback(
    (step: number) => {
      const snapshot = getSnapshotForStepCount(step);
      if (!snapshot) return;

      clearTimer();
      setState((prev) => ({
        ...prev,
        ...snapshot,
        isPlaying: false,
        isPaused: false,
      }));
    },
    [clearTimer, getSnapshotForStepCount],
  );

  const play = useCallback(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (stateRef.current.isPlaying && !stateRef.current.isPaused) return;
    if (stateRef.current.currentStep >= animation.steps.length) return;

    clearTimer();

    const advance = () => {
      const currentState = stateRef.current;
      if (currentState.currentStep >= currentState.totalSteps) {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
        }));
        clearTimer();
        return;
      }

      const snapshot = getSnapshotForStepCount(currentState.currentStep + 1);
      if (!snapshot) {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
        }));
        clearTimer();
        return;
      }

      const stepData = snapshot.currentStepData;
      const delay = (stepData?.duration || 300) / animationSpeed;

      setState((prev) => ({
        ...prev,
        ...snapshot,
        isPlaying: true,
        isPaused: false,
      }));

      timerRef.current = window.setTimeout(() => {
        if (stateRef.current.isPaused) return;
        advance();
      }, delay);
    };

    setState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));
    advance();
  }, [animationSpeed, clearTimer, getSnapshotForStepCount]);

  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      isPaused: true,
      isPlaying: true,
    }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
    play();
  }, [play]);

  const reset = useCallback(() => {
    clearTimer();
    const animation = animationRef.current;
    if (!animation) return;

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: animation.steps.length,
      currentState: animation.initialState,
      currentStepData: null,
    }));
  }, [clearTimer]);

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
    seekToStep,
    canStepForward: state.currentStep < state.totalSteps,
    canStepBackward: state.currentStep > 0,
  };
};
