import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  GitFork,
  AlertCircle,
  Code2,
  FileCode,
  FileText,
  FileCheck,
  GitBranch,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Sparkles,
  Video
} from 'lucide-react';
import MetricCard from './MetricCard';
import LanguageChart from './LanguageChart';

export default function RepositoryOverview({ metadata, stats, languageBreakdown }) {
  const navigate = useNavigate();
  if (!metadata) return null;

  return (
    <div className="space-y-8">
      {/* Header Info Banner */}
      <div className="bg-surface-900 border border-surface-750 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {metadata.owner?.avatarUrl ? (
              <img
                src={metadata.owner.avatarUrl}
                alt={metadata.owner.login}
                className="w-16 h-16 rounded-2xl border border-surface-700 shadow-md shrink-0 bg-surface-950"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-surface-800 border border-surface-700 flex items-center justify-center text-sky-700 dark:text-slate-300 font-extrabold text-2xl">
                {metadata.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metadata.fullName}
                </h2>
                {metadata.archived && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                    Archived
                  </span>
                )}
                {metadata.isFork && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold">
                    Fork
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {metadata.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/video')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Video className="w-4 h-4 text-white" />
              <span>Watch AI Video</span>
            </button>

            <a
              href={metadata.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-750 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-sky-500" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Badges / Meta row */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-surface-750 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium">
          {metadata.license && (
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              <span>License: {metadata.license.name || metadata.license.spdxId}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span>Default Branch: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{metadata.defaultBranch}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Push: {new Date(metadata.pushedAt).toLocaleDateString()}</span>
          </div>
          {metadata.topics && metadata.topics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {metadata.topics.slice(0, 4).map(topic => (
                <span
                  key={topic}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-sky-50 dark:bg-surface-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-surface-700"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GitHub Repository Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">
              GitHub Metrics
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Official REST Data</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Primary Language"
            value={metadata.language || 'Plain Text'}
            icon={Code2}
            badge="GitHub"
            color="sky"
            subtext="Repository linguist report"
          />
          <MetricCard
            title="GitHub Stars"
            value={metadata.stars.toLocaleString()}
            icon={Star}
            badge="GitHub"
            color="amber"
            subtext="Total stargazers"
          />
          <MetricCard
            title="Repository Forks"
            value={metadata.forks.toLocaleString()}
            icon={GitFork}
            badge="GitHub"
            color="violet"
            subtext="Community forks"
          />
          <MetricCard
            title="Open Issues"
            value={metadata.openIssues.toLocaleString()}
            icon={AlertCircle}
            badge="GitHub"
            color="rose"
            subtext="Issues & pull requests"
          />
        </div>
      </div>

      {/* DevLens Calculated Codebase Analysis Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">
              Calculated Codebase Metrics
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">DevLens Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Indexed Files"
            value={(stats?.discoveredFiles ?? 0).toLocaleString()}
            icon={Layers}
            badge="Engine"
            color="sky"
            subtext={stats?.isTruncated ? "Truncated to safe limit" : "Full tree traversed"}
          />
          <MetricCard
            title="Source Files"
            value={(stats?.sourceFilesCount ?? 0).toLocaleString()}
            icon={FileCode}
            badge="Engine"
            color="emerald"
            subtext="Program source files"
          />
          <MetricCard
            title="Documentation"
            value={(stats?.docsFilesCount ?? 0).toLocaleString()}
            icon={FileText}
            badge="Engine"
            color="violet"
            subtext="Guides, Markdown, README"
          />
          <MetricCard
            title="Configs & Manifests"
            value={(stats?.configFilesCount ?? 0).toLocaleString()}
            icon={FileCheck}
            badge="Engine"
            color="amber"
            subtext="Build files, packages, JSON"
          />
        </div>
      </div>

      {/* Language / File Extension Distribution Chart */}
      {languageBreakdown && languageBreakdown.length > 0 && (
        <div className="bg-surface-900 border border-surface-750 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Discovered File Extensions</h3>
              <p className="text-xs text-slate-500">Distribution of indexed source and configuration files</p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-800 text-slate-600 dark:text-slate-300 border border-surface-750 font-mono font-semibold">
              Top Extensions
            </span>
          </div>
          <LanguageChart data={languageBreakdown} />
        </div>
      )}
    </div>
  );
}
