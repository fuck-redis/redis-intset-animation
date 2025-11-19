import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, PlayCircle, Lightbulb, Code, Github } from 'lucide-react';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-icon">📦</div>
          <div className="brand-text">
            <h1>IntSet 可视化</h1>
            <span className="brand-subtitle">Redis数据结构学习平台</span>
          </div>
        </div>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Home size={18} />
              <span>首页</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/tutorial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <BookOpen size={18} />
              <span>原理教程</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/playground" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <PlayCircle size={18} />
              <span>交互演示</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/scenarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Lightbulb size={18} />
              <span>学习场景</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/source-code" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Code size={18} />
              <span>源码分析</span>
            </NavLink>
          </li>
        </ul>

        <div className="nav-actions">
          <a 
            href="https://github.com/redis/redis" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="Redis GitHub"
          >
            <Github size={20} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
