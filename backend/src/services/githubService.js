/**
 * DevLens AI - GitHub REST API Service
 * Handles repository metadata fetching, recursive file tree retrieval,
 * content reading, rate limit tracking, and in-memory caching.
 */

import { BINARY_EXTENSIONS, IGNORED_DIRECTORIES } from '../utils/validation.js';

const GITHUB_API_BASE = 'https://api.github.com';

// In-memory cache for repository metadata and trees (10-minute TTL)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Builds standard GitHub request headers, attaching token if configured.
 */
function getHeaders(customToken) {
  const token = customToken || process.env.GITHUB_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevLens-AI-Repo-Analyzer/1.0.0'
  };
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Checks GitHub API rate limit status.
 */
export async function getRateLimitStatus(token) {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getHeaders(token)
    });
    if (!res.ok) {
      return { remaining: null, limit: null, reset: null };
    }
    const data = await res.json();
    return {
      remaining: data.resources?.core?.remaining ?? null,
      limit: data.resources?.core?.limit ?? null,
      reset: data.resources?.core?.reset ?? null
    };
  } catch {
    return { remaining: null, limit: null, reset: null };
  }
}

/**
 * Fetches repository metadata from GitHub.
 */
export async function fetchRepositoryMetadata(owner, repo, token) {
  const cacheKey = `meta:${owner}/${repo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: getHeaders(token) });

  if (res.status === 404) {
    const error = new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    error.statusCode = 404;
    error.code = 'REPO_NOT_FOUND';
    throw error;
  }

  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining === '0') {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() : 'soon';
      const error = new Error(`GitHub API rate limit exceeded. Please provide a GITHUB_TOKEN in backend .env to increase the limit from 60 to 5,000 req/hr. Limit resets at ${resetDate}.`);
      error.statusCode = 429;
      error.code = 'GITHUB_RATE_LIMIT';
      throw error;
    }
  }

  if (!res.ok) {
    const error = new Error(`GitHub API returned status ${res.status}: ${res.statusText}`);
    error.statusCode = res.status >= 500 ? 502 : res.status;
    error.code = 'GITHUB_API_ERROR';
    throw error;
  }

  const data = await res.json();

  const metadata = {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    owner: {
      login: data.owner?.login,
      avatarUrl: data.owner?.avatar_url,
      htmlUrl: data.owner?.html_url
    },
    description: data.description || 'No description provided for this repository.',
    htmlUrl: data.html_url,
    homepage: data.homepage || null,
    defaultBranch: data.default_branch || 'main',
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    watchers: data.watchers_count ?? 0,
    sizeKb: data.size ?? 0,
    language: data.language || 'Unknown',
    license: data.license ? { name: data.license.name, spdxId: data.license.spdx_id } : null,
    topics: data.topics || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    isFork: data.fork ?? false,
    archived: data.archived ?? false
  };

  setCached(cacheKey, metadata);
  return metadata;
}

/**
 * Fetches the recursive Git tree for the repository default branch.
 */
export async function fetchRepositoryTree(owner, repo, defaultBranch, token) {
  const cacheKey = `tree:${owner}/${repo}:${defaultBranch}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const res = await fetch(url, { headers: getHeaders(token) });

  if (res.status === 404) {
    // Empty repository or no commits on branch
    return {
      tree: [],
      stats: {
        totalDiscovered: 0,
        returnedFiles: 0,
        sourceFilesCount: 0,
        docsFilesCount: 0,
        configFilesCount: 0,
        isTruncated: false
      },
      languageBreakdown: []
    };
  }

  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    const error = new Error('GitHub API rate limit exceeded while retrieving repository tree. Add a GITHUB_TOKEN in backend/.env.');
    error.statusCode = 429;
    error.code = 'GITHUB_RATE_LIMIT';
    throw error;
  }

  if (!res.ok) {
    const error = new Error(`Failed to fetch file tree (HTTP ${res.status}).`);
    error.statusCode = res.status >= 500 ? 502 : res.status;
    error.code = 'GITHUB_TREE_ERROR';
    throw error;
  }

  const data = await res.json();
  const rawTree = data.tree || [];
  const isTruncated = Boolean(data.truncated);

  // Filter out noisy, build, and vendor directories
  const filteredTree = [];
  let sourceFilesCount = 0;
  let docsFilesCount = 0;
  let configFilesCount = 0;
  const extCounts = {};

  for (const item of rawTree) {
    const path = item.path;

    // Skip ignored directories
    if (IGNORED_DIRECTORIES.some(dir => path.startsWith(dir) || path.includes('/' + dir))) {
      continue;
    }

    // Only process blobs (files) and trees (directories)
    if (item.type !== 'blob' && item.type !== 'tree') {
      continue;
    }

    const isDir = item.type === 'tree';
    const ext = isDir ? '' : (path.split('.').pop() || '').toLowerCase();

    // Categorize
    if (!isDir) {
      if (['md', 'txt', 'rst', 'adoc', 'pdf'].includes(ext) || path.toLowerCase().includes('readme')) {
        docsFilesCount++;
      } else if (['json', 'yaml', 'yml', 'toml', 'xml', 'env', 'config', 'mod', 'gradle'].includes(ext)) {
        configFilesCount++;
      } else if (!BINARY_EXTENSIONS.has(ext)) {
        sourceFilesCount++;
      }

      if (ext && !BINARY_EXTENSIONS.has(ext)) {
        extCounts[ext] = (extCounts[ext] || 0) + 1;
      }
    }

    filteredTree.push({
      path: item.path,
      mode: item.mode,
      type: isDir ? 'tree' : 'blob',
      size: item.size || 0,
      sha: item.sha
    });
  }

  // Calculate language/extension breakdown for visualization
  const languageBreakdown = Object.entries(extCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([extension, count]) => ({
      name: extension.toUpperCase(),
      count,
      extension
    }));

  // Limit tree sent to frontend to top 400 entries to maintain fast DOM rendering
  const MAX_FRONTEND_TREE_ITEMS = 400;
  const prunedTree = filteredTree.slice(0, MAX_FRONTEND_TREE_ITEMS);

  const result = {
    tree: prunedTree,
    allFilesList: filteredTree.filter(f => f.type === 'blob').map(f => f.path),
    stats: {
      totalDiscovered: rawTree.length,
      returnedFiles: prunedTree.length,
      sourceFilesCount,
      docsFilesCount,
      configFilesCount,
      isTruncated: isTruncated || filteredTree.length > MAX_FRONTEND_TREE_ITEMS
    },
    languageBreakdown
  };

  setCached(cacheKey, result);
  return result;
}

