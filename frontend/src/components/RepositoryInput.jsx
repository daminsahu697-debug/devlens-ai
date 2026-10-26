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
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-surface-900 border-2 border-surface-750 focus-within:border-sky-500 dark:focus-within:border-sky-500 rounded-3xl shadow-sm transition-all duration-200">
          <div className="flex items-center flex-1 px-3 py-2 gap-3 min-w-0">
            <GithubIcon className="w-5 h-5 text-sky-500 shrink-0" />
            <input
              type="text"
              id="repository-url-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="Enter GitHub URL (e.g. https://github.com/expressjs/express or owner/repo)"
              disabled={isAnalyzing}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-60 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-surface-800 border border-surface-750">
              Press Enter ↵
            </span>

            <button
              type="submit"
              id="analyze-repo-button"
              disabled={isAnalyzing || !url.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0 shadow-md shadow-sky-600/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span>Analyze Codebase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Error Message */}
        {localError && (
          <p className="mt-2 text-xs text-rose-500 flex items-center gap-1.5 px-3">
            <AlertCircle className="w-3.5 h-3.5" /> {localError}
          </p>
        )}
      </form>

      {/* Suggested Quick Links */}
      <div className="flex items-center gap-2 px-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
        <span>Try quick samples:</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/expressjs/express')}
          className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
        >
          expressjs/express
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/facebook/react')}
          className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
        >
          facebook/react
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/pallets/flask')}
          className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
        >
          pallets/flask
        </button>
      </div>
    </div>
  );
}
