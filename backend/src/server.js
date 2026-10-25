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
import architectureRoutes from './routes/architectureRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
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

// 2. Dynamic CORS Policy
app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);

    // 2. Allow local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // 3. Allow Vercel deployments and previews (*.vercel.app)
    if (origin.endsWith('.vercel.app') || origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // 4. Allow Render deployments (*.onrender.com)
    if (origin.endsWith('.onrender.com') || origin.includes('.onrender.com')) {
      return callback(null, true);
    }

    // 5. Allow configured custom FRONTEND_ORIGIN
    if (FRONTEND_ORIGIN && (origin === FRONTEND_ORIGIN || FRONTEND_ORIGIN === '*')) {
      return callback(null, true);
    }

    // If none match, reject safely
    return callback(new Error('Cross-Origin Request Blocked by DevLens CORS Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-github-token', 'x-gemini-api-key', 'x-llm-api-key']
}));

// Preflight handler
app.options('*', cors());

// 3. Request Body Parsing with Strict Size Limit
app.use(express.json({ limit: '1mb' }));

// 4. General Rate Limiting
app.use(generalLimiter);

// 5. API Routes (Mounted with /api and direct prefix for Vercel Serverless compatibility)
app.use('/api/repository/architecture', architectureRoutes);
app.use('/repository/architecture', architectureRoutes);
app.use('/api/repository/audit', auditRoutes);
app.use('/repository/audit', auditRoutes);
app.use('/api/repository', onboardingRoutes);
app.use('/repository', onboardingRoutes);
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

// In test mode or when dist is absent, serve JSON status on root
if (distPath && process.env.NODE_ENV !== 'test') {
  app.use(express.static(distPath, { index: false }));
  app.get('/', (req, res) => {
    if (req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          name: 'DevLens AI API',
          version: '1.0.0',
          status: 'operational',
          documentation: 'See README.md'
        }
      });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/repository') || req.path.startsWith('/ai') || req.path.startsWith('/config')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root API ping when running API-only mode or test suite
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
