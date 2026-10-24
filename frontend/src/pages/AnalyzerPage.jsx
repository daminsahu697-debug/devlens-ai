import React, { useState } from 'react';
import { Code2, Sparkles, FolderTree, FileCode, Layers } from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import FileExplorer from '../components/FileExplorer';
import SourceCodeViewer from '../components/SourceCodeViewer';
import SummaryPanel from '../components/SummaryPanel';
import RepositoryInput from '../components/RepositoryInput';
import EmptyState from '../components/EmptyState';

export default function AnalyzerPage() {
  const { currentRepo, analyze } = useRepository();
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'summary'

  if (!currentRepo) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Repository Analyzer</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Enter a public repository URL to explore source files and generate architecture summaries.
          </p>
          <div className="pt-2">
            <RepositoryInput />
          </div>
        </div>
        <EmptyState onSelectSample={(url) => analyze(url)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Workspace Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-900 border border-surface-700/80 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Workspace:</span>
              <span className="font-mono text-indigo-300">{currentRepo.fullName}</span>
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-950 rounded-xl border border-surface-800">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Source Code Viewer</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Project Summary</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: File Explorer (4 cols) */}
        <div className="lg:col-span-4">
          <FileExplorer />
        </div>

        {/* Right Column: Code Viewer or Summary (8 cols) */}
        <div className="lg:col-span-8">
          {activeTab === 'code' ? (
            <SourceCodeViewer />
          ) : (
            <SummaryPanel />
          )}
        </div>
      </div>
    </div>
  );
}
