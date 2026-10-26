import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  MessageSquareCode,
  ArrowRight,
  RefreshCw,
  Layers,
  Stethoscope
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import RepositoryInput from '../components/RepositoryInput';
import RepositoryOverview from '../components/RepositoryOverview';
import InstantOnboardingPanel from '../components/InstantOnboardingPanel';
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Search & Actions Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Repository Intelligence Dashboard
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Inspect structure, calculate metrics, audit vulnerabilities, and understand architecture with AI.
            </p>
          </div>

          {currentRepo && (
            <button
              onClick={clearActiveRepo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-surface-900 hover:bg-surface-800 border border-surface-750 transition-colors self-start md:self-auto shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-500" /> Analyze Another Repo
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Analyzed Repository Overview & Instant Onboarding */}
      {currentRepo && !isAnalyzing && (
        <div className="space-y-8">
          {/* Metadata & Language Breakdown */}
          <RepositoryOverview
            metadata={currentRepo}
            stats={repoStats}
            languageBreakdown={languageBreakdown}
          />

          {/* Feature 3: Instant Onboarding & Setup Guide Panel */}
          <InstantOnboardingPanel />

          {/* Quick Jump Action Cards for Features */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Explore Advanced Intelligence for {currentRepo.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Architecture Blueprint */}
              <button
                onClick={() => navigate('/architecture')}
                className="group relative p-6 rounded-3xl bg-surface-900 hover:bg-sky-50/50 dark:hover:bg-surface-850 border border-surface-750 hover:border-sky-300 dark:hover:border-sky-700 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold border border-sky-200 dark:border-sky-800">
                      4-Tier Schematic
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors tracking-tight">
                    Architecture Blueprint
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Interactive 4-tier visual system flow showing how client views, API handlers, intelligence engines, and cloud dependencies connect.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-750 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                  <span>View Full Blueprint</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Feature 2: Doctor Checkup */}
              <button
                onClick={() => navigate('/audit')}
                className="group relative p-6 rounded-3xl bg-surface-900 hover:bg-emerald-50/50 dark:hover:bg-surface-850 border border-surface-750 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      Doctor Checkup
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                    Smart Bug & Security Audit
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Deterministic OWASP security rules + AI heuristic vulnerability scanning with instant reviewable unified diff patches.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-750 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Run Security Audit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Feature 3: File Viewer & Analyzer */}
              <button
                onClick={() => navigate('/analyzer')}
                className="group relative p-6 rounded-3xl bg-surface-900 hover:bg-violet-50/50 dark:hover:bg-surface-850 border border-surface-750 hover:border-violet-300 dark:hover:border-violet-700 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 group-hover:scale-110 transition-transform">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold border border-violet-200 dark:border-violet-800">
                      Code Viewer
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors tracking-tight">
                    Repository Code Analyzer
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Browse source trees, inspect syntax with line numbers, and view verified AI grounded architecture explanations.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-750 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
                  <span>Browse Source Code</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
