import React, { useMemo, useState } from 'react';
import {
  IntSetOperation,
  OperationParams,
  IntSetStats,
  OperationGroup,
  LearningScenario,
  IntSetEncoding,
} from '../../types/intset';
import { PackagePlus, Play, Plus, Search, Shuffle, Trash2 } from 'lucide-react';
import ScenarioPanel from '../ScenarioPanel/ScenarioPanel';
import TipsPanel from '../TipsPanel/TipsPanel';
import './ControlPanel.css';

interface ControlPanelProps {
  stats: IntSetStats;
  isAnimating: boolean;
  currentEncoding: IntSetEncoding;
  onOperation: (operation: IntSetOperation, params: OperationParams) => Promise<void>;
  onExecuteScenario: (scenario: LearningScenario) => Promise<void>;
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
    operations: [{ id: 'search', label: '查找元素', icon: '🔍', description: '二分查找指定元素' }],
  },
];

const SINGLE_SAMPLES = [-2, 0, 12, 32767, 40000, -40000];
const BATCH_SAMPLES = ['1, 3, 5, 7', '10, 20, 30, 40', '-15, -1, 8, 64'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

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
  const [error, setError] = useState<string>('');

  const currentInputHint = useMemo(() => {
    if (selectedOperation === 'search') return '输入要查找的整数';
    if (selectedOperation === 'delete') return '输入要删除的整数';
    if (selectedOperation === 'batchInsert') return '输入逗号分隔的整数列表';
    return '输入要插入的整数';
  }, [selectedOperation]);

  const parseSingleValue = (raw: string): number | null => {
    const value = Number(raw.trim());
    if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
    if (!Number.isSafeInteger(value)) return null;
    return value;
  };

  const parseBatchValues = (raw: string): number[] | null => {
    const parts = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (parts.length === 0) return null;
    if (parts.length > 50) return null;

    const parsed = parts.map((item) => Number(item));
    const valid = parsed.every((item) => Number.isInteger(item) && Number.isSafeInteger(item));
    if (!valid) return null;

    return parsed;
  };

  const handleExecute = async () => {
    if (isAnimating) return;

    const params: OperationParams = {};

    if (selectedOperation === 'batchInsert') {
      const values = parseBatchValues(batchValues);
      if (!values) {
        setError('批量输入不合法：请使用逗号分隔的安全整数，且数量不超过50个。');
        return;
      }
      params.values = values;
    } else {
      const value = parseSingleValue(inputValue);
      if (value === null) {
        setError('请输入合法的安全整数（例如 -42, 0, 100000）。');
        return;
      }
      params.value = value;
    }

    setError('');
    await onOperation(selectedOperation, params);
  };

  const fillRandomData = () => {
    setError('');
    if (selectedOperation === 'batchInsert') {
      const count = randomInt(4, 8);
      const arr = Array.from({ length: count }, () => randomInt(-50000, 50000));
      setBatchValues(arr.join(', '));
      return;
    }

    const value = randomInt(-50000, 50000);
    setInputValue(String(value));
  };

  const applySample = (sample: string | number) => {
    setError('');
    if (selectedOperation === 'batchInsert') {
      setBatchValues(String(sample));
      return;
    }
    setInputValue(String(sample));
  };

  const getIcon = (op: IntSetOperation) => {
    switch (op) {
      case 'insert':
        return <Plus size={18} />;
      case 'search':
        return <Search size={18} />;
      case 'delete':
        return <Trash2 size={18} />;
      case 'batchInsert':
        return <PackagePlus size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="control-panel-inner">
      <TipsPanel currentOperation={selectedOperation} currentEncoding={currentEncoding} elementCount={stats.elementCount} />

      <section className="stats-section">
        <h3 className="section-title">统计信息</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">元素数量</div>
            <div className="stat-value">{stats.elementCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">总内存</div>
            <div className="stat-value">{stats.memoryUsage}B</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">头部/数据</div>
            <div className="stat-value tiny">
              {stats.headerUsage}B / {stats.payloadUsage}B
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">升级次数</div>
            <div className="stat-value">{stats.upgradeCount}</div>
          </div>
        </div>
      </section>

      <section className="operations-section">
        <h3 className="section-title">操作选择</h3>
        {OPERATION_GROUPS.map((group) => (
          <div key={group.name} className="operation-group">
            <h4 className="group-name">{group.name}</h4>
            <div className="operation-buttons">
              {group.operations.map((op) => (
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

      <section className="params-section">
        <h3 className="section-title">输入与执行</h3>
        <p className="input-hint">{currentInputHint}</p>

        {selectedOperation === 'batchInsert' ? (
          <div className="input-group">
            <label className="input-label">整数列表</label>
            <textarea
              className="input-textarea"
              value={batchValues}
              onChange={(e) => setBatchValues(e.target.value)}
              placeholder="例如: 10, 20, 30, 40"
              rows={2}
              disabled={isAnimating}
            />
          </div>
        ) : (
          <div className="input-group">
            <label className="input-label">整数值</label>
            <input
              type="text"
              className="input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入整数..."
              disabled={isAnimating}
            />
          </div>
        )}

        <div className="quick-ops-row">
          <button type="button" className="mini-btn" onClick={fillRandomData} disabled={isAnimating}>
            <Shuffle size={14} />
            随机
          </button>
          {(selectedOperation === 'batchInsert' ? BATCH_SAMPLES : SINGLE_SAMPLES).map((sample) => (
            <button
              key={String(sample)}
              type="button"
              className="sample-chip"
              onClick={() => applySample(sample)}
              disabled={isAnimating}
            >
              {String(sample)}
            </button>
          ))}
        </div>

        {error && <div className="input-error">{error}</div>}

        <button className="execute-btn" onClick={handleExecute} disabled={isAnimating}>
          <Play size={16} />
          <span>{isAnimating ? '执行中...' : '执行操作'}</span>
        </button>
      </section>

      <ScenarioPanel onExecuteScenario={onExecuteScenario} isAnimating={isAnimating} collapsible />
    </div>
  );
};

export default ControlPanel;
