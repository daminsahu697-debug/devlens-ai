/**
 * DevLens AI - Feature 3: Instant Onboarding Panel (Clean & Professional Edition)
 * Renders the 2-minute technical onboarding overview, deep tech stack matrix,
 * interactive local setup guide tabs, and key features with source line references.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Terminal,
  Code2,
  Database,
  Layers,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  FileCode,
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

export default function InstantOnboardingPanel() {
  const {
    currentRepo,
    onboardingData,
    isOnboardingLoading,
    onboardingError,
    requestOnboarding,
    selectFile,
    toggleChatDrawer
  } = useRepository();

  const navigate = useNavigate();

  const [activeSetupTab, setActiveSetupTab] = useState('quickstart');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Auto-fetch onboarding data on mount if repo is active
  useEffect(() => {
    if (currentRepo && !onboardingData && !isOnboardingLoading && !onboardingError) {
      requestOnboarding();
    }
  }, [currentRepo, onboardingData, isOnboardingLoading, onboardingError]);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOpenSourceFile = (filePath) => {
    selectFile(filePath);
    navigate('/analyzer');
  };

  if (isOnboardingLoading) {
    return (
      <div className="p-8 rounded-3xl bg-surface-900 border border-surface-750 text-center shadow-sm">
        <RefreshCw className="w-6 h-6 text-sky-500 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analyzing Repository for Instant Onboarding...</h3>
        <p className="text-xs text-slate-500 mt-1">Inspecting manifests, setup commands, and architectural patterns</p>
      </div>
    );
  }

  if (onboardingError) {
    return (
      <div className="p-6 rounded-3xl bg-surface-900 border border-rose-200 dark:border-rose-900 text-center shadow-sm">
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{onboardingError}</p>
        <button
          onClick={() => requestOnboarding(true)}
          className="mt-3 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-750 text-slate-700 dark:text-white text-xs font-semibold transition-colors"
        >
          Retry Onboarding Scan
        </button>
      </div>
    );
  }

  if (!onboardingData) return null;

  const stack = onboardingData.stack || {};
  const setup = onboardingData.setupGuide || {};

  return (
    <div className="space-y-6">
      {/* 2-Minute Developer Mission Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-750">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                2-Min Ramp Up
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Developer Onboarding Brief
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleChatDrawer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold transition-all shadow-sm hover:bg-sky-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Ask Codebase Assistant</span>
            </button>
            <button
              onClick={() => requestOnboarding(true)}
              className="p-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-surface-750 transition-colors"
              title="Refresh onboarding summary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-surface-950 border border-sky-100 dark:border-surface-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 tracking-wider block font-mono">Project Mission</span>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{onboardingData.purpose}</p>
          </div>
          <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-surface-950 border border-violet-100 dark:border-surface-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-400 tracking-wider block font-mono">Architecture Pattern</span>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{onboardingData.architectureStyle}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">{onboardingData.communicationMethod}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-surface-950 border border-emerald-100 dark:border-surface-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block font-mono">Data Flow</span>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{onboardingData.dataFlow}</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Matrix & Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technology Stack Matrix (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-750">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Verified Technology Stack</span>
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">
              Manifest Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/40 dark:bg-surface-950 border border-sky-100 dark:border-surface-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Frontend:</span>
              <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">{stack.frontendFramework}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-violet-50/40 dark:bg-surface-950 border border-violet-100 dark:border-surface-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Backend:</span>
              <span className="font-mono text-violet-700 dark:text-violet-300 font-bold">{stack.backendFramework}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/40 dark:bg-surface-950 border border-amber-100 dark:border-surface-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Database:</span>
              <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">{stack.database}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/40 dark:bg-surface-950 border border-emerald-100 dark:border-surface-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Authentication:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">{stack.authMethod}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/40 dark:bg-surface-950 border border-rose-100 dark:border-surface-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Testing:</span>
              <span className="font-mono text-rose-700 dark:text-rose-300 font-bold">{stack.testFramework}</span>
            </div>

            {stack.externalApis && stack.externalApis.length > 0 && (
              <div className="p-3 rounded-2xl bg-surface-800 border border-surface-750">
                <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-2">Cloud & External APIs:</span>
                <div className="flex flex-wrap gap-1.5">
                  {stack.externalApis.map(api => (
                    <span key={api} className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-surface-900 text-slate-700 dark:text-slate-300 border border-surface-750 font-mono text-[10px] font-semibold">
                      {api}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Setup Guide (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-750">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-500" />
              <span>Interactive Local Setup Guide</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Manager: <strong className="text-slate-900 dark:text-white">{setup.packageManager}</strong>
            </span>
          </div>

          {/* Setup Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-800 border border-surface-750 text-xs">
            {['quickstart', 'build_test', 'env_vars', 'scripts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSetupTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                  activeSetupTab === tab
                    ? 'bg-white dark:bg-surface-900 text-sky-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'quickstart' ? 'Quickstart' :
                 tab === 'build_test' ? 'Build & Test' :
                 tab === 'env_vars' ? 'Environment' : 'Scripts'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-3 text-xs">
            {activeSetupTab === 'quickstart' && (
              <div className="space-y-3">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">1. Install Dependencies:</span>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-800 border border-surface-750 font-mono text-slate-800 dark:text-slate-200">
                    <code>{setup.installCommand}</code>
                    <button
                      onClick={() => copyToClipboard(setup.installCommand, 'install')}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-surface-750"
                      title="Copy command"
                    >
                      {copiedIndex === 'install' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">2. Start Development Server:</span>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-800 border border-surface-750 font-mono text-slate-800 dark:text-slate-200">
                    <code>{setup.developmentCommand}</code>
                    <button
                      onClick={() => copyToClipboard(setup.developmentCommand, 'dev')}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-surface-750"
                      title="Copy command"
                    >
                      {copiedIndex === 'dev' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Endpoint: <span className="text-sky-600 dark:text-sky-400 font-bold">{setup.localDevUrl}</span>
                </div>
              </div>
            )}

            {activeSetupTab === 'build_test' && (
              <div className="space-y-3">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Production Build:</span>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-800 border border-surface-750 font-mono text-slate-800 dark:text-slate-200">
                    <code>{setup.buildCommand || 'No explicit build script declared'}</code>
                    {setup.buildCommand && (
                      <button
                        onClick={() => copyToClipboard(setup.buildCommand, 'build')}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {copiedIndex === 'build' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Run Test Suite:</span>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-800 border border-surface-750 font-mono text-slate-800 dark:text-slate-200">
                    <code>{setup.testCommand || 'No explicit test script declared'}</code>
                    {setup.testCommand && (
                      <button
                        onClick={() => copyToClipboard(setup.testCommand, 'test')}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {copiedIndex === 'test' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSetupTab === 'env_vars' && (
              <div className="space-y-2">
                {setup.environmentVariables && setup.environmentVariables.length > 0 ? (
                  setup.environmentVariables.map((v, i) => (
                    <div key={v.name} className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-800 border border-surface-750 font-mono text-xs">
                      <div>
                        <span className="text-slate-900 dark:text-white font-bold">{v.name}</span>
                        <span className="text-slate-500 text-[10px] ml-2">= {v.placeholder}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${v.name}=${v.placeholder}`, i)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Copy variable template"
                      >
                        {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs py-4 text-center">
                    No explicit .env.example or template found in repository root.
                  </p>
                )}
              </div>
            )}

            {activeSetupTab === 'scripts' && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {setup.availableScripts && setup.availableScripts.length > 0 ? (
                  setup.availableScripts.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-800 border border-surface-750 font-mono text-[11px]">
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{s.name}:</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">{s.script}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs py-2">No scripts found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Features & Important Files List */}
      {onboardingData.features && onboardingData.features.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-750">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span>Core Application Features & Key Files</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              Source Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingData.features.map((feat) => (
              <div
                key={feat.name}
                className="p-5 rounded-2xl bg-surface-800 hover:bg-surface-750 border border-surface-750 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{feat.name}</h4>
                    {feat.role && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {feat.role}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                    {feat.explanation}
                  </p>
                </div>

                {feat.primaryFile && (
                  <button
                    onClick={() => handleOpenSourceFile(feat.primaryFile)}
                    className="mt-4 flex items-center justify-between text-xs font-mono text-sky-600 dark:text-sky-400 hover:underline pt-3 border-t border-surface-750"
                  >
                    <span className="truncate">{feat.primaryFile}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
