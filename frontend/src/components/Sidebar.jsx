import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Code2,
  MessageSquareCode,
  History,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Stethoscope
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { currentRepo } = useRepository();

  const navItems = [
    { to: '/', label: 'Overview', icon: Compass, color: 'text-sky-500' },
    { to: '/architecture', label: 'Architecture Map', icon: Layers, color: 'text-indigo-500' },
    { to: '/audit', label: 'Doctor Checkup', icon: Stethoscope, color: 'text-emerald-500' },
    { to: '/analyzer', label: 'Repository Analyzer', icon: Code2, color: 'text-violet-500' },
    { to: '/ask', label: 'Ask Codebase', icon: MessageSquareCode, color: 'text-amber-500' },
    { to: '/history', label: 'Analysis History', icon: History, color: 'text-slate-500' },
    { to: '/settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-surface-900 border-r border-surface-750 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-750">
        <NavLink to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                DevLens <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono font-bold border border-sky-200 dark:border-sky-800/40">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 truncate">Repo Intelligence Engine</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-surface-800 transition-colors hidden md:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Repo Chip (if repository analyzed) */}
      {currentRepo && !isCollapsed && (
        <div className="px-4 py-3 bg-sky-50/50 dark:bg-surface-950/70 border-b border-surface-750">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase font-semibold">
            <span>Target Repo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
            {currentRepo.fullName}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            ★ {currentRepo.stars.toLocaleString()} • {currentRepo.language}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isFeatured = item.to === '/architecture' || item.to === '/audit';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-sky-50 dark:bg-surface-800 text-sky-700 dark:text-white border border-sky-200 dark:border-surface-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-800/80 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.color}`} />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {isFeatured && (
                    <span className="px-1.5 py-0.5 rounded text-sky-700 dark:text-sky-300 font-mono text-[9px] font-bold uppercase bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40">
                      NEW
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-surface-750 bg-surface-950/40">
        {!isCollapsed ? (
          <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>DevLens v1.0.0</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Ready</span>
          </div>
        ) : (
          <div className="text-center text-[10px] font-mono text-slate-500">v1.0</div>
        )}
      </div>
    </aside>
  );
}
