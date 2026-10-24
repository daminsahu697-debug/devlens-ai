/**
 * DevLens AI - Configuration & Status Routes
 * Provides non-sensitive information about active AI provider, rate limit, and system status.
 */

import express from 'express';
import { isLlmConfigured } from '../services/aiService.js';
import { getRateLimitStatus } from '../services/githubService.js';

const router = express.Router();

router.get('/status', async (req, res, next) => {
  try {
    const clientToken = req.headers['x-github-token'];
    const rateLimit = await getRateLimitStatus(clientToken);

    res.json({
      success: true,
      data: {
        llmConfigured: isLlmConfigured(req),
        llmProvider: process.env.LLM_PROVIDER || 'gemini',
        llmModel: process.env.LLM_MODEL || 'gemini-2.5-flash',
        githubTokenConfigured: Boolean(clientToken || process.env.GITHUB_TOKEN),
        rateLimit
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
