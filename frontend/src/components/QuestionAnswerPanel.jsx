import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  HelpCircle,
  Code2,
  FileText,
  ExternalLink,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import ErrorMessage from './ErrorMessage';

const SUGGESTED_QUESTIONS = [
  'Where does the application start?',
  'What is the purpose of this project?',
  'How are routes and API endpoints structured?',
  'What are the main third-party dependencies?',
  'Explain the main execution flow.',
  'What would I need to change to add a new feature?'
];

export default function QuestionAnswerPanel({ onNavigateToFile }) {
  const { currentRepo, chatMessages, isAsking, chatError, ask, selectFile } = useRepository();
  const [inputQuestion, setInputQuestion] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAsking) return;
    ask(inputQuestion.trim());
    setInputQuestion('');
  };

  const handleSuggestionClick = (question) => {
    if (isAsking) return;
    ask(question);
  };

  const handleReferenceClick = (ref) => {
    selectFile(ref.file, { start: ref.lineStart, end: ref.lineEnd });
    if (onNavigateToFile) onNavigateToFile();
  };

  if (!currentRepo) {
    return (
      <div className="bg-surface-850 border border-surface-700/80 rounded-2xl p-12 text-center shadow-lg">
        <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h4 className="text-base font-bold text-white mb-1">Analyze a Repository First</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please enter and analyze a public GitHub repository URL to start asking architectural and code questions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-850 border border-surface-700/80 rounded-2xl flex flex-col h-[700px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-surface-900 border-b border-surface-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ask Your Codebase</h3>
            <p className="text-xs text-slate-400">
              Source-grounded Q&A over <span className="font-mono text-indigo-300">{currentRepo.fullName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Source-Grounded Code Assistant</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Ask anything about project architecture, dependencies, entry points, or implementation logic. Every answer cites verified source code lines.
            </p>

            {/* Suggested Question Chips */}
            <div className="text-left max-w-lg mx-auto">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(q)}
                    className="text-left text-xs p-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 border border-surface-700/70 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <span className="text-slate-500 group-hover:text-indigo-400 text-xs">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-200'
                    : 'bg-surface-900 border border-surface-700/80 text-slate-200 shadow-md'
                }`}
              >
                {/* Message Header if AI */}
                {msg.sender === 'ai' && !msg.isError && (
                  <div className="flex items-center justify-between gap-2 border-b border-surface-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">DevLens AI</span>
                      {msg.confidence && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${
                          msg.confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : msg.confidence === 'medium'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {msg.confidence} Confidence
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {/* Content */}
                <p className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                  {msg.sender === 'user' ? msg.text : msg.answer}
                </p>

                {/* Insufficient Evidence Notice */}
                {msg.sender === 'ai' && msg.hasSufficientEvidence === false && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Evidence is limited based on initially retrieved repository files.</span>
                  </div>
                )}

                {/* Supporting Source References */}
                {msg.references && msg.references.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-surface-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Supporting Source References (Click to view code):
                    </span>
                    <div className="space-y-1.5">
                      {msg.references.map((ref, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleReferenceClick(ref)}
                          className="p-2.5 rounded-xl bg-surface-950 border border-surface-800 hover:border-indigo-500/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono text-indigo-400 group-hover:text-indigo-300 font-medium">
                              📄 {ref.file} <span className="text-slate-500 text-[11px]">(L{ref.lineStart}-{ref.lineEnd})</span>
                            </span>
                            <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Open in Viewer →
                            </span>
                          </div>
                          {ref.reason && (
                            <p className="text-[11px] text-slate-400 mb-1.5">
                              {ref.reason}
                            </p>
                          )}
                          {ref.snippet && (
                            <pre className="p-2 rounded bg-surface-900 border border-surface-800 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
                              {ref.snippet.trim().slice(0, 200)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isAsking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-900 border border-surface-700/80 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Scanning source files and generating grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-surface-900 border-t border-surface-700/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            id="chat-question-input"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about this repository's code or architecture..."
            disabled={isAsking}
            className="flex-1 bg-surface-800 text-xs text-white placeholder-slate-500 rounded-xl px-4 py-2.5 border border-surface-700 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            id="chat-send-button"
            disabled={isAsking || !inputQuestion.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md shadow-indigo-600/20"
            title="Send question"
          >
            {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
