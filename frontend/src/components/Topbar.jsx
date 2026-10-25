import React from 'react';
import { Menu, Key, Sparkles, CheckCircle, ExternalLink, MessageSquareCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepository } from '../context/RepositoryContext';

export default function Topbar({ onToggleMobileSidebar, pageTitle, pageDescription }) {
  const { currentRepo, systemStatus, sessionKeys, toggleChatDrawer } = useRepository();

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);
  const remainingRateLimit = systemStatus?.rateLimit?.remaining;

  return (
    <header className="h-16 bg-surface-900/90 backdrop-blur-md border-b border-surface-700/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 md:hidden transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
            <span>DevLens</span>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">{pageTitle?.split('—')?.[0]?.trim() || 'Dashboard'}</span>
          </div>
          <h1 className="text-sm md:text-base font-bold text-white truncate leading-none">
            {pageTitle || 'DevLens AI'}
          </h1>
        </div>
      </div>

      {/* Right Status Indicators & Quick Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Active Repo Badge with quick link */}
        {currentRepo && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-950 border border-surface-800 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="truncate max-w-[180px] font-semibold text-white">{currentRepo.fullName}</span>
            <a
              href={currentRepo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-indigo-400 transition-colors ml-0.5"
              title="Open GitHub repo in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Global Ask Codebase Floating Trigger */}
        <button
          onClick={toggleChatDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
          title="Ask question about active repository"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Ask Codebase</span>
        </button>

        {/* GitHub Rate Limit pill */}
        {remainingRateLimit !== null && remainingRateLimit !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-950 border border-surface-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">GH:</span>
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
              <span className="hidden sm:inline">AI Online</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Setup Key</span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}

