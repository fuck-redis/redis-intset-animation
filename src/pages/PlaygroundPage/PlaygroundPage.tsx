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
import { Plus, Search, Trash2, Layers, GitBranch, Shuffle, Info } from 'lucide-react';
import './PlaygroundPage.css';

interface StepExplanation {
  phase: string;
  title: string;
  description: string;
  insight: string;
  complexity?: string;
}

interface DemoConfig {
  id: string;
  operation: IntSetOperation;
  label: string;
  description: string;
  icon: React.ReactNode;
  initialData: number[];
  targetValue: number | number[];
  steps: { array: number[]; highlight: number[]; phase: string; color?: string }[];
  explanations: StepExplanation[];
  educationalNote?: string;
}

const DEMO_CONFIGS: DemoConfig[] = [
  {
    id: 'search-demo',
    operation: 'search',
    label: '二分查找',
    description: 'O(log n) 时间复杂度',
    icon: <Search size={14} />,
    initialData: [10, 20, 30, 40, 50],
    targetValue: 30,
    steps: [
      { array: [10, 20, 30, 40, 50], highlight: [], phase: '在 [10,20,30,40,50] 中找 30', color: 'neutral' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '检查索引 2 → 命中!', color: 'found' },
    ],
    explanations: [
      {
        phase: '在 [10,20,30,40,50] 中找 30',
        title: '二分查找',
        description: '在有序数组中查找 30，利用二分快速定位',
        insight: '有序数组可以通过二分查找快速定位目标',
        complexity: 'O(log n)',
      },
      {
        phase: '检查索引 2 → 命中!',
        title: '查找成功',
        description: '在索引 2 找到 30，命中目标',
        insight: '二分查找每次排除一半元素，所以很快',
        complexity: 'O(log n)',
      },
    ],
    educationalNote: '💡 二分查找利用有序数组，每次排除一半元素，所以查找很快',
  },
  {
    id: 'insert-demo',
    operation: 'insert',
    label: '插入元素',
    description: 'O(log n) + O(n)',
    icon: <Plus size={14} />,
    initialData: [10, 20, 40, 50],
    targetValue: 30,
    steps: [
      { array: [10, 20, 40, 50], highlight: [], phase: '原数组', color: 'neutral' },
      { array: [10, 20, 40, 50], highlight: [2], phase: '找到位置 [2]', color: 'searching' },
      { array: [10, 20, 40, 50], highlight: [2, 3], phase: '元素右移 →', color: 'moving' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '插入完成 ✓', color: 'inserting' },
    ],
    explanations: [
      {
        phase: '原数组',
        title: '原始状态',
        description: '数组 [10, 20, 40, 50] 是有序的，现在要插入 30',
        insight: '30 应该插入到 20 和 40 之间',
      },
      {
        phase: '找到位置 [2]',
        title: '二分查找定位',
        description: '通过二分查找快速定位，30 应该插入到索引 2',
        insight: '有序数组可以利用二分查找快速定位',
        complexity: '查找: O(log n)',
      },
      {
        phase: '元素右移 →',
        title: '腾出插入空间',
        description: '将 40 和 50 向右移动一位，空出索引 2 的位置',
        insight: '插入操作的核心开销 — 必须保持数组有序',
        complexity: '搬移: O(n)',
      },
      {
        phase: '插入完成 ✓',
        title: '插入成功',
        description: '30 写入空位，数组恢复有序 [10, 20, 30, 40, 50]',
        insight: '插入后数组长度 +1',
        complexity: '总: O(n)',
      },
    ],
    educationalNote: '💡 插入的关键：先二分查找定位，再移动元素腾位置，最后写入新值',
  },
  {
    id: 'delete-demo',
    operation: 'delete',
    label: '删除元素',
    description: 'O(log n) + O(n)',
    icon: <Trash2 size={14} />,
    initialData: [10, 20, 30, 40, 50],
    targetValue: 30,
    steps: [
      { array: [10, 20, 30, 40, 50], highlight: [], phase: '原数组', color: 'neutral' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '找到 30', color: 'searching' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '标记删除', color: 'deleting' },
      { array: [10, 20, 40, 50], highlight: [], phase: '左移填补 ✓', color: 'neutral' },
    ],
    explanations: [
      {
        phase: '原数组',
        title: '原始状态',
        description: '数组 [10, 20, 30, 40, 50] 是有序的，要删除 30',
        insight: '删除后数组长度 -1，其他元素需要左移保持有序',
      },
      {
        phase: '找到 30',
        title: '二分查找定位',
        description: '通过二分查找快速找到 30 位于索引 2',
        insight: '和插入一样，查找是 O(log n) 级别',
        complexity: '查找: O(log n)',
      },
      {
        phase: '标记删除',
        title: '标记待删除',
        description: '将索引 2 的元素 30 标记为待删除（红色高亮）',
        insight: '这一步在动画中演示，实际代码中不需要标记',
      },
      {
        phase: '左移填补 ✓',
        title: '元素左移完成',
        description: '将 40 和 50 向左移动一位，覆盖被删除的位置',
        insight: '删除操作的核心开销 — 后续元素需要顺序前移',
        complexity: '搬移: O(n)',
      },
    ],
    educationalNote: '💡 删除的关键：先二分查找定位，然后左侧元素依次左移填补空位',
  },
  {
    id: 'batch-insert-demo',
    operation: 'batchInsert',
    label: '批量插入',
    description: '批量添加多个元素',
    icon: <Layers size={14} />,
    initialData: [10, 50],
    targetValue: [20, 30, 40],
    steps: [
      { array: [10, 50], highlight: [], phase: '原数组', color: 'neutral' },
      { array: [10, 50], highlight: [1], phase: '插入 20 ✓', color: 'inserting' },
      { array: [10, 20, 50], highlight: [1, 2], phase: '50 右移 →', color: 'moving' },
      { array: [10, 20, 30, 50], highlight: [2], phase: '插入 30 ✓', color: 'inserting' },
      { array: [10, 20, 30, 40, 50], highlight: [3], phase: '插入 40 ✓', color: 'inserting' },
    ],
    explanations: [
      {
        phase: '原数组',
        title: '原始状态',
        description: '数组 [10, 50]，要批量插入 [20, 30, 40]',
        insight: '批量操作会触发多次独立的插入流程',
      },
      {
        phase: '插入 20 ✓',
        title: '插入第一个值',
        description: '20 在 10 和 50 之间，直接插入到位置 [1]',
        insight: '查找很快，主要工作是腾出位置',
        complexity: 'O(log n)',
      },
      {
        phase: '50 右移 →',
        title: '腾出空间',
        description: '插入 30 时，50 需要右移一位',
        insight: '每次插入都可能触发元素搬移',
        complexity: 'O(n)',
      },
      {
        phase: '插入 30 ✓',
        title: '插入第二个值',
        description: '成功插入 30，数组变为 [10, 20, 30, 50]',
        insight: '保持有序是关键约束',
      },
      {
        phase: '插入 40 ✓',
        title: '插入完成',
        description: '最后一个元素 40 插入到正确位置',
        insight: '批量插入总复杂度是各次插入之和',
        complexity: '最坏 O(k·n)',
      },
    ],
    educationalNote: '💡 批量插入技巧：先对要插入的值排序，可以减少元素移动次数',
  },
  {
    id: 'encoding-upgrade-demo',
    operation: 'upgrade',
    label: '编码升级',
    description: 'INT16 -> INT32',
    icon: <GitBranch size={14} />,
    initialData: [100, 200, 300],
    targetValue: 50000,
    steps: [
      { array: [100, 200, 300], highlight: [], phase: 'INT16 (2字节/值)', color: 'neutral' },
      { array: [100, 200, 300], highlight: [0, 1, 2], phase: '50000 超出范围!', color: 'upgrading' },
      { array: [100, 200, 300], highlight: [0, 1, 2], phase: '升级 INT32 (4字节/值)', color: 'upgrading' },
      { array: [100, 200, 300, 50000], highlight: [3], phase: '插入 50000 ✓', color: 'inserting' },
    ],
    explanations: [
      {
        phase: 'INT16 (2字节/值)',
        title: '当前编码状态',
        description: '当前使用 INT16 编码，每个值占 2 字节，范围：-32768 ~ 32767',
        insight: '小值占用内存少，这是 IntSet 的优势',
      },
      {
        phase: '50000 超出范围!',
        title: '触发编码升级',
        description: '尝试插入 50000，超出 INT16 范围，必须升级编码',
        insight: '50000 > 32767，无法存储在 INT16 中',
      },
      {
        phase: '升级 INT32 (4字节/值)',
        title: '全量数据迁移',
        description: '所有现有元素重新编码拷贝到新的内存空间',
        insight: '这是 IntSet 最"贵"的操作！升级不可逆',
        complexity: 'O(n) 拷贝',
      },
      {
        phase: '插入 50000 ✓',
        title: '升级后插入',
        description: '编码升级完成后，50000 成功插入（INT32 范围：±21亿）',
        insight: '升级后所有元素都占用更多内存',
      },
    ],
    educationalNote: '💡 编码升级自动发生但不可逆，升级后所有元素都占用更多内存',
  },
  {
    id: 'duplicate-prevention-demo',
    operation: 'search',
    label: '去重机制',
    description: '查找防止重复',
    icon: <Shuffle size={14} />,
    initialData: [10, 20, 30, 40, 50],
    targetValue: 30,
    steps: [
      { array: [10, 20, 30, 40, 50], highlight: [], phase: '原数组', color: 'neutral' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '二分查找 30...', color: 'searching' },
      { array: [10, 20, 30, 40, 50], highlight: [2], phase: '已找到 30!', color: 'found' },
      { array: [10, 20, 30, 40, 50], highlight: [], phase: '拒绝插入 ✗', color: 'neutral' },
    ],
    explanations: [
      {
        phase: '原数组',
        title: '原始状态',
        description: '数组 [10, 20, 30, 40, 50]，尝试插入已存在的 30',
        insight: 'IntSet 是数学集合，不允许重复元素',
      },
      {
        phase: '二分查找 30...',
        title: '查找目标',
        description: '通过二分查找定位 30 的位置',
        insight: '利用有序数组特性快速定位',
        complexity: 'O(log n)',
      },
      {
        phase: '已找到 30!',
        title: '发现重复',
        description: '在索引 2 找到 30，与要插入的值相同',
        insight: '查找过程中发现目标已存在',
      },
      {
        phase: '拒绝插入 ✗',
        title: '插入被拒绝',
        description: '因为 30 已存在，插入操作被拒绝，数组保持不变',
        insight: '这保证了 IntSet 的元素唯一性',
      },
    ],
    educationalNote: '💡 IntSet 的去重：插入前先二分查找，值存在则拒绝，保证集合元素唯一',
  },
];

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

  // Demo animation state
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);
  const demoIntervalRef = useRef<number | null>(null);

  const runDemo = useCallback((demoId: string) => {
    const demo = DEMO_CONFIGS.find((d) => d.id === demoId);
    if (!demo) return;

    if (demoIntervalRef.current) {
      window.clearInterval(demoIntervalRef.current);
    }

    setActiveDemo(demoId);
    setDemoStep(0);

    let step = 0;
    demoIntervalRef.current = window.setInterval(() => {
      step++;
      if (step >= demo.steps.length) {
        step = 0;
      }
      setDemoStep(step);
    }, 800);
  }, []);

  const stopDemo = useCallback(() => {
    if (demoIntervalRef.current) {
      window.clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setActiveDemo(null);
    setDemoStep(0);
  }, []);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        window.clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

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

      <div className="operation-demo-section">
        <div className="demo-section-header">
          <span className="demo-label">操作演示</span>
          <button
            type="button"
            className={`explanation-toggle ${showExplanations ? 'active' : ''}`}
            onClick={() => setShowExplanations(!showExplanations)}
            title="切换步骤说明"
          >
            <Info size={12} />
            <span>步骤说明</span>
          </button>
        </div>
        <div className="demo-cards-wrapper">
          <div className="demo-cards">
            {DEMO_CONFIGS.map((demo) => {
              const isActive = activeDemo === demo.id;
              const currentStepData = isActive ? demo.steps[demoStep] : demo.steps[0];
              const currentExplanation = isActive && showExplanations && demo.explanations
                ? demo.explanations[demoStep] || demo.explanations[0]
                : null;
              return (
                <div key={demo.id} className={`demo-card-wrapper ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`demo-card ${isActive ? 'active' : ''}`}
                    onClick={() => (isActive ? stopDemo() : runDemo(demo.id))}
                  >
                    <div className="demo-icon">{demo.icon}</div>
                    <div className="demo-text">
                      <span className="demo-op">{demo.label}</span>
                      <span className="demo-desc">{currentStepData.phase}</span>
                    </div>
                    <div className="demo-animation">
                      {currentStepData.array.map((val, idx) => {
                        const isHighlighted = currentStepData.highlight.includes(idx);
                        const colorClass = currentStepData.color || '';
                        const isMoving = currentStepData.color === 'moving' && isHighlighted;
                        return (
                          <React.Fragment key={idx}>
                            <div
                              className={`demo-array-cell ${isHighlighted ? colorClass : ''}`}
                              data-index={idx}
                            >
                              {val}
                            </div>
                            {/* 插入操作时显示插入位置的虚线框 */}
                            {demo.operation === 'insert' && isHighlighted && currentStepData.color === 'moving' && idx === currentStepData.highlight[0] && (
                              <>
                                <div className="demo-insert-gap">
                                  <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                    {typeof demo.targetValue === 'number' ? demo.targetValue : demo.targetValue[0]}
                                  </span>
                                </div>
                                <span className="demo-shift-arrow">→</span>
                              </>
                            )}
                            {/* 搬移动画时显示右移箭头 */}
                            {demo.operation === 'insert' && currentStepData.color === 'moving' && isHighlighted && idx < currentStepData.array.length - 1 && (
                              <span className="demo-shift-arrow">→</span>
                            )}
                            {/* 非高亮元素之间的分隔 */}
                            {!isHighlighted && idx < currentStepData.array.length - 1 && <span className="demo-arrow">·</span>}
                            {/* 高亮元素之间有箭头 */}
                            {isHighlighted && idx < currentStepData.highlight.length - 1 && (
                              <span style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: 700 }}>→</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {/* 目标值指示器 */}
                      {Array.isArray(demo.targetValue) ? (
                        <span className="demo-target-group">
                          +{demo.targetValue.join(',')}
                        </span>
                      ) : (
                        <div className="demo-target" style={{ marginLeft: '0.5rem' }}>
                          +{demo.targetValue}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="demo-progress">
                        <div
                          className="demo-progress-bar"
                          style={{ width: `${((demoStep + 1) / demo.steps.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </button>
                  {currentExplanation && (
                    <div className="demo-explanation">
                      <div className="explanation-header">
                        <span className="explanation-title">{currentExplanation.title}</span>
                        {currentExplanation.complexity && (
                          <span className="explanation-complexity">{currentExplanation.complexity}</span>
                        )}
                      </div>
                      <p className="explanation-description">{currentExplanation.description}</p>
                      <p className="explanation-insight">{currentExplanation.insight}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {activeDemo && DEMO_CONFIGS.find(d => d.id === activeDemo)?.educationalNote && (
          <div className="educational-note">
            <span className="educational-note-icon">💡</span>
            <span className="educational-note-text">
              {DEMO_CONFIGS.find(d => d.id === activeDemo)?.educationalNote}
            </span>
          </div>
        )}
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
