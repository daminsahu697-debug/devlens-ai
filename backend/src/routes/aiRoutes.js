/**
 * DevLens AI - AI Analysis Routes
 * Handles repository summarization and source-grounded Q&A.
 */

import express from 'express';
import { validateQuestion } from '../utils/validation.js';
import { fetchRepositoryMetadata, fetchRepositoryTree } from '../services/githubService.js';
import { getSummaryContext, retrieveRelevantSnippets } from '../services/retrievalService.js';
import {
  generateRepositorySummary,
  answerQuestionWithContext,
  resolveApiKey
} from '../services/aiService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/ai/summarize
 * Generates an architectural summary using verified repository context.
 */
router.post('/summarize', analysisLimiter, async (req, res, next) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Both "owner" and "repo" parameters are required.',
          code: 'MISSING_PARAMS'
        }
      });
    }

    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'AI API Key is not configured. Please add LLM_API_KEY in backend/.env or configure your key in Settings.',
          code: 'AI_NOT_CONFIGURED'
        }
      });
    }

    const clientToken = req.headers['x-github-token'];

    // 1. Fetch metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch tree to discover manifest and entry point files
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Gather verified key context files
    const contextFiles = await getSummaryContext(
      owner,
      repo,
      metadata.defaultBranch,
      treeResult.allFilesList,
      clientToken
    );

    // 4. Generate AI summary
    const summary = await generateRepositorySummary(metadata, contextFiles, apiKey);

    res.json({
      success: true,
      data: {
        summary,
        contextFilesUsed: contextFiles.map(f => ({ path: f.path, role: f.role }))
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/ask
 * Answers a user question grounded in retrieved repository source files.
 */
router.post('/ask', analysisLimiter, async (req, res, next) => {
  try {
    const { owner, repo, question } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Both "owner" and "repo" parameters are required.',
          code: 'MISSING_PARAMS'
        }
      });
    }

    const qValidation = validateQuestion(question);
    if (!qValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: qValidation.error,
          code: 'INVALID_QUESTION'
        }
      });
    }

    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'AI API Key is not configured. Please add LLM_API_KEY in backend/.env or configure your key in Settings.',
          code: 'AI_NOT_CONFIGURED'
        }
      });
    }

    const clientToken = req.headers['x-github-token'];

    // 1. Fetch metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch file tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Keyword-based retrieval of relevant snippets
    const snippetsData = await retrieveRelevantSnippets(
      owner,
      repo,
      metadata.defaultBranch,
      treeResult.allFilesList,
      qValidation.question,
      clientToken
    );

    // 4. Send grounded context to LLM
    const answerData = await answerQuestionWithContext(metadata, qValidation.question, snippetsData, apiKey);

    res.json({
      success: true,
      data: answerData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
