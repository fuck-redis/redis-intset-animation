import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  Code2, 
  Database, 
  Cpu, 
  Gauge, 
  Terminal, 
  HelpCircle 
} from 'lucide-react';
import './TutorialSidebar.css';

interface Chapter {
  path: string;
  title: string;
  icon: React.ReactNode;
}

const chapters: Chapter[] = [
  { path: '/tutorial/what-is-intset', title: 'IntSet是什么？', icon: <BookOpen size={18} /> },
  { path: '/tutorial/encoding', title: '编码类型详解', icon: <Code2 size={18} /> },
  { path: '/tutorial/memory-layout', title: '内存布局', icon: <Database size={18} /> },
  { path: '/tutorial/operations', title: '核心操作详解', icon: <Cpu size={18} /> },
  { path: '/tutorial/performance', title: '性能特点', icon: <Gauge size={18} /> },
  { path: '/tutorial/redis-practice', title: 'Redis实战', icon: <Terminal size={18} /> },
  { path: '/tutorial/faq', title: '常见问题FAQ', icon: <HelpCircle size={18} /> },
];

const TutorialSidebar: React.FC = () => {
  return (
    <div className="tutorial-sidebar">
      <div className="sidebar-header">
        <h2>教程目录</h2>
      </div>
      <nav className="sidebar-nav">
        {chapters.map((chapter, index) => (
          <NavLink
            key={chapter.path}
            to={chapter.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="chapter-number">{index + 1}</span>
            <span className="chapter-icon">{chapter.icon}</span>
            <span className="chapter-title">{chapter.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default TutorialSidebar;
