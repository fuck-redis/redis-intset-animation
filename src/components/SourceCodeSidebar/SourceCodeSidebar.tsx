import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileCode, 
  Box, 
  PlusCircle, 
  Search, 
  Trash2, 
  ArrowUpCircle,
  Zap,
  Database,
  BookMarked,
  Map
} from 'lucide-react';
import './SourceCodeSidebar.css';

interface Chapter {
  path: string;
  title: string;
  icon: React.ReactNode;
}

const chapters: Chapter[] = [
  { path: '/source-code/overview', title: '概览与结构', icon: <Map size={18} /> },
  { path: '/source-code/data-structure', title: '数据结构定义', icon: <Box size={18} /> },
  { path: '/source-code/creation', title: '创建与初始化', icon: <FileCode size={18} /> },
  { path: '/source-code/search', title: '查找算法', icon: <Search size={18} /> },
  { path: '/source-code/insert', title: '插入操作', icon: <PlusCircle size={18} /> },
  { path: '/source-code/delete', title: '删除操作', icon: <Trash2 size={18} /> },
  { path: '/source-code/upgrade', title: '编码升级', icon: <ArrowUpCircle size={18} /> },
  { path: '/source-code/optimization', title: '性能优化技巧', icon: <Zap size={18} /> },
  { path: '/source-code/memory', title: '内存管理', icon: <Database size={18} /> },
  { path: '/source-code/api-reference', title: 'API完整参考', icon: <BookMarked size={18} /> },
];

const SourceCodeSidebar: React.FC = () => {
  return (
    <div className="source-sidebar">
      <div className="sidebar-header">
        <h2>源码分析</h2>
        <p className="sidebar-subtitle">深入Redis IntSet实现</p>
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

export default SourceCodeSidebar;
