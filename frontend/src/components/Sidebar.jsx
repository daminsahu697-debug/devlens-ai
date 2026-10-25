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
    { to: '/architecture', label: 'Architecture X-Ray', icon: Layers },
    { to: '/audit', label: 'Doctor Checkup', icon: Stethoscope },
    { to: '/analyzer', label: 'Repository Analyzer', icon: Code2 },
    { to: '/ask', label: 'Ask Your Codebase', icon: MessageSquareCode },
    { to: '/history', label: 'Analysis History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-surface-900 border-r border-surface-700/80 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-700/80">
        <NavLink to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                DevLens <span className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">AI</span>
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
        <div className="px-4 py-3 bg-surface-950/60 border-b border-surface-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="uppercase tracking-wider font-semibold text-slate-500">Active Target</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <p className="font-mono text-xs font-semibold text-indigo-300 truncate">
            {currentRepo.fullName}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            ⭐ {currentRepo.stars.toLocaleString()} • {currentRepo.language}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-surface-800/80 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {isFeatured && (
                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[9px] uppercase border border-indigo-500/30">
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
      <div className="p-4 border-t border-surface-700/80 bg-surface-950/40">
        {!isCollapsed ? (
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>DevLens v1.0.0</span>
            <span className="font-mono text-indigo-400">Production Ready</span>
          </div>
        ) : (
          <div className="text-center text-[10px] font-mono text-slate-500">v1.0</div>
        )}
      </div>
    </aside>
  );
}