/**
 * Fetches and decodes a specific file's content from GitHub.
 */
export async function fetchFileContent(owner, repo, filePath, branch = null, token) {
  const cacheKey = `file:${owner}/${repo}:${branch || 'default'}:${filePath}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const queryParam = (branch && branch.trim()) ? `?ref=${encodeURIComponent(branch.trim())}` : '';
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}${queryParam}`;

  const res = await fetch(url, { headers: getHeaders(token) });

  if (res.status === 404) {
    const error = new Error(`File "${filePath}" does not exist in repository "${owner}/${repo}".`);
    error.statusCode = 404;
    error.code = 'FILE_NOT_FOUND';
    throw error;
  }

  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    const error = new Error('GitHub API rate limit exceeded while retrieving file. Add a GITHUB_TOKEN in backend/.env.');
    error.statusCode = 429;
    error.code = 'GITHUB_RATE_LIMIT';
    throw error;
  }

  if (!res.ok) {
    const error = new Error(`Failed to fetch file "${filePath}" (HTTP ${res.status}).`);
    error.statusCode = res.status >= 500 ? 502 : res.status;
    error.code = 'GITHUB_FILE_ERROR';
    throw error;
  }

  const data = await res.json();

  if (data.type !== 'file') {
    const error = new Error(`"${filePath}" is a directory or submodule, not a viewable file.`);
    error.statusCode = 400;
    error.code = 'NOT_A_FILE';
    throw error;
  }

  // Reject files over 500 KB to avoid memory bloating
  const MAX_FILE_SIZE_BYTES = 500 * 1024;
  if (data.size > MAX_FILE_SIZE_BYTES) {
    const error = new Error(`File is too large to preview (${Math.round(data.size / 1024)} KB). Maximum supported size is 500 KB.`);
    error.statusCode = 413;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  // Decode base64 content safely
  let textContent = '';
  if (data.encoding === 'base64' && data.content) {
    try {
      const buffer = Buffer.from(data.content, 'base64');
      // Check for null bytes to detect binary files
      if (buffer.includes(0x00)) {
        const error = new Error('This file appears to be a binary file and cannot be displayed as text.');
        error.statusCode = 400;
        error.code = 'BINARY_FILE';
        throw error;
      }
      textContent = buffer.toString('utf-8');
    } catch (err) {
      if (err.code === 'BINARY_FILE') throw err;
      const error = new Error('Failed to decode file content from base64.');
      error.statusCode = 500;
      throw error;
    }
  } else if (typeof data.content === 'string') {
    textContent = data.content;
  }

  const lineCount = textContent.split('\n').length;
  const fileName = filePath.split('/').pop() || filePath;
  const extension = fileName.split('.').pop() || '';

  const fileData = {
    path: filePath,
    name: fileName,
    extension,
    sizeBytes: data.size,
    lineCount,
    content: textContent,
    htmlUrl: data.html_url
  };

  setCached(cacheKey, fileData);
  return fileData;
}
