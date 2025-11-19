import React, { useState } from 'react';
import { IntSetState, IntSetOperation, OperationParams, IntSetStats, LearningScenario } from '../../types/intset';
import { IntSetEngine } from '../../core/IntSetEngine';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import MainLayout from '../../components/MainLayout/MainLayout';
import './PlaygroundPage.css';

const PlaygroundPage: React.FC = () => {
  // IntSet状态
  const [intSetState, setIntSetState] = useState<IntSetState>(() => 
    IntSetEngine.create([1, 3, 5])
  );

  // 动画控制状态
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const animationPlayer = useAnimationPlayer(animationSpeed);

  // 统计信息
  const [stats, setStats] = useState<IntSetStats>({
    elementCount: 3,
    memoryUsage: 6,
    upgradeCount: 0,
    averageSearchTime: 0,
    memoryEfficiency: 100,
  });

  // 执行操作
  const handleOperation = async (
    operation: IntSetOperation, 
    params: OperationParams
  ) => {
    try {
      let animation;

      switch (operation) {
        case 'create':
          {
            const newState = IntSetEngine.create(params.values || []);
            setIntSetState(newState);
            updateStats(newState, 0);
          }
          return;

        case 'insert':
          if (params.value !== undefined) {
            animation = IntSetEngine.generateInsertAnimation(intSetState, params.value);
          }
          break;

        case 'search':
          if (params.value !== undefined) {
            animation = IntSetEngine.generateSearchAnimation(intSetState, params.value);
          }
          break;

        case 'delete':
          if (params.value !== undefined) {
            animation = IntSetEngine.generateDeleteAnimation(intSetState, params.value);
          }
          break;

        case 'batchInsert':
          if (params.values && params.values.length > 0) {
            const newState = IntSetEngine.batchInsert(intSetState, params.values);
            setIntSetState(newState);
            updateStats(newState, stats.upgradeCount);
          }
          return;

        default:
          return;
      }

      if (animation) {
        animationPlayer.loadAnimation(animation);
        animationPlayer.play();
        
        // 等待动画完成后更新状态
        setTimeout(() => {
          setIntSetState(animation.finalState);
          updateStats(animation.finalState, stats.upgradeCount + (animation.finalState.encoding !== intSetState.encoding ? 1 : 0));
        }, animation.steps.reduce((sum, step) => sum + step.duration, 0) / animationSpeed);
      }
    } catch (error) {
      console.error('操作执行失败:', error);
    }
  };

  // 更新统计信息
  const updateStats = (state: IntSetState, upgradeCount: number) => {
    setStats({
      elementCount: state.length,
      memoryUsage: state.byteSize,
      upgradeCount,
      averageSearchTime: state.length > 0 ? Math.log2(state.length) * 10 : 0,
      memoryEfficiency: 100,
    });
  };

  // 执行学习场景
  const handleExecuteScenario = async (scenario: LearningScenario) => {
    try {
      // 重置到场景初始状态
      const initialState = IntSetEngine.create(scenario.initialSet);
      setIntSetState(initialState);
      updateStats(initialState, 0);

      // 等待一下让用户看到初始状态
      await new Promise(resolve => setTimeout(resolve, 500));

      // 执行场景中的所有操作
      for (const operation of scenario.operations) {
        await handleOperation(operation.type, operation.params);
        // 每个操作之间稍作停顿
        await new Promise(resolve => setTimeout(resolve, 1000 / animationSpeed));
      }
    } catch (error) {
      console.error('场景执行失败:', error);
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1>交互式演示</h1>
        <p>通过可视化动画深入理解IntSet的操作过程</p>
      </div>
      <div className="demo-content">
        <MainLayout 
          intSetState={animationPlayer.currentState || intSetState}
          stats={stats}
          isAnimating={animationPlayer.isPlaying}
          animationSpeed={animationSpeed}
          animationPlayer={animationPlayer}
          onOperation={handleOperation}
          onSpeedChange={setAnimationSpeed}
          onExecuteScenario={handleExecuteScenario}
        />
      </div>
    </div>
  );
};

export default PlaygroundPage;
