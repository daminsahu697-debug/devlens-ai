/**
 * DevLens AI - Frontend API Client
 * Interfaces with the Express backend, attaching custom session tokens when provided.
 */

const API_BASE = '/api';

/**
 * Helper to build headers with optional user session tokens.
 */
function buildHeaders(sessionKeys = {}) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (sessionKeys.geminiApiKey) {
    headers['x-gemini-api-key'] = sessionKeys.geminiApiKey.trim();
  }
  if (sessionKeys.githubToken) {
    headers['x-github-token'] = sessionKeys.githubToken.trim();
  }

  return headers;
}

/**
 * Parses response safely and normalizes error messages.
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned unexpected format (HTTP ${response.status})`);
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.code = data.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return data.data;
}

/**
 * Analyzes a GitHub repository by URL.
 */
export async function analyzeRepository(repositoryUrl, sessionKeys) {
  const response = await fetch(`${API_BASE}/repository/analyze`, {
    method: 'POST',
    headers: buildHeaders(sessionKeys),
    body: JSON.stringify({ repositoryUrl })
  });
  return handleResponse(response);
}

/**
 * Fetches source file content.
 */
export async function fetchFileContent(owner, repo, path, branch, sessionKeys) {
  const response = await fetch(`${API_BASE}/repository/files`, {
    method: 'POST',
    headers: buildHeaders(sessionKeys),
    body: JSON.stringify({ owner, repo, path, branch })
  });
  return handleResponse(response);
}

/**
 * Generates an architectural summary using verified files.
 */
export async function generateSummary(owner, repo, sessionKeys) {
  const response = await fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    headers: buildHeaders(sessionKeys),
    body: JSON.stringify({ owner, repo })
  });
  return handleResponse(response);
}

/**
 * Asks a source-grounded question about the repository.
 */
export async function askQuestion(owner, repo, question, sessionKeys) {
  const response = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: buildHeaders(sessionKeys),
    body: JSON.stringify({ owner, repo, question })
  });
  return handleResponse(response);
}

/**
 * Retrieves backend system configuration status.
 */
export async function getSystemStatus(sessionKeys) {
  const response = await fetch(`${API_BASE}/config/status`, {
    method: 'GET',
    headers: buildHeaders(sessionKeys)
  });
  return handleResponse(response);
}
