import React from 'react';
import { AlertCircle, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorMessage({ title = 'Error', message, code, onRetry, className = '' }) {
  const isKeyError = code === 'AI_NOT_CONFIGURED';
  const isRateLimit = code === 'GITHUB_RATE_LIMIT';

  return (
    <div className={`bg-rose-950/30 border border-rose-900/60 rounded-xl p-4 text-slate-200 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-semibold text-rose-300 text-sm">{title}</h4>
            {code && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-800/60">
                {code}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            {message}
          </p>

          {/* Actionable Hints */}
          {isKeyError && (
            <div className="bg-surface-900/80 border border-surface-700/80 rounded-lg p-3 text-xs text-slate-300 mb-3 space-y-1">
              <p className="font-medium text-amber-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> How to resolve:
              </p>
              <p>1. Open <Link to="/settings" className="text-blue-400 underline hover:text-blue-300">Settings</Link> to enter a free Gemini API key for this browser session.</p>
              <p>2. Or add <code className="bg-surface-800 px-1.5 py-0.5 rounded text-amber-200">LLM_API_KEY=your_key</code> inside <code className="bg-surface-800 px-1.5 py-0.5 rounded text-amber-200">backend/.env</code> and restart the server.</p>
            </div>
          )}

          {isRateLimit && (
            <div className="bg-surface-900/80 border border-surface-700/80 rounded-lg p-3 text-xs text-slate-300 mb-3 space-y-1">
              <p className="font-medium text-amber-300 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> GitHub Rate Limit Note:
              </p>
              <p>Unauthenticated GitHub API calls are capped at 60 requests/hr. Add an optional GitHub Token in <Link to="/settings" className="text-blue-400 underline hover:text-blue-300">Settings</Link> to unlock 5,000 requests/hr.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg border border-rose-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Request
              </button>
            )}
            {isKeyError && (
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-colors"
              >
                <Key className="w-3.5 h-3.5" /> Configure API Key
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
