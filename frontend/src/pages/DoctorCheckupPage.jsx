/**
 * DevLens AI - Feature 2: Smart Bug & Security Audit (Doctor Checkup)
 * Hybrid auditing dashboard combining deterministic rule-based checks with
 * AI-assisted reasoning, reviewable diff patch generation, and false-positive handling.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  Sparkles,
  Cpu,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Copy,
  Download,
  FileCode,
  X,
  Code2
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

const SEVERITY_CONFIG = {
  CRITICAL: {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: AlertOctagon,
    color: 'text-rose-400'
  },
  HIGH: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: AlertTriangle,
    color: 'text-amber-400'
  },
  MEDIUM: {
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: AlertTriangle,
    color: 'text-yellow-400'
  },
  LOW: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: Info,
    color: 'text-blue-400'
  },
  INFO: {
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    icon: Info,
    color: 'text-slate-400'
  }
};

export default function DoctorCheckupPage() {
  const {
    currentRepo,
    auditData,
    isAuditLoading,
    auditError,
    requestAudit,
    requestFix,
    dismissedFindings,
    markFindingStatus,
    selectFile
  } = useRepository();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState(null);

  // Fix Generation Modal State
  const [activeFixFinding, setActiveFixFinding] = useState(null);
  const [fixResult, setFixResult] = useState(null);
  const [isFixLoading, setIsFixLoading] = useState(false);
  const [fixError, setFixError] = useState(null);
  const [copiedPatch, setCopiedPatch] = useState(false);

  // Auto-request audit on mount if repo active and not yet loaded
  useEffect(() => {
    if (currentRepo && !auditData && !isAuditLoading && !auditError) {
      requestAudit();
    }
  }, [currentRepo, auditData, isAuditLoading, auditError]);

  // Filtered & Sorted Findings
  const filteredFindings = useMemo(() => {
    if (!auditData?.findings) return [];

    return auditData.findings.filter(f => {
      const isDismissed = Boolean(dismissedFindings[f.id]);
      const matchesSearch = !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.filePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.ruleId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
      const matchesSource = selectedSource === 'ALL' || f.analysisSource === selectedSource;

      return matchesSearch && matchesSeverity && matchesSource;
    });
  }, [auditData, searchQuery, selectedSeverity, selectedSource, dismissedFindings]);

  // Trigger One-Click Fix Patch Generator
  const handleGenerateFix = async (finding) => {
    setActiveFixFinding(finding);
    setFixResult(null);
    setFixError(null);
    setIsFixLoading(true);
    setCopiedPatch(false);

    try {
      const result = await requestFix(finding);
      setFixResult(result);
    } catch (err) {
      setFixError(err.message || 'Failed to generate patch.');
    } finally {
      setIsFixLoading(false);
    }
  };

  // Copy Unified Diff
  const handleCopyDiff = (diffText) => {
    navigator.clipboard.writeText(diffText);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  // Download Unified Diff as .diff file
  const handleDownloadDiff = (diffText, filePath) => {
    const blob = new Blob([diffText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = filePath.split('/').pop().replace(/\.[^/.]+$/, '');
    link.href = url;
    link.download = `devlens_fix_${safeName}.diff`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenSourceViewer = (filePath, startLine, endLine) => {
    selectFile(filePath, { start: startLine, end: endLine });
    navigate('/analyzer');
  };

  if (!currentRepo) {
    return (
      <EmptyState
        title="No Repository Selected"
        description="Analyze a GitHub repository first to run the hybrid Doctor Checkup security and bug audit."
      />
    );
  }

  const summary = auditData?.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-900 border border-surface-750">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Code Health & Security Audit</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] border border-surface-700">
                Doctor Checkup
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Code Health & Vulnerability Assessment
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-white font-mono font-semibold">{currentRepo.fullName}</span> • Branch <span className="text-slate-300 font-mono">{currentRepo.defaultBranch}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => requestAudit(true)}
              disabled={isAuditLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-700 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditLoading ? 'animate-spin' : ''}`} />
              <span>{isAuditLoading ? 'Running Scan...' : 'Re-run Audit'}</span>
            </button>
          </div>
        </div>

        {/* Score & Engine Cards */}
        {auditData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-700/60">
            {/* Health Score */}
            <div className="p-4 rounded-xl bg-surface-950/80 border border-surface-700/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Heuristic Health Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-extrabold ${
                  auditData.healthScore > 80 ? 'text-emerald-400' : auditData.healthScore > 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {auditData.healthScore}/100
                </span>
                <span className="text-xs text-slate-500">rating</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                {auditData.scoreDisclaimer}
              </p>
            </div>

            {/* Severity Distribution */}
            <div className="p-4 rounded-xl bg-surface-950/80 border border-surface-700/60 md:col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Identified Findings by Severity
              </span>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="block text-rose-400 font-extrabold text-base">{summary.critical}</span>
                  <span className="text-[10px] text-rose-300 uppercase font-semibold">Critical</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="block text-amber-400 font-extrabold text-base">{summary.high}</span>
                  <span className="text-[10px] text-amber-300 uppercase font-semibold">High</span>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <span className="block text-yellow-400 font-extrabold text-base">{summary.medium}</span>
                  <span className="text-[10px] text-yellow-300 uppercase font-semibold">Medium</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="block text-blue-400 font-extrabold text-base">{summary.low}</span>
                  <span className="text-[10px] text-blue-300 uppercase font-semibold">Low</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-500/10 border border-slate-500/20">
                  <span className="block text-slate-400 font-extrabold text-base">{summary.info}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Info</span>
                </div>
              </div>
            </div>

            {/* Scanner Status */}
            <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 text-xs space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                Scanning Engines
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" /> Rule Engine:
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Active (10 rules)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" /> AI Inspector:
                </span>
                <span className="text-slate-200 font-mono text-[11px]">Active (Gemini 2.5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Semgrep:
                </span>
                <span className="text-slate-500 font-mono text-[10px]">Serverless N/A</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-surface-900 border border-surface-700/80">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings or files..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-950 border border-surface-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-950 border border-surface-700 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-950 border border-surface-700 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="rule-based">Deterministic Rules</option>
            <option value="AI">AI Inspector</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing <span className="text-slate-200 font-semibold">{filteredFindings.length}</span> findings
        </span>
      </div>

      {/* Findings List */}
      {isAuditLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-900/60 border border-surface-700/60">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Executing Doctor Checkup Scan...</h3>
          <p className="text-xs text-slate-500 mt-1">Testing deterministic rules and reasoning with Gemini AI</p>
        </div>
      ) : auditError ? (
        <div className="p-8 text-center rounded-2xl bg-rose-950/20 border border-rose-500/30">
          <AlertOctagon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-300">{auditError}</p>
          <button
            onClick={() => requestAudit(true)}
            className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Retry Scan
          </button>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-900/40 border border-surface-700/60">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No matching issues identified</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || selectedSeverity !== 'ALL' || selectedSource !== 'ALL'
              ? 'Try adjusting your filters or search query.'
              : 'Deterministic scanner and AI review did not flag any severe issues in the scanned files.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => {
            const isExpanded = expandedFindingId === finding.id;
            const userStatus = dismissedFindings[finding.id];
            const sevConfig = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.INFO;
            const SevIcon = sevConfig.icon;

            return (
              <div
                key={finding.id}
                className={`p-5 rounded-2xl border transition-all ${
                  userStatus
                    ? 'bg-surface-900/40 border-surface-800 opacity-60'
                    : 'bg-surface-900/90 border-surface-700/80 hover:border-surface-600'
                }`}
              >
                {/* Finding Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border shrink-0 ${sevConfig.badge}`}>
                      <SevIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${sevConfig.badge}`}>
                          {finding.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-surface-800 text-slate-300">
                          {finding.ruleId}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-surface-800 text-slate-300 border border-surface-700">
                          {finding.analysisSource === 'rule-based' ? 'Rule Engine' : 'AI Inspector'}
                        </span>
                        {userStatus && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold font-mono">
                            {userStatus.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white mt-1 break-words">
                        {finding.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                        <button
                          onClick={() => handleOpenSourceViewer(finding.filePath, finding.startLine, finding.endLine)}
                          className="text-slate-300 hover:text-white underline underline-offset-2 flex items-center gap-1"
                          title="View in source code viewer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{finding.filePath}:{finding.startLine}</span>
                        </button>
                        <span>•</span>
                        <span className="text-slate-500">{finding.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleGenerateFix(finding)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-white border border-surface-700 text-xs font-medium transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>Generate Fix</span>
                    </button>

                    <button
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-300 hover:text-white text-xs font-medium border border-surface-700"
                    >
                      {isExpanded ? 'Collapse' : 'Inspect'}
                    </button>
                  </div>
                </div>

                {/* Evidence Snippet */}
                {finding.evidence && (
                  <div className="mt-3 p-2.5 rounded-xl bg-surface-950 font-mono text-xs text-slate-300 border border-surface-800 overflow-x-auto">
                    <span className="text-slate-600 select-none mr-2">{finding.startLine} |</span>
                    <code>{finding.evidence}</code>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-surface-800 space-y-3 text-xs animate-in fade-in">
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Explanation</span>
                      <p className="text-slate-200 leading-relaxed">{finding.explanation}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-rose-400 block mb-0.5">Potential Impact</span>
                      <p className="text-slate-300 leading-relaxed">{finding.impact}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-emerald-400 block mb-0.5">Recommended Remediation</span>
                      <p className="text-slate-300 leading-relaxed">{finding.suggestedFix}</p>
                    </div>

                    {/* False-Positive and Review Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[11px] text-slate-500 mr-2">Mark status:</span>
                      <button
                        onClick={() => markFindingStatus(finding.id, 'Reviewed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          userStatus === 'Reviewed'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-surface-800 text-slate-300 border-surface-700 hover:bg-surface-700'
                        }`}
                      >
                        Reviewed
                      </button>
                      <button
                        onClick={() => markFindingStatus(finding.id, 'False Positive')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          userStatus === 'False Positive'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-surface-800 text-slate-300 border-surface-700 hover:bg-surface-700'
                        }`}
                      >
                        False Positive
                      </button>
                      <button
                        onClick={() => markFindingStatus(finding.id, 'Accepted Risk')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          userStatus === 'Accepted Risk'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-surface-800 text-slate-300 border-surface-700 hover:bg-surface-700'
                        }`}
                      >
                        Accept Risk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* One-Click Fix Review Modal */}
      {activeFixFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-surface-900 border border-surface-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] font-bold uppercase border border-surface-700">
                  Proposed AI Fix Patch
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Targeted Patch for {activeFixFinding.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {activeFixFinding.filePath}:{activeFixFinding.startLine}
                </p>
              </div>
              <button
                onClick={() => setActiveFixFinding(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isFixLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-200">Generating targeted patch diff...</p>
                <p className="text-xs text-slate-500 mt-1">Inspecting file context and validating safe syntax</p>
              </div>
            ) : fixError ? (
              <div className="my-6 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                {fixError}
              </div>
            ) : fixResult ? (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Patch Explanation</span>
                  <p className="text-slate-300 leading-relaxed bg-surface-950 p-3 rounded-xl border border-surface-800">
                    {fixResult.explanation}
                  </p>
                </div>

                {/* Unified Diff Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-300">Unified Diff</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyDiff(fixResult.unifiedDiff)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-750 text-slate-200 text-[11px]"
                      >
                        {copiedPatch ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPatch ? 'Copied' : 'Copy Diff'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDiff(fixResult.unifiedDiff, activeFixFinding.filePath)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-750 text-slate-200 text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .diff</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 rounded-xl bg-surface-950 border border-surface-800 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                    {fixResult.unifiedDiff}
                  </pre>
                </div>

                {/* Testing Advice */}
                {fixResult.testingAdvice && (
                  <div className="p-3 rounded-xl bg-surface-950 border border-surface-800 text-slate-300 text-xs">
                    <span className="font-bold block mb-0.5 text-slate-200">Verification Advice</span>
                    {fixResult.testingAdvice}
                  </div>
                )}

                {/* Safety Notice */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-[11px]">
                  <strong>Safety Notice:</strong> {fixResult.safetyNotice} Validation status: <em>{fixResult.validationStatus}</em>.
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveFixFinding(null)}
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
