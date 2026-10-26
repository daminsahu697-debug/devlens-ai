import React from 'react';
import { GitBranch, Sparkles, MessageSquareCode, ArrowRight, Layers, Stethoscope } from 'lucide-react';

export default function EmptyState({ onSelectSample }) {
  const sampleRepos = [
    { name: 'expressjs/express', desc: 'Fast, unopinionated, minimalist web framework for Node.js', lang: 'JavaScript', stars: '64k' },
    { name: 'daminsahu697-debug/portfolio', desc: 'Modern responsive developer portfolio with React and Tailwind', lang: 'React SPA', stars: '12' },
    { name: 'pallets/flask', desc: 'The Python micro framework for building web applications', lang: 'Python', stars: '67k' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-900 border border-surface-750 text-zinc-300 text-xs font-mono mb-4">
        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
        <span>Repository Intelligence</span>
      </div>

      {/* Hero Headings */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
        Analyze and Understand Any GitHub Codebase
      </h1>
      <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
        Inspect architecture blueprints, run doctor checkup security audits, and browse source files with AI.
      </p>

      {/* Quick Launch Cards */}
      <div className="mb-10 text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase font-mono">
            Quick Start Samples:
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleRepos.map(repo => (
            <button
              key={repo.name}
              onClick={() => onSelectSample(`https://github.com/${repo.name}`)}
              className="group text-left p-4 rounded-xl bg-surface-900 hover:bg-surface-850 border border-surface-750 hover:border-surface-600 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-white group-hover:underline truncate">
                  {repo.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 shrink-0" />
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                {repo.desc}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-surface-950 border border-surface-750 text-zinc-300">
                  {repo.lang}
                </span>
                <span>★ {repo.stars}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-surface-750 pt-8">
        <div className="p-4 rounded-xl bg-surface-900 border border-surface-750">
          <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center mb-2.5">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono">3-Tier Architecture</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Instant blueprint separating client UI, API routes, and cloud services.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900 border border-surface-750">
          <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center mb-2.5">
            <Stethoscope className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono">Doctor Checkup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deterministic OWASP security rules and AI heuristic audit with reviewable patches.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900 border border-surface-750">
          <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center mb-2.5">
            <MessageSquareCode className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono">Instant Onboarding</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            2-minute ramp up guide with local setup commands and source-grounded answers.
          </p>
        </div>
      </div>
    </div>
  );
}
