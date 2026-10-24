/**
 * DevLens AI - Automated Test Suite
 * Tests input validation, error handling, security controls, and endpoint behavior.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  validateRepositoryUrl,
  validateFilePath,
  validateQuestion,
  getFileExtension
} from '../src/utils/validation.js';

describe('1. Repository URL Validation & Security', () => {
  test('Valid standard GitHub URL', () => {
    const res = validateRepositoryUrl('https://github.com/expressjs/express');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'expressjs');
    assert.strictEqual(res.repo, 'express');
  });

  test('Valid GitHub URL without protocol', () => {
    const res = validateRepositoryUrl('github.com/facebook/react');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'facebook');
    assert.strictEqual(res.repo, 'react');
  });

  test('Valid GitHub URL ending in .git is stripped', () => {
    const res = validateRepositoryUrl('https://github.com/torvalds/linux.git');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'torvalds');
    assert.strictEqual(res.repo, 'linux');
  });

  test('Rejects non-GitHub external URLs (SSRF prevention)', () => {
    const res = validateRepositoryUrl('https://evil.com/owner/repo');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /Only public GitHub repositories/);
  });

  test('Rejects invalid URL format or empty input', () => {
    const resEmpty = validateRepositoryUrl('');
    assert.strictEqual(resEmpty.isValid, false);

    const resMalformed = validateRepositoryUrl('not-a-url');
    assert.strictEqual(resMalformed.isValid, false);
  });

  test('Rejects directory traversal in owner/repo names', () => {
    const res = validateRepositoryUrl('https://github.com/../..');
    assert.strictEqual(res.isValid, false);
  });
});

describe('2. File Path Validation & Traversal Defense', () => {
  test('Accepts valid relative source file paths', () => {
    const res = validateFilePath('src/index.js');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.sanitizedPath, 'src/index.js');
  });

  test('Rejects directory traversal sequences ("..")', () => {
    const res = validateFilePath('src/../../etc/passwd');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /Directory traversal/);
  });

  test('Rejects absolute paths', () => {
    const resPosix = validateFilePath('/etc/hosts');
    assert.strictEqual(resPosix.isValid, false);

    const resWin = validateFilePath('C:\\Windows\\system32');
    assert.strictEqual(resWin.isValid, false);
  });

  test('Rejects binary file extensions', () => {
    const resPng = validateFilePath('assets/logo.png');
    assert.strictEqual(resPng.isValid, false);
    assert.strictEqual(resPng.isBinary, true);

    const resExe = validateFilePath('bin/binary.exe');
    assert.strictEqual(resExe.isValid, false);
    assert.strictEqual(resExe.isBinary, true);
  });
});

describe('3. Question Validation for Codebase Q&A', () => {
  test('Accepts valid question', () => {
    const res = validateQuestion('Where is the application entry point?');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.question, 'Where is the application entry point?');
  });

  test('Rejects empty or whitespace-only questions', () => {
    const res = validateQuestion('   ');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /cannot be empty/);
  });

  test('Rejects excessively long questions (> 500 chars)', () => {
    const longQ = 'a'.repeat(501);
    const res = validateQuestion(longQ);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /too long/);
  });
});

describe('4. File Extension Extraction', () => {
  test('Correctly extracts file extension', () => {
    assert.strictEqual(getFileExtension('server.js'), 'js');
    assert.strictEqual(getFileExtension('src/components/Header.tsx'), 'tsx');
    assert.strictEqual(getFileExtension('Dockerfile'), '');
    assert.strictEqual(getFileExtension('archive.tar.gz'), 'gz');
  });
});
