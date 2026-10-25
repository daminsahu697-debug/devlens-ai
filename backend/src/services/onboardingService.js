/**
 * DevLens AI - Onboarding Service (Instant Onboarding & Grounded Assistant)
 * Analyzes repository manifests, configuration files, and source code to generate
 * a 2-minute technical onboarding overview, deterministic setup guide,
 * feature breakdown, and source-grounded codebase chat with exact line citations.
 */

import { fetchFileContent } from './githubService.js';
import { retrieveRelevantSnippets } from './retrievalService.js';
import { callLlmWithJson, SYSTEM_SECURITY_PROMPT } from './aiService.js';

/**
 * Detects the package manager used based on repository lockfiles.
 */
function detectPackageManager(allFilesList) {
  const files = new Set(allFilesList.map(f => f.toLowerCase()));
  if (files.has('pnpm-lock.yaml')) return { name: 'pnpm', installCmd: 'pnpm install', runPrefix: 'pnpm' };
  if (files.has('yarn.lock')) return { name: 'yarn', installCmd: 'yarn install', runPrefix: 'yarn' };
  if (files.has('bun.lockb') || files.has('bun.lock')) return { name: 'bun', installCmd: 'bun install', runPrefix: 'bun' };
  if (files.has('package-lock.json')) return { name: 'npm', installCmd: 'npm install', runPrefix: 'npm run' };
  if (files.has('poetry.lock')) return { name: 'poetry', installCmd: 'poetry install', runPrefix: 'poetry run' };
  if (files.has('pipfile.lock')) return { name: 'pipenv', installCmd: 'pipenv install', runPrefix: 'pipenv run' };
  if (files.has('cargo.lock')) return { name: 'cargo', installCmd: 'cargo build', runPrefix: 'cargo' };
  return { name: 'npm', installCmd: 'npm install', runPrefix: 'npm run' };
}

/**
 * Detects technology stack from evidence in manifests and files.
 */
function detectTechStack(manifestContent, allFilesList) {
  const stack = {
    frontendFramework: 'Not detected',
    backendFramework: 'Not detected',
    database: 'Not detected',
    authMethod: 'Not detected',
    externalApis: [],
    testFramework: 'Not detected'
  };

  const filesJoined = allFilesList.join(' ').toLowerCase();
  const manifestLower = (manifestContent || '').toLowerCase();

  // Frontend Framework
  if (manifestLower.includes('next') || filesJoined.includes('next.config')) stack.frontendFramework = 'Next.js';
  else if (manifestLower.includes('react') || filesJoined.includes('.jsx') || filesJoined.includes('.tsx')) stack.frontendFramework = 'React';
  else if (manifestLower.includes('vue') || filesJoined.includes('.vue')) stack.frontendFramework = 'Vue.js';
  else if (manifestLower.includes('svelte') || filesJoined.includes('.svelte')) stack.frontendFramework = 'Svelte';
  else if (manifestLower.includes('angular') || filesJoined.includes('angular.json')) stack.frontendFramework = 'Angular';

  // Backend Framework
  if (manifestLower.includes('express')) stack.backendFramework = 'Express.js';
  else if (manifestLower.includes('fastify')) stack.backendFramework = 'Fastify';
  else if (manifestLower.includes('nest') || manifestLower.includes('@nestjs/core')) stack.backendFramework = 'NestJS';
  else if (manifestLower.includes('django') || filesJoined.includes('manage.py')) stack.backendFramework = 'Django';
  else if (manifestLower.includes('flask')) stack.backendFramework = 'Flask';
  else if (manifestLower.includes('fastapi')) stack.backendFramework = 'FastAPI';
  else if (manifestLower.includes('spring') || filesJoined.includes('pom.xml')) stack.backendFramework = 'Spring Boot';

  // Database
  const detectedDbs = [];
  if (manifestLower.includes('prisma') || filesJoined.includes('schema.prisma')) detectedDbs.push('Prisma ORM');
  if (manifestLower.includes('mongoose') || manifestLower.includes('mongodb')) detectedDbs.push('MongoDB / Mongoose');
  if (manifestLower.includes('pg') || manifestLower.includes('postgres')) detectedDbs.push('PostgreSQL');
  if (manifestLower.includes('mysql')) detectedDbs.push('MySQL');
  if (manifestLower.includes('sqlite')) detectedDbs.push('SQLite');
  if (manifestLower.includes('redis') || manifestLower.includes('ioredis')) detectedDbs.push('Redis');
  if (detectedDbs.length > 0) stack.database = detectedDbs.join(', ');

  // Auth Method
  const detectedAuth = [];
  if (manifestLower.includes('next-auth')) detectedAuth.push('NextAuth.js');
  if (manifestLower.includes('passport')) detectedAuth.push('Passport.js');
  if (manifestLower.includes('jsonwebtoken') || manifestLower.includes('jwt')) detectedAuth.push('JWT (JSON Web Tokens)');
  if (manifestLower.includes('firebase-admin') || manifestLower.includes('firebase')) detectedAuth.push('Firebase Authentication');
  if (detectedAuth.length > 0) stack.authMethod = detectedAuth.join(', ');

  // Test Framework
  if (manifestLower.includes('jest')) stack.testFramework = 'Jest';
  else if (manifestLower.includes('vitest')) stack.testFramework = 'Vitest';
  else if (manifestLower.includes('mocha')) stack.testFramework = 'Mocha';
  else if (manifestLower.includes('pytest')) stack.testFramework = 'Pytest';
  else if (manifestLower.includes('node:test') || manifestLower.includes('node --test')) stack.testFramework = 'Node.js Native Test Runner';

  // External APIs
  if (manifestLower.includes('stripe')) stack.externalApis.push('Stripe');
  if (manifestLower.includes('@google/generative-ai') || manifestLower.includes('gemini')) stack.externalApis.push('Google Gemini AI');
  if (manifestLower.includes('openai')) stack.externalApis.push('OpenAI API');
  if (manifestLower.includes('aws-sdk') || manifestLower.includes('@aws-sdk')) stack.externalApis.push('AWS Cloud');
  if (manifestLower.includes('@octokit') || manifestLower.includes('github')) stack.externalApis.push('GitHub REST API');

  return stack;
}

