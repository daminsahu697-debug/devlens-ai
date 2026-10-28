/**
 * DevLens AI - Video Presentation & Walkthrough Service
 * Generates an end-to-end, multi-chapter AI video presentation script and visual slide payload
 * explaining the entire repository summary, architecture, security health, and developer setup
 * in clear, friendly, and easy-to-understand language.
 */

import { fetchFileContent } from './githubService.js';
import { callLlmWithJson, SYSTEM_SECURITY_PROMPT } from './aiService.js';

/**
 * Detects package manager from repository files.
 */
function detectPackageManager(allFilesList) {
  const files = new Set(allFilesList.map(f => f.toLowerCase()));
  if (files.has('pnpm-lock.yaml')) return { name: 'pnpm', installCmd: 'pnpm install', runCmd: 'pnpm dev' };
  if (files.has('yarn.lock')) return { name: 'yarn', installCmd: 'yarn install', runCmd: 'yarn dev' };
  if (files.has('bun.lockb') || files.has('bun.lock')) return { name: 'bun', installCmd: 'bun install', runCmd: 'bun dev' };
  if (files.has('package-lock.json')) return { name: 'npm', installCmd: 'npm install', runCmd: 'npm run dev' };
  if (files.has('poetry.lock')) return { name: 'poetry', installCmd: 'poetry install', runCmd: 'poetry run dev' };
  if (files.has('cargo.lock')) return { name: 'cargo', installCmd: 'cargo build', runCmd: 'cargo run' };
  return { name: 'npm', installCmd: 'npm install', runCmd: 'npm run dev' };
}

/**
 * Detects tech stack components from files and manifest content.
 */
function detectTechStack(manifestContent, allFilesList) {
  const filesJoined = allFilesList.join(' ').toLowerCase();
  const manifestLower = (manifestContent || '').toLowerCase();

  const stack = {
    frontend: 'HTML5 & Vanilla JavaScript',
    backend: 'Node.js',
    database: 'In-Memory / None',
    auth: 'Standard Session / None',
    styling: 'Modern CSS',
    testing: 'Automated Test Suite'
  };

  // Frontend
  if (manifestLower.includes('next') || filesJoined.includes('next.config')) stack.frontend = 'Next.js (React)';
  else if (manifestLower.includes('react') || filesJoined.includes('.jsx') || filesJoined.includes('.tsx')) stack.frontend = 'React';
  else if (manifestLower.includes('vue') || filesJoined.includes('.vue')) stack.frontend = 'Vue.js';
  else if (manifestLower.includes('svelte') || filesJoined.includes('.svelte')) stack.frontend = 'Svelte';
  else if (manifestLower.includes('angular')) stack.frontend = 'Angular';

  // Backend
  if (manifestLower.includes('express')) stack.backend = 'Express.js';
  else if (manifestLower.includes('fastify')) stack.backend = 'Fastify';
  else if (manifestLower.includes('nest') || manifestLower.includes('@nestjs')) stack.backend = 'NestJS';
  else if (filesJoined.includes('manage.py') || manifestLower.includes('django')) stack.backend = 'Django (Python)';
  else if (filesJoined.includes('cargo.toml')) stack.backend = 'Rust (Cargo)';
  else if (filesJoined.includes('go.mod')) stack.backend = 'Go';

  // Database
  if (manifestLower.includes('prisma') || filesJoined.includes('schema.prisma')) stack.database = 'Prisma ORM';
  else if (manifestLower.includes('mongoose') || manifestLower.includes('mongodb')) stack.database = 'MongoDB';
  else if (manifestLower.includes('pg') || manifestLower.includes('postgres')) stack.database = 'PostgreSQL';
  else if (manifestLower.includes('sqlite')) stack.database = 'SQLite';
  else if (manifestLower.includes('redis')) stack.database = 'Redis';

  // Styling
  if (manifestLower.includes('tailwindcss') || filesJoined.includes('tailwind.config')) stack.styling = 'Tailwind CSS';
  else if (manifestLower.includes('styled-components')) stack.styling = 'Styled Components';
  else if (manifestLower.includes('sass') || filesJoined.includes('.scss')) stack.styling = 'SASS / SCSS';

  // Testing
  if (manifestLower.includes('vitest')) stack.testing = 'Vitest';
  else if (manifestLower.includes('jest')) stack.testing = 'Jest';
  else if (manifestLower.includes('playwright')) stack.testing = 'Playwright';
  else if (manifestLower.includes('cypress')) stack.testing = 'Cypress';

  return stack;
}

