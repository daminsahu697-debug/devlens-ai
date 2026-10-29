/**
 * DevLens AI - Unit and Integration Tests for Upgraded Features
 * Tests Feature 1 (Architecture X-Ray), Feature 2 (Doctor Checkup), and Feature 3 (Instant Onboarding & Chat)
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/server.js';
import { NODE_TYPES, CONFIDENCE_LEVELS } from '../src/services/architectureService.js';
import { SEVERITIES } from '../src/services/auditService.js';

let server;
let baseUrl;

before(async () => {
  await new Promise(resolve => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
});

describe('Feature 1: Interactive Architecture Map (X-Ray View)', () => {
  test('POST /api/repository/architecture - Rejects missing parameters (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/architecture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'MISSING_PARAMS');
  });

  test('POST /api/repository/architecture - Rejects non-GitHub SSRF URL (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/architecture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: 'https://evil-internal-host.com/secret/repo' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_URL');
  });

  test('Architecture constants and node types are defined', () => {
    assert.strictEqual(NODE_TYPES.FRONTEND, 'frontend');
    assert.strictEqual(NODE_TYPES.BACKEND_ROUTE, 'route');
    assert.strictEqual(NODE_TYPES.DATABASE_MODEL, 'database');
    assert.strictEqual(CONFIDENCE_LEVELS.VERIFIED, 'VERIFIED');
    assert.strictEqual(CONFIDENCE_LEVELS.INFERRED, 'INFERRED');
  });
});

describe('Feature 2: Smart Bug & Security Audit (Doctor Checkup)', () => {
  test('POST /api/repository/audit - Rejects missing repoUrl and owner/repo (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'MISSING_PARAMS');
  });

  test('POST /api/repository/audit/fix - Rejects missing finding payload (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/audit/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner: 'expressjs', repo: 'express' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'MISSING_PARAMS');
  });

  test('Audit severities are accurately tiered', () => {
    assert.strictEqual(SEVERITIES.CRITICAL, 'CRITICAL');
    assert.strictEqual(SEVERITIES.HIGH, 'HIGH');
    assert.strictEqual(SEVERITIES.MEDIUM, 'MEDIUM');
    assert.strictEqual(SEVERITIES.LOW, 'LOW');
    assert.strictEqual(SEVERITIES.INFO, 'INFO');
  });
});

describe('Feature 3: Instant Onboarding & Grounded Chat', () => {
  test('POST /api/repository/summary - Rejects missing repository URL (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'MISSING_PARAMS');
  });

  test('POST /api/repository/chat - Rejects empty question (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: 'expressjs',
        repo: 'express',
        question: '   '
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_QUESTION');
  });

  test('extractKeywords expands authentication to auth and session clusters while ignoring stopwords', async () => {
    const { extractKeywords } = await import('../src/services/retrievalService.js');
    const keywords = extractKeywords('Where is user authentication or session handling implemented?');
    assert.ok(keywords.includes('auth'), 'Must expand to auth');
    assert.ok(keywords.includes('session'), 'Must include session');
    assert.ok(keywords.includes('nextauth'), 'Must include nextauth');
    assert.ok(!keywords.includes('where'), 'Must ignore stopword where');
    assert.ok(!keywords.includes('is'), 'Must ignore stopword is');
  });
});

describe('Feature: AI Video Walkthrough & Presentation', () => {
  test('POST /api/repository/video/script - Rejects missing parameters (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/video/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'MISSING_PARAMS');
  });

  test('POST /api/repository/video/script - Rejects non-GitHub SSRF URL (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/video/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: 'https://malicious-site.com/exploit/repo' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_URL');
  });
});

