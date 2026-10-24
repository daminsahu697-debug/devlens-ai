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
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {metadata.owner?.avatarUrl ? (
              <img
                src={metadata.owner.avatarUrl}
                alt={metadata.owner.login}
                className="w-14 h-14 rounded-2xl border-2 border-surface-700 shadow-md shrink-0 bg-surface-900"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-surface-800 border-2 border-surface-700 flex items-center justify-center text-slate-400 font-bold text-xl">
                {metadata.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {metadata.fullName}
                </h2>
                {metadata.archived && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Archived
                  </span>
                )}
                {metadata.isFork && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-750 text-slate-300 border border-surface-700">
                    Fork
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {metadata.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <a
              href={metadata.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-surface-800 hover:bg-surface-750 border border-surface-700 hover:border-slate-500 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Badges / Meta row */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-surface-700/60 flex-wrap text-xs text-slate-400">
          {metadata.license && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
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
              {metadata.topics.slice(0, 5).map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
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
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Official GitHub Repository Metadata
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Source: GitHub API v3</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Primary Language"
            value={metadata.language || 'Plain Text'}
            icon={Code2}
            badge="GitHub"
            subtext="Reported by repository linguist"
            accentColor="blue"
          />
          <MetricCard
            title="GitHub Stars"
            value={metadata.stars.toLocaleString()}
            icon={Star}
            badge="GitHub"
            subtext="Total stargazers"
            accentColor="amber"
          />
          <MetricCard
            title="Repository Forks"
            value={metadata.forks.toLocaleString()}
            icon={GitFork}
            badge="GitHub"
            subtext="Community forks"
            accentColor="violet"
          />
          <MetricCard
            title="Open Issues"
            value={metadata.openIssues.toLocaleString()}
            icon={AlertCircle}
            badge="GitHub"
            subtext="Open issues & pull requests"
            accentColor="indigo"
          />
        </div>
      </div>

      {/* Distinction Header 2: DevLens AI Calculated Analysis Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              DevLens Calculated Analysis Metrics
            </h3>
          </div>
          <span className="text-[11px] text-violet-400 font-medium">Computed by DevLens Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Discovered Files"
            value={(stats?.discoveredFiles ?? 0).toLocaleString()}
            icon={Layers}
            badge="DevLens"
            subtext={stats?.isTruncated ? "Truncated to safe limit" : "Full tree traversed"}
            accentColor="violet"
          />
          <MetricCard
            title="Source Code Files"
            value={(stats?.sourceFilesCount ?? 0).toLocaleString()}
            icon={FileCode}
            badge="DevLens"
            subtext="Program source files filtered"
            accentColor="emerald"
          />
          <MetricCard
            title="Documentation Files"
            value={(stats?.docsFilesCount ?? 0).toLocaleString()}
            icon={FileText}
            badge="DevLens"
            subtext="README, Guides, Markdown"
            accentColor="blue"
          />
          <MetricCard
            title="Config & Manifests"
            value={(stats?.configFilesCount ?? 0).toLocaleString()}
            icon={FileCheck}
            badge="DevLens"
            subtext="Build files, packages, JSON"
            accentColor="indigo"
          />
        </div>
      </div>

      {/* Language / File Extension Distribution Chart */}
      {languageBreakdown && languageBreakdown.length > 0 && (
        <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Discovered File Extensions</h3>
              <p className="text-xs text-slate-400">Distribution of indexed source and configuration files</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-800 text-slate-400 border border-surface-700">
              Top 7 Extensions
            </span>
          </div>
          <LanguageChart data={languageBreakdown} />
        </div>
      )}
    </div>
  );
}
