import React from 'react';

export default function MetricCard({ title, value, icon: Icon, subtext, badge, accentColor = 'blue' }) {
  const accentStyles = {
    blue: {
      icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      dot: 'bg-blue-400',
      glow: 'group-hover:border-blue-500/40'
    },
    violet: {
      icon: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      dot: 'bg-violet-400',
      glow: 'group-hover:border-violet-500/40'
    },
    emerald: {
      icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-400',
      glow: 'group-hover:border-emerald-500/40'
    },
    amber: {
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-400',
      glow: 'group-hover:border-amber-500/40'
    },
    indigo: {
      icon: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      dot: 'bg-indigo-400',
      glow: 'group-hover:border-indigo-500/40'
    },
  }[accentColor] || {
    icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-400',
    glow: 'group-hover:border-blue-500/40'
  };

  return (
    <div className={`group relative bg-surface-900/90 hover:bg-surface-850 border border-surface-700/80 ${accentStyles.glow} rounded-2xl p-4 transition-all duration-200 shadow-lg hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${accentStyles.dot}`}></span>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl border ${accentStyles.icon} transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">{value}</span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-surface-800 text-slate-300 border border-surface-700">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1 font-sans">
          {subtext}
        </p>
      )}
    </div>
  );
}

