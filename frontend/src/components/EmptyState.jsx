import React from 'react';
import { GitBranch, Sparkles, MessageSquareCode, ShieldCheck, Terminal, Compass, ArrowRight } from 'lucide-react';

export default function EmptyState({ onSelectSample }) {
  const sampleRepos = [
    { name: 'expressjs/express', desc: 'Fast, unopinionated, minimalist web framework for Node.js', lang: 'JavaScript', stars: '64k' },
    { name: 'facebook/react', desc: 'The library for web and native user interfaces', lang: 'JavaScript', stars: '228k' },
    { name: 'pallets/flask', desc: 'The Python micro framework for building web applications', lang: 'Python', stars: '67k' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        AI-Powered Codebase Intelligence
      </div>

      {/* Hero Headings */}
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        Understand Any Codebase. <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
          In Minutes.
        </span>
      </h1>
      <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Explore repositories, understand project architecture, and get source-grounded explanations with AI.
      </p>

      {/* Quick Launch Cards */}
      <div className="mb-12 text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Quick Start with Popular Open Source Repositories:
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleRepos.map(repo => (
            <button
              key={repo.name}
              onClick={() => onSelectSample(`https://github.com/${repo.name}`)}
              className="group text-left p-4 rounded-xl bg-surface-850 hover:bg-surface-800 border border-surface-700/70 hover:border-indigo-500/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {repo.name}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                {repo.desc}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-surface-900 border border-surface-700 text-slate-300">
                  {repo.lang}
                </span>
                <span>⭐ {repo.stars}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-surface-700/60 pt-10">
        <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <GitBranch className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Live Metadata & Tree</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct GitHub API tree traversal, categorized source files, language breakdown, and safe in-browser code viewing.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Architectural Summaries</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI infers project purpose, dependencies, core responsibilities, and execution flow without hallucinating unseen code.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900/60 border border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Ask Your Codebase</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Source-grounded answers with clickable line number references and honest uncertainty when evidence is insufficient.
          </p>
        </div>
      </div>
    </div>
  );
}
