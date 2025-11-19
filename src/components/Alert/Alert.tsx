import React from 'react';
import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import './Alert.css';

type AlertType = 'info' | 'warning' | 'success' | 'tip';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ type = 'info', title, children }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'success':
        return <CheckCircle size={20} />;
      case 'tip':
        return <Lightbulb size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'warning':
        return '⚠️ 注意';
      case 'success':
        return '✅ 成功';
      case 'tip':
        return '💡 提示';
      default:
        return 'ℹ️ 信息';
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">{getIcon()}</div>
      <div className="alert-content">
        {(title || getDefaultTitle()) && (
          <div className="alert-title">{title || getDefaultTitle()}</div>
        )}
        <div className="alert-body">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
