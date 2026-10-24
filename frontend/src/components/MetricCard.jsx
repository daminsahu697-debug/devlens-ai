import React from 'react';

export default function MetricCard({ title, value, icon: Icon, subtext, badge, accentColor = 'blue' }) {
  const accentClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  }[accentColor] || 'text-blue-400 bg-blue-500/10 border-blue-500/20';

  return (
    <div className="bg-surface-850 border border-surface-700/70 hover:border-surface-600 rounded-xl p-4 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${accentClasses}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface-800 text-slate-300 border border-surface-700">
            {badge}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
