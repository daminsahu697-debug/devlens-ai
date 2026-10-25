/**
 * DevLens AI - Architecture Service (X-Ray View)
 * Performs static structural parsing of imports, routes, components, and models,
 * combined with AI-assisted relationship inference to produce a structured,
 * verified architecture graph.
 */

import { fetchFileContent } from './githubService.js';
import { callLlmWithJson } from './aiService.js';

// Categories of architecture nodes
export const NODE_TYPES = {
  FRONTEND: 'frontend',
  PAGE: 'page',
  BACKEND_ROUTE: 'route',
  BACKEND_SERVICE: 'service',
  DATABASE_MODEL: 'database',
  EXTERNAL_API: 'external',
  AUTH: 'auth',
  CONFIG: 'config',
  TEST: 'test'
};

// Relationship confidence tiers
export const CONFIDENCE_LEVELS = {
  VERIFIED: 'VERIFIED',
  INFERRED: 'INFERRED',
  LOW_CONFIDENCE: 'LOW CONFIDENCE'
};

/**
 * Classifies a file path into an architectural node type.
 */
function classifyFileType(filePath) {
  const lower = filePath.toLowerCase();

  // Test modules
  if (lower.includes('test') || lower.includes('spec') || lower.startsWith('tests/') || lower.includes('__tests__')) {
    return NODE_TYPES.TEST;
  }

  // Configuration
  if (
    lower.endsWith('package.json') ||
    lower.endsWith('tsconfig.json') ||
    lower.endsWith('vite.config.js') ||
    lower.endsWith('vite.config.ts') ||
    lower.endsWith('next.config.js') ||
    lower.endsWith('webpack.config.js') ||
    lower.endsWith('.env.example') ||
    lower.endsWith('docker-compose.yml') ||
    lower.endsWith('dockerfile')
  ) {
    return NODE_TYPES.CONFIG;
  }

  // Authentication
  if (lower.includes('auth') || lower.includes('passport') || lower.includes('session') || lower.includes('token')) {
    return NODE_TYPES.AUTH;
  }

  // Database models and schemas
  if (
    lower.includes('model') ||
    lower.includes('schema') ||
    lower.includes('entity') ||
    lower.includes('entities') ||
    lower.endsWith('schema.prisma') ||
    lower.includes('migration')
  ) {
    return NODE_TYPES.DATABASE_MODEL;
  }

  // API Routes & Controllers
  if (
    lower.includes('route') ||
    lower.includes('controller') ||
    lower.startsWith('api/') ||
    lower.includes('/api/') ||
    lower.includes('endpoints')
  ) {
    return NODE_TYPES.BACKEND_ROUTE;
  }

  // Pages & View Entry points
  if (
    lower.includes('pages/') ||
    lower.includes('views/') ||
    lower.startsWith('app/') && (lower.endsWith('page.tsx') || lower.endsWith('page.jsx')) ||
    lower.endsWith('app.jsx') ||
    lower.endsWith('app.tsx')
  ) {
    return NODE_TYPES.PAGE;
  }

  // Frontend components
  if (
    lower.includes('components/') ||
    lower.endsWith('.jsx') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.vue') ||
    lower.endsWith('.svelte')
  ) {
    return NODE_TYPES.FRONTEND;
  }

  // Backend services, utilities, helpers
  if (
    lower.includes('service') ||
    lower.includes('util') ||
    lower.includes('helper') ||
    lower.includes('middleware') ||
    lower.includes('lib/')
  ) {
    return NODE_TYPES.BACKEND_SERVICE;
  }

  // Default fallback for source files
  if (lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.py') || lower.endsWith('.go') || lower.endsWith('.rs')) {
    return NODE_TYPES.BACKEND_SERVICE;
  }

  return null;
}

/**
 * Extracts static import paths from JavaScript/TypeScript/Python content.
 */
