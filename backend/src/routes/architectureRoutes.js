/**
 * DevLens AI - Architecture Routes (Feature 1: X-Ray View)
 * Handles endpoint POST /api/repository/architecture
 */

import express from 'express';
import { validateRepositoryUrl } from '../utils/validation.js';
import { fetchRepositoryMetadata, fetchRepositoryTree } from '../services/githubService.js';
import { analyzeArchitecture } from '../services/architectureService.js';
import { resolveApiKey } from '../services/aiService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/repository/architecture
 * Generates an interactive architecture graph.
 */
router.post(['/', '/analyze'], analysisLimiter, async (req, res, next) => {
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

    // 3. Analyze architecture graph
    const architectureData = await analyzeArchitecture(
      owner,
      repo,
      metadata.defaultBranch,
      treeResult.allFilesList,
      clientToken,
      apiKey
    );

    res.json({
      success: true,
      data: architectureData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
