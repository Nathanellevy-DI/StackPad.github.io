/**
 * App.jsx - Main Application Component
 * 
 * This is the heart of StackPad. It sets up:
 * 1. Redux store for global state management
 * 2. Theme handling (light/dark mode)
 * 3. Navigation between different sections
 * 4. The main layout structure (Header, Sidebar, Content, Footer)
 * 
 * Architecture:
 * - App wraps everything in Redux Provider for state access
 * - Dashboard handles the actual UI and navigation logic
 */

import { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';

// ============================================
// LAYOUT COMPONENTS
// These create the structural skeleton of the app
// ============================================
import Header from './components/layout/Header';           // Top bar with logo, social links, theme toggle
import Sidebar from './components/layout/Sidebar';         // Desktop navigation (left side)
import MobileNav from './components/layout/MobileNav';     // Mobile navigation (bottom bar)
import MiniPlayer from './components/MusicPlayer/MiniPlayer'; // Persistent music player

// ============================================
// FEATURE COMPONENTS
// Each one is a self-contained feature/page
// ============================================
import CommandSearch from './components/CommandVault/CommandSearch'; // Command vault with search
import ZenTimer from './components/ZenTimer/ZenTimer';               // Pomodoro timer
import SystemLogs from './components/SystemLogs/SystemLogs';         // Daily check-ins/logs
import StickyNotes from './components/StickyNotes/StickyNotes';      // Draggable sticky notes
import DevHints from './components/DevHints/DevHints';               // Developer cheat sheets
import UserProfile from './components/UserProfile/UserProfile';       // Profile edit modal
import ProgressStats from './components/ProgressStats/ProgressStats'; // Weekly stats & streaks
import TodoList from './components/TodoList/TodoList';               // Task management
import MusicPlayer from './components/MusicPlayer/MusicPlayer';       // YouTube music player
import SlackTab from './components/SlackIntegration/SlackTab';         // Slack Integration Hub
import InstallPrompt from './components/InstallPrompt/InstallPrompt';  // PWA Install Banner

import './App.css'; // Layout and container styles

/**
 * Dashboard Component
 * 
 * Handles the main UI logic including:
 * - Theme application (sets data-theme attribute on <html>)
 * - Section navigation (which content to show)
 * - Responsive layout rendering
 */
function Dashboard() {
  // Get current theme from Redux store
  const { mode } = useSelector((state) => state.theme);

  // Track which section is currently active (default: 'dashboard')
  const [activeSection, setActiveSection] = useState('dashboard');

  // Apply theme whenever it changes
  // This sets data-theme="dark" or data-theme="light" on the <html> element
  // CSS variables then respond to this attribute to change colors
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  /**
   * renderContent - Renders the appropriate component based on active section
   * 
   * This is a simple router alternative - we use state instead of URL routing
   * because this is a single-page productivity dashboard, not a multi-page site
   */
  const renderContent = () => {
    switch (activeSection) {
      case 'commands':
        return <CommandSearch />;
      case 'timer':
        return <ZenTimer />;
      case 'notes':
        // Sticky notes need full page height for the canvas
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
      case 'music':
        return <MusicPlayer />;
      case 'settings':
        return <Settings />;
      case 'slack':
        return <SlackTab />;

      // Default: Show the main dashboard with multiple widgets
      case 'dashboard':
      default:
        return (
          <div className="dashboard-grid">
            {/* Dashboard shows 4 widgets in a grid layout */}
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
      {/* Fixed header at the top */}
      <Header />

      {/* User profile modal (only visible when opened) */}
      <UserProfile />

      <div className="app-layout">
        {/* Desktop sidebar navigation (hidden on mobile) */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main content area - renders based on activeSection */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* Music player that persists across all sections */}
      <MiniPlayer />

      {/* PWA Install Prompt (Mobile/Desktop) */}
      <InstallPrompt />

      {/* Mobile bottom navigation (hidden on desktop) */}
      <MobileNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}

/**
 * App Component - Root of the application
 * 
 * Wraps everything in Redux Provider so all child components
 * can access the global state using useSelector and useDispatch
 */
function App() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
}

export default App;
