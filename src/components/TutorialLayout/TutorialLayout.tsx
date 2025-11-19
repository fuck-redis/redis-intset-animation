import React from 'react';
import { Outlet } from 'react-router-dom';
import TutorialSidebar from '../TutorialSidebar/TutorialSidebar';
import './TutorialLayout.css';

const TutorialLayout: React.FC = () => {
  return (
    <div className="tutorial-layout">
      <TutorialSidebar />
      <div className="tutorial-content-wrapper">
        <div className="tutorial-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TutorialLayout;
