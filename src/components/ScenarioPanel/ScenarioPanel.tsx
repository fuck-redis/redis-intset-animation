import React, { useState } from 'react';
import { LearningScenario } from '../../types/intset';
import { Lightbulb, Play, ChevronDown, ChevronUp } from 'lucide-react';
import './ScenarioPanel.css';

interface ScenarioPanelProps {
  onExecuteScenario: (scenario: LearningScenario) => void;
  isAnimating: boolean;
  collapsible?: boolean;
}

const LEARNING_SCENARIOS: LearningScenario[] = [
  {
    name: '基础操作演示',
    description: '演示基本的插入和查找操作',
    initialSet: [10, 20, 30],
    operations: [
      { type: 'insert', params: { value: 25 } },
      { type: 'search', params: { value: 25 } },
    ],
    expectedResult: '[10, 20, 25, 30] - INT16编码',
  },
  {
    name: '编码升级 - INT16到INT32',
    description: '插入超出INT16范围的值，触发升级',
    initialSet: [100, 1000, 10000],
    operations: [
      { type: 'insert', params: { value: 40000 } },
    ],
    expectedResult: '升级到INT32，内存从6字节增至16字节',
  },
  {
    name: '编码升级 - 负数溢出',
    description: '插入负数触发编码升级',
    initialSet: [-100, -1000, -10000],
    operations: [
      { type: 'insert', params: { value: -40000 } },
    ],
    expectedResult: 'INT16 → INT32，支持更大范围负数',
  },
  {
    name: '批量插入场景',
    description: '一次性插入多个元素',
    initialSet: [],
    operations: [
      { type: 'batchInsert', params: { values: [5, 15, 25, 35, 45] } },
    ],
    expectedResult: '快速构建有序集合',
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
  },
];

const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  onExecuteScenario,
  isAnimating,
  collapsible = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  return (
    <div className="scenario-panel">
      <div 
        className={`scenario-header ${collapsible ? 'clickable' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <Lightbulb size={20} />
        <h3>学习场景</h3>
        {collapsible && (
          isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />
        )}
      </div>
      
      {isExpanded && (
        <>
          <p className="scenario-description">
            选择预设场景快速体验IntSet的各种特性
          </p>
          
          <div className="scenarios-list">
            {LEARNING_SCENARIOS.map((scenario, index) => (
              <div key={index} className="scenario-card">
                <div className="scenario-content">
                  <h4 className="scenario-name">{scenario.name}</h4>
                  <p className="scenario-desc">{scenario.description}</p>
                  <div className="scenario-details">
                    <div className="detail-item">
                      <span className="detail-label">初始:</span>
                      <code className="detail-value">[{scenario.initialSet.join(', ')}]</code>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">操作:</span>
                      <span className="detail-value">
                        {scenario.operations.length}步
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">结果:</span>
                      <span className="detail-value expected">{scenario.expectedResult}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="scenario-run-btn"
                  onClick={() => onExecuteScenario(scenario)}
                  disabled={isAnimating}
                  title="运行此场景"
                >
                  <Play size={16} />
                  <span>运行</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ScenarioPanel;
