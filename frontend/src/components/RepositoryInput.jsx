import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { useRepository } from '../context/RepositoryContext';

export default function RepositoryInput({ onAnalyzed }) {
  const { analyze, isAnalyzing } = useRepository();
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
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-surface-900 border border-surface-750 rounded-2xl shadow-sm focus-within:border-slate-500 transition-all duration-200">
          <div className="flex items-center flex-1 px-3 py-2 gap-3 min-w-0">
            <GithubIcon className="w-5 h-5 text-slate-400 shrink-0" />
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm text-slate-950 bg-white hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-slate-950" />
                  <span>Analyze Codebase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Error Message */}
        {localError && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 px-2">
            <AlertCircle className="w-3.5 h-3.5" /> {localError}
          </p>
        )}
      </form>

      {/* Suggested Quick Links */}
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-950 hover:bg-surface-850 border border-surface-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all text-[11px] font-mono group"
          >
            <span>{sample.label}</span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400">({sample.lang})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
