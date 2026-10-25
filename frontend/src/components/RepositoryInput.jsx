import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { useRepository } from '../context/RepositoryContext';

export default function RepositoryInput({ onAnalyzed }) {
  const { analyze, isAnalyzing, analysisError } = useRepository();
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const validateUrl = (input) => {
    if (!input || !input.trim()) {
      return 'Please enter a GitHub repository URL.';
    }
    const trimmed = input.trim();
    if (!trimmed.includes('github.com') && !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      return 'Please enter a valid GitHub URL (e.g. https://github.com/owner/repository).';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const validationMsg = validateUrl(url);
    if (validationMsg) {
      setLocalError(validationMsg);
      return;
    }

    try {
      await analyze(url.trim());
      if (onAnalyzed) onAnalyzed();
    } catch {
      // Error is caught in context and exposed via analysisError
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    setLocalError('');
  };

  return (
    <div className="w-full space-y-2.5">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Subtle focus glow behind the input */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>

          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-surface-900/95 border border-surface-700/80 rounded-2xl shadow-xl group-focus-within:border-indigo-500 transition-all duration-200 backdrop-blur-md">
            <div className="flex items-center flex-1 px-3 py-2 gap-3 min-w-0">
              <GithubIcon className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                id="repository-url-input"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (localError) setLocalError('');
                }}
                placeholder="Enter GitHub URL (e.g. https://github.com/expressjs/express or daminsahu697-debug/portfolio)"
                disabled={isAnalyzing}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-60 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-surface-950 border border-surface-800">
                Press Enter ↵
              </span>

              <button
                type="submit"
                id="analyze-repo-button"
                disabled={isAnalyzing || !url.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all duration-150 shrink-0 active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Codebase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Validation Error Message */}
        {localError && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 px-2">
            <AlertCircle className="w-3.5 h-3.5" /> {localError}
          </p>
        )}
      </form>

      {/* Suggested Quick Links / Sample Repositories */}
      <div className="flex items-center gap-2 px-2 text-xs text-slate-400 flex-wrap">
        <span className="text-slate-500 font-medium text-[11px]">Popular Quick Starts:</span>
        {[
          { label: 'expressjs/express', url: 'https://github.com/expressjs/express', lang: 'Node.js' },
          { label: 'daminsahu697-debug/portfolio', url: 'https://github.com/daminsahu697-debug/portfolio', lang: 'React SPA' },
          { label: 'pallets/flask', url: 'https://github.com/pallets/flask', lang: 'Python' }
        ].map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => handleSampleClick(sample.url)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-950/70 hover:bg-surface-850 border border-surface-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-[11px] font-mono group"
          >
            <span>{sample.label}</span>
            <span className="text-[9px] text-slate-500 group-hover:text-indigo-400">({sample.lang})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
