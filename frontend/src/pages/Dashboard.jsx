import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  MessageSquareCode,
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import RepositoryInput from '../components/RepositoryInput';
import RepositoryOverview from '../components/RepositoryOverview';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { CardSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const {
    currentRepo,
    repoStats,
    languageBreakdown,
    isAnalyzing,
    analysisError,
    analyze,
    clearActiveRepo
  } = useRepository();

  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Search & Actions Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Repository Intelligence Dashboard
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Inspect structure, calculate metrics, and understand architecture with AI.
            </p>
          </div>

          {currentRepo && (
            <button
              onClick={clearActiveRepo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-surface-850 hover:bg-surface-800 border border-surface-700 transition-colors self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Analyze Another Repo
            </button>
          )}
        </div>

        <RepositoryInput onAnalyzed={() => {}} />
      </div>

      {/* Analysis Error Alert */}
      {analysisError && (
        <ErrorMessage
          title="Analysis Failed"
          message={analysisError}
          code="ANALYSIS_ERROR"
          onRetry={() => {}}
        />
      )}

      {/* Loading Skeleton */}
      {isAnalyzing && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {/* Empty State when no repository is loaded */}
      {!currentRepo && !isAnalyzing && (
        <EmptyState onSelectSample={(url) => analyze(url)} />
      )}

      {/* Analyzed Repository Overview & Quick Jump Cards */}
      {currentRepo && !isAnalyzing && (
        <div className="space-y-8">
          <RepositoryOverview
            metadata={currentRepo}
            stats={repoStats}
            languageBreakdown={languageBreakdown}
          />

          {/* Quick Jump Action Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Next Steps for {currentRepo.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/analyzer')}
                className="group p-5 rounded-2xl bg-surface-850 hover:bg-surface-800 border border-surface-700/80 hover:border-indigo-500/50 text-left transition-all duration-200 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Explore Source Files & Summary
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Browse filtered file tree, inspect source code with line numbers, and view the AI architecture summary.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
              </button>

              <button
                onClick={() => navigate('/ask')}
                className="group p-5 rounded-2xl bg-surface-850 hover:bg-surface-800 border border-surface-700/80 hover:border-violet-500/50 text-left transition-all duration-200 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                    <MessageSquareCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      Ask Questions About Codebase
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Query the codebase for entry points, data flows, and dependencies with source-grounded references.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
