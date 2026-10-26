import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Star, ExternalLink, ArrowRight, Trash2, Clock } from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

export default function HistoryPage() {
  const { history, analyze } = useRepository();
  const navigate = useNavigate();

  const handleClear = () => {
    try {
      localStorage.removeItem('devlens_analysis_history');
      window.location.reload();
    } catch {
      // ignore
    }
  };

  const handleReanalyze = async (fullName) => {
    await analyze(`https://github.com/${fullName}`);
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
            Recently analyzed GitHub repositories stored locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 bg-surface-900 hover:bg-surface-850 border border-surface-750 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-surface-900 border border-surface-750 rounded-3xl p-12 text-center shadow-sm">
          <History className="w-10 h-10 text-sky-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Analysis History Yet</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Repositories you analyze will appear here for fast 1-click reloading.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/20"
          >
            Analyze a Repository
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((repo, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-900 border border-surface-750 hover:border-surface-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">{repo.fullName}</span>
                  {repo.language && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold">
                      {repo.language}
                    </span>
                  )}
                  {repo.stars !== undefined && (
                    <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                      ★ {repo.stars.toLocaleString()}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Analyzed {new Date(repo.analyzedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-750 transition-colors"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleReanalyze(repo.fullName)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-colors"
                >
                  <span>Re-analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
