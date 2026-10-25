/**
 * DevLens AI - Integration Tests
 * Tests Express API routes for expected status codes, error schemas, and response formats.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/server.js';

let server;
let baseUrl;

before(async () => {
  await new Promise(resolve => {
    // Bind to random ephemeral port for testing
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

describe('API Route Integration Tests', () => {
  test('GET / - Root returns operational status', async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: { 'Accept': 'application/json' }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'operational');
  });

  test('GET /api/config/status - Returns configuration status and provider info', async () => {
    const res = await fetch(`${baseUrl}/api/config/status`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.llmConfigured, 'boolean');
    assert.strictEqual(body.data.llmProvider, 'gemini');
  });

  test('POST /api/repository/analyze - Rejects missing or invalid repository URL (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl: 'https://not-github.com/test/repo' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_URL');
  });

  test('POST /api/repository/files - Rejects invalid file path with directory traversal (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: 'expressjs',
        repo: 'express',
        path: '../../package.json'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_PATH');
  });

  test('POST /api/repository/files - Rejects binary files (400)', async () => {
    const res = await fetch(`${baseUrl}/api/repository/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: 'expressjs',
        repo: 'express',
        path: 'images/logo.png'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'BINARY_FILE');
  });

  test('POST /api/ai/summarize - Returns clear error when AI key is missing (400)', async () => {
    const origKey = process.env.LLM_API_KEY;
    const origGemini = process.env.GEMINI_API_KEY;
    delete process.env.LLM_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const res = await fetch(`${baseUrl}/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'expressjs',
          repo: 'express'
        })
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'AI_NOT_CONFIGURED');
      assert.match(body.error.message, /LLM_API_KEY/);
    } finally {
      if (origKey) process.env.LLM_API_KEY = origKey;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    }
  });

  test('POST /api/ai/ask - Rejects empty question (400)', async () => {
    const res = await fetch(`${baseUrl}/api/ai/ask`, {
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
});
