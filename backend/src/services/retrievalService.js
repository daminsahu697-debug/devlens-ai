/**
 * DevLens AI - Context Retrieval Service
 * Selects representative repository files for AI summarization and
 * performs keyword-based snippet retrieval for Q&A.
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
  'please', 'find', 'look', 'give', 'me', 'i', 'you', 'we', 'they'
]);

/**
 * Discovers and collects key contextual files for generating an accurate AI project summary.
 * Retrieves:
 * 1. README (if exists)
 * 2. Dependency / build manifest (e.g. package.json, go.mod, Cargo.toml, pyproject.toml)
 * 3. Primary application entry point (e.g. index.js, main.py, src/main.rs)
 * Caps file lengths to prevent token exhaustion.
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
 * Extracts searchable keywords from a user question.
 */
export function extractKeywords(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && !STOP_WORDS.has(word));
}

/**
 * Keyword-based retrieval for Q&A.
 * Scores all known files by name/path match and content keywords,
 * extracts targeted snippets with start/end line numbers.
 */
export async function retrieveRelevantSnippets(owner, repo, defaultBranch, allFilesList, question, token) {
  const keywords = extractKeywords(question);
  if (keywords.length === 0) {
    return { snippets: [], searchedFilesCount: 0, keywordsUsed: [] };
  }

  // Score files by path relevance
  const scoredFiles = allFilesList.map(filePath => {
    let score = 0;
    const lower = filePath.toLowerCase();
    const parts = lower.split('/');
    const fileName = parts[parts.length - 1];

    for (const kw of keywords) {
      if (fileName.includes(kw)) score += 5;
      if (lower.includes(kw)) score += 2;
    }

    // Boost common high-value architectural files
    if (lower.includes('readme')) score += 3;
    if (lower.includes('config') || lower.includes('manifest')) score += 1;
    if (lower.includes('route') || lower.includes('controller') || lower.includes('api')) score += 2;
    if (lower.includes('auth') || lower.includes('model') || lower.includes('service')) score += 2;

    return { filePath, score };
  });

  // Filter to files with score > 0, sorted descending
  const topCandidates = scoredFiles
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.filePath);

  // If no candidates matched keywords, fall back to README and entry point
  if (topCandidates.length === 0) {
    const readme = allFilesList.find(f => f.toLowerCase().includes('readme'));
    if (readme) topCandidates.push(readme);
    const entry = allFilesList.find(f => /index|main|app/i.test(f));
    if (entry && !topCandidates.includes(entry)) topCandidates.push(entry);
  }

  const snippets = [];

  for (const filePath of topCandidates.slice(0, 4)) {
    try {
      const fileData = await fetchFileContent(owner, repo, filePath, defaultBranch, token);
      const lines = fileData.content.split('\n');

      // Search for keyword matches in content
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
            reason: `Matches terms "${keywords.join(', ')}" in ${filePath}`
          });
        }
      } else {
        // If file was selected by path match but no direct content line matched, take the head of file
        const headLines = lines.slice(0, Math.min(lines.length, 30));
        snippets.push({
          file: filePath,
          lineStart: 1,
          lineEnd: headLines.length,
          snippet: headLines.join('\n'),
          reason: `Relevant architectural file identified from path match (${filePath})`
        });
      }
    } catch {
      // Continue if one file fails to fetch
    }
  }

  return {
    snippets: snippets.slice(0, 5),
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
