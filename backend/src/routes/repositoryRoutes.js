/**
 * DevLens AI - Repository Analysis Routes
 * Handles URL validation, GitHub metadata extraction, tree parsing, and file inspection.
 */

import express from 'express';
import { validateRepositoryUrl, validateFilePath } from '../utils/validation.js';
import {
  fetchRepositoryMetadata,
  fetchRepositoryTree,
  fetchFileContent
} from '../services/githubService.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/repository/analyze
 * Analyzes a public GitHub repository given its URL.
 */
router.post('/analyze', analysisLimiter, async (req, res, next) => {
  try {
    const { repositoryUrl } = req.body;

    const validation = validateRepositoryUrl(repositoryUrl);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: validation.error,
          code: 'INVALID_URL'
        }
      });
    }

    const { owner, repo } = validation;
    const clientToken = req.headers['x-github-token'];

    // 1. Fetch repository metadata
    const metadata = await fetchRepositoryMetadata(owner, repo, clientToken);

    // 2. Fetch repository file tree
    const treeResult = await fetchRepositoryTree(owner, repo, metadata.defaultBranch, clientToken);

    res.json({
      success: true,
      data: {
        metadata,
        tree: treeResult.tree,
        allFilesList: treeResult.allFilesList,
        stats: {
          ...treeResult.stats,
          discoveredFiles: treeResult.stats.totalDiscovered,
          retrievedFiles: treeResult.stats.returnedFiles
        },
        languageBreakdown: treeResult.languageBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/repository/files
 * Retrieves and returns the contents of a specific file in the repository.
 */
router.post('/files', async (req, res, next) => {
  try {
    const { owner, repo, path, branch } = req.body;

    if (!owner || !repo || !path) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required parameters: "owner", "repo", and "path" are required.',
          code: 'MISSING_PARAMS'
        }
      });
    }

    const validation = validateFilePath(path);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: validation.error,
          code: validation.isBinary ? 'BINARY_FILE' : 'INVALID_PATH'
        }
      });
    }

    const clientToken = req.headers['x-github-token'];
    const fileData = await fetchFileContent(owner, repo, validation.sanitizedPath, branch || null, clientToken);

    res.json({
      success: true,
      data: fileData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
