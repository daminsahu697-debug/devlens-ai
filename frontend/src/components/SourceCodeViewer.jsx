import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Code2,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

export default function SourceCodeViewer() {
  const { selectedFile, isFileLoading, fileError, highlightedLineRange, currentRepo } = useRepository();
  const [copied, setCopied] = useState(false);
  const codeContainerRef = useRef(null);

  // Auto-scroll to highlighted line if navigated from Q&A reference
  useEffect(() => {
    if (highlightedLineRange?.start && codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(`#line-${highlightedLineRange.start}`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedLineRange, selectedFile]);

  const handleCopy = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isFileLoading) {
    return (
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl h-[650px] flex flex-col items-center justify-center text-slate-400 p-8 shadow-xl">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Retrieving source file from GitHub...</p>
        <p className="text-xs text-slate-500 mt-1">Decoding content and formatting lines</p>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl h-[650px] flex flex-col items-center justify-center text-center p-8 shadow-xl">
        <div className="p-4 rounded-2xl bg-surface-800 border border-surface-700 text-slate-400 mb-4">
          <Code2 className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="text-base font-semibold text-white mb-1">No File Selected</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
          Select any file from the file explorer on the left to inspect its code, view line numbers, and copy snippets.
        </p>
      </div>
    );
  }

  const lines = (selectedFile.content || '').split('\n');
  const pathSegments = selectedFile.path.split('/');

  return (
    <div className="bg-surface-850 border border-surface-700/80 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="p-3 bg-surface-900 border-b border-surface-700/80 flex items-center justify-between gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate min-w-0">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          {pathSegments.map((seg, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-600">/</span>}
              <span className={idx === pathSegments.length - 1 ? 'text-indigo-300 font-semibold truncate' : 'text-slate-400 truncate'}>
                {seg}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* File Meta & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
            {lines.length} lines
          </span>

          {selectedFile.sizeBytes && (
            <span className="text-[11px] font-mono text-slate-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
              {Math.round(selectedFile.sizeBytes / 1024)} KB
            </span>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {currentRepo && (
            <a
              href={`https://github.com/${currentRepo.fullName}/blob/${currentRepo.defaultBranch}/${selectedFile.path}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
              title="Open file on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* Highlight notice if navigated from Q&A */}
      {highlightedLineRange && (
        <div className="px-4 py-1.5 bg-indigo-500/10 border-b border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <span>Highlighting reference lines: {highlightedLineRange.start} - {highlightedLineRange.end}</span>
          <button
            onClick={() => {}}
            className="text-[10px] text-indigo-400 underline"
          >
            Clear highlight
          </button>
        </div>
      )}

      {/* Code Text Area with Line Numbers */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-auto bg-surface-950 font-mono text-xs text-slate-300 p-2 selection:bg-indigo-900 selection:text-white"
      >
        <div className="min-w-full inline-block">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightedLineRange &&
              lineNum >= highlightedLineRange.start &&
              lineNum <= highlightedLineRange.end;

            return (
              <div
                key={lineNum}
                id={`line-${lineNum}`}
                className={`code-line flex items-baseline ${isHighlighted ? 'highlighted' : ''}`}
              >
                {/* Line number gutter */}
                <span className="w-12 pr-4 text-right select-none text-slate-600 font-mono text-[11px] shrink-0 border-r border-surface-850">
                  {lineNum}
                </span>

                {/* Line content (Untrusted text rendered safely through standard React JSX string interpolation) */}
                <span className="pl-4 pr-4 whitespace-pre font-mono text-slate-300 flex-1">
                  {lineText || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
