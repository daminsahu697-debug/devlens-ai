import React from 'react';
import { GitBranch, Sparkles, MessageSquareCode, ArrowRight, Layers, Stethoscope } from 'lucide-react';

export default function EmptyState({ onSelectSample }) {
  const sampleRepos = [
    { name: 'expressjs/express', desc: 'Fast, unopinionated, minimalist web framework for Node.js', lang: 'JavaScript', stars: '64k', color: 'sky' },
    { name: 'daminsahu697-debug/portfolio', desc: 'Modern responsive developer portfolio with React and Tailwind', lang: 'React SPA', stars: '12', color: 'emerald' },
    { name: 'pallets/flask', desc: 'The Python micro framework for building web applications', lang: 'Python', stars: '67k', color: 'violet' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold mb-5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
        <span>Repository Intelligence & Architecture X-Ray</span>
      </div>

      {/* Hero Headings */}
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
        Analyze, Audit, & Understand Any GitHub Codebase
      </h1>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Generate 4-tier visual architecture blueprints, run doctor checkup security audits, and browse source files with AI.
      </p>

      {/* Quick Launch Cards */}
      <div className="mb-12 text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-mono">
            Quick Start Samples:
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleRepos.map(repo => (
            <button
              key={repo.name}
              onClick={() => onSelectSample(`https://github.com/${repo.name}`)}
              className="group text-left p-5 rounded-3xl bg-surface-900 hover:bg-sky-50/40 dark:hover:bg-surface-850 border border-surface-750 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:underline truncate">
                  {repo.name}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {repo.desc}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span className="px-2 py-0.5 rounded-md bg-surface-800 border border-surface-750 text-slate-700 dark:text-slate-300 font-semibold">
                  {repo.lang}
                </span>
                <span className="font-semibold text-amber-500">★ {repo.stars}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-surface-750 pt-10">
        <div className="p-6 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono">4-Tier Architecture</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Large, visual flow diagram mapping client UI, API routes, intelligence engines, and cloud services.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mb-3">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono">Doctor Checkup</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Deterministic OWASP security rules and AI heuristic audit with instant reviewable unified diff patches.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 flex items-center justify-center mb-3">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono">Instant Onboarding</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            2-minute ramp up guide with verified tech stack matrix, setup commands, and source-grounded answers.
          </p>
        </div>
      </div>
    </div>
  );
}
