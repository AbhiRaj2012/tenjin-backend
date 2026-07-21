import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Learn from './components/Learn';
import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import Level4 from './components/Level4';
import Assessment from './components/Assessment';
import ChatPanel from './components/ChatPanel';
import Profile from './components/Profile';
import Settings from './components/Settings';
import LearningPath from './components/LearningPath';
import './index.css';

// frontend/src/App.jsx
import { Lipsync } from 'wawa-lipsync';
// Create the single shared instance for the whole application
export const lipsyncManager = new Lipsync();


export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [quizMode, setQuizMode] = useState('level1');

  const navigateTo = (targetTab) => {
    if (targetTab === 'ultimate_quiz') {
      setQuizMode('all');
      setCurrentTab('assessment');
    } else {
      setCurrentTab(targetTab);
    }
  };

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard navigateTo={navigateTo} />;
      case 'learn':
        return <Learn navigateTo={navigateTo} />;
      case 'level1':
        return <Level1 navigateTo={navigateTo} setQuizMode={setQuizMode} />;
      case 'level2':
        return <Level2 navigateTo={navigateTo} setQuizMode={setQuizMode} />;
      case 'level3':
        return <Level3 navigateTo={navigateTo} setQuizMode={setQuizMode} />;
      case 'level4':
        return <Level4 navigateTo={navigateTo} setQuizMode={setQuizMode} />;
      case 'assessment':
        return <Assessment quizMode={quizMode} navigateTo={navigateTo} />;
      case 'chat':
        return <ChatPanel />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: "Konnichiwa, Learner! 👋", sub: "Track your progress and continue your journey." };
      case 'learn':
        return { title: "Curriculum Modules 📚", sub: "Step-by-step Japanese mastery." };
      case 'level1':
        return { title: "Level 1: Alphabets 🎌", sub: "Master Hiragana, Katakana, and basic Kanji." };
      case 'level2':
        return { title: "Level 2: Vocabulary 📖", sub: "Expand your everyday dictionary." };
      case 'level3':
        return { title: "Level 3: Grammar 🧩", sub: "Learn sentence structure and particles." };
      case 'level4':
        return { title: "Level 4: Sentences 🗣️", sub: "Practice common phrases and translations." };
      case 'chat':
        return { title: "Let's Chat 💬", sub: "Practice conversational fluency." };
      case 'profile':
        return { title: "Your Profile 📊", sub: "View and manage your personal details." };
      case 'settings':
        return { title: "System Configuration ⚙️", sub: "Configure cloud intelligence credentials." };
      default:
        return { title: "Tenjin", sub: "Language Learning Infrastructure" };
    }
  };

  const { title, sub } = getHeaderInfo();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">
            <img src="/assets/images/tenjin_icon.png" alt="Tenjin" />
          </div>
          <h2>Tenjin</h2>
        </div>
        
        <nav className="nav-menu">
          <button className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
            🏠 Dashboard
          </button>
          <button className={`nav-item ${currentTab === 'learn' || currentTab.startsWith('level') ? 'active' : ''}`} onClick={() => navigateTo('learn')}>
            📚 Learning Path
          </button>
          <button className={`nav-item ${currentTab === 'chat' ? 'active' : ''}`} onClick={() => navigateTo('chat')}>
            💬 Chat with Nanami
          </button>
          <button className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => navigateTo('profile')}>
            👤 Profile
          </button>
          <button className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => navigateTo('settings')}>
            ⚙️ Settings
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="welcome-text">
            <h1>{title}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
          </div>
          <div className="header-controls">
            <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>● Core Online</span>
          </div>
        </header>

        <div className="view-viewport">
          {renderView()}
        </div>
      </main>
    </div>
  );
}