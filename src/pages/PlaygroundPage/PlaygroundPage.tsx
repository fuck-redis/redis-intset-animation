import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AnimationSequence,
  CodeLanguage,
  IntSetOperation,
  IntSetState,
  IntSetStats,
  LearningScenario,
  OperationParams,
} from '../../types/intset';
import { IntSetEngine } from '../../core/IntSetEngine';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { useRepoStars } from '../../hooks/useRepoStars';
import { useIndexedSetting } from '../../hooks/useIndexedSetting';
import MainLayout from '../../components/MainLayout/MainLayout';
import PlaygroundHeader from '../../components/PlaygroundHeader/PlaygroundHeader';
import FloatingCommunity from '../../components/FloatingCommunity/FloatingCommunity';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import {
  BinarySearchVideo,
  EncodingUpgradeVideo,
  InsertOperationVideo,
  DeleteOperationVideo,
} from '../../videos';
import './PlaygroundPage.css';

const VIDEO_CONFIGS: VideoConfig[] = [
  {
    id: 'binary-search-playground',
    title: '二分查找算法',
    description: 'O(log n) 时间复杂度的查找过程可视化',
    component: BinarySearchVideo,
    props: { searchValue: 42, data: [1, 15, 23, 42, 56, 78, 89, 100] },
  },
  {
    id: 'encoding-upgrade-playground',
    title: '编码升级机制',
    description: 'INT16 → INT32 → INT64 自动升级过程',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 50000 },
  },
  {
    id: 'insert-playground',
    title: '插入操作详解',
    description: '二分查找 → 编码检查 → 元素移动 → 写入新值',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 35, initialData: [10, 20, 30, 40, 50] },
  },
  {
    id: 'delete-playground',
    title: '删除操作详解',
    description: '二分查找 → 标记删除 → 元素左移',
    component: DeleteOperationVideo,
    props: { operation: 'delete', value: 30, initialData: [10, 20, 30, 40, 50] },
  },
];

const REPO_URL = 'https://github.com/fuck-redis/redis-intset-animation';

const buildStats = (state: IntSetState, upgradeCount: number): IntSetStats => ({
  elementCount: state.length,
  memoryUsage: state.byteSize,
  headerUsage: state.headerByteSize,
  payloadUsage: state.payloadByteSize,
  upgradeCount,
  averageSearchTime: state.length > 0 ? Number((Math.log2(state.length + 1) * 0.2).toFixed(2)) : 0,
  memoryEfficiency:
    state.byteSize > 0 ? Number(((state.payloadByteSize / state.byteSize) * 100).toFixed(1)) : 0,
});

const getAnimationDuration = (animation: AnimationSequence, speed: number) => {
  const total = animation.steps.reduce((sum, step) => sum + step.duration, 0);
  return Math.max(120, total / speed + 60);
};

