/**
 * DevLens AI - Architecture Overview (Simple, Clean & Professional Edition)
 * Designed for immediate understanding with a 3-tier system diagram,
 * step-by-step request flow, and categorized file directory.
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
  Info
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';

// Minimal Canvas Node for React Flow View
function SimpleCanvasNode({ data, selected }) {
  return (
    <div
      className={`px-3 py-2.5 rounded-xl bg-surface-900 border transition-all duration-150 min-w-[200px] max-w-[240px] cursor-pointer ${
        selected ? 'border-white ring-1 ring-white/20' : 'border-surface-750 hover:border-surface-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400 !w-2 !h-2 !border !border-surface-950 !-top-1" />
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
        <span>{data.type?.toUpperCase()}</span>
        <span className="text-emerald-400">Verified</span>
      </div>
      <div className="font-mono text-xs font-bold text-white truncate">{data.label}</div>
      <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{data.filePath}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400 !w-2 !h-2 !border !border-surface-950 !-bottom-1" />
    </div>
  );
}

const nodeTypes = { archNode: SimpleCanvasNode };

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
  const [activeView, setActiveView] = useState('diagram'); // 'diagram' | 'topology'
  const [selectedTierTab, setSelectedTierTab] = useState('frontend'); // 'frontend' | 'backend' | 'services'
  const [selectedFileItem, setSelectedFileItem] = useState(null);
  const [copiedPath, setCopiedPath] = useState(false);

  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Group discovered nodes into 3 clean, simple tiers
  const tiers = useMemo(() => {
    const res = {
      frontend: [],
      backend: [],
      services: []
    };
    if (!architectureData?.nodes) return res;

    architectureData.nodes.forEach(node => {
      const t = node.type;
      if (t === 'frontend' || t === 'page') {
        res.frontend.push(node);
      } else if (t === 'route' || t === 'auth') {
        res.backend.push(node);
      } else {
        res.services.push(node);
      }
    });

    return res;
  }, [architectureData]);

  // 2D Topology layout (hierarchical: frontend top -> backend middle -> services bottom)
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];
    const tierList = [
      { id: 'frontend', nodes: tiers.frontend },
      { id: 'backend', nodes: tiers.backend },
      { id: 'services', nodes: tiers.services }
    ];

    const result = [];
    const X_SPACING = 260;
    const Y_ROW_SPACING = 120;
    let currentY = 60;

    tierList.forEach(tier => {
      if (tier.nodes.length === 0) return;
      const COLS = Math.min(tier.nodes.length, 3);
      const tierWidth = (COLS - 1) * X_SPACING;
      const startX = Math.max(60, 420 - (tierWidth / 2));

      tier.nodes.forEach((node, idx) => {
        const row = Math.floor(idx / COLS);
        const col = idx % COLS;
        result.push({
          id: node.id,
          type: 'archNode',
          position: {
            x: startX + (col * X_SPACING),
            y: currentY + (row * Y_ROW_SPACING)
          },
          data: node
        });
      });

      const rowCount = Math.ceil(tier.nodes.length / COLS);
      currentY += (rowCount * Y_ROW_SPACING) + 90;
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
      markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 10, height: 10 },
      style: { stroke: '#52525b', strokeWidth: 1.5 },
      data: edge
    }));
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleOpenSourceCode = (filePath) => {
    selectFile(filePath);
    navigate('/analyzer');
  };

  const handleCopyPath = (filePath) => {
    navigator.clipboard.writeText(filePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  if (!currentRepo) {
    return (
      <EmptyState
        title="No Repository Analyzed"
        description="Enter a GitHub repository URL on the dashboard to generate the architecture blueprint."
      />
    );
  }

  const activeFileList = tiers[selectedTierTab] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-750">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>System Architecture Overview</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {currentRepo.fullName}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            High-level technical design: how the client, API, and cloud services connect and communicate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simple Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-900 border border-surface-750 text-xs">
            <button
              onClick={() => setActiveView('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeView === 'diagram'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>System Diagram</span>
            </button>

            <button
              onClick={() => setActiveView('topology')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeView === 'topology'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>
          </div>

          <button
            onClick={() => requestArchitecture(true)}
            disabled={isArchitectureLoading}
            className="p-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-zinc-400 hover:text-white border border-surface-750 transition-colors disabled:opacity-50"
            title="Re-run architecture scan"
          >
            <RefreshCw className={`w-4 h-4 ${isArchitectureLoading ? 'animate-spin text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isArchitectureLoading && (
        <div className="p-12 rounded-2xl bg-surface-900 border border-surface-750 text-center">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-300 font-medium">Extracting architecture blueprint...</p>
        </div>
      )}

      {architectureError && (
        <div className="p-4 rounded-xl bg-surface-900 border border-rose-500/30 text-xs text-rose-300 text-center">
          <AlertTriangle className="w-4 h-4 text-rose-400 inline-block mr-1.5" />
          <span>{architectureError}</span>
          <button
            onClick={() => requestArchitecture(true)}
            className="ml-3 underline hover:text-white font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: CLEAN & SIMPLE 3-TIER SYSTEM ARCHITECTURE DIAGRAM            */}
      {/* ===================================================================== */}
      {activeView === 'diagram' && !isArchitectureLoading && (
        <div className="space-y-6">
          {/* Main 3 Pillars Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Pillar 1: Client UI */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-surface-750 mb-3">
                  <span className="uppercase font-semibold">Tier 1</span>
                  <span>{tiers.frontend.length} Components</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-white shrink-0">
                    <Layout className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Client UI (Frontend)</h3>
                    <p className="text-[11px] text-zinc-400">User Interface & Views</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Renders the visual dashboard, accepts repository inputs, and presents live analysis.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Key Files</span>
                <div className="space-y-1">
                  {tiers.frontend.slice(0, 3).map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleOpenSourceCode(f.filePath)}
                      className="w-full text-left font-mono text-xs text-zinc-300 hover:text-white truncate block py-0.5 hover:underline"
                    >
                      • {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 2: Backend API */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-surface-750 mb-3">
                  <span className="uppercase font-semibold">Tier 2</span>
                  <span>{tiers.backend.length} Handlers</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-white shrink-0">
                    <Server className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">API & Controllers</h3>
                    <p className="text-[11px] text-zinc-400">Request Dispatchers</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Handles incoming REST requests, executes validation, and orchestrates codebase analysis.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Key Files</span>
                <div className="space-y-1">
                  {tiers.backend.slice(0, 3).map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleOpenSourceCode(f.filePath)}
                      className="w-full text-left font-mono text-xs text-zinc-300 hover:text-white truncate block py-0.5 hover:underline"
                    >
                      • {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 3: Data & Cloud */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-surface-750 mb-3">
                  <span className="uppercase font-semibold">Tier 3</span>
                  <span>{tiers.services.length} Services</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-white shrink-0">
                    <HardDrive className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Services & Cloud</h3>
                    <p className="text-[11px] text-zinc-400">External Integrations</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Fetches remote files via GitHub REST API, processes ASTs, and generates AI reasoning.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-800">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Key Files</span>
                <div className="space-y-1">
                  {tiers.services.slice(0, 3).map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleOpenSourceCode(f.filePath)}
                      className="w-full text-left font-mono text-xs text-zinc-300 hover:text-white truncate block py-0.5 hover:underline"
                    >
                      • {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Simple Step-by-Step Request Flow */}
          <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              End-to-End Request Journey
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-750 space-y-1">
                <span className="font-mono text-zinc-500 text-[10px] block">STEP 1</span>
                <h4 className="font-semibold text-white">User Input</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  User inputs a GitHub repository URL into the search bar.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-950 border border-surface-750 space-y-1">
                <span className="font-mono text-zinc-500 text-[10px] block">STEP 2</span>
                <h4 className="font-semibold text-white">API Dispatch</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Client sends request to Express backend API endpoints.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-950 border border-surface-750 space-y-1">
                <span className="font-mono text-zinc-500 text-[10px] block">STEP 3</span>
                <h4 className="font-semibold text-white">Code Analysis</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Backend queries GitHub API and runs deterministic rule checks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-950 border border-surface-750 space-y-1">
                <span className="font-mono text-zinc-500 text-[10px] block">STEP 4</span>
                <h4 className="font-semibold text-white">Insights Rendered</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Clean architecture blueprint and health report displayed to user.
                </p>
              </div>
            </div>
          </div>

          {/* Organized File Directory by Layer (Clean Tabs) */}
          <div className="p-5 rounded-2xl bg-surface-900 border border-surface-750 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-750">
              <div>
                <h3 className="font-bold text-sm text-white">Discovered Code Modules</h3>
                <p className="text-xs text-zinc-400">Click any component to inspect its code in the viewer</p>
              </div>

              {/* Tier Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-950 border border-surface-750 text-xs">
                <button
                  onClick={() => setSelectedTierTab('frontend')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedTierTab === 'frontend' ? 'bg-surface-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Frontend ({tiers.frontend.length})
                </button>
                <button
                  onClick={() => setSelectedTierTab('backend')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedTierTab === 'backend' ? 'bg-surface-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  API & Backend ({tiers.backend.length})
                </button>
                <button
                  onClick={() => setSelectedTierTab('services')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedTierTab === 'services' ? 'bg-surface-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Services & Cloud ({tiers.services.length})
                </button>
              </div>
            </div>

            {/* Clean Component List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeFileList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenSourceCode(item.filePath)}
                  className="p-3 rounded-xl bg-surface-950 border border-surface-750 hover:border-surface-600 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-semibold text-white group-hover:underline truncate block">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 truncate block mt-0.5">
                      {item.filePath}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: INTERACTIVE 2D TOPOLOGY CANVAS (Secondary Tab)               */}
      {/* ===================================================================== */}
      {activeView === 'topology' && !isArchitectureLoading && (
        <div className="relative w-full h-[620px] rounded-2xl bg-surface-950 border border-surface-750 overflow-hidden shadow-sm">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.25}
            maxZoom={2}
          >
            <Background color="#27272a" gap={20} size={1} />
            <Controls className="bg-surface-900 border border-surface-750 text-zinc-300 fill-zinc-300 rounded-xl overflow-hidden" />
          </ReactFlow>

          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-surface-900/90 border border-surface-750 text-xs font-mono text-zinc-400">
            Scroll to zoom • Drag to pan • Click node to open in code viewer
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
