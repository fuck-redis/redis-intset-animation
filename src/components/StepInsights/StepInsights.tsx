import React, { useMemo, useState } from 'react';
import { AnimationStep, IntSetOperation, IntSetState } from '../../types/intset';
import { Copy, Check } from 'lucide-react';
import './StepInsights.css';

interface StepInsightsProps {
  operation: IntSetOperation | null;
  currentStep: number;
  totalSteps: number;
  step: AnimationStep | null;
  state: IntSetState;
}

const StepInsights: React.FC<StepInsightsProps> = ({
  operation,
  currentStep,
  totalSteps,
  step,
  state,
}) => {
  const vars = step?.data?.variables ? Object.entries(step.data.variables) : [];
  const [copied, setCopied] = useState(false);

  const exportPayload = useMemo(
    () => ({
      operation,
      step: currentStep,
      totalSteps,
      description: step?.description || '',
      phase: step?.phase || '',
      encoding: state.encoding,
      contents: state.contents,
      byteSize: state.byteSize,
      timestamp: new Date().toISOString(),
    }),
    [currentStep, operation, state, step, totalSteps],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="step-insights">
      <div className="step-insights-header">
        <h3>执行上下文</h3>
        <span className="step-badge">
          {totalSteps > 0 ? `${currentStep}/${totalSteps}` : '0/0'}
        </span>
      </div>

      <div className="step-row">
        <span className="label">当前操作</span>
        <span className="value">{operation || '-'}</span>
      </div>

      <div className="step-row">
        <span className="label">步骤</span>
        <span className="value">{step?.description || '等待执行'}</span>
      </div>

      {step?.data?.comparison && (
        <div className="step-row">
          <span className="label">比较表达式</span>
          <span className="value mono">{step.data.comparison}</span>
        </div>
      )}

      {step?.data?.message && (
        <div className="step-row">
          <span className="label">说明</span>
          <span className="value">{step.data.message}</span>
        </div>
      )}

      {!!vars.length && (
        <div className="step-vars">
          <div className="label">变量快照</div>
          <ul>
            {vars.map(([key, value]) => (
              <li key={key}>
                <span className="mono">{key}</span>
                <span className="mono">{String(value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="export-btn" onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? '已复制' : '导出演示状态'}</span>
      </button>
    </section>
  );
};

export default StepInsights;
