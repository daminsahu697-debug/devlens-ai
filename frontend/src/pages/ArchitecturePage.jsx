/**
 * DevLens AI - Architecture Overview (High-Clarity & Large Visual Edition)
 * Designed for immediate understanding with a 4-tier visual flow schematic,
 * prominent connecting data paths, large readable component cards, and
 * full-size interactive topology graph.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Layers,
  Search,
  RefreshCw,
  Code2,
  Database,
  Cloud,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Network,
  Split,
  ArrowRight,
  ArrowDown,
  Copy,
  Check,
  Cpu,
  Layout,
  Server,
  HardDrive,
  Eye,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';

// Tier Color Scheme Configuration
const TIER_THEMES = {
  frontend: {
    name: 'Presentation Layer (UI)',
    badge: 'Tier 1 • Client Frontend',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    border: 'border-sky-300 dark:border-sky-800/60',
    headerBg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-300',
    iconColor: 'text-sky-500',
    accentBorder: 'border-sky-500',
    icon: Layout
  },
  backend: {
    name: 'API Gateway & Routing',
    badge: 'Tier 2 • Server & Endpoints',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-300 dark:border-violet-800/60',
    headerBg: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-700 dark:text-violet-300',
    iconColor: 'text-violet-500',
    accentBorder: 'border-violet-500',
    icon: Server
  },
  services: {
    name: 'Analysis & Intelligence Engines',
    badge: 'Tier 3 • Rules & AI Reasoning',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-300 dark:border-emerald-800/60',
    headerBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
    accentBorder: 'border-emerald-500',
    icon: Cpu
  },
  data: {
    name: 'Data Sources & Cloud Services',
    badge: 'Tier 4 • External Integrations',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-300 dark:border-amber-800/60',
    headerBg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    iconColor: 'text-amber-500',
    accentBorder: 'border-amber-500',
    icon: HardDrive
  }
};

// Large, Highly-Readable Canvas Node for ReactFlow
function LargeCanvasNode({ data, selected }) {
  const tierKey =
    data.type === 'frontend' || data.type === 'page'
      ? 'frontend'
      : data.type === 'route' || data.type === 'auth'
      ? 'backend'
      : data.type === 'service' || data.type === 'test'
      ? 'services'
      : 'data';

  const theme = TIER_THEMES[tierKey];

  return (
    <div
      className={`w-72 rounded-2xl bg-surface-900 border-2 transition-all duration-200 shadow-md ${
        selected ? 'border-sky-500 ring-4 ring-sky-500/20 shadow-xl' : `${theme.border} hover:shadow-lg`
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white !-top-1.5"
      />

      {/* Node Header Banner */}
      <div className={`px-4 py-2.5 rounded-t-xl ${theme.headerBg} border-b ${theme.border} flex items-center justify-between`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${theme.text}`}>
            {data.type}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
          Verified
        </span>
      </div>

      {/* Node Body */}
      <div className="p-4 space-y-1.5">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
          {data.label}
        </h4>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
          {data.filePath}
        </p>

        {data.lines && (
          <div className="pt-2 border-t border-surface-750 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{data.lines} lines of code</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">Click to view</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white !-bottom-1.5"
      />
    </div>
  );
}

const nodeTypes = { archNode: LargeCanvasNode };

function ArchitecturePageInner() {
  const {
    currentRepo,
    architectureData,
    isArchitectureLoading,
    architectureError,
    requestArchitecture,
    selectFile
  } = useRepository();

  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('diagram'); // 'diagram' | 'topology' | 'directory'
  const [selectedTierTab, setSelectedTierTab] = useState('frontend');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Categorize Discovered Nodes into 4 Distinct Architecture Tiers
  const tiers = useMemo(() => {
    const res = {
      frontend: [],
      backend: [],
      services: [],
      data: []
    };
    if (!architectureData?.nodes) return res;

    architectureData.nodes.forEach(node => {
      const t = node.type;
      if (t === 'frontend' || t === 'page') {
        res.frontend.push(node);
      } else if (t === 'route' || t === 'auth') {
        res.backend.push(node);
      } else if (t === 'service' || t === 'test') {
        res.services.push(node);
      } else {
        res.data.push(node);
      }
    });

    return res;
  }, [architectureData]);

  // Topology Nodes for ReactFlow View (Spacious layout with large cards)
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];
    const tierList = [
      { id: 'frontend', nodes: tiers.frontend },
      { id: 'backend', nodes: tiers.backend },
      { id: 'services', nodes: tiers.services },
      { id: 'data', nodes: tiers.data }
    ];

    const result = [];
    const X_SPACING = 340;
    const Y_ROW_SPACING = 160;
    let currentY = 60;

    tierList.forEach(tier => {
      if (tier.nodes.length === 0) return;
      const COLS = Math.min(tier.nodes.length, 3);
      const tierWidth = (COLS - 1) * X_SPACING;
      const startX = Math.max(60, 480 - tierWidth / 2);

      tier.nodes.forEach((node, idx) => {
        const row = Math.floor(idx / COLS);
        const col = idx % COLS;
        result.push({
          id: node.id,
          type: 'archNode',
          position: {
            x: startX + col * X_SPACING,
            y: currentY + row * Y_ROW_SPACING
          },
          data: node
        });
      });

      const rowCount = Math.ceil(tier.nodes.length / COLS);
      currentY += rowCount * Y_ROW_SPACING + 100;
    });

    return result;
  }, [architectureData, tiers]);

  const initialEdges = useMemo(() => {
    if (!architectureData?.edges) return [];
    return architectureData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7', width: 12, height: 12 },
      style: { stroke: '#0284c7', strokeWidth: 2 },
      data: edge
    }));
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleOpenSourceCode = filePath => {
    selectFile(filePath);
    navigate('/analyzer');
  };

  if (!currentRepo) {
    return (
      <EmptyState
        title="No Repository Analyzed"
        description="Enter a GitHub repository URL on the dashboard to generate the architecture blueprint."
      />
    );
  }

  const allNodesCount = architectureData?.nodes?.length || 0;
  const verifiedEdgesCount = architectureData?.metrics?.verifiedEdges || 0;

  return (
    <div className="space-y-8 w-full pb-16">
      {/* 1. Page Header with Architecture Pattern & Quick Stats */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800/40">
                System Architecture Blueprint
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Branch: {currentRepo.defaultBranch}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentRepo.fullName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Decoupled 4-Tier Layered Architecture: High-level visual schematic mapping client presentation, API controllers, core analysis engines, and external cloud integrations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1.5 rounded-2xl bg-surface-800 border border-surface-750 text-xs font-semibold">
              <button
                onClick={() => setActiveView('diagram')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeView === 'diagram'
                    ? 'bg-white dark:bg-surface-900 text-sky-700 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Split className="w-4 h-4 text-sky-500" />
                <span>Architecture Schematic</span>
              </button>

              <button
                onClick={() => setActiveView('topology')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  activeView === 'topology'
                    ? 'bg-white dark:bg-surface-900 text-indigo-700 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Network className="w-4 h-4 text-indigo-500" />
                <span>Interactive Graph</span>
              </button>
            </div>

            <button
              onClick={() => requestArchitecture(true)}
              disabled={isArchitectureLoading}
              className="p-2.5 rounded-2xl bg-surface-800 hover:bg-surface-750 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-surface-750 transition-colors disabled:opacity-50"
              title="Re-run architecture scan"
            >
              <RefreshCw className={`w-4 h-4 ${isArchitectureLoading ? 'animate-spin text-sky-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Architectural Tier Metrics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-750">
          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 shrink-0">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
                {tiers.frontend.length}
              </span>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                Frontend Views
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-600 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
                {tiers.backend.length}
              </span>
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                API Handlers
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
                {tiers.services.length}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Core Engines
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
                {tiers.data.length}
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Data & Config
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isArchitectureLoading && (
        <div className="p-16 rounded-3xl bg-surface-900 border border-surface-750 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Extracting System Architecture Blueprint...
          </h3>
          <p className="text-xs text-slate-500">
            Analyzing abstract syntax trees, route endpoints, and AI relationship inferences
          </p>
        </div>
      )}

      {architectureError && (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>{architectureError}</span>
          </div>
          <button
            onClick={() => requestArchitecture(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
          >
            Retry Scan
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: PROMINENT & LARGE 4-TIER ARCHITECTURE FLOW SCHEMATIC         */}
      {/* ===================================================================== */}
      {activeView === 'diagram' && !isArchitectureLoading && (
        <div className="space-y-6">
          {/* TIER 1: CLIENT PRESENTATION LAYER */}
          <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border-2 border-sky-200 dark:border-sky-800/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-750">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 shrink-0">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      TIER 1
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Presentation Layer (Client Web UI)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Renders interactive dashboards, accepts user inputs, renders architecture blueprints, and displays live AI answers.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 self-start sm:self-auto">
                {tiers.frontend.length} Discovered Modules
              </span>
            </div>

            {/* Component Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {tiers.frontend.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenSourceCode(item.filePath)}
                  className="p-4 rounded-2xl bg-sky-50/40 hover:bg-sky-50 dark:bg-surface-850 dark:hover:bg-surface-800 border border-sky-100 dark:border-surface-700 hover:border-sky-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 group-hover:underline truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-surface-900 text-slate-500 border border-surface-750">
                        {item.type}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {item.filePath}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-sky-100 dark:border-surface-750 flex items-center justify-between text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    <span>Inspect Code</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONNECTING DATA BUS 1 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white dark:bg-surface-900 border border-surface-750 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <ArrowDown className="w-4 h-4 text-sky-500 animate-bounce" />
              <span>HTTP REST API Calls • JSON Payloads • CORS & Validation Guardrails</span>
            </div>
          </div>

          {/* TIER 2: API GATEWAY & ROUTING LAYER */}
          <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border-2 border-violet-200 dark:border-violet-800/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-750">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-600 shrink-0">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      TIER 2
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      API Gateway & Controller Layer
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Express.js backend endpoints, input validation, SSRF prevention, and rate-limiting middleware.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800 self-start sm:self-auto">
                {tiers.backend.length} Discovered Modules
              </span>
            </div>

            {/* Component Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {tiers.backend.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenSourceCode(item.filePath)}
                  className="p-4 rounded-2xl bg-violet-50/40 hover:bg-violet-50 dark:bg-surface-850 dark:hover:bg-surface-800 border border-violet-100 dark:border-surface-700 hover:border-violet-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-300 group-hover:underline truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-surface-900 text-slate-500 border border-surface-750">
                        {item.type}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {item.filePath}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-violet-100 dark:border-surface-750 flex items-center justify-between text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                    <span>Inspect Route</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONNECTING DATA BUS 2 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white dark:bg-surface-900 border border-surface-750 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <ArrowDown className="w-4 h-4 text-violet-500 animate-bounce" />
              <span>Dispatches AST Parsing, Security Rule Scanning & Context Retrieval</span>
            </div>
          </div>

          {/* TIER 3: CORE ANALYSIS & AI ENGINES */}
          <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border-2 border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-750">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      TIER 3
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Core Intelligence & Audit Engines
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Deterministic OWASP security rules, AST parsing, and Google Gemini 2.5 generative reasoning pipeline.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                {tiers.services.length} Discovered Modules
              </span>
            </div>

            {/* Component Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {tiers.services.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenSourceCode(item.filePath)}
                  className="p-4 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 dark:bg-surface-850 dark:hover:bg-surface-800 border border-emerald-100 dark:border-surface-700 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 group-hover:underline truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-surface-900 text-slate-500 border border-surface-750">
                        {item.type}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {item.filePath}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-surface-750 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Inspect Engine</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONNECTING DATA BUS 3 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white dark:bg-surface-900 border border-surface-750 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <ArrowDown className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>Queries Remote Git Trees & Executes Generative Model Inferences</span>
            </div>
          </div>

          {/* TIER 4: DATA & EXTERNAL INTEGRATIONS */}
          <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border-2 border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-750">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 shrink-0">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      TIER 4
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      External Services & Data Sources
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    GitHub REST API v3, Google Gemini API endpoints, and browser session storage.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                {tiers.data.length} Discovered Modules
              </span>
            </div>

            {/* Component Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {tiers.data.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenSourceCode(item.filePath)}
                  className="p-4 rounded-2xl bg-amber-50/40 hover:bg-amber-50 dark:bg-surface-850 dark:hover:bg-surface-800 border border-amber-100 dark:border-surface-700 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 group-hover:underline truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-surface-900 text-slate-500 border border-surface-750">
                        {item.type}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {item.filePath}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-100 dark:border-surface-750 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <span>Inspect Config</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Step End-to-End Request Journey */}
          <div className="p-6 md:p-8 rounded-3xl bg-surface-900 border border-surface-750 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              Complete End-to-End Request Journey
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-surface-850 border border-sky-200 dark:border-surface-750 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">User Input</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  User inputs a repository URL or asks a targeted technical codebase question.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-surface-850 border border-violet-200 dark:border-surface-750 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-violet-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">API Dispatch</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Express API validates parameters, checks rate limits, and defends against directory traversal.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-surface-850 border border-emerald-200 dark:border-surface-750 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hybrid Analysis</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Deterministic rules parse AST imports while Gemini AI analyzes deep patterns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-surface-850 border border-amber-200 dark:border-surface-750 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-mono text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Insights Rendered</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Clean interactive blueprint, security findings, and verified code diffs presented.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: LARGE INTERACTIVE 2D TOPOLOGY CANVAS (ReactFlow)              */}
      {/* ===================================================================== */}
      {activeView === 'topology' && !isArchitectureLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Scroll or pinch to zoom • Drag to pan • Click any node to open in source viewer</span>
            <span className="font-mono text-sky-600 font-semibold">Nodes: {allNodesCount} • Edges: {verifiedEdgesCount}</span>
          </div>

          <div className="relative w-full h-[700px] rounded-3xl bg-surface-900 border border-surface-750 overflow-hidden shadow-md">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              defaultViewport={{ x: 100, y: 50, zoom: 0.9 }}
              minZoom={0.4}
              maxZoom={2.0}
            >
              <Background color="#cbd5e1" gap={24} size={1.5} />
              <Controls className="bg-white dark:bg-surface-900 border border-surface-750 rounded-2xl shadow-lg overflow-hidden" />
              <MiniMap
                className="bg-white dark:bg-surface-900 border border-surface-750 rounded-2xl overflow-hidden shadow-lg"
                nodeColor={n => {
                  if (n.data?.type === 'frontend') return '#0284c7';
                  if (n.data?.type === 'route') return '#7c3aed';
                  if (n.data?.type === 'service') return '#059669';
                  return '#d97706';
                }}
              />
            </ReactFlow>

            <div className="absolute top-4 left-4 flex items-center gap-2 p-2 rounded-2xl bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-750 text-xs font-mono shadow-md">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> UI (Frontend)
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span> API & Routes
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Core Engines
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Cloud / Config
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <ReactFlowProvider>
      <ArchitecturePageInner />
    </ReactFlowProvider>
  );
}
