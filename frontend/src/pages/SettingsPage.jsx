import React, { useState } from 'react';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Lock
} from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import { useRepository } from '../context/RepositoryContext';

export default function SettingsPage() {
  const { sessionKeys, updateSessionKeys, systemStatus, refreshStatus } = useRepository();

  const [geminiKeyInput, setGeminiKeyInput] = useState(sessionKeys.geminiApiKey || '');
  const [githubTokenInput, setGithubTokenInput] = useState(sessionKeys.githubToken || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    updateSessionKeys({
      geminiApiKey: geminiKeyInput.trim(),
      githubToken: githubTokenInput.trim()
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
    refreshStatus();
  };

  const handleClearKeys = () => {
    setGeminiKeyInput('');
    setGithubTokenInput('');
    updateSessionKeys({ geminiApiKey: '', githubToken: '' });
    refreshStatus();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await refreshStatus();
    setIsTesting(false);
  };

  const isLlmConfigured = systemStatus?.llmConfigured || Boolean(sessionKeys?.geminiApiKey);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System & API Settings
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
          Configure AI provider credentials, GitHub tokens, and view system status.
        </p>
      </div>

      {/* Backend Status Banner */}
      <div className="bg-surface-900 border border-surface-750 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Backend Status</h3>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-750 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Connection & Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-950 border border-surface-750">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-mono">AI Engine Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLlmConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-white">
                {isLlmConfigured ? 'Key Configured (Active)' : 'Key Missing'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Provider: {systemStatus?.llmProvider || 'gemini'} ({systemStatus?.llmModel || 'gemini-1.5-flash'})
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-950 border border-surface-750">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-mono">GitHub Rate Limit</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {systemStatus?.rateLimit?.remaining !== null && systemStatus?.rateLimit?.remaining !== undefined
                  ? `${systemStatus.rateLimit.remaining} / ${systemStatus.rateLimit.limit} req/hr`
                  : 'Checking...'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Reset in {systemStatus?.rateLimit?.resetMinutes ?? 60} minutes
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-950 border border-surface-750">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-mono">API Health</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-white">Operational</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              Serverless Node.js
            </p>
          </div>
        </div>
      </div>

      {/* In-Session Key Configuration */}
      <div className="bg-surface-900 border border-surface-750 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-base font-bold text-white">In-Session API Configuration</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Keys entered here are stored in your browser's <code className="bg-surface-950 px-1 py-0.5 rounded text-zinc-300 font-mono">sessionStorage</code> and transmitted via headers for this session.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-4">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 underline"
              >
                <span>Get Free Gemini Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                id="gemini-key-input"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-surface-950 border border-surface-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Required for AI Project Summaries and Ask Codebase Q&A.
            </p>
          </div>

          {/* GitHub Personal Access Token (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                GitHub Personal Access Token (Optional)
              </label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 underline"
              >
                <span>Generate at GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGithubToken ? 'text' : 'password'}
                id="github-token-input"
                value={githubTokenInput}
                onChange={(e) => setGithubTokenInput(e.target.value)}
                placeholder="ghp_... (No special scopes required for public repositories)"
                className="w-full bg-surface-950 border border-surface-750 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Optional: Increases GitHub API limit from 60 to 5,000 requests per hour.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                id="save-settings-button"
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all"
              >
                Save Session Keys
              </button>
              {(sessionKeys.geminiApiKey || sessionKeys.githubToken) && (
                <button
                  type="button"
                  onClick={handleClearKeys}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  Clear Keys
                </button>
              )}
            </div>

            {saveFeedback && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Keys saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Permanent Backend .env Configuration */}
      <div className="bg-surface-900 border border-surface-750 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-white">Permanent Backend .env Configuration</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Configure keys directly on your development machine in <code className="bg-surface-950 px-1 py-0.5 rounded text-zinc-300 font-mono">devlens-ai/backend/.env</code>:
        </p>

        <div className="bg-surface-950 border border-surface-750 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-1">
          <p className="text-zinc-500"># devlens-ai/backend/.env</p>
          <p className="text-zinc-200">LLM_PROVIDER=gemini</p>
          <p className="text-zinc-200">LLM_API_KEY=your_gemini_api_key_here</p>
          <p className="text-zinc-200">LLM_MODEL=gemini-1.5-flash</p>
          <p className="text-zinc-500 pt-1"># Optional GitHub Personal Access Token:</p>
          <p className="text-zinc-200">GITHUB_TOKEN=your_github_token_here</p>
        </div>
      </div>
    </div>
  );
}
