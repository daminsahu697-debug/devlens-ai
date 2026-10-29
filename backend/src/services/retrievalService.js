/**
 * DevLens AI - Context Retrieval Service
 * Selects representative repository files for AI summarization and
 * performs keyword-based snippet retrieval for Q&A with semantic expansion
 * and binary asset filtering.
 */

import { fetchFileContent } from './githubService.js';
import { ENTRY_POINT_PATTERNS, MANIFEST_PATTERNS } from '../utils/validation.js';

// Common English stopwords to ignore during keyword extraction
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for',
  'of', 'with', 'by', 'from', 'about', 'as', 'into', 'like', 'through', 'after',
  'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under',
  'around', 'among', 'how', 'what', 'where', 'when', 'why', 'who', 'does', 'do',
  'did', 'can', 'could', 'should', 'would', 'will', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'having', 'this', 'that', 'these',
  'those', 'it', 'its', 'code', 'project', 'repo', 'repository', 'file', 'files',
  'implementation', 'implemented', 'works', 'working', 'explain', 'show', 'tell',
  'please', 'find', 'look', 'give', 'me', 'i', 'you', 'we', 'they', 'here', 'there'
]);

// Non-source code / media / binary file extensions that must NOT be retrieved for code Q&A
const NON_SOURCE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'avif', 'bmp', 'tiff',
  'mp4', 'webm', 'mov', 'avi', 'mp3', 'wav', 'ogg',
  'woff', 'woff2', 'eot', 'ttf', 'otf',
  'zip', 'tar', 'gz', '7z', 'rar', 'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'lock', 'lockb', 'map'
]);

// Semantic keyword expansion clusters to bridge user natural language to code filenames
const SYNONYM_CLUSTERS = [
  {
    triggers: [
      'auth', 'authentication', 'authenticate', 'authenticated', 'authenticating',
      'login', 'signin', 'sign-in', 'signup', 'sign-up', 'register', 'registration',
      'session', 'sessions', 'user', 'users', 'account', 'accounts',
      'credential', 'credentials', 'password', 'passwords', 'token', 'tokens',
      'jwt', 'oauth', 'role', 'roles', 'permission', 'permissions', 'nextauth', 'passport'
    ],
    coreTokens: ['auth', 'session', 'login', 'nextauth', 'jwt', 'credentials', 'oauth', 'token']
  },
  {
    triggers: [
      'db', 'database', 'databases', 'prisma', 'postgres', 'postgresql', 'mysql',
      'mongo', 'mongodb', 'mongoose', 'sqlite', 'redis', 'model', 'models',
      'schema', 'schemas', 'entity', 'entities', 'table', 'tables', 'migration',
      'migrations', 'query', 'queries', 'orm', 'store', 'storage'
    ],
    coreTokens: ['prisma', 'schema', 'db', 'database', 'model', 'entity', 'sql', 'migration']
  },
  {
    triggers: [
      'api', 'apis', 'route', 'routes', 'routing', 'endpoint', 'endpoints',
      'controller', 'controllers', 'handler', 'handlers', 'rest', 'graphql',
      'trpc', 'webhook', 'webhooks', 'request', 'response'
    ],
    coreTokens: ['route', 'api', 'controller', 'handler', 'endpoint']
  },
  {
    triggers: [
      'state', 'store', 'stores', 'redux', 'zustand', 'context', 'recoil',
      'mobx', 'reducer', 'reducers', 'slice', 'slices', 'action', 'actions'
    ],
    coreTokens: ['store', 'context', 'state', 'slice', 'reducer']
  },
  {
    triggers: [
      'payment', 'payments', 'pay', 'checkout', 'stripe', 'razorpay',
      'paypal', 'cart', 'order', 'orders', 'billing', 'invoice', 'invoices',
      'price', 'pricing'
    ],
    coreTokens: ['payment', 'checkout', 'stripe', 'razorpay', 'order', 'cart']
  },
  {
    triggers: [
      'ui', 'component', 'components', 'page', 'pages', 'view', 'views',
      'layout', 'layouts', 'style', 'styles', 'css', 'tailwind', 'theme', 'themes'
    ],
    coreTokens: ['component', 'page', 'layout', 'ui', 'view', 'theme']
  },
  {
    triggers: [
      'test', 'tests', 'testing', 'spec', 'specs', 'jest', 'vitest', 'mocha',
      'cypress', 'playwright', 'unit', 'e2e'
    ],
    coreTokens: ['test', 'spec', 'jest', 'vitest']
  },
  {
    triggers: [
      'config', 'configuration', 'env', 'environment', 'variable', 'variables',
      'secret', 'secrets', 'docker', 'dockerfile', 'build', 'vite', 'webpack'
    ],
    coreTokens: ['config', 'env', 'package.json', 'docker']
  }
];

