/**
 * DevLens AI - Grounded Codebase Chat Sidebar / Drawer
 * Interactive AI assistant grounded in retrieved repository snippets with
 * clickable file & line citations that open directly in the code viewer.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  X,
  Trash2,
  FileCode,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';

const STARTER_QUESTIONS = [
  'How does the frontend communicate with the backend?',
  'Where is user authentication or session handling implemented?',
  'Where are database models and queries defined?',
  'Which files should I inspect first to understand this codebase?',
  'How are errors handled and logged across the project?'
];

export default function CodebaseChatDrawer() {
  const {
    currentRepo,
    chatMessages,
    isAsking,
    chatError,
    ask,
    clearChat,
    isChatDrawerOpen,
    toggleChatDrawer,
    selectFile
  } = useRepository();

  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAsking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isAsking) return;
    ask(inputText.trim());
    setInputText('');
  };

  const handleSelectStarter = (q) => {
    ask(q);
  };

  const handleCitationClick = (citation) => {
    const filePath = citation.filePath || citation.file;
    if (filePath) {
      selectFile(filePath, {
        start: citation.startLine || citation.lineStart || 1,
        end: citation.endLine || citation.lineEnd || 10
      });
      navigate('/analyzer');
    }
  };

  if (!isChatDrawerOpen) {
    // Floating Quick-Action Toggle Button
    return (
      <button
        onClick={toggleChatDrawer}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-sky-600/30 border border-sky-400/40 transition-all hover:scale-105"
        title="Open Codebase AI Assistant"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ask Codebase</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface-900 border-l border-surface-750 shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="h-16 px-5 border-b border-surface-750 flex items-center justify-between bg-surface-900">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 shrink-0">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">AI Codebase Assistant</h3>
            <p className="text-[10px] text-slate-500 truncate">
              {currentRepo ? currentRepo.fullName : 'No active repository'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleChatDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {chatMessages.length === 0 ? (
          <div className="py-8 px-2 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-slate-300 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Source-Grounded Codebase Q&A</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xs mx-auto">
                Ask specific technical questions about how this application works. Answers are verified and cited directly from the repository source code.
              </p>
            </div>

            {/* Starter Questions */}
            <div className="pt-2 text-left space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block px-1">
                Suggested Questions
              </span>
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSelectStarter(q)}
                  disabled={!currentRepo || isAsking}
                  className="w-full text-left p-2.5 rounded-xl bg-surface-950 hover:bg-surface-800/80 border border-surface-800 text-slate-300 hover:text-white text-xs transition-colors flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="line-clamp-2">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    isUser
                      ? 'bg-surface-800 text-white rounded-br-none border border-surface-700'
                      : 'bg-surface-950 text-slate-200 border border-surface-800 rounded-bl-none'
                  }`}
                >
                  {isUser ? (
                    <p>{msg.text}</p>
                  ) : msg.isError ? (
                    <p className="text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{msg.answer}</span>
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose prose-invert prose-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {msg.answer}
                      </div>

                      {/* Source Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2.5 border-t border-surface-800 space-y-1.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                            Verified Source Citations
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c, idx) => {
                              const path = c.filePath || c.file;
                              const sLine = c.startLine || c.lineStart || 1;
                              const eLine = c.endLine || c.lineEnd || sLine;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleCitationClick(c)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-900 hover:bg-surface-850 border border-surface-700 text-slate-300 font-mono text-[10px] transition-colors"
                                  title={`Open ${path} (lines ${sLine}-${eLine}) in code viewer`}
                                >
                                  <FileCode className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{path}:{sLine}-{eLine}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}

        {isAsking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-950 border border-surface-800 text-slate-400 text-xs w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            <span>Retrieving source files & generating answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-surface-700/80 bg-surface-950">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!currentRepo || isAsking}
            placeholder={currentRepo ? "Ask about files, routes, auth, logic..." : "Analyze a repository first"}
            className="flex-1 px-3.5 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-surface-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAsking || !currentRepo}
            className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-40 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
