/**
 * DevLens AI - Video Presentation & Walkthrough Routes
 * Handles endpoints:
 * - POST /api/repository/video/script
 * Generates an end-to-end 6-chapter video narration script and slide data.
 */

import express from 'express';
import { validateRepositoryUrl } from '../utils/validation.js';
import { fetchRepositoryMetadata, fetchRepositoryTree } from '../services/githubService.js';
import { generateVideoPresentation } from '../services/videoService.js';
import { resolveApiKey } from '../services/aiService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/repository/video/script
 * or POST /script (when mounted at /api/repository/video)
 */
router.post(['/script', '/'], analysisLimiter, async (req, res, next) => {
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
    const narrationMode = req.body.narrationMode || 'simple';

    // 1. Fetch repository metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch repository file tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    // 3. Generate 6-chapter video presentation payload
    const presentationData = await generateVideoPresentation(
      owner,
      repo,
      metadata.defaultBranch,
      metadata,
      treeResult.allFilesList,
      clientToken,
      apiKey,
      narrationMode
    );

    res.json({
      success: true,
      data: presentationData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