// High-specificity domain tokens that receive amplified relevance score
const HIGH_SPECIFICITY_TOKENS = new Set([
  'auth', 'authentication', 'session', 'nextauth', 'jwt', 'oauth', 'credentials',
  'prisma', 'database', 'postgres', 'mysql', 'mongo', 'mongoose', 'schema',
  'stripe', 'razorpay', 'docker', 'redis'
]);

/**
 * Discovers and collects key contextual files for generating an accurate AI project summary.
 */
export async function getSummaryContext(owner, repo, defaultBranch, allFilesList, token) {
  const contextFiles = [];
  const lowercaseFiles = allFilesList.map(f => ({ original: f, lower: f.toLowerCase() }));

  // 1. Find README
  const readmeMatch = lowercaseFiles.find(f =>
    f.lower === 'readme.md' ||
    f.lower === 'readme' ||
    f.lower === 'readme.txt' ||
    f.lower.startsWith('readme.')
  );

  if (readmeMatch) {
    try {
      const readme = await fetchFileContent(owner, repo, readmeMatch.original, defaultBranch, token);
      contextFiles.push({
        path: readme.path,
        role: 'Documentation / Overview',
        content: truncateLines(readme.content, 180)
      });
    } catch {
      // Graceful fallback if README cannot be read
    }
  }

  // 2. Find primary manifest file (e.g. package.json, Cargo.toml, go.mod, pyproject.toml)
  for (const manifestName of MANIFEST_PATTERNS) {
    const match = lowercaseFiles.find(f => f.lower === manifestName.toLowerCase());
    if (match) {
      try {
        const manifest = await fetchFileContent(owner, repo, match.original, defaultBranch, token);
        contextFiles.push({
          path: manifest.path,
          role: 'Dependency & Build Manifest',
          content: truncateLines(manifest.content, 120)
        });
        break; // Grab the primary top-level manifest
      } catch {
        // continue
      }
    }
  }

  // 3. Find likely entry point files
  const candidateEntryFiles = [];
  for (const item of lowercaseFiles) {
    for (const pattern of ENTRY_POINT_PATTERNS) {
      if (pattern.test(item.original)) {
        candidateEntryFiles.push(item.original);
        break;
      }
    }
  }

  // Fetch up to 2 key entry point files
  for (const entryPath of candidateEntryFiles.slice(0, 2)) {
    try {
      const entry = await fetchFileContent(owner, repo, entryPath, defaultBranch, token);
      contextFiles.push({
        path: entry.path,
        role: 'Application Entry Point',
        content: truncateLines(entry.content, 150)
      });
    } catch {
      // continue
    }
  }

  return contextFiles;
}

/**
 * Extracts searchable keywords from a user question with synonym cluster expansion.
 */
export function extractKeywords(question) {
  const rawWords = question
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && !STOP_WORDS.has(word));

  const expandedSet = new Set(rawWords);

  // Expand with synonym clusters
  for (const cluster of SYNONYM_CLUSTERS) {
    const isTriggered = rawWords.some(w =>
      cluster.triggers.includes(w) ||
      cluster.triggers.some(t => (w.length >= 4 && t.includes(w)) || (t.length >= 4 && w.includes(t)))
    );

    if (isTriggered) {
      cluster.coreTokens.forEach(token => expandedSet.add(token));
    }
  }

  return Array.from(expandedSet);
}

/**
 * Keyword-based retrieval for Q&A with semantic ranking and exact snippet extraction.
 */