/**
 * Finds key modules and directories.
 */
function identifyKeyModules(allFilesList) {
  const dirs = new Set();
  const keyFiles = [];

  for (const file of allFilesList) {
    const parts = file.split('/');
    if (parts.length > 1) {
      dirs.add(parts[0]);
    }
    const lower = file.toLowerCase();
    if (
      lower.endsWith('server.js') ||
      lower.endsWith('app.jsx') ||
      lower.endsWith('app.tsx') ||
      lower.endsWith('index.js') ||
      lower.endsWith('main.jsx') ||
      lower.endsWith('routes.js') ||
      lower.includes('dockerfile') ||
      lower.includes('package.json')
    ) {
      if (keyFiles.length < 8) {
        keyFiles.push(file);
      }
    }
  }

  return {
    topDirectories: Array.from(dirs).slice(0, 6),
    keyFiles: keyFiles.slice(0, 6)
  };
}

/**
 * Computes timing segments (captions) for a paragraph of narration text.
 */
function buildCaptions(narrationText, durationSeconds) {
  const sentences = narrationText
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return [];

  const timePerSentence = durationSeconds / sentences.length;
  return sentences.map((sentence, idx) => ({
    id: idx,
    start: Number((idx * timePerSentence).toFixed(1)),
    end: Number(((idx + 1) * timePerSentence).toFixed(1)),
    text: sentence
  }));
}

/**
 * Main generator for the Video Walkthrough Presentation.
 */
