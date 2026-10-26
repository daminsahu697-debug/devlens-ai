import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareCode, Code2, Eye, EyeOff } from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import QuestionAnswerPanel from '../components/QuestionAnswerPanel';
import SourceCodeViewer from '../components/SourceCodeViewer';
import RepositoryInput from '../components/RepositoryInput';
import EmptyState from '../components/EmptyState';

export default function AskCodebasePage() {
  const { currentRepo, selectedFile, analyze } = useRepository();
  const [showViewerSideBySide, setShowViewerSideBySide] = useState(false);
  const navigate = useNavigate();

  if (!currentRepo) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Ask Your Codebase</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
            Ask targeted questions grounded in source code. Analyze a repository first.
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
      {/* Top Bar for Q&A */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-900 border border-surface-750 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4 text-violet-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            <span className="text-slate-500 font-sans font-normal">Codebase Q&A:</span> <span>{currentRepo.fullName}</span>
          </h2>
        </div>

        <button
          onClick={() => setShowViewerSideBySide(!showViewerSideBySide)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
        >
          {showViewerSideBySide ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hide Split Viewer</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Show Split Viewer</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className={`grid gap-4 items-start ${showViewerSideBySide ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
        <div className={showViewerSideBySide ? 'lg:col-span-6' : 'w-full'}>
          <QuestionAnswerPanel
            onNavigateToFile={() => {
              if (!showViewerSideBySide) {
                setShowViewerSideBySide(true);
              }
            }}
          />
        </div>

        {showViewerSideBySide && (
          <div className="lg:col-span-6">
            <SourceCodeViewer />
          </div>
        )}
      </div>
    </div>
  );
}
