import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import TutorialLayout from './components/TutorialLayout/TutorialLayout';
import SourceCodeLayout from './components/SourceCodeLayout/SourceCodeLayout';
import HomePage from './pages/HomePage/HomePage';
import PlaygroundPage from './pages/PlaygroundPage/PlaygroundPage';
import ScenariosPage from './pages/ScenariosPage/ScenariosPage';
import VideoGalleryPage from './pages/VideoGalleryPage/VideoGalleryPage';

// Tutorial chapters
import WhatIsIntSet from './pages/TutorialPage/chapters/WhatIsIntSet';
import Encoding from './pages/TutorialPage/chapters/Encoding';
import MemoryLayout from './pages/TutorialPage/chapters/MemoryLayout';
import Operations from './pages/TutorialPage/chapters/Operations';
import Performance from './pages/TutorialPage/chapters/Performance';
import RedisPractice from './pages/TutorialPage/chapters/RedisPractice';
import FAQ from './pages/TutorialPage/chapters/FAQ';

// Source code chapters
import Overview from './pages/SourceCodePage/chapters/Overview';
import DataStructure from './pages/SourceCodePage/chapters/DataStructure';
import Creation from './pages/SourceCodePage/chapters/Creation';
import SearchAlgorithm from './pages/SourceCodePage/chapters/SearchAlgorithm';
import InsertOperation from './pages/SourceCodePage/chapters/InsertOperation';
import DeleteOperation from './pages/SourceCodePage/chapters/DeleteOperation';
import UpgradeEncoding from './pages/SourceCodePage/chapters/UpgradeEncoding';
import Optimization from './pages/SourceCodePage/chapters/Optimization';
import MemoryManagement from './pages/SourceCodePage/chapters/MemoryManagement';
import APIReference from './pages/SourceCodePage/chapters/APIReference';

import './App.css';

const BASENAME = import.meta.env.BASENAME || '';

const App: React.FC = () => {
  return (
    <Router basename={BASENAME}>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Tutorial routes with sidebar */}
          <Route path="/tutorial" element={<TutorialLayout />}>
            <Route index element={<Navigate to="/tutorial/what-is-intset" replace />} />
            <Route path="what-is-intset" element={<WhatIsIntSet />} />
            <Route path="encoding" element={<Encoding />} />
            <Route path="memory-layout" element={<MemoryLayout />} />
            <Route path="operations" element={<Operations />} />
            <Route path="performance" element={<Performance />} />
            <Route path="redis-practice" element={<RedisPractice />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
          
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/videos" element={<VideoGalleryPage />} />
          
          {/* Source code routes with sidebar */}
          <Route path="/source-code" element={<SourceCodeLayout />}>
            <Route index element={<Navigate to="/source-code/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="data-structure" element={<DataStructure />} />
            <Route path="creation" element={<Creation />} />
            <Route path="search" element={<SearchAlgorithm />} />
            <Route path="insert" element={<InsertOperation />} />
            <Route path="delete" element={<DeleteOperation />} />
            <Route path="upgrade" element={<UpgradeEncoding />} />
            <Route path="optimization" element={<Optimization />} />
            <Route path="memory" element={<MemoryManagement />} />
            <Route path="api-reference" element={<APIReference />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
