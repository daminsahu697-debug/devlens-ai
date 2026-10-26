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
    { to: '/', label: 'Overview', icon: Compass },
    { to: '/architecture', label: 'Architecture Map', icon: Layers },
    { to: '/audit', label: 'Doctor Checkup', icon: Stethoscope },
    { to: '/analyzer', label: 'Repository Analyzer', icon: Code2 },
    { to: '/ask', label: 'Ask Codebase', icon: MessageSquareCode },
    { to: '/history', label: 'Analysis History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
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
          <div className="w-9 h-9 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4 text-slate-300" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                DevLens <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-800 text-slate-300 font-mono border border-surface-700">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 truncate">Repo Intelligence Engine</p>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors hidden md:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Repo Chip (if repository analyzed) */}
      {currentRepo && !isCollapsed && (
        <div className="px-4 py-3 bg-surface-950/70 border-b border-surface-750">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase">
            <span>Target Repo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="font-mono text-xs font-semibold text-white truncate">
            {currentRepo.fullName}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-surface-800 text-white border border-surface-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-surface-800/60 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {isFeatured && (
                    <span className="px-1.5 py-0.2 rounded text-slate-400 font-mono text-[9px] uppercase border border-surface-700 bg-surface-950">
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
            <span className="text-slate-400">Ready</span>
          </div>
        ) : (
          <div className="text-center text-[10px] font-mono text-slate-500">v1.0</div>
        )}
      </div>
    </aside>
  );
}
