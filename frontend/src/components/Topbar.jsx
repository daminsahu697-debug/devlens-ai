import React, { useState } from 'react';
import { Menu, Key, Sparkles, ExternalLink, Sun, Moon, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepository } from '../context/RepositoryContext';

export default function Topbar({ onToggleMobileSidebar, pageTitle }) {
  const {
    currentRepo,
    systemStatus,
    sessionKeys,
    toggleChatDrawer,
    theme,
    toggleTheme,
    accentColor,
    setAccentColor
  } = useRepository();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);
  const remainingRateLimit = systemStatus?.rateLimit?.remaining;

  return (
    <header className="h-16 bg-surface-900/90 backdrop-blur-md border-b border-surface-750 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-surface-800 md:hidden transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-0.5">
            <span>DevLens</span>
            <span>/</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold">{pageTitle?.split('—')?.[0]?.trim() || 'Dashboard'}</span>
          </div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate leading-none">
            {pageTitle || 'DevLens AI'}
          </h1>
        </div>
      </div>

      {/* Right Status Indicators & Quick Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Active Repo Badge with quick link */}
        {currentRepo && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-xs font-mono text-sky-900 dark:text-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[180px] font-semibold text-slate-900 dark:text-white">{currentRepo.fullName}</span>
            <a
              href={currentRepo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 transition-colors ml-0.5"
              title="Open GitHub repo in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Global Ask Codebase Trigger */}
        <button
          onClick={toggleChatDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-surface-800 dark:hover:bg-surface-750 text-sky-700 dark:text-slate-200 border border-sky-200 dark:border-surface-700 text-xs font-semibold transition-all shadow-sm"
          title="Ask question about active repository"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Color Palette Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-700 dark:text-slate-300 transition-colors"
            title="Choose UI Color Palette"
          >
            <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                accentColor === 'emerald'
                  ? 'bg-emerald-500'
                  : accentColor === 'violet'
                  ? 'bg-violet-500'
                  : accentColor === 'rose'
                  ? 'bg-rose-500'
                  : accentColor === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
            />
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-surface-900 border border-surface-750 shadow-xl z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-surface-750 mb-1">
                UI Color Palette
              </div>
              {[
                { id: 'sky', label: 'Ocean Sky', color: 'bg-sky-500', hex: '#0284c7' },
                { id: 'emerald', label: 'Emerald Mint', color: 'bg-emerald-500', hex: '#059669' },
                { id: 'violet', label: 'Electric Violet', color: 'bg-violet-500', hex: '#7c3aed' },
                { id: 'rose', label: 'Sunset Rose', color: 'bg-rose-500', hex: '#e11d48' },
                { id: 'amber', label: 'Solar Amber', color: 'bg-amber-500', hex: '#d97706' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setAccentColor(p.id);
                    setIsPaletteOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    accentColor === p.id
                      ? 'bg-sky-50 dark:bg-surface-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-surface-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${p.color}`} />
                    <span>{p.label}</span>
                  </div>
                  {accentColor === p.id && (
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* GitHub Rate Limit pill */}
        {remainingRateLimit !== null && remainingRateLimit !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-800 border border-surface-750 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">GH:</span>
            <span className={remainingRateLimit < 10 ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>
              {remainingRateLimit} left
            </span>
          </div>
        )}

        {/* AI Key Status Pill */}
        <Link
          to="/settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-700 dark:text-slate-300 transition-colors"
          title="Configure AI API keys in Settings"
        >
          {isLlmConfigured ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
