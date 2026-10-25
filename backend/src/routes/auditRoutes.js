/**
 * DevLens AI - Security & Bug Audit Routes (Feature 2: Doctor Checkup)
 * Handles endpoints:
 * - POST /api/repository/audit
 * - POST /api/repository/audit/fix
 */

import express from 'express';
import { validateRepositoryUrl } from '../utils/validation.js';
import { fetchRepositoryMetadata, fetchRepositoryTree } from '../services/githubService.js';
import { performRepositoryAudit, generateFindingFix } from '../services/auditService.js';
import { resolveApiKey } from '../services/aiService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/repository/audit
 * Runs deterministic rule-based checks and AI code inspection.
 */
router.post('/', analysisLimiter, async (req, res, next) => {
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

    // 1. Fetch metadata & branch
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Perform hybrid audit
    const auditReport = await performRepositoryAudit(
      owner,
      repo,
      metadata.defaultBranch,
      treeResult.allFilesList,
      clientToken,
      apiKey
    );

    res.json({
      success: true,
      data: auditReport
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/repository/audit/fix
 * Generates a reviewable before-and-after patch diff for a specific finding.
 */
router.post('/fix', analysisLimiter, async (req, res, next) => {
  try {
    const rawUrl = req.body.repoUrl || req.body.repositoryUrl;
    let owner = req.body.owner;
    let repo = req.body.repo;
    const { finding } = req.body;

    if (rawUrl) {
      const validation = validateRepositoryUrl(rawUrl);
      if (validation.isValid) {
        owner = validation.owner;
        repo = validation.repo;
      }
    }

    if (!owner || !repo || !finding || !finding.filePath) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required parameters: owner, repo, and finding details are required.',
          code: 'MISSING_PARAMS'
        }
      });
    }

    const clientToken = req.headers['x-github-token'];
    const apiKey = resolveApiKey(req);

    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    const fixResult = await generateFindingFix(
      owner,
      repo,
      metadata.defaultBranch,
      finding,
      clientToken,
      apiKey
    );

    res.json({
      success: true,
      data: fixResult
    });
  } catch (err) {
    next(err);
  }
});

export default router;