const PlaygroundPage: React.FC = () => {
  const location = useLocation();
  const [intSetState, setIntSetState] = useState<IntSetState>(() => IntSetEngine.create([1, 3, 5]));
  const [upgradeCount, setUpgradeCount] = useState(0);
  const [stats, setStats] = useState<IntSetStats>(() => buildStats(IntSetEngine.create([1, 3, 5]), 0));

  const [animationSpeed, setAnimationSpeed] = useIndexedSetting<number>('playback-speed', 1);
  const [codeLanguage, setCodeLanguage] = useIndexedSetting<CodeLanguage>('code-language', 'java');

  const animationPlayer = useAnimationPlayer(animationSpeed);

  const [ideaOpen, setIdeaOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);
  const { stars, loading: starsLoading } = useRepoStars('fuck-redis', 'redis-intset-animation');

  useEffect(() => {
    setStats(buildStats(intSetState, upgradeCount));
  }, [intSetState, upgradeCount]);

  const runAnimation = useCallback(
    (animation: AnimationSequence, baseState: IntSetState, baseUpgradeCount: number) => {
      return new Promise<{ state: IntSetState; upgradeCount: number }>((resolve) => {
        animationPlayer.loadAnimation(animation);
        animationPlayer.play();

        window.setTimeout(() => {
          const newUpgradeCount =
            baseUpgradeCount + (animation.finalState.encoding !== baseState.encoding ? 1 : 0);
          setIntSetState(animation.finalState);
          setUpgradeCount(newUpgradeCount);
          resolve({ state: animation.finalState, upgradeCount: newUpgradeCount });
        }, getAnimationDuration(animation, animationSpeed));
      });
    },
    [animationPlayer, animationSpeed],
  );

  const executeFromState = useCallback(
    async (
      baseState: IntSetState,
      baseUpgradeCount: number,
      operation: IntSetOperation,
      params: OperationParams,
    ): Promise<{ state: IntSetState; upgradeCount: number }> => {
      if (operation === 'create') {
        const newState = IntSetEngine.create(params.values || []);
        setIntSetState(newState);
        setUpgradeCount(0);
        return { state: newState, upgradeCount: 0 };
      }

      if (operation === 'batchInsert') {
        if (!params.values || params.values.length === 0) {
          return { state: baseState, upgradeCount: baseUpgradeCount };
        }

        const newState = IntSetEngine.batchInsert(baseState, params.values);
        const newUpgradeCount =
          baseUpgradeCount + (newState.encoding !== baseState.encoding ? 1 : 0);

        setIntSetState(newState);
        setUpgradeCount(newUpgradeCount);
        return { state: newState, upgradeCount: newUpgradeCount };
      }

      if (params.value === undefined) {
        return { state: baseState, upgradeCount: baseUpgradeCount };
      }

      let animation: AnimationSequence | null = null;
      if (operation === 'insert') {
        animation = IntSetEngine.generateInsertAnimation(baseState, params.value);
      } else if (operation === 'search') {
        animation = IntSetEngine.generateSearchAnimation(baseState, params.value);
      } else if (operation === 'delete') {
        animation = IntSetEngine.generateDeleteAnimation(baseState, params.value);
      }

      if (!animation) {
        return { state: baseState, upgradeCount: baseUpgradeCount };
      }

      return runAnimation(animation, baseState, baseUpgradeCount);
    },
    [runAnimation],
  );

  const handleOperation = useCallback(
    async (operation: IntSetOperation, params: OperationParams) => {
      await executeFromState(intSetState, upgradeCount, operation, params);
    },
    [executeFromState, intSetState, upgradeCount],
  );

  const handleExecuteScenario = useCallback(
    async (scenario: LearningScenario) => {
      const initialState = IntSetEngine.create(scenario.initialSet);
      setIntSetState(initialState);
      setUpgradeCount(0);

      let workingState = initialState;
      let workingUpgradeCount = 0;

      await new Promise((resolve) => window.setTimeout(resolve, 300));

      for (const operation of scenario.operations) {
        const result = await executeFromState(
          workingState,
          workingUpgradeCount,
          operation.type,
          operation.params,
        );
        workingState = result.state;
        workingUpgradeCount = result.upgradeCount;
        await new Promise((resolve) => window.setTimeout(resolve, 260));
      }
    },
    [executeFromState],
  );

  const consumedScenarioRef = useRef(false);
  useEffect(() => {
    if (consumedScenarioRef.current) return;
    const state = location.state as { scenario?: LearningScenario } | null;
    if (!state?.scenario) return;

    consumedScenarioRef.current = true;
    handleExecuteScenario(state.scenario).catch(() => {});
  }, [handleExecuteScenario, location.state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputTarget =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInputTarget) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        animationPlayer.stepBackward();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        animationPlayer.stepForward();
      } else if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        if (!animationPlayer.isPlaying) {
          animationPlayer.play();
        } else if (animationPlayer.isPaused) {
          animationPlayer.resume();
        } else {
          animationPlayer.pause();
        }
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        animationPlayer.reset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [animationPlayer]);

  return (
    <div className="playground-page">
      <PlaygroundHeader
        title="Redis IntSet 数据结构可视化演示"
        subtitle="分镜头动画 + 代码联动 + 可交互画布"
        repoUrl={REPO_URL}
        stars={stars}
        starsLoading={starsLoading}
        onOpenIdea={() => setIdeaOpen(true)}
        onOpenVideo={() => setSelectedVideo(VIDEO_CONFIGS[0])}
      />

      <div className="playground-content">
        <MainLayout
          intSetState={animationPlayer.currentState || intSetState}
          stats={stats}
          isAnimating={animationPlayer.isPlaying}
          animationSpeed={animationSpeed}
          animationPlayer={animationPlayer}
          codeLanguage={codeLanguage}
          onCodeLanguageChange={setCodeLanguage}
          onOperation={handleOperation}
          onSpeedChange={setAnimationSpeed}
          onExecuteScenario={handleExecuteScenario}
        />
      </div>

      {ideaOpen && (
        <div className="idea-modal-mask" onClick={() => setIdeaOpen(false)}>
          <div className="idea-modal" onClick={(event) => event.stopPropagation()}>
            <h3>IntSet 解题思路（教学版）</h3>
            <ol>
              <li>保持有序数组，所有查找都通过二分定位，复杂度 O(log n)。</li>
              <li>插入/删除时通过数组搬移完成，复杂度 O(n)。</li>
              <li>编码按值域自动升级：INT16 → INT32 → INT64，且升级不可逆。</li>
              <li>动画里同步展示比较指针、搬移方向、内存变化，帮助建立执行心智模型。</li>
            </ol>
            <button type="button" onClick={() => setIdeaOpen(false)}>
              关闭
            </button>
          </div>
        </div>
      )}

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />

      <FloatingCommunity />
    </div>
  );
};

export default PlaygroundPage;