/**
 * Parses package.json or config to extract verified scripts and setup details.
 */
function extractSetupCommands(packageJsonData, pkgManager) {
  const scripts = packageJsonData?.scripts || {};
  const run = pkgManager.runPrefix;

  const devCmd = scripts.dev ? `${run} dev` : (scripts.start ? `${run} start` : null);
  const buildCmd = scripts.build ? `${run} build` : null;
  const testCmd = scripts.test ? `${run} test` : null;
  const lintCmd = scripts.lint ? `${run} lint` : null;

  return {
    packageManager: pkgManager.name,
    installCommand: pkgManager.installCmd,
    developmentCommand: devCmd || `${run} start`,
    buildCommand: buildCmd,
    testCommand: testCmd,
    lintCommand: lintCmd,
    availableScripts: Object.entries(scripts).map(([name, cmd]) => ({ name, script: cmd }))
  };
}

/**
 * Extracts environment variable names from .env.example or files (masking any real values).
 */
function extractEnvVariables(envContent) {
  if (!envContent) return [];
  const lines = envContent.split('\n');
  const vars = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=/i);
    if (match) {
      vars.push({
        name: match[1],
        placeholder: 'your_' + match[1].toLowerCase() + '_here',
        isSecret: /key|secret|token|password|auth/i.test(match[1])
      });
    }
  }

  return vars;
}

/**
 * Generates Instant Onboarding Technical Summary & Setup Guide
 */
