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
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Explore Advanced Intelligence for {currentRepo.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1: Architecture X-Ray */}
              <button
                onClick={() => navigate('/architecture')}
                className="group p-5 rounded-2xl bg-surface-850 hover:bg-surface-800 border border-surface-700/80 hover:border-indigo-500/50 text-left transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      X-Ray View
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Architecture Map
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Interactive topology map with verified imports, API routes, and ORM connections.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-indigo-400">
                  <span>Open Topology</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Feature 2: Doctor Checkup */}
              <button
                onClick={() => navigate('/audit')}
                className="group p-5 rounded-2xl bg-surface-850 hover:bg-surface-800 border border-surface-700/80 hover:border-emerald-500/50 text-left transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      Doctor Checkup
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Bug & Security Audit
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Deterministic OWASP rule scanning + AI review with reviewable code diff patches.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-emerald-400">
                  <span>Run Audit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* File Viewer & Analyzer */}
              <button
                onClick={() => navigate('/analyzer')}
                className="group p-5 rounded-2xl bg-surface-850 hover:bg-surface-800 border border-surface-700/80 hover:border-blue-500/50 text-left transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                      Code Viewer
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Repository Analyzer
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Browse source trees, inspect syntax with line numbers, and view architecture notes.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-800 flex items-center justify-between text-xs font-medium text-blue-400">
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
