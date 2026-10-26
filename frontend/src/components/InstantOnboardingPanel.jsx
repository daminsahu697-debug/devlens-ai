/**
 * DevLens AI - Feature 3: Instant Onboarding Panel (Clean & Minimal Edition)
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
      <div className="p-8 rounded-2xl bg-surface-900 border border-surface-750 text-center">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">Analyzing Repository for Instant Onboarding...</h3>
        <p className="text-xs text-slate-400 mt-1">Inspecting manifests, setup commands, and architectural patterns</p>
      </div>
    );
  }

  if (onboardingError) {
    return (
      <div className="p-6 rounded-2xl bg-surface-900 border border-rose-500/30 text-center">
        <p className="text-xs font-semibold text-rose-300">{onboardingError}</p>
        <button
          onClick={() => requestOnboarding(true)}
          className="mt-3 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-700 text-white text-xs font-medium transition-colors"
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
      <div className="p-6 rounded-2xl bg-surface-900 border border-surface-750 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-800">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Developer Onboarding Brief</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] border border-surface-700">
                2-Min Ramp Up
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Architecture & System Overview
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleChatDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Ask Codebase Question</span>
            </button>
            <button
              onClick={() => requestOnboarding(true)}
              className="p-1.5 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-400 hover:text-white border border-surface-700 transition-colors"
              title="Refresh onboarding summary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-950 border border-surface-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Project Mission</span>
            <p className="text-slate-200 mt-1 leading-relaxed">{onboardingData.purpose}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-950 border border-surface-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Architecture Pattern</span>
            <p className="text-slate-200 mt-1 leading-relaxed">{onboardingData.architectureStyle}</p>
            <p className="text-slate-400 mt-1 text-[11px] font-mono">{onboardingData.communicationMethod}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-950 border border-surface-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Data Flow</span>
            <p className="text-slate-200 mt-1 leading-relaxed">{onboardingData.dataFlow}</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Matrix & Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technology Stack Matrix (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface-900 border border-surface-750 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Verified Technology Stack</span>
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              Manifest Verified
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-slate-400">Frontend:</span>
              <span className="font-mono text-white font-medium">{stack.frontendFramework}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-slate-400">Backend:</span>
              <span className="font-mono text-white font-medium">{stack.backendFramework}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-slate-400">Database:</span>
              <span className="font-mono text-white font-medium">{stack.database}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-mono text-white font-medium">{stack.authMethod}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800">
              <span className="text-slate-400">Testing:</span>
              <span className="font-mono text-white font-medium">{stack.testFramework}</span>
            </div>

            {stack.externalApis && stack.externalApis.length > 0 && (
              <div className="p-2.5 rounded-xl bg-surface-950 border border-surface-800">
                <span className="text-slate-400 block mb-1.5">Cloud & External APIs:</span>
                <div className="flex flex-wrap gap-1.5">
                  {stack.externalApis.map(api => (
                    <span key={api} className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 border border-surface-700 font-mono text-[10px]">
                      {api}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Setup Guide (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-surface-900 border border-surface-750 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Interactive Local Setup Guide</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Manager: <strong className="text-white">{setup.packageManager}</strong>
            </span>
          </div>

          {/* Setup Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-950 border border-surface-800 text-xs">
            {['quickstart', 'build_test', 'env_vars', 'scripts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSetupTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeSetupTab === tab
                    ? 'bg-surface-800 text-white border border-surface-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 block mb-1">1. Install Dependencies:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 font-mono text-slate-200">
                    <code>{setup.installCommand}</code>
                    <button
                      onClick={() => copyToClipboard(setup.installCommand, 'install')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy command"
                    >
                      {copiedIndex === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">2. Start Development Server:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 font-mono text-slate-200">
                    <code>{setup.developmentCommand}</code>
                    <button
                      onClick={() => copyToClipboard(setup.developmentCommand, 'dev')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy command"
                    >
                      {copiedIndex === 'dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Endpoint: <span className="text-slate-300">{setup.localDevUrl}</span>
                </div>
              </div>
            )}

            {activeSetupTab === 'build_test' && (
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 block mb-1">Production Build:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 font-mono text-slate-200">
                    <code>{setup.buildCommand || 'No explicit build script declared'}</code>
                    {setup.buildCommand && (
                      <button
                        onClick={() => copyToClipboard(setup.buildCommand, 'build')}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedIndex === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Run Test Suite:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 font-mono text-slate-200">
                    <code>{setup.testCommand || 'No explicit test script declared'}</code>
                    {setup.testCommand && (
                      <button
                        onClick={() => copyToClipboard(setup.testCommand, 'test')}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedIndex === 'test' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
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
                    <div key={v.name} className="flex items-center justify-between p-2 rounded-xl bg-surface-950 border border-surface-800 font-mono text-xs">
                      <div>
                        <span className="text-white font-semibold">{v.name}</span>
                        <span className="text-slate-500 text-[10px] ml-2">= {v.placeholder}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${v.name}=${v.placeholder}`, i)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy variable template"
                      >
                        {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs py-4 text-center">
                    No explicit .env.example or template found in repository root.
                  </p>
                )}
              </div>
            )}

            {activeSetupTab === 'scripts' && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {setup.availableScripts && setup.availableScripts.length > 0 ? (
                  setup.availableScripts.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-surface-950 border border-surface-800 font-mono text-[11px]">
                      <span className="text-slate-300 font-semibold">{s.name}:</span>
                      <span className="text-slate-400 truncate max-w-xs">{s.script}</span>
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
        <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-400" />
              <span>Core Application Features & Key Files</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Source Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {onboardingData.features.map((feat) => (
              <div
                key={feat.name}
                className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-slate-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{feat.name}</h4>
                    {feat.role && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-800 text-slate-300 border border-surface-700">
                        {feat.role}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    {feat.explanation}
                  </p>
                </div>

                {feat.primaryFile && (
                  <button
                    onClick={() => handleOpenSourceFile(feat.primaryFile)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors pt-2 border-t border-surface-850"
                  >
                    <Code2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{feat.primaryFile}</span>
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