function extractStaticImports(content, fileExtension) {
  const imports = [];
  if (!content) return imports;

  if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(fileExtension)) {
    // ES6 import ... from '...'
    const esImportRegex = /(?:import\s+(?:[\w*\s{},$]+from\s+)?['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
    let match;
    while ((match = esImportRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (importPath) imports.push(importPath);
    }
  } else if (fileExtension === 'py') {
    // Python import ... or from ... import ...
    const pyImportRegex = /(?:from\s+([\w.]+)\s+import)|(?:import\s+([\w.]+))/g;
    let match;
    while ((match = pyImportRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (importPath) imports.push(importPath);
    }
  }

  return imports;
}

/**
 * Extracts API endpoint calls (e.g. fetch('/api/...'), axios.get('/api/...')).
 */
function extractFrontendApiCalls(content) {
  const endpoints = [];
  if (!content) return endpoints;

  const apiRegex = /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*[`'"](\/api\/[^`'"]+|https?:\/\/[^`'"]+)[`'"]/g;
  let match;
  while ((match = apiRegex.exec(content)) !== null) {
    endpoints.push(match[1]);
  }
  return endpoints;
}

/**
 * Extracts route definition strings (e.g. app.get('/api/...'), router.post('/...')).
 */
function extractRouteDefinitions(content) {
  const routes = [];
  if (!content) return routes;

  const routeRegex = /(?:app|router)\.(?:get|post|put|delete|patch|use)\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push(match[1]);
  }
  return routes;
}

/**
 * Extracts external integration references (e.g., Stripe, AWS, OpenAI, Firebase, GitHub).
 */
function extractExternalIntegrations(content) {
  const integrations = [];
  if (!content) return integrations;

  const patterns = [
    { name: 'Stripe API', regex: /stripe/i },
    { name: 'OpenAI API', regex: /openai/i },
    { name: 'Google Gemini', regex: /google.*generative-ai|gemini/i },
    { name: 'AWS S3 / SDK', regex: /aws-sdk|@aws-sdk/i },
    { name: 'GitHub REST API', regex: /api\.github\.com|octokit/i },
    { name: 'Firebase / Firestore', regex: /firebase|firestore/i },
    { name: 'PostgreSQL / Prisma', regex: /@prisma\/client|pg|postgres/i },
    { name: 'MongoDB / Mongoose', regex: /mongoose|mongodb/i },
    { name: 'Redis Cache', regex: /ioredis|redis/i }
  ];

  for (const p of patterns) {
    if (p.regex.test(content)) {
      integrations.push(p.name);
    }
  }

  return Array.from(new Set(integrations));
}

/**
 * Primary Architecture Analyzer
 */
export async function analyzeArchitecture(owner, repo, defaultBranch, allFilesList, token, apiKey) {
  // 1. Select candidate architectural files (bounded to top 20 files to prevent API exhaustion)
  const candidateFiles = allFilesList.filter(f => classifyFileType(f) !== null);

  // Score candidate importance
  const prioritizedFiles = candidateFiles.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    // Prioritize root entry points, routes, and configs
    const getWeight = (path) => {
      if (path.includes('package.json')) return 100;
      if (path.includes('app.jsx') || path.includes('index.js') || path.includes('main.')) return 90;
      if (path.includes('route') || path.includes('controller')) return 80;
      if (path.includes('service') || path.includes('model')) return 70;
      if (path.includes('components/')) return 60;
      return 50;
    };
    return getWeight(bLower) - getWeight(aLower);
  }).slice(0, 18);

  // 2. Fetch content of prioritized files
  const fileDetailsMap = new Map();
  for (const filePath of prioritizedFiles) {
    try {
      const fileData = await fetchFileContent(owner, repo, filePath, defaultBranch, token);
      fileDetailsMap.set(filePath, fileData);
    } catch {
      // Continue gracefully if a file fails to fetch
    }
  }

  // 3. Static Node Extraction
  const nodes = [];
  const edges = [];
  const nodeMap = new Map(); // id -> node

  // Create nodes from discovered files
  for (const [filePath, fileData] of fileDetailsMap.entries()) {
    const nodeType = classifyFileType(filePath);
    const fileName = filePath.split('/').pop();
    const nodeId = filePath.replace(/[^a-zA-Z0-9_-]/g, '_');

    const node = {
      id: nodeId,
      label: fileName,
      type: nodeType,
      filePath,
      description: `${nodeType.toUpperCase()} file (${fileData.lineCount || 0} lines)`,
      confidence: CONFIDENCE_LEVELS.VERIFIED,
      tags: [nodeType, fileData.extension],
      metrics: {
        lines: fileData.lineCount || 0,
        sizeBytes: fileData.sizeBytes || 0
      }
    };

    nodes.push(node);
    nodeMap.set(filePath, node);
  }

  // 4. Static Edge Extraction
  let edgeCounter = 1;
  const detectedApiRoutes = new Map(); // routePath -> nodeId
  const externalNodes = new Map(); // name -> nodeId

  for (const [filePath, fileData] of fileDetailsMap.entries()) {
    const sourceNode = nodeMap.get(filePath);
    if (!sourceNode) continue;

    // A. Parse static imports
    const imports = extractStaticImports(fileData.content, fileData.extension);
    for (const imp of imports) {
      // Resolve relative path to repo file
      for (const [targetPath, targetNode] of nodeMap.entries()) {
        if (targetPath === filePath) continue;
        const targetBase = targetPath.replace(/\.[^/.]+$/, '');
        const targetName = targetPath.split('/').pop().replace(/\.[^/.]+$/, '');

        if (imp.endsWith(targetName) || imp.includes(targetBase) || targetPath.endsWith(imp.replace(/^\.\//, ''))) {
          edges.push({
            id: `edge-${edgeCounter++}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'import',
            label: 'imports',
            confidence: CONFIDENCE_LEVELS.VERIFIED,
            evidence: `Direct import '${imp}' observed in ${filePath}`
          });
          break;
        }
      }
    }

    // B. Route definition vs API call matching
    const routes = extractRouteDefinitions(fileData.content);
    for (const r of routes) {
      detectedApiRoutes.set(r, sourceNode.id);
    }

    const apiCalls = extractFrontendApiCalls(fileData.content);
    for (const call of apiCalls) {
      // Check if call matches any backend route
      for (const [routePath, routeNodeId] of detectedApiRoutes.entries()) {
        if (call.includes(routePath) || routePath.includes(call)) {
          edges.push({
            id: `edge-${edgeCounter++}`,
            source: sourceNode.id,
            target: routeNodeId,
            type: 'api-call',
            label: 'HTTP request',
            confidence: CONFIDENCE_LEVELS.VERIFIED,
            evidence: `Frontend request to '${call}' matches route defined in ${filePath}`
          });
        }
      }
    }

    // C. External Integrations
    const externals = extractExternalIntegrations(fileData.content);
    for (const ext of externals) {
      let extNodeId = externalNodes.get(ext);
      if (!extNodeId) {
        extNodeId = `ext_${ext.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        externalNodes.set(ext, extNodeId);
        nodes.push({
          id: extNodeId,
          label: ext,
          type: NODE_TYPES.EXTERNAL_API,
          filePath: 'External Cloud / API Service',
          description: `Third-party integration: ${ext}`,
          confidence: CONFIDENCE_LEVELS.VERIFIED,
          tags: ['external-service', 'cloud'],
          metrics: { lines: 0, sizeBytes: 0 }
        });
      }

      edges.push({
        id: `edge-${edgeCounter++}`,
        source: sourceNode.id,
        target: extNodeId,
        type: 'external-call',
        label: 'integrates with',
        confidence: CONFIDENCE_LEVELS.VERIFIED,
        evidence: `Direct usage of ${ext} identified in ${filePath}`
      });
    }
  }

  // 5. AI-Assisted Architecture Enrichment (if apiKey is available and graph can be enriched)
  if (apiKey && nodes.length > 0) {
    try {
      const fileSummaryList = nodes
        .filter(n => n.type !== NODE_TYPES.EXTERNAL_API)
        .map(n => `- ${n.filePath} (${n.type})`)
        .join('\n');

      const prompt = `You are DevLens AI's architectural inference engine.
Analyze these discovered repository components and infer high-level architecture relationships that static imports might have missed.

DISCOVERED COMPONENTS:
${fileSummaryList}

CRITICAL RULES:
1. ONLY propose connections that are genuinely plausible based on component roles.
2. Label relationships as "INFERRED" or "LOW CONFIDENCE". Never mark inferred relationships as "VERIFIED".
3. Distinguish controller-to-service, service-to-model, and frontend-to-backend data flows.
4. If uncertain, do not create unnecessary edges.

Respond ONLY with a valid JSON array of relationships:
[
  {
    "sourceFilePath": "path/to/source",
    "targetFilePath": "path/to/target",
    "relationship": "delegates to | queries | provides config for | authenticates",
    "confidence": "INFERRED" | "LOW CONFIDENCE",
    "reason": "Brief evidence-based rationale"
  }
]`;

      const aiInferences = await callLlmWithJson(prompt, apiKey, 'You are an objective software architecture inference engine.');
      if (Array.isArray(aiInferences)) {
        for (const item of aiInferences.slice(0, 10)) {
          const srcNode = nodeMap.get(item.sourceFilePath);
          const tgtNode = nodeMap.get(item.targetFilePath);
          if (srcNode && tgtNode && srcNode.id !== tgtNode.id) {
            // Check if edge already exists
            const alreadyExists = edges.some(e => e.source === srcNode.id && e.target === tgtNode.id);
            if (!alreadyExists) {
              edges.push({
                id: `edge-${edgeCounter++}`,
                source: srcNode.id,
                target: tgtNode.id,
                type: 'inferred',
                label: item.relationship || 'inferred relation',
                confidence: item.confidence === 'LOW CONFIDENCE' ? CONFIDENCE_LEVELS.LOW_CONFIDENCE : CONFIDENCE_LEVELS.INFERRED,
                evidence: `AI Architecture Inference: ${item.reason || 'Pattern-based inference'}`
              });
            }
          }
        }
      }
    } catch {
      // AI enrichment is non-blocking; static analysis remains intact
    }
  }

  // 6. Return Structured Architecture Graph
  return {
    repository: {
      owner,
      name: repo,
      branch: defaultBranch
    },
    metrics: {
      totalDiscoveredNodes: nodes.length,
      totalEdges: edges.length,
      verifiedEdges: edges.filter(e => e.confidence === CONFIDENCE_LEVELS.VERIFIED).length,
      inferredEdges: edges.filter(e => e.confidence !== CONFIDENCE_LEVELS.VERIFIED).length
    },
    legend: {
      [CONFIDENCE_LEVELS.VERIFIED]: 'Direct static proof from source code imports, route handlers, or API definitions.',
      [CONFIDENCE_LEVELS.INFERRED]: 'Architectural flow derived from naming conventions, ORM associations, or standard framework paradigms.',
      [CONFIDENCE_LEVELS.LOW_CONFIDENCE]: 'Probabilistic relationship requiring developer verification.'
    },
    nodes,
    edges
  };
}
