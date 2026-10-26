import React from 'react';

export default function MetricCard({ title, value, icon: Icon, subtext, badge }) {
  return (
    <div className="group relative bg-surface-900/90 hover:bg-surface-850 border border-surface-750/80 hover:border-surface-600 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-sans">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-surface-800/80 text-slate-300 border border-surface-700/60 group-hover:text-white transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight font-sans">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono text-slate-400 bg-surface-800 border border-surface-700/60">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-400 truncate font-sans">
          {subtext}
        </p>
      )}
    </div>
  );
}
