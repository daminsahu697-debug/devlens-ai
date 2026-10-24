/**
 * DevLens AI - Global Repository Context
 * Manages repository state, active files, AI summaries, Q&A chat history,
 * analysis history, and secure in-session API keys.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  analyzeRepository,
  fetchFileContent,
  generateSummary,
  askQuestion,
  getSystemStatus
} from '../services/api.js';

const RepositoryContext = createContext(null);

const STORAGE_KEY_HISTORY = 'devlens_analysis_history';
const SESSION_KEY_SECRETS = 'devlens_session_secrets';

export function RepositoryProvider({ children }) {
  // Current active repository
  const [currentRepo, setCurrentRepo] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [allFilesList, setAllFilesList] = useState([]);
  const [repoStats, setRepoStats] = useState(null);
  const [languageBreakdown, setLanguageBreakdown] = useState([]);

  // Active selected file in code viewer
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [highlightedLineRange, setHighlightedLineRange] = useState(null);

  // AI Summary State
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Q&A Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Global analysis loading & error
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // System status (LLM configured, GitHub rate limit)
  const [systemStatus, setSystemStatus] = useState(null);

  // In-session API keys (Stored in sessionStorage only, never localStorage)
  const [sessionKeys, setSessionKeys] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY_SECRETS);
      return saved ? JSON.parse(saved) : { geminiApiKey: '', githubToken: '' };
    } catch {
      return { geminiApiKey: '', githubToken: '' };
    }
  });

  // Recent analysis history (Persisted in localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save session secrets safely
  const updateSessionKeys = (keys) => {
    const next = { ...sessionKeys, ...keys };
    setSessionKeys(next);
    try {
      sessionStorage.setItem(SESSION_KEY_SECRETS, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Fetch backend status on mount or when keys change
  const refreshStatus = async () => {
    try {
      const status = await getSystemStatus(sessionKeys);
      setSystemStatus(status);
    } catch {
      // Backend may be starting
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [sessionKeys.geminiApiKey, sessionKeys.githubToken]);

  // Analyze repository action
  const analyze = async (url) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedFile(null);
    setSummaryData(null);
    setChatMessages([]);
    setSummaryError(null);
    setChatError(null);

    try {
      const result = await analyzeRepository(url, sessionKeys);
      setCurrentRepo(result.metadata);
      setFileTree(result.tree);
      setAllFilesList(result.allFilesList);
      setRepoStats(result.stats);
      setLanguageBreakdown(result.languageBreakdown);

      // Save to history (keep top 10 unique)
      const newEntry = {
        fullName: result.metadata.fullName,
        owner: result.metadata.owner.login,
        repo: result.metadata.name,
        stars: result.metadata.stars,
        language: result.metadata.language,
        description: result.metadata.description,
        analyzedAt: new Date().toISOString()
      };

      setHistory(prev => {
        const filtered = prev.filter(item => item.fullName.toLowerCase() !== newEntry.fullName.toLowerCase());
        const updated = [newEntry, ...filtered].slice(0, 10);
        try {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Automatically select README if available
      const readme = result.allFilesList.find(f => /readme/i.test(f));
      if (readme) {
        selectFile(readme);
      }

      refreshStatus();
      return result;
    } catch (err) {
      setAnalysisError(err.message || 'Failed to analyze repository.');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select and view a specific file
  const selectFile = async (filePath, lineRange = null) => {
    if (!currentRepo) return;
    setIsFileLoading(true);
    setFileError(null);
    setHighlightedLineRange(lineRange);

    try {
      const fileData = await fetchFileContent(
        currentRepo.owner.login,
        currentRepo.name,
        filePath,
        currentRepo.defaultBranch,
        sessionKeys
      );
      setSelectedFile(fileData);
    } catch (err) {
      setFileError(err.message || 'Failed to load file content.');
      setSelectedFile({
        path: filePath,
        name: filePath.split('/').pop(),
        content: `// Error loading file: ${err.message}`
      });
    } finally {
      setIsFileLoading(false);
    }
  };

  // Request AI Summary
  const requestSummary = async () => {
    if (!currentRepo) return;
    setIsSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await generateSummary(
        currentRepo.owner.login,
        currentRepo.name,
        sessionKeys
      );
      setSummaryData(data);
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate AI summary.');
      throw err;
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Ask question about codebase
  const ask = async (questionText) => {
    if (!currentRepo || !questionText.trim()) return;
    setIsAsking(true);
    setChatError(null);

    const userMessage = {
      id: 'q_' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      const answerData = await askQuestion(
        currentRepo.owner.login,
        currentRepo.name,
        questionText.trim(),
        sessionKeys
      );

      const aiMessage = {
        id: 'a_' + Date.now(),
        sender: 'ai',
        answer: answerData.answer,
        confidence: answerData.confidence,
        hasSufficientEvidence: answerData.hasSufficientEvidence,
        references: answerData.references || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setChatError(err.message || 'Failed to answer question.');
      const errorMessage = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        isError: true,
        answer: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const clearActiveRepo = () => {
    setCurrentRepo(null);
    setFileTree([]);
    setAllFilesList([]);
    setRepoStats(null);
    setSelectedFile(null);
    setSummaryData(null);
    setChatMessages([]);
    setAnalysisError(null);
  };

  return (
    <RepositoryContext.Provider
      value={{
        currentRepo,
        fileTree,
        allFilesList,
        repoStats,
        languageBreakdown,
        selectedFile,
        isFileLoading,
        fileError,
        highlightedLineRange,
        summaryData,
        isSummaryLoading,
        summaryError,
        chatMessages,
        isAsking,
        chatError,
        isAnalyzing,
        analysisError,
        systemStatus,
        sessionKeys,
        history,
        analyze,
        selectFile,
        requestSummary,
        ask,
        updateSessionKeys,
        clearActiveRepo,
        refreshStatus
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
