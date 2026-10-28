import React, { useState, useRef, useEffect } from 'react';
import { Menu, Key, Sparkles, ExternalLink, Sun, Moon, Palette, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRepository } from '../context/RepositoryContext';

export default function Topbar({ onToggleMobileSidebar, pageTitle }) {
  const {
    currentRepo,
    systemStatus,
    sessionKeys,
    toggleChatDrawer,
    theme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor
  } = useRepository();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef(null);

  // Close palette dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setIsPaletteOpen(false);
      }
    }
    if (isPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaletteOpen]);

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);
  const remainingRateLimit = systemStatus?.rateLimit?.remaining;

  const palettes = [
    { id: 'sky', label: 'Ocean Sky', color: 'bg-[#0ea5e9]' },
    { id: 'emerald', label: 'Emerald Mint', color: 'bg-[#10b981]' },
    { id: 'violet', label: 'Electric Violet', color: 'bg-[#8b5cf6]' },
    { id: 'rose', label: 'Sunset Rose', color: 'bg-[#f43f5e]' },
    { id: 'amber', label: 'Solar Amber', color: 'bg-[#f59e0b]' },
  ];

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

        {/* Unified Appearance Dropdown (Theme & Color Palette) */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title="Appearance & Theme Settings"
          >
            <Palette className="w-4 h-4 text-sky-500" />
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                accentColor === 'emerald'
                  ? 'bg-[#10b981]'
                  : accentColor === 'violet'
                  ? 'bg-[#8b5cf6]'
                  : accentColor === 'rose'
                  ? 'bg-[#f43f5e]'
                  : accentColor === 'amber'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#0ea5e9]'
              }`}
            />
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl bg-surface-900 border border-surface-750 shadow-2xl z-50 space-y-3">
              {/* Theme Mode Segment */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider mb-1.5">
                  Appearance Mode
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setTheme('light');
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      theme === 'light'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold shadow-sm ring-1 ring-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-surface-800 border-surface-750'
                    }`}
                  >
                    <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark');
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      theme === 'dark'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/50 font-bold shadow-sm ring-1 ring-indigo-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-surface-800 border-surface-750'
                    }`}
                  >
                    <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400 fill-indigo-400' : 'text-slate-400'}`} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Accent Color Palette Segment */}
              <div className="pt-2 border-t border-surface-750">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider mb-1.5">
                  Accent Color
                </div>
                <div className="space-y-1">
                  {palettes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setAccentColor(p.id);
                        setIsPaletteOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        accentColor === p.id
                          ? 'bg-surface-800 text-slate-900 dark:text-white font-bold ring-1 ring-sky-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-surface-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${p.color} shadow-sm`} />
                        <span>{p.label}</span>
                      </div>
                      {accentColor === p.id && (
                        <Check className="w-3.5 h-3.5 text-sky-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick 1-Click Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
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
