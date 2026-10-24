import React from 'react';
import {
  Sparkles,
  Layers,
  Cpu,
  FileCode,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import { SummarySkeleton } from './LoadingSkeleton';
import ErrorMessage from './ErrorMessage';

export default function SummaryPanel() {
  const {
    currentRepo,
    summaryData,
    isSummaryLoading,
    summaryError,
    requestSummary,
    selectFile
  } = useRepository();

  if (!currentRepo) return null;

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">AI Architectural Intelligence</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified repository context analyzed by AI to extract purpose, patterns, and execution flow.
          </p>
        </div>

        <button
          onClick={requestSummary}
          disabled={isSummaryLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 shrink-0"
        >
          {isSummaryLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Architecture...</span>
            </>
          ) : summaryData ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Summary</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {summaryError && (
        <ErrorMessage
          title="AI Summary Failed"
          message={summaryError}
          code="AI_NOT_CONFIGURED"
          onRetry={requestSummary}
        />
      )}

      {/* Loading Skeleton */}
      {isSummaryLoading && <SummarySkeleton />}

      {/* Empty State before generation */}
      {!summaryData && !isSummaryLoading && !summaryError && (
        <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-2">Generate Project Architecture Summary</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            DevLens AI will inspect the repository's README, dependency manifests (package.json, pyproject.toml, etc.), and main entry point files to synthesize an architectural overview.
          </p>
          <button
            onClick={requestSummary}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25"
          >
            <Sparkles className="w-4 h-4" /> Start AI Analysis
          </button>
        </div>
      )}

      {/* Summary Content */}
      {summaryData && !isSummaryLoading && (
        <div className="space-y-6">
          {/* 1. Project Purpose */}
          <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Project Purpose</h4>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {summaryData.summary?.projectPurpose}
            </p>
          </div>

          {/* 2. Main Technologies */}
          {summaryData.summary?.mainTechnologies?.length > 0 && (
            <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-blue-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Main Technologies & Libraries</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.summary.mainTechnologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-900 border border-surface-700 text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Architecture & Execution Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inferred Architecture */}
            <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-violet-400">
                <Layers className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Inferred Architecture</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                {summaryData.summary?.architecture}
              </p>
            </div>

            {/* Execution Flow */}
            <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Terminal className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Main Execution Flow</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                {summaryData.summary?.executionFlow}
              </p>
            </div>
          </div>

          {/* 4. Important Files & Responsibilities */}
          {summaryData.summary?.importantFiles?.length > 0 && (
            <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <FileCode className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Important Files & Responsibilities</h4>
              </div>
              <div className="space-y-2">
                {summaryData.summary.importantFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-900 border border-surface-700/60 hover:border-surface-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <button
                      onClick={() => selectFile(file.path)}
                      className="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:underline text-left font-semibold"
                    >
                      {file.path}
                    </button>
                    <span className="text-xs text-slate-300 sm:text-right max-w-md">
                      {file.responsibility}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Setup Instructions */}
          <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Terminal className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Setup & Running Instructions</h4>
            </div>
            <div className="bg-surface-950 border border-surface-800 rounded-xl p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {summaryData.summary?.setupInstructions}
            </div>
          </div>

          {/* 6. Confidence Notes & Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-900/60 border border-surface-750 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5 text-slate-300">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-semibold text-slate-200">Confidence & Verification Notes</h5>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {summaryData.summary?.confidenceNotes}
              </p>
            </div>

            <div className="bg-surface-900/60 border border-surface-750 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5 text-slate-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h5 className="text-xs font-semibold text-slate-200">Potential Limitations</h5>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {summaryData.summary?.limitations}
              </p>
            </div>
          </div>

          {/* Verified Source Files Used */}
          {summaryData.contextFilesUsed?.length > 0 && (
            <div className="p-4 bg-surface-900/40 border border-surface-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
              <span className="text-slate-500 font-medium">Context files verified by server:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {summaryData.contextFilesUsed.map((cf, i) => (
                  <button
                    key={i}
                    onClick={() => selectFile(cf.path)}
                    className="px-2 py-0.5 rounded bg-surface-850 hover:bg-surface-800 border border-surface-700 text-indigo-300 font-mono text-[11px] hover:underline"
                  >
                    {cf.path}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
