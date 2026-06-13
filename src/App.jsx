import React from 'react';
import { DeskProvider, useDesks } from './context/DeskContext';
import Navbar from './components/Navbar';
import LandingScreen from './components/LandingScreen';
import LibraryMapScreen from './components/LibraryMapScreen';
import StudentCheckInScreen from './components/StudentCheckInScreen';
import LibrarianDashboard from './components/LibrarianDashboard';
import StillHereModal from './components/StillHereModal';
import DemoPanel from './components/DemoPanel';

function MainAppContent() {
  const { currentView } = useDesks();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingScreen />;
      case 'map':
        return <LibraryMapScreen />;
      case 'student-flow':
        return <StudentCheckInScreen />;
      case 'librarian':
        return <LibrarianDashboard />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans transition-colors duration-500">
      <Navbar />
      <main className="flex-grow">
        {renderView()}
      </main>
      
      {/* Simulation control drawer */}
      <DemoPanel />
      
      {/* Screen 4 overlay warning */}
      <StillHereModal />
    </div>
  );
}

export default function App() {
  return (
    <DeskProvider>
      <MainAppContent />
    </DeskProvider>
  );
}
