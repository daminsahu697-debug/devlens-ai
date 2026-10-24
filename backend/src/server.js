/**
 * DevLens AI - Main Backend Server
 * Express application with security headers, CORS, rate limiting, and centralized error handling.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

import repositoryRoutes from './routes/repositoryRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import configRoutes from './routes/configRoutes.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Policy
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or frontend origin
    if (!origin || origin === FRONTEND_ORIGIN || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Cross-Origin Request Blocked by DevLens CORS Policy'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-github-token', 'x-gemini-api-key', 'x-llm-api-key']
}));

// 3. Request Body Parsing with Strict Size Limit
app.use(express.json({ limit: '1mb' }));

// 4. General Rate Limiting
app.use(generalLimiter);

// 5. API Routes (Mounted with /api and direct prefix for Vercel Serverless compatibility)
app.use('/api/repository', repositoryRoutes);
app.use('/repository', repositoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);
app.use('/api/config', configRoutes);
app.use('/config', configRoutes);

import path from 'node:path';
import fs from 'node:fs';

// 6. Serve Compiled Frontend Assets in Production
const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
const localDistPath = path.resolve(process.cwd(), 'frontend/dist');
const distPath = fs.existsSync(frontendDistPath)
  ? frontendDistPath
  : (fs.existsSync(localDistPath) ? localDistPath : null);

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Fallback API ping when running API-only mode
  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'DevLens AI API',
        version: '1.0.0',
        status: 'operational',
        documentation: 'See README.md'
      }
    });
  });
}

// 6. 404 Handler
app.use(notFoundHandler);

// 7. Centralized Error Handler
app.use(errorHandler);

import { fileURLToPath } from 'node:url';

// Start server only when executed directly (not when imported in tests)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule || process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`[DevLens AI Backend] Server running on http://localhost:${PORT}`);
    console.log(`[DevLens AI Backend] Allowed Frontend Origin: ${FRONTEND_ORIGIN}`);
    console.log(`[DevLens AI Backend] LLM Provider: ${process.env.LLM_PROVIDER || 'gemini'}`);
  });
}

export default app;
