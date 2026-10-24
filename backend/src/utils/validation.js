/**
 * DevLens AI - Input Validation Utilities
 * Validates URLs, repository names, file paths, and questions with security in mind.
 */

// Binary and non-source file extensions that should be rejected or excluded
export const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'bmp', 'tiff',
  'pdf', 'zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'exe', 'dll', 'so',
  'dylib', 'bin', 'iso', 'dmg', 'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp3', 'wav', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'ogg', 'lock',
  'pyc', 'pyo', 'class', 'jar', 'war', 'db', 'sqlite', 'sqlite3', 'wasm'
]);

// Directories to exclude from initial analysis to reduce noise and rate-limit waste
export const IGNORED_DIRECTORIES = [
  '.git/',
  'node_modules/',
  'dist/',
  'build/',
  '.next/',
  '.nuxt/',
  '.output/',
  'coverage/',
  'vendor/',
  'target/',
  'bin/',
  'obj/',
  '__pycache__/',
  '.venv/',
  'venv/',
  '.idea/',
  '.vscode/',
  '.turbo/'
];

// Well-known entry point file patterns
export const ENTRY_POINT_PATTERNS = [
  /^index\.(js|jsx|ts|tsx|mjs|cjs)$/i,
  /^main\.(js|jsx|ts|tsx|py|go|rs)$/i,
  /^app\.(js|jsx|ts|tsx|py)$/i,
  /^server\.(js|ts)$/i,
  /^src\/index\.(js|jsx|ts|tsx)$/i,
  /^src\/main\.(js|jsx|ts|tsx|rs|go|py)$/i,
  /^src\/App\.(js|jsx|ts|tsx)$/i,
  /^src\/server\.(js|ts)$/i,
  /^cmd\/.*\/main\.go$/i
];

// Well-known dependency and configuration manifests
export const MANIFEST_PATTERNS = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'Pipfile',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'composer.json',
  'Dockerfile',
  'docker-compose.yml'
];

/**
 * Validates a GitHub repository URL and extracts owner and repository name.
 * Accepts:
 *   - https://github.com/owner/repo
 *   - http://github.com/owner/repo
 *   - github.com/owner/repo
 * Rejects arbitrary external URLs, SSRF vectors, invalid characters.
 */
export function validateRepositoryUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: 'Repository URL is required and must be a string.'
    };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: 'Repository URL is too long (maximum 255 characters).'
    };
  }

  // Prepend protocol if missing for URL parsing
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please provide a valid GitHub repository URL.'
    };
  }

  // Enforce GitHub domain only (prevents SSRF to internal network or arbitrary domains)
  const host = parsed.hostname.toLowerCase();
  if (host !== 'github.com' && host !== 'www.github.com') {
    return {
      isValid: false,
      error: 'Only public GitHub repositories (github.com) are supported.'
    };
  }

  // Extract path segments (e.g. /owner/repo)
  const segments = parsed.pathname
    .split('/')
    .map(s => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    return {
      isValid: false,
      error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repository'
    };
  }

  const owner = segments[0];
  let repo = segments[1];

  // Strip trailing .git if present
  if (repo.toLowerCase().endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  // Validate owner and repo names: alphanumeric, hyphen, underscore, period
  const githubNamePattern = /^[a-zA-Z0-9_.-]+$/;
  if (!githubNamePattern.test(owner) || !githubNamePattern.test(repo)) {
    return {
      isValid: false,
      error: 'Repository owner and name must contain only letters, numbers, hyphens, periods, or underscores.'
    };
  }

  // Guard against traversal-like names
  if (owner === '.' || owner === '..' || repo === '.' || repo === '..') {
    return {
      isValid: false,
      error: 'Invalid repository identifier.'
    };
  }

  return {
    isValid: true,
    owner,
    repo,
    canonicalUrl: `https://github.com/${owner}/${repo}`
  };
}

/**
 * Validates a file path requested from a repository.
 * Defends against directory traversal, absolute paths, and null byte injections.
 */
export function validateFilePath(path) {
  if (!path || typeof path !== 'string') {
    return { isValid: false, error: 'File path is required.' };
  }

  const trimmed = path.trim();
  if (trimmed.length > 500) {
    return { isValid: false, error: 'File path exceeds maximum length of 500 characters.' };
  }

  // Guard against null bytes or control characters
  if (/[\0\r\n]/.test(trimmed)) {
    return { isValid: false, error: 'File path contains invalid control characters.' };
  }

  // Guard against absolute paths and directory traversal
  if (trimmed.startsWith('/') || trimmed.startsWith('\\') || /^[a-zA-Z]:/.test(trimmed)) {
    return { isValid: false, error: 'Absolute paths are not permitted.' };
  }

  const segments = trimmed.replace(/\\/g, '/').split('/');
  for (const segment of segments) {
    if (segment === '..') {
      return { isValid: false, error: 'Directory traversal sequence ("..") is not permitted.' };
    }
  }

  // Check if extension is known binary
  const ext = getFileExtension(trimmed).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      isBinary: true,
      error: `Binary and media files (.${ext}) cannot be viewed or analyzed as text.`
    };
  }

  return {
    isValid: true,
    sanitizedPath: segments.filter(Boolean).join('/')
  };
}

/**
 * Validates a user question submitted for Q&A.
 */
export function validateQuestion(question) {
  if (!question || typeof question !== 'string') {
    return { isValid: false, error: 'Question text is required.' };
  }

  const trimmed = question.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Question cannot be empty.' };
  }

  if (trimmed.length > 500) {
    return { isValid: false, error: 'Question is too long (maximum 500 characters).' };
  }

  return { isValid: true, question: trimmed };
}

/**
 * Extracts extension from a file path.
 */
export function getFileExtension(path) {
  const parts = path.split('.');
  return parts.length > 1 ? parts.pop() : '';
}