export async function retrieveRelevantSnippets(owner, repo, defaultBranch, allFilesList, question, token) {
  const keywords = extractKeywords(question);
  if (keywords.length === 0) {
    return { snippets: [], searchedFilesCount: 0, keywordsUsed: [] };
  }

  // 1. Filter out non-source code and media files
  const candidateFiles = allFilesList.filter(filePath => {
    const ext = (filePath.split('.').pop() || '').toLowerCase();
    return !NON_SOURCE_EXTENSIONS.has(ext);
  });

  // 2. Score candidate files
  const scoredFiles = candidateFiles.map(filePath => {
    let score = 0;
    const lower = filePath.toLowerCase();
    const parts = lower.split('/');
    const fileName = parts[parts.length - 1];
    const baseName = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;

    for (const kw of keywords) {
      const isSpecific = HIGH_SPECIFICITY_TOKENS.has(kw);
      const mult = isSpecific ? 2.5 : 1;

      if (baseName === kw) {
        score += 25 * mult;
      } else if (fileName.includes(kw)) {
        score += 15 * mult;
      } else if (lower.includes(kw)) {
        score += 8 * mult;
      }
    }

    // Boost API routes if question relates to APIs or routes
    if ((lower.startsWith('src/app/api/') || lower.startsWith('src/api/') || lower.includes('/routes/')) && score > 0) {
      score += 4;
    }

    return { filePath, score };
  });

  // 3. Take top candidates with positive score
  let topCandidates = scoredFiles
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.filePath);

  // If no candidates matched keywords, fall back to README and entry point
  if (topCandidates.length === 0) {
    const readme = candidateFiles.find(f => f.toLowerCase().includes('readme'));
    if (readme) topCandidates.push(readme);
    const entry = candidateFiles.find(f => /index|main|app/i.test(f));
    if (entry && !topCandidates.includes(entry)) topCandidates.push(entry);
  }

  const snippets = [];

  // 4. Fetch up to 6 candidate files and extract targeted excerpts
  for (const filePath of topCandidates.slice(0, 6)) {
    try {
      const fileData = await fetchFileContent(owner, repo, filePath, defaultBranch, token);
      const lines = fileData.content.split('\n');

      // Search for keyword matches in file content
      const matchingLineIndices = [];
      lines.forEach((line, idx) => {
        const lineLower = line.toLowerCase();
        for (const kw of keywords) {
          if (lineLower.includes(kw)) {
            matchingLineIndices.push(idx);
            break;
          }
        }
      });

      if (matchingLineIndices.length > 0) {
        // Group nearby matches into excerpt windows (up to 2 windows per file)
        const windows = groupLineIndices(matchingLineIndices, 8);
        for (const win of windows.slice(0, 2)) {
          const startLine = Math.max(0, win[0] - 3);
          const endLine = Math.min(lines.length - 1, win[win.length - 1] + 3);
          const snippetLines = lines.slice(startLine, endLine + 1);

          snippets.push({
            file: filePath,
            lineStart: startLine + 1,
            lineEnd: endLine + 1,
            snippet: snippetLines.join('\n'),
            reason: `Matches key terms in ${filePath}`
          });
        }
      } else {
        // If file was selected by strong name match (e.g. auth.ts or route.ts), take the primary code body (up to 40 lines)
        const headLines = lines.slice(0, Math.min(lines.length, 40));
        snippets.push({
          file: filePath,
          lineStart: 1,
          lineEnd: headLines.length,
          snippet: headLines.join('\n'),
          reason: `High-relevance source module matching query (${filePath})`
        });
      }
    } catch {
      // Continue if one file fails to fetch
    }
  }

  return {
    snippets: snippets.slice(0, 6),
    searchedFilesCount: topCandidates.length,
    keywordsUsed: keywords
  };
}

/**
 * Truncates text to a specified maximum line count.
 */
function truncateLines(text, maxLines) {
  if (!text) return '';
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  return lines.slice(0, maxLines).join('\n') + `\n\n... [Content truncated to ${maxLines} lines for brevity] ...`;
}

/**
 * Groups nearby line indices into continuous ranges.
 */
function groupLineIndices(indices, maxDistance = 5) {
  if (indices.length === 0) return [];
  const groups = [];
  let currentGroup = [indices[0]];

  for (let i = 1; i < indices.length; i++) {
    if (indices[i] - indices[i - 1] <= maxDistance) {
      currentGroup.push(indices[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [indices[i]];
    }
  }
  groups.push(currentGroup);
  return groups;
}
