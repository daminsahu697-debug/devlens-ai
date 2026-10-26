import React from 'react';
import { Menu, Key, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepository } from '../context/RepositoryContext';

export default function Topbar({ onToggleMobileSidebar, pageTitle }) {
  const { currentRepo, systemStatus, sessionKeys, toggleChatDrawer } = useRepository();

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);
  const remainingRateLimit = systemStatus?.rateLimit?.remaining;

  return (
    <header className="h-16 bg-surface-900/90 backdrop-blur-md border-b border-surface-750 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4">
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
            <span className="text-slate-300 font-medium">{pageTitle?.split('—')?.[0]?.trim() || 'Dashboard'}</span>
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="truncate max-w-[180px] font-medium text-white">{currentRepo.fullName}</span>
            <a
              href={currentRepo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors ml-0.5"
              title="Open GitHub repo in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Global Ask Codebase Trigger */}
        <button
          onClick={toggleChatDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-200 border border-surface-700 text-xs font-medium transition-colors shadow-sm"
          title="Ask question about active repository"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* GitHub Rate Limit pill */}
        {remainingRateLimit !== null && remainingRateLimit !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-950 border border-surface-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">GH:</span>
            <span className={remainingRateLimit < 10 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {remainingRateLimit} left
            </span>
          </div>
        )}

        {/* AI Key Status Pill */}
        <Link
          to="/settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-950 border border-surface-800 hover:border-surface-700 text-slate-300 transition-colors"
          title="Configure AI API keys in Settings"
        >
          {isLlmConfigured ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline">AI Active</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Setup Key</span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
