/**
 * DevLens AI - Onboarding Routes (Feature 3: Instant Onboarding & Grounded Chat)
 * Handles endpoints:
 * - POST /api/repository/summary
 * - POST /api/repository/chat
 */

import express from 'express';
import { validateRepositoryUrl, validateQuestion } from '../utils/validation.js';
import { fetchRepositoryMetadata, fetchRepositoryTree } from '../services/githubService.js';
import { generateOnboardingSummary, chatWithCodebase } from '../services/onboardingService.js';
import { resolveApiKey } from '../services/aiService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/repository/summary
 * Generates an onboarding overview, stack detection, and deterministic setup guide.
 */
router.post('/summary', analysisLimiter, async (req, res, next) => {
  try {
    const rawUrl = req.body.repoUrl || req.body.repositoryUrl;
    let owner = req.body.owner;
    let repo = req.body.repo;

    if (rawUrl) {
      const validation = validateRepositoryUrl(rawUrl);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            message: validation.error,
            code: 'INVALID_URL'
          }
        });
      }
      owner = validation.owner;
      repo = validation.repo;
    }

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Repository URL or owner and repo parameters are required.',
          code: 'MISSING_PARAMS'
        }
      });
    }

    const clientToken = req.headers['x-github-token'];
    const apiKey = resolveApiKey(req);

    // 1. Fetch metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Generate Onboarding Summary
    const summaryData = await generateOnboardingSummary(
      owner,
      repo,
      metadata.defaultBranch,
      metadata,
      treeResult.allFilesList,
      clientToken,
      apiKey
    );

    res.json({
      success: true,
      data: summaryData
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/repository/chat
 * Answers technical questions with exact file and line citations.
 */
router.post('/chat', analysisLimiter, async (req, res, next) => {
  try {
    const rawUrl = req.body.repoUrl || req.body.repositoryUrl;
    let owner = req.body.owner;
    let repo = req.body.repo;
    const { question, history } = req.body;

    if (rawUrl) {
      const validation = validateRepositoryUrl(rawUrl);
      if (validation.isValid) {
        owner = validation.owner;
        repo = validation.repo;
      }
    }

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

    const clientToken = req.headers['x-github-token'];
    const apiKey = resolveApiKey(req);

    // 1. Fetch metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Chat with codebase
    const answerData = await chatWithCodebase(
      owner,
      repo,
      metadata.defaultBranch,
      treeResult.allFilesList,
      qValidation.question,
      history || [],
      clientToken,
      apiKey
    );

    res.json({
      success: true,
      data: answerData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
