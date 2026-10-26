import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Search,
  ChevronRight,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

function getFileIcon(extension) {
  const ext = (extension || '').toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'cs', 'rb', 'php'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
  }
  if (['md', 'txt', 'rst', 'doc'].includes(ext)) {
    return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
  }
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'env'].includes(ext)) {
    return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
  }
  return <File className="w-4 h-4 text-slate-400 shrink-0" />;
}

export default function FileExplorer() {
  const { fileTree, selectedFile, selectFile, isFileLoading, repoStats } = useRepository();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'source', 'docs', 'config'

  // Filter files
  const filteredFiles = useMemo(() => {
    if (!fileTree) return [];
    return fileTree.filter(item => {
      // Exclude directories from list view for cleaner navigation
      if (item.type === 'tree') return false;

      // Filter by search query
      if (searchQuery.trim() && !item.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      const ext = (item.path.split('.').pop() || '').toLowerCase();
      if (activeFilter === 'source') {
        return ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'cs', 'php', 'rb'].includes(ext);
      }
      if (activeFilter === 'docs') {
        return ['md', 'txt', 'rst'].includes(ext) || item.path.toLowerCase().includes('readme');
      }
      if (activeFilter === 'config') {
        return ['json', 'yaml', 'yml', 'toml', 'xml', 'mod', 'gradle'].includes(ext);
      }

      return true;
    });
  }, [fileTree, searchQuery, activeFilter]);

  return (
    <div className="bg-surface-850 border border-surface-700/80 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-surface-700/80 bg-surface-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Repository Files
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
            {filteredFiles.length} files
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames or paths..."
            className="w-full bg-surface-800 text-xs text-white placeholder-zinc-500 rounded-lg pl-8 pr-3 py-1.5 border border-surface-700 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {['all', 'source', 'docs', 'config'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-md capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-surface-800 text-white border border-surface-700'
                  : 'bg-surface-950 text-zinc-400 hover:text-white border border-surface-750'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredFiles.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            {searchQuery ? 'No files match your search filter.' : 'No files discovered in repository.'}
          </div>
        ) : (
          filteredFiles.map(file => {
            const isSelected = selectedFile?.path === file.path;
            const ext = file.path.split('.').pop();
            const segments = file.path.split('/');
            const fileName = segments.pop();
            const dirPath = segments.join('/');

            return (
              <button
                key={file.path}
                onClick={() => selectFile(file.path)}
                disabled={isFileLoading && isSelected}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs group transition-colors ${
                  isSelected
                    ? 'bg-surface-800 text-white border border-surface-700 font-semibold'
                    : 'text-zinc-300 hover:bg-surface-800/60 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(ext)}
                  <div className="min-w-0 truncate">
                    <span className="font-mono text-xs">{fileName}</span>
                    {dirPath && (
                      <span className="text-[10px] text-slate-500 ml-1.5 truncate">
                        {dirPath}
                      </span>
                    )}
                  </div>
                </div>

                {file.size > 0 && (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                    {Math.round(file.size / 1024) > 0 ? `${Math.round(file.size / 1024)} KB` : `${file.size} B`}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Truncation notice if large repository */}
      {repoStats?.isTruncated && (
        <div className="p-2 bg-amber-950/30 border-t border-amber-900/50 text-[11px] text-amber-300/90 text-center">
          Repository tree truncated to maintain performance.
        </div>
      )}
    </div>
  );
}
