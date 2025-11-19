import React from 'react';
import { Outlet } from 'react-router-dom';
import SourceCodeSidebar from '../SourceCodeSidebar/SourceCodeSidebar';
import './SourceCodeLayout.css';

const SourceCodeLayout: React.FC = () => {
  return (
    <div className="source-code-layout">
      <SourceCodeSidebar />
      <div className="source-content-wrapper">
        <div className="source-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SourceCodeLayout;
