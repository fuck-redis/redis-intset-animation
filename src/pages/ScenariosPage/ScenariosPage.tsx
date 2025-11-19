import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { LearningScenario } from '../../types/intset';
import './ScenariosPage.css';

const LEARNING_SCENARIOS: (LearningScenario & { difficulty: string; learningGoals: string[] })[] = [
  {
    name: '基础操作演示',
    description: '演示基本的插入和查找操作',
    initialSet: [10, 20, 30],
    operations: [
      { type: 'insert', params: { value: 25 } },
      { type: 'search', params: { value: 25 } },
    ],
    expectedResult: '[10, 20, 25, 30] - INT16编码',
    difficulty: '入门',
    learningGoals: [
      '理解IntSet如何保持元素有序',
      '观察插入时的二分查找和元素移动',
      '体验二分查找的查询过程',
    ],
  },
  {
    name: '编码升级 - INT16到INT32',
    description: '插入超出INT16范围的值，触发升级',
    initialSet: [100, 1000, 10000],
    operations: [
      { type: 'insert', params: { value: 40000 } },
    ],
    expectedResult: '升级到INT32，内存从6字节增至16字节',
    difficulty: '进阶',
    learningGoals: [
      '理解编码升级的触发条件',
      '观察内存重新分配和数据迁移过程',
      '体会编码升级对内存占用的影响',
    ],
  },
  {
    name: '编码升级 - 负数溢出',
    description: '插入负数触发编码升级',
    initialSet: [-100, -1000, -10000],
    operations: [
      { type: 'insert', params: { value: -40000 } },
    ],
    expectedResult: 'INT16 → INT32，支持更大范围负数',
    difficulty: '进阶',
    learningGoals: [
      '理解负数也会触发编码升级',
      '观察负数在内存中的存储方式',
      '理解编码范围的对称性',
    ],
  },
  {
    name: '批量插入场景',
    description: '一次性插入多个元素',
    initialSet: [],
    operations: [
      { type: 'batchInsert', params: { values: [5, 15, 25, 35, 45] } },
    ],
    expectedResult: '快速构建有序集合',
    difficulty: '入门',
    learningGoals: [
      '了解批量插入的使用场景',
      '观察IntSet如何高效处理多个元素',
      '理解有序数组的构建过程',
    ],
  },
  {
    name: '二分查找演示',
    description: '在大型集合中查找元素',
    initialSet: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    operations: [
      { type: 'search', params: { value: 70 } },
      { type: 'search', params: { value: 25 } },
    ],
    expectedResult: '演示O(log n)查找效率',
    difficulty: '进阶',
    learningGoals: [
      '深入理解二分查找算法',
      '观察查找路径和比较次数',
      '对比成功和失败的查找过程',
    ],
  },
  {
    name: '删除操作演示',
    description: '删除元素并观察内存变化',
    initialSet: [5, 10, 15, 20, 25],
    operations: [
      { type: 'delete', params: { value: 15 } },
      { type: 'delete', params: { value: 5 } },
    ],
    expectedResult: '元素移动，内存收缩',
    difficulty: '进阶',
    learningGoals: [
      '理解删除操作的实现细节',
      '观察元素移动和内存回收',
      '理解为什么删除是O(n)操作',
    ],
  },
  {
    name: '连续升级场景',
    description: '体验多次编码升级',
    initialSet: [100],
    operations: [
      { type: 'insert', params: { value: 100000 } },
      { type: 'insert', params: { value: 10000000000 } },
    ],
    expectedResult: 'INT16 → INT32 → INT64',
    difficulty: '高级',
    learningGoals: [
      '体验完整的编码升级链',
      '观察每次升级的内存变化',
      '理解编码升级的不可逆性',
    ],
  },
];

const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '入门': return 'difficulty-easy';
      case '进阶': return 'difficulty-medium';
      case '高级': return 'difficulty-hard';
      default: return '';
    }
  };

  return (
    <div className="scenarios-page">
      <div className="scenarios-container">
        <div className="scenarios-header">
          <h1>学习场景</h1>
          <p className="scenarios-subtitle">
            通过精心设计的场景，系统学习IntSet的各个方面
          </p>
        </div>

        <div className="scenarios-intro">
          <h2>如何使用学习场景？</h2>
          <div className="intro-steps">
            <div className="intro-step">
              <div className="step-num">1</div>
              <div>
                <h3>选择场景</h3>
                <p>根据难度和学习目标选择合适的场景</p>
              </div>
            </div>
            <div className="intro-step">
              <div className="step-num">2</div>
              <div>
                <h3>运行演示</h3>
                <p>点击"运行场景"按钮进入交互演示页面</p>
              </div>
            </div>
            <div className="intro-step">
              <div className="step-num">3</div>
              <div>
                <h3>观察学习</h3>
                <p>使用动画控制观察每个步骤的执行过程</p>
              </div>
            </div>
          </div>
        </div>

        <div className="scenarios-grid">
          {LEARNING_SCENARIOS.map((scenario, index) => (
            <div 
              key={index}
              className={`scenario-card ${selectedScenario === index ? 'selected' : ''}`}
              onClick={() => setSelectedScenario(selectedScenario === index ? null : index)}
            >
              <div className="scenario-card-header">
                <div>
                  <div className="scenario-meta">
                    <span className={`difficulty-badge ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                    <span className="operations-count">
                      {scenario.operations.length}个操作
                    </span>
                  </div>
                  <h3>{scenario.name}</h3>
                  <p className="scenario-description">{scenario.description}</p>
                </div>
              </div>

              <div className="scenario-details">
                <div className="detail-item">
                  <span className="detail-label">初始状态：</span>
                  <code>[{scenario.initialSet.join(', ')}]</code>
                </div>
                <div className="detail-item">
                  <span className="detail-label">预期结果：</span>
                  <span className="expected-result">{scenario.expectedResult}</span>
                </div>
              </div>

              {selectedScenario === index && (
                <div className="scenario-expanded">
                  <div className="learning-goals">
                    <h4>学习目标</h4>
                    <ul>
                      {scenario.learningGoals.map((goal, idx) => (
                        <li key={idx}>
                          <ChevronRight size={16} />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <button 
                className="run-scenario-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/playground');
                }}
              >
                <Play size={18} />
                运行场景
              </button>
            </div>
          ))}
        </div>

        <div className="scenarios-footer">
          <div className="footer-cta">
            <h3>准备好开始实践了吗？</h3>
            <p>在交互演示页面，你可以手动执行这些场景，或者自定义你自己的测试用例</p>
            <button className="cta-btn" onClick={() => navigate('/playground')}>
              前往演示页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPage;