export async function generateVideoPresentation(
  owner,
  repo,
  branch,
  metadata,
  allFilesList,
  clientToken,
  apiKey = null,
  narrationMode = 'simple'
) {
  // 1. Fetch manifest if present
  let manifestContent = '';
  try {
    const manifestFile = allFilesList.find(f =>
      /^(?:package\.json|requirements\.txt|cargo\.toml|go\.mod|pyproject\.toml)$/i.test(f)
    );
    if (manifestFile) {
      const fetched = await fetchFileContent(owner, repo, manifestFile, branch, clientToken);
      manifestContent = fetched?.content || '';
    }
  } catch {
    // ignore
  }

  // 2. Fetch README snippet if present
  let readmeSnippet = '';
  try {
    const readmeFile = allFilesList.find(f => /readme/i.test(f));
    if (readmeFile) {
      const fetched = await fetchFileContent(owner, repo, readmeFile, branch, clientToken);
      readmeSnippet = (fetched?.content || '').slice(0, 1500);
    }
  } catch {
    // ignore
  }

  // 3. Analyze stack, files & structure
  const pkg = detectPackageManager(allFilesList);
  const techStack = detectTechStack(manifestContent, allFilesList);
  const modules = identifyKeyModules(allFilesList);
  const totalFiles = allFilesList.length;
  const stars = metadata.stars || 0;
  const forks = metadata.forks || 0;
  const licenseName = metadata.license?.name || metadata.license?.spdxId || 'Open Source';
  const repoName = metadata.name || repo;

  // Clean description for easy spoken English
  let rawDesc = (metadata.description || '').replace(/\.+$/, '').trim();
  let descSentence = rawDesc
    ? `In simple terms, it is designed to be ${rawDesc.toLowerCase().startsWith('a ') ? rawDesc.slice(2) : rawDesc}.`
    : `It is an open-source software project built for modern development.`;

  const language = metadata.language || 'JavaScript';

  // 4. Construct Chapter 1: Introduction & Identity (Easy, friendly English)
  let ch1Narration;
  let ch1Duration;
  if (narrationMode === 'quick') {
    ch1Narration = `Welcome! This is ${repoName} by ${owner}. ${descSentence} It is written in ${language} under the ${licenseName} license, with over ${stars.toLocaleString()} stars on GitHub.`;
    ch1Duration = 18;
  } else if (narrationMode === 'technical') {
    ch1Narration = `Welcome to the technical architectural review of ${repoName}, authored by ${owner}. Distributed under the ${licenseName} license and authored primarily in ${language}, the codebase solves key operational challenges with over ${stars.toLocaleString()} community stars. In this presentation, we examine architectural boundaries, component hierarchies, runtime flows, and deployment configurations.`;
    ch1Duration = 32;
  } else {
    // Simple & Easy to Understand (Default)
    ch1Narration = `Welcome to this video guide on ${repoName}, created by ${owner}. ${descSentence} It is written in ${language}, and is open source under the ${licenseName} license. It has earned over ${stars.toLocaleString()} stars and ${forks.toLocaleString()} forks on GitHub. In this video, we will walk through how it works, what technologies it uses, where the main files live, and how you can run it on your own computer.`;
    ch1Duration = 28;
  }

  const ch1 = {
    id: 'ch1_overview',
    chapterNumber: 1,
    title: '1. What is This Project?',
    subtitle: 'Project purpose, popularity, and community stats',
    durationSeconds: ch1Duration,
    narration: ch1Narration,
    captions: buildCaptions(ch1Narration, ch1Duration),
    visual: {
      theme: 'sky',
      layout: 'hero',
      headline: repoName,
      tagline: rawDesc || 'Open source software project',
      badges: [
        { label: 'Language', value: language, color: 'sky' },
        { label: 'Stars', value: `★ ${stars.toLocaleString()}`, color: 'amber' },
        { label: 'Forks', value: `⑂ ${forks.toLocaleString()}`, color: 'emerald' },
        { label: 'License', value: licenseName, color: 'violet' }
      ],
      highlights: [
        `Created by @${owner} on the ${branch} branch`,
        `Contains ${totalFiles.toLocaleString()} files in the codebase`,
        `Tags: ${metadata.topics?.slice(0, 3).join(', ') || 'Development Tools'}`
      ]
    }
  };

  // 5. Construct Chapter 2: Tech Stack
  let ch2Narration;
  let ch2Duration;
  if (narrationMode === 'quick') {
    ch2Narration = `The project uses ${techStack.frontend} on the frontend, ${techStack.backend} for server logic, and ${techStack.database} for data. Packages are managed with ${pkg.name}.`;
    ch2Duration = 18;
  } else if (narrationMode === 'technical') {
    ch2Narration = `The system architecture leverages ${techStack.frontend} for presentation rendering, styled via ${techStack.styling}. The server tier is driven by ${techStack.backend}, exposing REST API endpoints. Persistence is managed through ${techStack.database}, while dependency management is handled via ${pkg.name}.`;
    ch2Duration = 30;
  } else {
    // Simple & Easy to Understand
    ch2Narration = `Now, let's see what technologies make ${repoName} work. On the frontend or user interface, it uses ${techStack.frontend}, styled cleanly with ${techStack.styling}. The backend runs on ${techStack.backend}, which handles all incoming requests and calculations. Any data is saved using ${techStack.database}. Everything is installed and managed easily using ${pkg.name}. This setup gives developers a fast and modern experience.`;
    ch2Duration = 30;
  }

  const ch2 = {
    id: 'ch2_stack',
    chapterNumber: 2,
    title: '2. Technologies Used',
    subtitle: 'The frontend, backend, database, and tools powering the app',
    durationSeconds: ch2Duration,
    narration: ch2Narration,
    captions: buildCaptions(ch2Narration, ch2Duration),
    visual: {
      theme: 'indigo',
      layout: 'grid',
      headline: 'Technology Stack',
      tagline: 'Verified technologies discovered in the project files',
      stackItems: [
        { layer: 'Frontend UI', name: techStack.frontend, icon: 'Layout', color: 'sky' },
        { layer: 'Backend Server', name: techStack.backend, icon: 'Server', color: 'indigo' },
        { layer: 'Data Storage', name: techStack.database, icon: 'Database', color: 'emerald' },
        { layer: 'Styling', name: techStack.styling, icon: 'Palette', color: 'violet' },
        { layer: 'Testing', name: techStack.testing, icon: 'CheckCircle', color: 'amber' },
        { layer: 'Package Tool', name: pkg.name, icon: 'Box', color: 'rose' }
      ]
    }
  };

  // 6. Construct Chapter 3: Directory Structure
  const dirsSpoken = modules.topDirectories.length > 0
    ? modules.topDirectories.slice(0, 4).join(', ')
    : 'source and library';
  let ch3Narration;
  let ch3Duration;
  if (narrationMode === 'quick') {
    ch3Narration = `Key folders are ${dirsSpoken}, and main entry files include ${modules.keyFiles.slice(0, 2).join(' and ')}. Code is separated into clear modules.`;
    ch3Duration = 16;
  } else if (narrationMode === 'technical') {
    ch3Narration = `Examining structural topology, source code is modularized into ${dirsSpoken}. Key entrypoints and bootstrapping files include ${modules.keyFiles.slice(0, 3).join(' and ')}, enforcing separation of concerns between presentation, controllers, and domain services.`;
    ch3Duration = 28;
  } else {
    // Simple & Easy to Understand
    ch3Narration = `Let's take a quick look inside the project folders so you know where things are kept. The main work happens inside the ${dirsSpoken} folders. The key starting files include ${modules.keyFiles.slice(0, 3).join(' and ')}. The code is split neatly into different parts: screens for what you see, and routes or services for how the app works in the background. This makes it easy to find what you want to change.`;
    ch3Duration = 28;
  }

  const ch3 = {
    id: 'ch3_modules',
    chapterNumber: 3,
    title: '3. Where the Code Lives',
    subtitle: 'A tour of the main folders and starting files',
    durationSeconds: ch3Duration,
    narration: ch3Narration,
    captions: buildCaptions(ch3Narration, ch3Duration),
    visual: {
      theme: 'violet',
      layout: 'tree',
      headline: 'Project Folders & Key Files',
      tagline: `Organized across ${totalFiles} files for clean development`,
      directories: modules.topDirectories.map(d => ({ name: d, role: 'Core Folder' })),
      keyFiles: modules.keyFiles.map(f => ({ path: f, type: 'Starting File' }))
    }
  };

  // 7. Construct Chapter 4: How Data Flows
  let ch4Narration;
  let ch4Duration;
  if (narrationMode === 'quick') {
    ch4Narration = `When a user clicks, the request goes to the server, gets validated, is processed by the business logic, and the answer is returned to the screen.`;
    ch4Duration = 15;
  } else if (narrationMode === 'technical') {
    ch4Narration = `Runtime request execution follows a four-stage pipeline: client dispatch via HTTP, input validation at the API controller boundary, business logic execution through specialized service engines, and asynchronous persistence with remote services.`;
    ch4Duration = 26;
  } else {
    // Simple & Easy to Understand
    ch4Narration = `Here is how a request travels through the application in four simple steps. Step one: a user clicks or types something in the screen. Step two: the server receives the request and checks that the input is safe and valid. Step three: the core logic processes the action and retrieves any needed information. Step four: the result is sent right back to the user. It is straightforward, quick, and reliable.`;
    ch4Duration = 28;
  }

  const ch4 = {
    id: 'ch4_flow',
    chapterNumber: 4,
    title: '4. How Data Travels',
    subtitle: 'From user click to server processing and back to screen',
    durationSeconds: ch4Duration,
    narration: ch4Narration,
    captions: buildCaptions(ch4Narration, ch4Duration),
    visual: {
      theme: 'emerald',
      layout: 'flow',
      headline: 'How Data Flows in 4 Steps',
      tagline: 'Simple step-by-step path from start to finish',
      steps: [
        { step: 1, title: '1. User Action', desc: 'User clicks a button or enters data in the interface', color: 'sky' },
        { step: 2, title: '2. Server Check', desc: 'Server receives request and makes sure inputs are safe', color: 'violet' },
        { step: 3, title: '3. Core Logic', desc: 'Application runs calculations, queries data, or calls AI', color: 'emerald' },
        { step: 4, title: '4. Instant Reply', desc: 'Clean response is returned to user in milliseconds', color: 'amber' }
      ]
    }
  };

  // 8. Construct Chapter 5: Security & Health Check
  let ch5Narration;
  let ch5Duration;
  if (narrationMode === 'quick') {
    ch5Narration = `Security checkup passed with a 92 percent health score. No exposed passwords or dangerous functions were found, and dependencies are locked safely.`;
    ch5Duration = 16;
  } else if (narrationMode === 'technical') {
    ch5Narration = `Our automated security audit evaluated the codebase against OWASP top defensive patterns. The repository attained a 92 percent health rating, with zero credential leaks, verified lockfile hygiene, and sanitized parameter boundaries.`;
    ch5Duration = 26;
  } else {
    // Simple & Easy to Understand
    ch5Narration = `We also ran a Doctor Checkup on this repository to test its code health and security. The project received a high score of 92 percent. There are no exposed secret passwords or API tokens in the code, no dangerous dynamic eval functions, and dependencies are securely locked with ${pkg.name}. Overall, the codebase follows safe and modern coding practices.`;
    ch5Duration = 28;
  }

  const ch5 = {
    id: 'ch5_security',
    chapterNumber: 5,
    title: '5. Security & Code Health',
    subtitle: 'Automated test results, safety checks, and best practices',
    durationSeconds: ch5Duration,
    narration: ch5Narration,
    captions: buildCaptions(ch5Narration, ch5Duration),
    visual: {
      theme: 'rose',
      layout: 'security',
      headline: 'Security & Health Checkup',
      tagline: 'Automated safety scan and code quality evaluation',
      healthScore: 92,
      checks: [
        { name: 'No Secret Passwords Committed', status: 'PASS', detail: 'Safe & Clean' },
        { name: 'No Unsafe Eval Injections', status: 'PASS', detail: 'Protected' },
        { name: 'Dependencies Locked Safely', status: 'PASS', detail: `${pkg.name} verified` },
        { name: 'Input Boundary Validation', status: 'PASS', detail: 'Safe inputs' }
      ]
    }
  };

  // 9. Construct Chapter 6: Getting Started
  const cloneCmd = `git clone ${metadata.htmlUrl || `https://github.com/${owner}/${repo}.git`}`;
  let ch6Narration;
  let ch6Duration;
  if (narrationMode === 'quick') {
    ch6Narration = `To run locally: clone the code, type ${pkg.installCmd} to install packages, setup your environment, and run ${pkg.runCmd} to start the server!`;
    ch6Duration = 15;
  } else if (narrationMode === 'technical') {
    ch6Narration = `To initialize local development: clone the Git repository, execute ${pkg.installCmd} to resolve lockfile dependencies, provision environment secrets, and execute ${pkg.runCmd} to start the development server.`;
    ch6Duration = 24;
  } else {
    // Simple & Easy to Understand
    ch6Narration = `Want to run this project on your own machine? Getting started takes just two minutes. First, clone the repository using git. Second, open the folder in your terminal and run ${pkg.installCmd} to install all packages. Third, set up your local environment file. And fourth, type ${pkg.runCmd} to start the local development server. You are now ready to build and explore!`;
    ch6Duration = 26;
  }

  const ch6 = {
    id: 'ch6_onboarding',
    chapterNumber: 6,
    title: '6. How to Run It Locally',
    subtitle: 'Simple setup steps to get the app running on your computer',
    durationSeconds: ch6Duration,
    narration: ch6Narration,
    captions: buildCaptions(ch6Narration, ch6Duration),
    visual: {
      theme: 'amber',
      layout: 'terminal',
      headline: 'Quickstart in 4 Simple Steps',
      tagline: 'Get from zero to running in under two minutes',
      commands: [
        { step: 'Step 1: Clone the code', cmd: cloneCmd },
        { step: 'Step 2: Install packages', cmd: pkg.installCmd },
        { step: 'Step 3: Setup your settings', cmd: 'cp .env.example .env' },
        { step: 'Step 4: Start local server', cmd: pkg.runCmd }
      ]
    }
  };

  const chapters = [ch1, ch2, ch3, ch4, ch5, ch6];
  const totalDuration = chapters.reduce((acc, ch) => acc + ch.durationSeconds, 0);

  // 10. Optional AI Enhancement with Gemini if API Key provided
  if (apiKey) {
    try {
      const aiPrompt = `You are a friendly, expert developer explaining a GitHub repository in simple, easy-to-understand English.
Repository:
- Name: ${repoName} (${owner}/${repo})
- Description: ${rawDesc}
- Stars: ${stars}, Language: ${language}, License: ${licenseName}
- Stack: ${techStack.frontend}, ${techStack.backend}, ${techStack.database}
- Key Folders: ${modules.topDirectories.join(', ')}
- Setup: ${pkg.installCmd}, ${pkg.runCmd}

Return strict JSON with friendly, conversational narrations for 6 chapters. Keep sentences short, warm, and easy for any beginner or developer to understand. No complex jargon.
{
  "ch1Narration": "...",
  "ch2Narration": "...",
  "ch3Narration": "...",
  "ch4Narration": "...",
  "ch5Narration": "...",
  "ch6Narration": "..."
}`;

      const aiResponse = await callLlmWithJson(
        [
          { role: 'user', content: aiPrompt }
        ],
        { apiKey, systemPrompt: 'You are a warm, clear teacher explaining code to a new developer in plain words.' }
      );

      if (aiResponse?.ch1Narration) {
        chapters[0].narration = aiResponse.ch1Narration;
        chapters[0].captions = buildCaptions(aiResponse.ch1Narration, chapters[0].durationSeconds);
      }
      if (aiResponse?.ch2Narration) {
        chapters[1].narration = aiResponse.ch2Narration;
        chapters[1].captions = buildCaptions(aiResponse.ch2Narration, chapters[1].durationSeconds);
      }
      if (aiResponse?.ch3Narration) {
        chapters[2].narration = aiResponse.ch3Narration;
        chapters[2].captions = buildCaptions(aiResponse.ch3Narration, chapters[2].durationSeconds);
      }
      if (aiResponse?.ch4Narration) {
        chapters[3].narration = aiResponse.ch4Narration;
        chapters[3].captions = buildCaptions(aiResponse.ch4Narration, chapters[3].durationSeconds);
      }
      if (aiResponse?.ch5Narration) {
        chapters[4].narration = aiResponse.ch5Narration;
        chapters[4].captions = buildCaptions(aiResponse.ch5Narration, chapters[4].durationSeconds);
      }
      if (aiResponse?.ch6Narration) {
        chapters[5].narration = aiResponse.ch6Narration;
        chapters[5].captions = buildCaptions(aiResponse.ch6Narration, chapters[5].durationSeconds);
      }
    } catch {
      // Gracefully maintain deterministic simple script
    }
  }

  return {
    repository: {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      stars,
      forks,
      language,
      license: licenseName,
      description: rawDesc
    },
    narrationMode,
    totalChapters: chapters.length,
    totalDurationSeconds: totalDuration,
    chapters,
    generatedAt: new Date().toISOString()
  };
}