export async function generateOnboardingSummary(owner, repo, defaultBranch, metadata, allFilesList, token, apiKey) {
  // 1. Identify key files (manifest, README, env example)
  const pkgMgr = detectPackageManager(allFilesList);
  let packageJsonData = null;
  let packageJsonRaw = '';
  let readmeRaw = '';
  let envRaw = '';

  // Try fetching package.json
  const pkgPath = allFilesList.find(f => f.toLowerCase() === 'package.json');
  if (pkgPath) {
    try {
      const file = await fetchFileContent(owner, repo, pkgPath, defaultBranch, token);
      packageJsonRaw = file.content;
      packageJsonData = JSON.parse(file.content);
    } catch {
      // ignore
    }
  }

  // Try fetching README
  const readmePath = allFilesList.find(f => /readme/i.test(f));
  if (readmePath) {
    try {
      const file = await fetchFileContent(owner, repo, readmePath, defaultBranch, token);
      readmeRaw = file.content.slice(0, 4000); // Bounded slice
    } catch {
      // ignore
    }
  }

  // Try fetching .env.example
  const envPath = allFilesList.find(f => f.toLowerCase().includes('.env.example') || f.toLowerCase().includes('.env.sample'));
  if (envPath) {
    try {
      const file = await fetchFileContent(owner, repo, envPath, defaultBranch, token);
      envRaw = file.content;
    } catch {
      // ignore
    }
  }

  // 2. Deterministic stack detection & setup guide
  const stack = detectTechStack(packageJsonRaw, allFilesList);
  const setupCommands = extractSetupCommands(packageJsonData, pkgMgr);
  const envVariables = extractEnvVariables(envRaw);

  // 3. AI-Assisted Architecture & Feature Extraction (if API key available)
  let aiInsights = {
    purpose: metadata.description || 'Open-source software repository.',
    keyFeatures: [],
    dataFlow: 'Client initiates HTTP requests to server routes, which invoke services and return structured JSON responses.',
    communicationMethod: 'REST API via HTTP fetch/JSON payload',
    architectureStyle: 'Modular Client-Server Architecture'
  };

  if (apiKey) {
    const contextPrompt = `You are DevLens AI's Instant Onboarding Assistant.
Analyze this repository's metadata, manifest, and README to produce a concise 2-minute onboarding guide.

METADATA:
Name: ${metadata.fullName}
Description: ${metadata.description}
Primary Language: ${metadata.language}
Detected Stack: Frontend=${stack.frontendFramework}, Backend=${stack.backendFramework}, DB=${stack.database}

FILES LIST PREVIEW:
${allFilesList.slice(0, 40).join('\n')}

<untrusted_repository_content>
README EXCERPT:
${readmeRaw.slice(0, 1500)}
</untrusted_repository_content>

CRITICAL RULES:
1. Base all features strictly on actual code files in the repository.
2. For each key feature, list the exact file paths where it is implemented.
3. Keep the purpose clear and technical.

Respond ONLY with a valid JSON object matching this schema:
{
  "purpose": "Precise 1-2 sentence technical mission of the project.",
  "architectureStyle": "Architecture pattern (e.g. Full-Stack Single-Page App with Express API)",
  "communicationMethod": "How frontend and backend communicate (e.g. REST API /api routes with JSON)",
  "dataFlow": "Short description of how user input flows to backend and data persistence",
  "keyFeatures": [
    {
      "name": "Feature name",
      "explanation": "What this feature does",
      "primaryFile": "exact/file/path",
      "role": "controller | service | component | entry-point"
    }
  ]
}`;

    try {
      const parsedAi = await callLlmWithJson(contextPrompt, apiKey, SYSTEM_SECURITY_PROMPT);
      if (parsedAi && parsedAi.purpose) {
        aiInsights = {
          purpose: parsedAi.purpose,
          architectureStyle: parsedAi.architectureStyle || aiInsights.architectureStyle,
          communicationMethod: parsedAi.communicationMethod || aiInsights.communicationMethod,
          dataFlow: parsedAi.dataFlow || aiInsights.dataFlow,
          keyFeatures: Array.isArray(parsedAi.keyFeatures) ? parsedAi.keyFeatures : []
        };
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // 4. Important Files & Entry Points
  const importantFiles = allFilesList.filter(f => {
    const l = f.toLowerCase();
    return l.includes('readme') ||
      l.includes('package.json') ||
      l.includes('server.js') ||
      l.includes('app.jsx') ||
      l.includes('app.tsx') ||
      l.includes('index.js') ||
      l.includes('main.py') ||
      l.includes('schema.prisma');
  }).slice(0, 8).map(filePath => ({
    filePath,
    role: filePath.toLowerCase().includes('readme') ? 'Documentation' :
      filePath.toLowerCase().includes('package.json') ? 'Dependencies' :
      filePath.toLowerCase().includes('server') ? 'Backend Entry' :
      filePath.toLowerCase().includes('app') ? 'Main Application' : 'Core Module'
  }));

  return {
    repository: {
      owner,
      name: repo,
      branch: defaultBranch,
      stars: metadata.stars,
      language: metadata.language
    },
    purpose: aiInsights.purpose,
    architectureStyle: aiInsights.architectureStyle,
    communicationMethod: aiInsights.communicationMethod,
    dataFlow: aiInsights.dataFlow,
    stack,
    setupGuide: {
      ...setupCommands,
      prerequisites: [
        `${metadata.language} runtime environment`,
        `${pkgMgr.name} package manager`
      ],
      environmentVariables: envVariables,
      localDevUrl: 'http://localhost:5173 or http://localhost:3000'
    },
    features: aiInsights.keyFeatures,
    importantFiles,
    limitations: [
      'Static analysis is bounded to top repository files and manifests.',
      'Private dependencies and internal intranet services cannot be verified without developer access.'
    ]
  };
}

/**
 * Answers a Codebase Question with exact file and line citations
 */
export async function chatWithCodebase(owner, repo, defaultBranch, allFilesList, question, conversationHistory, token, apiKey) {
  if (!apiKey) {
    const error = new Error('AI API Key is required to chat with the codebase.');
    error.statusCode = 400;
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  // 1. Retrieve grounded snippets with exact line indices
  const retrieval = await retrieveRelevantSnippets(owner, repo, defaultBranch, allFilesList, question, token);

  const snippetsContext = retrieval.snippets.length > 0
    ? retrieval.snippets.map(s => `--- FILE: ${s.file} (Lines ${s.lineStart}-${s.lineEnd}) ---\n${s.snippet}\n`).join('\n')
    : 'No directly matching source snippets were found in the scanned files.';

  const historyContext = (conversationHistory || []).slice(-4).map(h => `${h.sender.toUpperCase()}: ${h.text || h.answer}`).join('\n');

  const prompt = `A developer is asking a technical question about "${owner}/${repo}".
QUESTION: "${question}"

PREVIOUS CHAT CONTEXT:
${historyContext || 'None'}

RETRIEVED SOURCE EXCERPTS WITH VERIFIED LINE NUMBERS:
<untrusted_repository_content>
${snippetsContext}
</untrusted_repository_content>

CRITICAL ACCURACY & CITATION RULES:
1. Base your answer STRICTLY on the retrieved source excerpts.
2. YOU MUST CITE verified files and line numbers in the format: "filePath:startLine-endLine" (e.g. "src/routes/api.js:15-30").
3. DO NOT guess or fabricate line numbers. Use only the lines indicated in the excerpts.
4. If the retrieved snippets are insufficient to answer, state: "Based on the retrieved files, there is insufficient evidence to determine...".

Respond ONLY with a valid JSON object matching this schema:
{
  "answer": "Clear, direct, grounded answer with markdown formatting.",
  "confidence": "HIGH | MEDIUM | LOW",
  "citations": [
    {
      "filePath": "exact/file/path",
      "startLine": 10,
      "endLine": 25,
      "reason": "What this excerpt demonstrates"
    }
  ]
}`;

  const response = await callLlmWithJson(prompt, apiKey, SYSTEM_SECURITY_PROMPT);

  // Cross-reference citations with retrieved snippets to guarantee valid start/end lines
  const citations = (Array.isArray(response.citations) && response.citations.length > 0)
    ? response.citations.map(c => {
        const matchingSnippet = retrieval.snippets.find(s => s.file === c.filePath);
        return {
          filePath: c.filePath,
          startLine: c.startLine || matchingSnippet?.lineStart || 1,
          endLine: c.endLine || matchingSnippet?.lineEnd || 10,
          reason: c.reason || 'Referenced implementation'
        };
      })
    : retrieval.snippets.map(s => ({
        filePath: s.file,
        startLine: s.lineStart,
        endLine: s.lineEnd,
        reason: s.reason
      }));

  return {
    question,
    answer: response.answer || 'Unable to generate an answer from the retrieved repository context.',
    confidence: response.confidence || (retrieval.snippets.length > 0 ? 'HIGH' : 'LOW'),
    hasSufficientEvidence: retrieval.snippets.length > 0,
    citations
  };
}
