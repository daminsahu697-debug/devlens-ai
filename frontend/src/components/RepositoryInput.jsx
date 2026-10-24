import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-surface-900 border border-surface-700/80 rounded-2xl shadow-xl focus-within:border-indigo-500/80 transition-all duration-200">
          <div className="flex items-center flex-1 px-3 py-2 gap-2.5">
            <GithubIcon className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              id="repository-url-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="https://github.com/owner/repository (e.g. https://github.com/expressjs/express)"
              disabled={isAnalyzing}
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-60 font-sans"
            />
          </div>

          <button
            type="submit"
            id="analyze-repo-button"
            disabled={isAnalyzing || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all duration-150 shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Repository...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Repository</span>
              </>
            )}
          </button>
        </div>

        {/* Validation Error Message */}
        {localError && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 px-2">
            <AlertCircle className="w-3.5 h-3.5" /> {localError}
          </p>
        )}
      </form>

      {/* Suggested Quick Links */}
      <div className="flex items-center gap-2 mt-2 px-2 text-xs text-slate-400 flex-wrap">
        <span className="text-slate-500">Try example:</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/expressjs/express')}
          className="hover:text-indigo-400 transition-colors underline decoration-slate-600"
        >
          expressjs/express
        </button>
        <span className="text-slate-600">•</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/facebook/react')}
          className="hover:text-indigo-400 transition-colors underline decoration-slate-600"
        >
          facebook/react
        </button>
        <span className="text-slate-600">•</span>
        <button
          type="button"
          onClick={() => handleSampleClick('https://github.com/pallets/flask')}
          className="hover:text-indigo-400 transition-colors underline decoration-slate-600"
        >
          pallets/flask
        </button>
      </div>
    </div>
  );
}
