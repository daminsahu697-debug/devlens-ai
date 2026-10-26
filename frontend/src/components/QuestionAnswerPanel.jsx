import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, FileCode, CheckCircle2 } from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

const SUGGESTED_QUESTIONS = [
  'What is the main architectural pattern of this project?',
  'Where are the primary entry points and routing configurations?',
  'What external services or databases does this codebase connect to?',
  'How is authentication and security handled?'
];

export default function QuestionAnswerPanel({ onNavigateToFile }) {
  const { currentRepo, chatMessages, isAsking, askCodebase, selectFile } = useRepository();
  const [inputQuestion, setInputQuestion] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAsking) return;

    const q = inputQuestion.trim();
    setInputQuestion('');
    await askCodebase(q);
  };

  const handleSuggestionClick = async (q) => {
    if (isAsking) return;
    await askCodebase(q);
  };

  const handleReferenceClick = (ref) => {
    if (ref.file) {
      selectFile(ref.file, { start: ref.lineStart, end: ref.lineEnd });
      if (onNavigateToFile) onNavigateToFile(ref.file);
    }
  };

  if (!currentRepo) {
    return (
      <div className="bg-surface-900 border border-surface-750 rounded-2xl p-8 text-center">
        <Bot className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white mb-1">No Active Repository</h4>
        <p className="text-xs text-zinc-400">
          Analyze a GitHub repository first to ask questions grounded in source code.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-900 border border-surface-750 rounded-2xl flex flex-col h-[700px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-surface-900 border-b border-surface-750 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-800 text-zinc-300 border border-surface-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ask Your Codebase</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Source-grounded Q&A • {currentRepo.fullName}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Source-Grounded Code Assistant</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
              Ask anything about project architecture, dependencies, entry points, or implementation logic. Every answer cites verified source code lines.
            </p>

            {/* Suggested Question Chips */}
            <div className="text-left max-w-lg mx-auto">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2 px-1 font-mono">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(q)}
                    className="text-left text-xs p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800 border border-surface-750 hover:border-surface-600 text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0" />
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
                <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-surface-800 text-white border border-surface-700'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-200'
                    : 'bg-surface-950 border border-surface-750 text-zinc-200'
                }`}
              >
                {/* Message Header if AI */}
                {msg.sender === 'ai' && !msg.isError && (
                  <div className="flex items-center justify-between gap-2 border-b border-surface-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300">DevLens AI</span>
                      {msg.confidence && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-850 text-zinc-400 border border-surface-750">
                          {msg.confidence}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans text-xs text-zinc-200 leading-relaxed">
                  {msg.text}
                </div>

                {/* Supporting Source References */}
                {msg.references && msg.references.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-surface-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Supporting Source References:
                    </span>
                    <div className="space-y-1.5">
                      {msg.references.map((ref, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleReferenceClick(ref)}
                          className="p-2.5 rounded-xl bg-surface-900 border border-surface-800 hover:border-surface-600 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono text-zinc-200 group-hover:underline font-medium">
                              📄 {ref.file} <span className="text-zinc-500 text-[11px]">(L{ref.lineStart}-{ref.lineEnd})</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                              Open in Viewer →
                            </span>
                          </div>
                          {ref.reason && (
                            <p className="text-[11px] text-zinc-400 mb-1.5">
                              {ref.reason}
                            </p>
                          )}
                          {ref.snippet && (
                            <pre className="p-2 rounded bg-surface-950 border border-surface-850 text-[10px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
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
                <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isAsking && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 text-zinc-300 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-2xl bg-surface-950 border border-surface-750 text-xs text-zinc-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>Scanning source files and generating grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-surface-900 border-t border-surface-750">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            id="chat-question-input"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about this repository's code or architecture..."
            disabled={isAsking}
            className="flex-1 bg-surface-950 text-xs text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 border border-surface-750 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            id="chat-send-button"
            disabled={isAsking || !inputQuestion.trim()}
            className="p-2.5 rounded-xl bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            title="Send question"
          >
            {isAsking ? <Loader2 className="w-4 h-4 animate-spin text-zinc-950" /> : <Send className="w-4 h-4 text-zinc-950" />}
          </button>
        </form>
      </div>
    </div>
  );
}
