import React from 'react';
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
  Layers
} from 'lucide-react';
import MetricCard from './MetricCard';
import LanguageChart from './LanguageChart';

export default function RepositoryOverview({ metadata, stats, languageBreakdown }) {
  if (!metadata) return null;

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-surface-900 border border-surface-750 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {metadata.owner?.avatarUrl ? (
              <img
                src={metadata.owner.avatarUrl}
                alt={metadata.owner.login}
                className="w-13 h-13 rounded-2xl border border-surface-700 shadow-sm shrink-0 bg-surface-950"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-slate-300 font-bold text-lg">
                {metadata.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {metadata.fullName}
                </h2>
                {metadata.archived && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 border border-surface-700">
                    Archived
                  </span>
                )}
                {metadata.isFork && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 border border-surface-700">
                    Fork
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {metadata.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <a
              href={metadata.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Badges / Meta row */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-800 flex-wrap text-xs text-slate-400">
          {metadata.license && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>License: {metadata.license.name || metadata.license.spdxId}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span>Default Branch: <span className="font-mono text-slate-200">{metadata.defaultBranch}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Push: {new Date(metadata.pushedAt).toLocaleDateString()}</span>
          </div>
          {metadata.topics && metadata.topics.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap ml-auto">
              {metadata.topics.slice(0, 4).map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-800 text-slate-300 border border-surface-700"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distinction Header 1: Official GitHub REST Metadata */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Repository Metadata
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">GitHub API v3</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Primary Language"
            value={metadata.language || 'Plain Text'}
            icon={Code2}
            badge="GitHub"
            subtext="Repository linguist report"
          />
          <MetricCard
            title="GitHub Stars"
            value={metadata.stars.toLocaleString()}
            icon={Star}
            badge="GitHub"
            subtext="Total stargazers"
          />
          <MetricCard
            title="Repository Forks"
            value={metadata.forks.toLocaleString()}
            icon={GitFork}
            badge="GitHub"
            subtext="Community forks"
          />
          <MetricCard
            title="Open Issues"
            value={metadata.openIssues.toLocaleString()}
            icon={AlertCircle}
            badge="GitHub"
            subtext="Issues & pull requests"
          />
        </div>
      </div>

      {/* Distinction Header 2: DevLens AI Calculated Analysis Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Calculated Codebase Metrics
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">DevLens Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Indexed Files"
            value={(stats?.discoveredFiles ?? 0).toLocaleString()}
            icon={Layers}
            badge="Engine"
            subtext={stats?.isTruncated ? "Truncated to safe limit" : "Full tree traversed"}
          />
          <MetricCard
            title="Source Files"
            value={(stats?.sourceFilesCount ?? 0).toLocaleString()}
            icon={FileCode}
            badge="Engine"
            subtext="Program source files"
          />
          <MetricCard
            title="Documentation"
            value={(stats?.docsFilesCount ?? 0).toLocaleString()}
            icon={FileText}
            badge="Engine"
            subtext="Guides, Markdown, README"
          />
          <MetricCard
            title="Configs & Manifests"
            value={(stats?.configFilesCount ?? 0).toLocaleString()}
            icon={FileCheck}
            badge="Engine"
            subtext="Build files, packages, JSON"
          />
        </div>
      </div>

      {/* Language / File Extension Distribution Chart */}
      {languageBreakdown && languageBreakdown.length > 0 && (
        <div className="bg-surface-900 border border-surface-750 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Discovered File Extensions</h3>
              <p className="text-xs text-slate-400">Distribution of indexed source and configuration files</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-800 text-slate-400 border border-surface-700 font-mono">
              Top Extensions
            </span>
          </div>
          <LanguageChart data={languageBreakdown} />
        </div>
      )}
    </div>
  );
}
