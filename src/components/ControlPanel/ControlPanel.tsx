import React, { useState } from 'react';
import { 
  IntSetOperation, 
  OperationParams, 
  IntSetStats,
  OperationGroup,
  LearningScenario,
  IntSetEncoding,
} from '../../types/intset';
import { 
  Plus, 
  Search, 
  Trash2, 
  Zap, 
  PackagePlus,
  Play,
  Pause,
} from 'lucide-react';
import ScenarioPanel from '../ScenarioPanel/ScenarioPanel';
import TipsPanel from '../TipsPanel/TipsPanel';
import './ControlPanel.css';

interface ControlPanelProps {
  stats: IntSetStats;
  isAnimating: boolean;
  animationSpeed?: number;
  animationPlayer?: any;
  currentEncoding: IntSetEncoding;
  onOperation: (operation: IntSetOperation, params: OperationParams) => void;
  onSpeedChange?: (speed: number) => void;
  onExecuteScenario: (scenario: LearningScenario) => void;
}

const OPERATION_GROUPS: OperationGroup[] = [
  {
    name: '修改操作',
    operations: [
      { id: 'insert', label: '插入元素', icon: '📥', description: '插入单个整数到集合中' },
      { id: 'batchInsert', label: '批量插入', icon: '📦', description: '一次插入多个整数' },
      { id: 'delete', label: '删除元素', icon: '🗑️', description: '从集合中删除指定元素' },
    ],
  },
  {
    name: '查询操作',
    operations: [
      { id: 'search', label: '查找元素', icon: '🔍', description: '二分查找指定元素' },
    ],
  },
];

const ControlPanel: React.FC<ControlPanelProps> = ({
  stats,
  isAnimating,
  currentEncoding,
  onOperation,
  onExecuteScenario,
}) => {
  const [selectedOperation, setSelectedOperation] = useState<IntSetOperation>('insert');
  const [inputValue, setInputValue] = useState('');
  const [batchValues, setBatchValues] = useState('');

  const handleExecute = () => {
    if (isAnimating) return;

    const params: OperationParams = {};

    if (selectedOperation === 'batchInsert') {
      const values = batchValues
        .split(',')
        .map(v => parseInt(v.trim()))
        .filter(v => !isNaN(v));
      
      if (values.length === 0) {
        alert('请输入有效的数值，用逗号分隔');
        return;
      }
      params.values = values;
    } else {
      const value = parseInt(inputValue);
      if (isNaN(value)) {
        alert('请输入有效的数值');
        return;
      }
      params.value = value;
    }

    onOperation(selectedOperation, params);
    setInputValue('');
    setBatchValues('');
  };

  const getIcon = (op: IntSetOperation) => {
    switch (op) {
      case 'insert': return <Plus size={18} />;
      case 'search': return <Search size={18} />;
      case 'delete': return <Trash2 size={18} />;
      case 'batchInsert': return <PackagePlus size={18} />;
      case 'upgrade': return <Zap size={18} />;
      default: return null;
    }
  };

  return (
    <div className="control-panel">
      {/* 智能提示 */}
      <TipsPanel 
        currentOperation={selectedOperation}
        currentEncoding={currentEncoding}
        elementCount={stats.elementCount}
      />

      {/* 统计信息 */}
      <section className="stats-section">
        <h3 className="section-title">统计信息</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">元素数量</div>
            <div className="stat-value">{stats.elementCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">内存使用</div>
            <div className="stat-value">{stats.memoryUsage}B</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">升级次数</div>
            <div className="stat-value">{stats.upgradeCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">查询时间</div>
            <div className="stat-value">{stats.averageSearchTime.toFixed(1)}ms</div>
          </div>
        </div>
      </section>

      {/* 操作选择 */}
      <section className="operations-section">
        <h3 className="section-title">操作选择</h3>
        {OPERATION_GROUPS.map(group => (
          <div key={group.name} className="operation-group">
            <h4 className="group-name">{group.name}</h4>
            <div className="operation-buttons">
              {group.operations.map(op => (
                <button
                  key={op.id}
                  className={`operation-btn ${selectedOperation === op.id ? 'active' : ''}`}
                  onClick={() => setSelectedOperation(op.id)}
                  disabled={isAnimating}
                  title={op.description}
                >
                  {getIcon(op.id)}
                  <span>{op.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 参数输入 */}
      <section className="params-section">
        <h3 className="section-title">参数输入</h3>
        {selectedOperation === 'batchInsert' ? (
          <div className="input-group">
            <label className="input-label">整数列表（逗号分隔）</label>
            <textarea
              className="input-textarea"
              value={batchValues}
              onChange={e => setBatchValues(e.target.value)}
              placeholder="例如: 10, 20, 30, 40"
              rows={3}
              disabled={isAnimating}
            />
          </div>
        ) : (
          <div className="input-group">
            <label className="input-label">整数值</label>
            <input
              type="number"
              className="input-field"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="输入整数..."
              disabled={isAnimating}
            />
          </div>
        )}
        
        <button 
          className="execute-btn"
          onClick={handleExecute}
          disabled={isAnimating}
        >
          {isAnimating ? (
            <>
              <Pause size={18} />
              <span>执行中...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>执行操作</span>
            </>
          )}
        </button>
      </section>

      {/* 学习场景 */}
      <ScenarioPanel 
        onExecuteScenario={onExecuteScenario}
        isAnimating={isAnimating}
        collapsible={true}
      />
    </div>
  );
};

export default ControlPanel;
