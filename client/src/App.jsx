import { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

// Feature components
import CommandSearch from './components/CommandVault/CommandSearch';
import ZenTimer from './components/ZenTimer/ZenTimer';
import SystemLogs from './components/SystemLogs/SystemLogs';
import StickyNotes from './components/StickyNotes/StickyNotes';
import DevHints from './components/DevHints/DevHints';
import UserProfile from './components/UserProfile/UserProfile';
import ProgressStats from './components/ProgressStats/ProgressStats';
import TodoList from './components/TodoList/TodoList';

import './App.css';

function Dashboard() {
  const { mode } = useSelector((state) => state.theme);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const renderContent = () => {
    switch (activeSection) {
      case 'commands':
        return <CommandSearch />;
      case 'timer':
        return <ZenTimer />;
      case 'notes':
        return (
          <div className="full-page-section">
            <StickyNotes />
          </div>
        );
      case 'logs':
        return <SystemLogs />;
      case 'hints':
        return <DevHints />;
      case 'progress':
        return <ProgressStats />;
      case 'todos':
        return <TodoList />;
      case 'dashboard':
      default:
        return (
          <div className="dashboard-grid">
            <div className="dashboard-section timer-section">
              <ZenTimer />
            </div>
            <div className="dashboard-section commands-section">
              <CommandSearch />
            </div>
            <div className="dashboard-section logs-section">
              <SystemLogs />
            </div>
            <div className="dashboard-section stickies-section">
              <StickyNotes />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header />
      <UserProfile />

      <div className="app-layout">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      <MobileNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
}

export default App;
