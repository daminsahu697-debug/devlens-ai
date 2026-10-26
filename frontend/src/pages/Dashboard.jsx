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
              <Layers className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Explore Advanced Intelligence for {currentRepo.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1: Architecture Blueprint */}
              <button
                onClick={() => navigate('/architecture')}
                className="group relative p-6 rounded-2xl bg-surface-900 hover:bg-surface-850 border border-surface-750 hover:border-slate-500 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-800 text-slate-200 border border-surface-700 group-hover:text-white transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] font-medium border border-surface-700">
                      System Topology
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors tracking-tight">
                    Architecture Blueprint
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Clear 3-tier system breakdown with verified static imports, API routes, and cloud service dependencies.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                  <span>View Architecture</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Feature 2: Doctor Checkup */}
              <button
                onClick={() => navigate('/audit')}
                className="group relative p-6 rounded-2xl bg-surface-900 hover:bg-surface-850 border border-surface-750 hover:border-slate-500 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-800 text-slate-200 border border-surface-700 group-hover:text-white transition-colors">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] font-medium border border-surface-700">
                      Doctor Checkup
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors tracking-tight">
                    Smart Bug & Security Audit
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Deterministic OWASP security rules + AI heuristic review with reviewable unified diff patches.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                  <span>Run Audit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Feature 3: File Viewer & Analyzer */}
              <button
                onClick={() => navigate('/analyzer')}
                className="group relative p-6 rounded-2xl bg-surface-900 hover:bg-surface-850 border border-surface-750 hover:border-slate-500 text-left transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-800 text-slate-200 border border-surface-700 group-hover:text-white transition-colors">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] font-medium border border-surface-700">
                      Code Viewer
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors tracking-tight">
                    Repository Analyzer
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Browse source trees, inspect syntax with line numbers, and view grounded AI explanations.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                  <span>Browse Source</span>
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
