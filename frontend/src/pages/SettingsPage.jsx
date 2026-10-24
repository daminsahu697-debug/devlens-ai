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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
          System & API Settings
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Configure AI provider credentials, GitHub tokens, and view system status.
        </p>
      </div>

      {/* Backend Status Banner */}
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Live Backend Status</h3>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Connection & Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-900 border border-surface-750">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">AI Engine Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLlmConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-white">
                {isLlmConfigured ? 'Key Configured (Active)' : 'Key Missing'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Provider: {systemStatus?.llmProvider || 'gemini'} ({systemStatus?.llmModel || 'gemini-1.5-flash'})
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-900 border border-surface-750">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">GitHub API Rate Limit</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-300">
                {systemStatus?.rateLimit?.remaining !== null && systemStatus?.rateLimit?.remaining !== undefined
                  ? `${systemStatus.rateLimit.remaining} / ${systemStatus.rateLimit.limit} req/hr`
                  : 'Checking...'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {systemStatus?.githubTokenConfigured ? 'Personal token attached (5,000 max)' : 'Unauthenticated (60 max)'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-900 border border-surface-750">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Security Standard</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Prompt Guard Active</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Untrusted code isolation enabled
            </p>
          </div>
        </div>
      </div>

      {/* In-Session Key Configuration */}
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-6 shadow-lg space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">In-Session API Configuration</h3>
          </div>
          <p className="text-xs text-slate-400">
            Keys entered here are stored strictly in your browser's <code className="bg-surface-800 px-1 py-0.5 rounded text-indigo-300">sessionStorage</code> and transmitted via encrypted headers for this session. They are never written to permanent storage or logs.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-4">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
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
                className="w-full bg-surface-900 border border-surface-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Required for AI Project Summaries and Ask Your Codebase Q&A.
            </p>
          </div>

          {/* GitHub Personal Access Token (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                GitHub Personal Access Token (Optional)
              </label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
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
                className="w-full bg-surface-900 border border-surface-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Optional: Increases GitHub API limit from 60 to 5,000 requests per hour.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                id="save-settings-button"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
              >
                Save Session Keys
              </button>
              {(sessionKeys.geminiApiKey || sessionKeys.githubToken) && (
                <button
                  type="button"
                  onClick={handleClearKeys}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors"
                >
                  Clear Keys
                </button>
              )}
            </div>

            {saveFeedback && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Keys saved for this session!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Alternative Permanent Server Configuration Guidance */}
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Permanent Backend .env Configuration</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          If you prefer to configure keys directly on your development machine so they persist across restarts without using browser session storage:
        </p>

        <div className="bg-surface-950 border border-surface-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1">
          <p className="text-slate-500"># 1. Open devlens-ai/backend/.env in your editor</p>
          <p className="text-indigo-300">LLM_PROVIDER=gemini</p>
          <p className="text-indigo-300">LLM_API_KEY=your_gemini_api_key_here</p>
          <p className="text-indigo-300">LLM_MODEL=gemini-1.5-flash</p>
          <p className="text-slate-500"># Optional GitHub Personal Access Token:</p>
          <p className="text-indigo-300">GITHUB_TOKEN=your_github_token_here</p>
          <p className="text-slate-500 pt-2"># 2. Restart backend server: npm run dev</p>
        </div>
      </div>
    </div>
  );
}
