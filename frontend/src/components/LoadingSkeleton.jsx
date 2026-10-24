import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-surface-850 border border-surface-700/60 rounded-xl p-4 animate-shimmer space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-surface-700 rounded"></div>
        <div className="h-7 w-7 bg-surface-700 rounded-lg"></div>
      </div>
      <div className="h-7 w-20 bg-surface-700 rounded"></div>
      <div className="h-3 w-36 bg-surface-800 rounded"></div>
    </div>
  );
}

export function CodeViewerSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-700/70 rounded-xl overflow-hidden animate-shimmer">
      <div className="h-10 bg-surface-850 border-b border-surface-700/70 px-4 flex items-center justify-between">
        <div className="h-4 w-48 bg-surface-700 rounded"></div>
        <div className="h-4 w-20 bg-surface-700 rounded"></div>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3 w-3/4 bg-surface-800 rounded"></div>
        <div className="h-3 w-1/2 bg-surface-800 rounded"></div>
        <div className="h-3 w-5/6 bg-surface-800 rounded"></div>
        <div className="h-3 w-2/3 bg-surface-800 rounded"></div>
        <div className="h-3 w-4/5 bg-surface-800 rounded"></div>
        <div className="h-3 w-1/3 bg-surface-800 rounded"></div>
        <div className="h-3 w-3/5 bg-surface-800 rounded"></div>
      </div>
    </div>
  );
}

export function TreeSkeleton() {
  return (
    <div className="p-3 space-y-2 animate-shimmer">
      <div className="h-3 w-32 bg-surface-700 rounded mb-4"></div>
      <div className="h-5 w-full bg-surface-800 rounded"></div>
      <div className="h-5 w-4/5 bg-surface-800 rounded ml-3"></div>
      <div className="h-5 w-3/4 bg-surface-800 rounded ml-3"></div>
      <div className="h-5 w-full bg-surface-800 rounded"></div>
      <div className="h-5 w-2/3 bg-surface-800 rounded ml-3"></div>
      <div className="h-5 w-4/5 bg-surface-800 rounded ml-3"></div>
    </div>
  );
}

export function SummarySkeleton() {
  return (
    <div className="space-y-4 animate-shimmer">
      <div className="bg-surface-850 border border-surface-700/60 rounded-xl p-5 space-y-3">
        <div className="h-5 w-40 bg-surface-700 rounded"></div>
        <div className="h-4 w-full bg-surface-800 rounded"></div>
        <div className="h-4 w-5/6 bg-surface-800 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-850 border border-surface-700/60 rounded-xl p-5 space-y-2">
          <div className="h-4 w-32 bg-surface-700 rounded"></div>
          <div className="h-3 w-full bg-surface-800 rounded"></div>
          <div className="h-3 w-4/5 bg-surface-800 rounded"></div>
        </div>
        <div className="bg-surface-850 border border-surface-700/60 rounded-xl p-5 space-y-2">
          <div className="h-4 w-32 bg-surface-700 rounded"></div>
          <div className="h-3 w-full bg-surface-800 rounded"></div>
          <div className="h-3 w-3/4 bg-surface-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}
