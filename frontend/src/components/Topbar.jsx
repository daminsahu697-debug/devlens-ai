import React from 'react';
import { Menu, Key, Sparkles, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepository } from '../context/RepositoryContext';

export default function Topbar({ onToggleMobileSidebar, pageTitle, pageDescription }) {
  const { currentRepo, systemStatus, sessionKeys } = useRepository();

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);
  const remainingRateLimit = systemStatus?.rateLimit?.remaining;

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left Title / Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-bold text-white truncate">
            {pageTitle || 'DevLens AI'}
          </h1>
          {pageDescription && (
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              {pageDescription}
            </p>
          )}
        </div>
      </div>

      {/* Right Status Indicators */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active Repo Badge (mobile/tablet view) */}
        {currentRepo && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800 border border-surface-700 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="truncate max-w-[200px]">{currentRepo.fullName}</span>
          </div>
        )}

        {/* GitHub Rate Limit pill */}
        {remainingRateLimit !== null && remainingRateLimit !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-850 border border-surface-700 text-[11px] font-mono text-slate-400">
            <span>GH Limit:</span>
            <span className={remainingRateLimit < 10 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
              {remainingRateLimit} left
            </span>
          </div>
        )}

        {/* AI Key Status Pill */}
        <Link
          to="/settings"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isLlmConfigured
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title="Configure AI API keys in Settings"
        >
          {isLlmConfigured ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Ready</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>AI: Setup Required</span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
