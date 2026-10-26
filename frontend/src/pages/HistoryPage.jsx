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
          <h2 className="text-xl md:text-2xl font-bold text-white">Analysis History</h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Recently analyzed GitHub repositories stored locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 bg-surface-900 hover:bg-surface-850 border border-surface-750 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-surface-900 border border-surface-750 rounded-2xl p-12 text-center shadow-sm">
          <History className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Analysis History Yet</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Repositories you analyze will appear here for fast 1-click reloading.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-colors"
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
                  <span className="font-bold text-sm text-white font-mono">{repo.fullName}</span>
                  {repo.language && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-800 text-zinc-300 border border-surface-700">
                      {repo.language}
                    </span>
                  )}
                  {repo.stars !== undefined && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      ★ {repo.stars.toLocaleString()}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Analyzed {new Date(repo.analyzedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleReanalyze(repo.fullName)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
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
