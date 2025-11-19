import React from 'react';
import { Database } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Database className="header-icon" size={32} />
          <div className="header-title-group">
            <h1 className="header-title">Redis IntSet 可视化演示系统</h1>
            <p className="header-subtitle">交互式整数集合数据结构学习平台</p>
          </div>
        </div>
        <div className="header-right">
          <a 
            href="https://github.com/redis/redis" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            Redis 文档
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
