/**
 * DevLens AI - Global Repository Context
 * Manages repository state, active files, AI summaries, Q&A chat history,
 * Architecture X-Ray state, Doctor Checkup audit state, Instant Onboarding,
 * Codebase assistant sidebar, analysis history, and secure in-session API keys.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  analyzeRepository,
  fetchFileContent,
  generateSummary,
  askQuestion,
  fetchArchitecture,
  fetchAudit,
  generateAuditFix,
  fetchOnboardingSummary,
  fetchVideoScript,
  sendCodebaseChat,
  getSystemStatus
} from '../services/api.js';

const RepositoryContext = createContext(null);

const STORAGE_KEY_HISTORY = 'devlens_analysis_history';
const SESSION_KEY_SECRETS = 'devlens_session_secrets';
const STORAGE_KEY_DISMISSED = 'devlens_dismissed_findings';

export function RepositoryProvider({ children }) {
  // Current active repository
  const [currentRepo, setCurrentRepo] = useState(null);
  const [currentRepoUrl, setCurrentRepoUrl] = useState('');
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

  // Feature 1: Architecture X-Ray State
  const [architectureData, setArchitectureData] = useState(null);
  const [isArchitectureLoading, setIsArchitectureLoading] = useState(false);
  const [architectureError, setArchitectureError] = useState(null);

  // Feature 2: Doctor Checkup Audit State
  const [auditData, setAuditData] = useState(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [dismissedFindings, setDismissedFindings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISMISSED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Feature 3: Instant Onboarding Summary State
  const [onboardingData, setOnboardingData] = useState(null);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState(null);

  // Feature 4: Video Walkthrough Presentation State
  const [videoData, setVideoData] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);

  // Sidebar Codebase Grounded Chat State
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
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

  // Theme state ('light' by default, persisted in localStorage)
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('devlens_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Explicit, synchronous theme setter
  const setTheme = (newTheme) => {
    setThemeState(prev => {
      const resolved = typeof newTheme === 'function' ? newTheme(prev) : newTheme;
      const valid = resolved === 'dark' ? 'dark' : 'light';
      try {
        localStorage.setItem('devlens_theme', valid);
      } catch {
        // ignore
      }
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (valid === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
      return valid;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Color Accent Palette ('sky' | 'emerald' | 'violet' | 'rose' | 'amber')
  const [accentColor, setAccentColorState] = useState(() => {
    try {
      const saved = localStorage.getItem('devlens_accent_palette');
      return ['sky', 'emerald', 'violet', 'rose', 'amber'].includes(saved) ? saved : 'sky';
    } catch {
      return 'sky';
    }
  });

  const setAccentColor = (color) => {
    setAccentColorState(color);
    try {
      localStorage.setItem('devlens_accent_palette', color);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', color);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

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

  // Main Analyze repository action
  const analyze = async (url) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedFile(null);
    setSummaryData(null);
    setArchitectureData(null);
    setAuditData(null);
    setOnboardingData(null);
    setVideoData(null);
    setChatMessages([]);
    setSummaryError(null);
    setArchitectureError(null);
    setAuditError(null);
    setOnboardingError(null);
    setVideoError(null);
    setChatError(null);
    setCurrentRepoUrl(url);

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

  // Request Feature 1: Architecture X-Ray Map
  const requestArchitecture = async (forceRefresh = false) => {
    if (!currentRepo) return;
    if (architectureData && !forceRefresh) return architectureData;

    setIsArchitectureLoading(true);
    setArchitectureError(null);

    try {
      const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
      const data = await fetchArchitecture(repoUrl, sessionKeys);
      setArchitectureData(data);
      return data;
    } catch (err) {
      setArchitectureError(err.message || 'Failed to generate architecture map.');
      throw err;
    } finally {
      setIsArchitectureLoading(false);
    }
  };

  // Request Feature 2: Doctor Checkup Audit
  const requestAudit = async (forceRefresh = false) => {
    if (!currentRepo) return;
    if (auditData && !forceRefresh) return auditData;

    setIsAuditLoading(true);
    setAuditError(null);

    try {
      const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
      const data = await fetchAudit(repoUrl, sessionKeys);
      setAuditData(data);
      return data;
    } catch (err) {
      setAuditError(err.message || 'Failed to run security and bug audit.');
      throw err;
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Request One-Click Fix Patch for Finding
  const requestFix = async (finding) => {
    if (!currentRepo) return;
    const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
    return await generateAuditFix(repoUrl, finding, sessionKeys);
  };

  // Update status for a finding (reviewed, false positive, accepted risk)
  const markFindingStatus = (findingId, status) => {
    setDismissedFindings(prev => {
      const next = { ...prev, [findingId]: status };
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Request Feature 3: Instant Onboarding Summary
  const requestOnboarding = async (forceRefresh = false) => {
    if (!currentRepo) return;
    if (onboardingData && !forceRefresh) return onboardingData;

    setIsOnboardingLoading(true);
    setOnboardingError(null);

    try {
      const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
      const data = await fetchOnboardingSummary(repoUrl, sessionKeys);
      setOnboardingData(data);
      return data;
    } catch (err) {
      setOnboardingError(err.message || 'Failed to generate onboarding summary.');
      throw err;
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  // Request Video Walkthrough Presentation Script
  const requestVideoScript = async (forceRefresh = false, narrationMode = 'simple') => {
    if (!currentRepo) return null;
    if (videoData && !forceRefresh && videoData.narrationMode === narrationMode) return videoData;

    setIsVideoLoading(true);
    setVideoError(null);

    try {
      const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
      const data = await fetchVideoScript(repoUrl, sessionKeys, narrationMode);
      setVideoData(data);
      return data;
    } catch (err) {
      setVideoError(err.message || 'Failed to generate video walkthrough presentation.');
      throw err;
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Request Legacy AI Summary
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
      return data;
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate AI summary.');
      throw err;
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Grounded Codebase Chat
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
      const repoUrl = currentRepoUrl || currentRepo.htmlUrl;
      const answerData = await sendCodebaseChat(
        repoUrl,
        questionText.trim(),
        chatMessages,
        sessionKeys
      );

      const aiMessage = {
        id: 'a_' + Date.now(),
        sender: 'ai',
        answer: answerData.answer,
        confidence: answerData.confidence,
        hasSufficientEvidence: answerData.hasSufficientEvidence,
        citations: answerData.citations || [],
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

  const clearChat = () => {
    setChatMessages([]);
    setChatError(null);
  };

  const toggleChatDrawer = () => {
    setIsChatDrawerOpen(prev => !prev);
  };

  const clearActiveRepo = () => {
    setCurrentRepo(null);
    setCurrentRepoUrl('');
    setFileTree([]);
    setAllFilesList([]);
    setRepoStats(null);
    setSelectedFile(null);
    setSummaryData(null);
    setArchitectureData(null);
    setAuditData(null);
    setOnboardingData(null);
    setVideoData(null);
    setVideoError(null);
    setChatMessages([]);
    setAnalysisError(null);
  };

  return (
    <RepositoryContext.Provider
      value={{
        currentRepo,
        currentRepoUrl,
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
        architectureData,
        isArchitectureLoading,
        architectureError,
        auditData,
        isAuditLoading,
        auditError,
        dismissedFindings,
        onboardingData,
        isOnboardingLoading,
        onboardingError,
        videoData,
        isVideoLoading,
        videoError,
        chatMessages,
        isAsking,
        chatError,
        isChatDrawerOpen,
        isAnalyzing,
        analysisError,
        systemStatus,
        sessionKeys,
        history,
        analyze,
        selectFile,
        requestArchitecture,
        requestAudit,
        requestFix,
        markFindingStatus,
        requestOnboarding,
        requestSummary,
        requestVideoScript,
        ask,
        clearChat,
        toggleChatDrawer,
        setIsChatDrawerOpen,
        updateSessionKeys,
        clearActiveRepo,
        refreshStatus,
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor
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
