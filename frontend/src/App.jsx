import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RepositoryProvider } from './context/RepositoryContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import ArchitecturePage from './pages/ArchitecturePage';
import DoctorCheckupPage from './pages/DoctorCheckupPage';
import AnalyzerPage from './pages/AnalyzerPage';
import AskCodebasePage from './pages/AskCodebasePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import CodebaseChatDrawer from './components/CodebaseChatDrawer';

function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'DevLens AI — Repository Dashboard',
          desc: 'Instant Onboarding, verified tech stack metrics, and architectural intelligence.'
        };
      case '/architecture':
        return {
          title: 'Interactive Architecture Map — X-Ray View',
          desc: 'Interactive visual component topology with verified and inferred relationships.'
        };
      case '/audit':
        return {
          title: 'Smart Bug & Security Audit — Doctor Checkup',
          desc: 'Deterministic OWASP vulnerability scanning + AI review with reviewable code diff patches.'
        };
      case '/analyzer':
        return {
          title: 'Repository Analyzer',
          desc: 'Browse source files, inspect code with line numbers, and view AI architecture summaries.'
        };
      case '/ask':
        return {
          title: 'Ask Your Codebase',
          desc: 'Source-grounded codebase Q&A with supporting line-number citations.'
        };
      case '/history':
        return {
          title: 'Analysis History',
          desc: 'Recently analyzed repositories saved in your local browser workspace.'
        };
      case '/settings':
        return {
          title: 'System Settings & Credentials',
          desc: 'Manage AI provider credentials, GitHub tokens, and view rate limit quotas.'
        };
      default:
        return { title: 'DevLens AI', desc: '' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen bg-surface-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`md:block ${isMobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Topbar
          pageTitle={meta.title}
          pageDescription={meta.desc}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/audit" element={<DoctorCheckupPage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/ask" element={<AskCodebasePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Global Dockable / Floating Codebase Assistant */}
        <CodebaseChatDrawer />

        <footer className="py-4 px-8 border-t border-surface-750 bg-surface-900 text-center text-xs text-slate-500 font-medium">
          DevLens AI — AI-Powered GitHub Repository Analyzer • Architecture X-Ray • Doctor Checkup • Instant Onboarding
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RepositoryProvider>
        <AppLayout />
      </RepositoryProvider>
    </BrowserRouter>
  );
}
