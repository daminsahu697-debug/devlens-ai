import React from 'react';

export default function MetricCard({ title, value, icon: Icon, subtext, badge, color = 'sky' }) {
  const colorMap = {
    sky: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
    violet: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/40',
    rose: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
  };

  const badgeStyle = colorMap[color] || colorMap.sky;

  return (
    <div className="group relative bg-surface-900 hover:bg-surface-850 border border-surface-750 hover:border-surface-600 rounded-3xl p-5 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase font-sans">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${badgeStyle} group-hover:scale-110 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold text-slate-500 bg-surface-800 border border-surface-750">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate font-sans">
          {subtext}
        </p>
      )}
    </div>
  );
}
