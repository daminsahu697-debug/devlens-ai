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
  const { selectedFile, isFileLoading, highlightedLineRange, currentRepo } = useRepository();
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
      <div className="bg-surface-900 border border-surface-750 rounded-2xl h-[650px] flex flex-col items-center justify-center text-zinc-400 p-8 shadow-sm">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-white">Retrieving source file...</p>
        <p className="text-xs text-zinc-500 mt-1">Decoding content and formatting lines</p>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="bg-surface-900 border border-surface-750 rounded-2xl h-[650px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
        <div className="p-3.5 rounded-2xl bg-surface-800 border border-surface-700 text-zinc-400 mb-3">
          <Code2 className="w-6 h-6 text-zinc-300" />
        </div>
        <h4 className="text-sm font-semibold text-white mb-1">No File Selected</h4>
        <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
          Select any file from the explorer on the left to inspect its code, view line numbers, and copy snippets.
        </p>
      </div>
    );
  }

  const lines = (selectedFile.content || '').split('\n');
  const pathSegments = selectedFile.path.split('/');

  return (
    <div className="bg-surface-900 border border-surface-750 rounded-2xl flex flex-col h-[650px] shadow-sm overflow-hidden">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="p-3 bg-surface-900 border-b border-surface-750 flex items-center justify-between gap-4 flex-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono truncate min-w-0">
          <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
          {pathSegments.map((seg, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-zinc-600">/</span>}
              <span className={idx === pathSegments.length - 1 ? 'text-white font-semibold truncate' : 'text-zinc-400 truncate'}>
                {seg}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* File Meta & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] font-mono text-zinc-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
            {lines.length} lines
          </span>

          {selectedFile.sizeBytes && (
            <span className="text-[10px] font-mono text-zinc-400 bg-surface-800 px-2 py-0.5 rounded border border-surface-700">
              {Math.round(selectedFile.sizeBytes / 1024)} KB
            </span>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
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
        <div className="px-4 py-1.5 bg-surface-800 border-b border-surface-750 text-xs text-zinc-300 flex items-center justify-between font-mono text-[11px]">
          <span>Highlighting reference lines: {highlightedLineRange.start} - {highlightedLineRange.end}</span>
        </div>
      )}

      {/* Code Text Area with Line Numbers */}
      <div
        ref={codeContainerRef}
        className="flex-1 overflow-auto bg-surface-950 font-mono text-xs text-zinc-300 p-2 selection:bg-surface-800 selection:text-white"
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
                <span className="w-12 pr-4 text-right select-none text-zinc-600 font-mono text-[11px] shrink-0 border-r border-surface-800">
                  {lineNum}
                </span>

                {/* Line content */}
                <span className="pl-4 pr-4 whitespace-pre font-mono text-[12px] text-zinc-200">
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
