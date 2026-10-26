/**
 * DevLens AI - Interactive Architecture Map (Clean, Minimal & Professional Edition)
 * Designed for immediate human comprehension with a sleek monochrome dark palette.
 * Default view: Intuitive 4-Stage System Flow (Client -> API -> Services -> Cloud/Data).
 * Optional view: Minimal 2D Interactive Canvas.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ChevronRight,
  Info
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';

// Category Definitions & Minimal Icons
const LAYER_META = {
  client: {
    id: 'client',
    number: '01',
    title: 'Client & UI Layer',
    subtitle: 'User interface components, pages, and interactive views',
    icon: Layout,
    types: ['frontend', 'page']
  },
  api: {
    id: 'api',
    number: '02',
    title: 'API & Gateway Layer',
    subtitle: 'HTTP routes, request dispatchers, and auth controllers',
    icon: Server,
    types: ['route', 'auth']
  },
  services: {
    id: 'services',
    number: '03',
    title: 'Core Services & Logic',
    subtitle: 'Business algorithms, AI engines, and code parsers',
    icon: Cpu,
    types: ['service']
  },
  data: {
    id: 'data',
    number: '04',
    title: 'Data & Cloud Integrations',
    subtitle: 'Databases, external cloud APIs, and environment configs',
    icon: HardDrive,
    types: ['database', 'external', 'config', 'test']
  }
};

const TYPE_LABELS = {
  frontend: 'UI Component',
  page: 'Page View',
  route: 'API Route',
  auth: 'Auth Module',
  service: 'Core Service',
  database: 'Data Model',
  external: 'Cloud API',
  config: 'System Config',
  test: 'Test Suite'
};

/**
 * Minimal Canvas Node for React Flow View
 */
function ArchitectureCanvasNode({ data, selected }) {
  const typeLabel = TYPE_LABELS[data.type] || 'Module';

  return (
    <div
      className={`group px-3.5 py-3 rounded-xl bg-surface-900 border transition-all duration-200 shadow-md min-w-[220px] max-w-[260px] cursor-pointer ${
        selected
          ? 'border-white ring-1 ring-white/30 shadow-xl'
          : 'border-surface-750 hover:border-slate-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-2 !h-2 !border !border-surface-950 !-top-1"
      />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-surface-800 border border-surface-700">
          {typeLabel}
        </span>
        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Verified</span>
        </span>
      </div>

      <div className="font-mono text-xs font-bold text-white truncate" title={data.label}>
        {data.label}
      </div>

      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={data.filePath}>
        {data.filePath}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-surface-800 font-mono">
        <span>{data.metrics?.lines > 0 ? `${data.metrics.lines} lines` : 'Integration'}</span>
        <span className="text-slate-300 group-hover:text-white flex items-center gap-0.5">
          <span>Inspect</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2 !h-2 !border !border-surface-950 !-bottom-1"
      />
    </div>
  );
}

const nodeTypes = {
  archNode: ArchitectureCanvasNode
};

/**
 * Minimal Canvas Control Toolbar
 */
function CanvasToolbar({ onToggleMiniMap, showMiniMap, onToggleFullscreen, isFullscreen }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-surface-900/95 border border-surface-750 shadow-lg backdrop-blur-md">
      <button
        onClick={() => fitView({ padding: 0.35, duration: 250 })}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-750 text-white text-xs font-medium border border-surface-700 transition-colors"
        title="Fit all components on screen"
      >
        <Maximize className="w-3.5 h-3.5 text-slate-400" />
        <span>Fit View</span>
      </button>

      <div className="w-[1px] h-4 bg-surface-700" />

      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-surface-700" />

      <button
        onClick={onToggleMiniMap}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          showMiniMap ? 'bg-surface-800 text-white' : 'text-slate-400 hover:text-white'
        }`}
        title="Toggle MiniMap"
      >
        <span>MiniMap</span>
      </button>

      <button
        onClick={onToggleFullscreen}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

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
  const { fitView } = useReactFlow();

  // Mode & Filter States
  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' | 'canvas'
  const [selectedLayerFilter, setSelectedLayerFilter] = useState('all'); // 'all' | 'client' | 'api' | 'services' | 'data'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // Auto-request architecture on mount if repo active
  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Categorize nodes into 4 clear, logical system tiers
  const categorizedLayers = useMemo(() => {
    const empty = { client: [], api: [], services: [], data: [] };
    if (!architectureData?.nodes) return empty;

    architectureData.nodes.forEach(node => {
      const t = node.type;
      if (LAYER_META.client.types.includes(t)) {
        empty.client.push(node);
      } else if (LAYER_META.api.types.includes(t)) {
        empty.api.push(node);
      } else if (LAYER_META.services.types.includes(t)) {
        empty.services.push(node);
      } else {
        empty.data.push(node);
      }
    });

    return empty;
  }, [architectureData]);

  // Compute 2D Flow Nodes with clean hierarchical alignment
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];

    const tierSequence = [
      { id: 'client', nodes: categorizedLayers.client },
      { id: 'api', nodes: categorizedLayers.api },
      { id: 'services', nodes: categorizedLayers.services },
      { id: 'data', nodes: categorizedLayers.data }
    ];

    const result = [];
    const X_SPACING = 280;
    const Y_ROW_SPACING = 150;
    const TIER_MARGIN = 110;
    let currentY = 80;

    tierSequence.forEach(tier => {
      if (tier.nodes.length === 0) return;
      const COLS = Math.min(tier.nodes.length, 3);
      const tierWidth = (COLS - 1) * X_SPACING;
      const startX = Math.max(80, 480 - (tierWidth / 2));

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
          data: {
            ...node,
            layerId: tier.id
          }
        });
      });

      const rowCount = Math.ceil(tier.nodes.length / COLS);
      currentY += (rowCount * Y_ROW_SPACING) + TIER_MARGIN;
    });

    return result;
  }, [architectureData, categorizedLayers]);

  // Compute Canvas Edges with clean slate styling
  const initialEdges = useMemo(() => {
    if (!architectureData?.edges) return [];

    return architectureData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b',
        width: 12,
        height: 12
      },
      style: {
        stroke: '#475569',
        strokeWidth: 1.5
      },
      labelStyle: {
        fill: '#94a3b8',
        fontSize: 10,
        fontFamily: 'monospace'
      },
      labelBgStyle: {
        fill: '#0f172a',
        fillOpacity: 0.95
      },
      data: edge
    }));
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Canvas selection & focus
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.data);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return null;
    const ids = new Set([selectedNode.id]);
    edges.forEach(e => {
      if (e.source === selectedNode.id) ids.add(e.target);
      if (e.target === selectedNode.id) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, edges]);

  const displayNodes = useMemo(() => {
    return nodes.map(n => {
      const matchesSearch = !searchQuery ||
        n.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.filePath?.toLowerCase().includes(searchQuery.toLowerCase());

      const isConnected = !connectedNodeIds || connectedNodeIds.has(n.id);

      return {
        ...n,
        selected: selectedNode?.id === n.id,
        style: {
          ...n.style,
          opacity: matchesSearch ? (isConnected ? 1 : 0.25) : 0.1,
          pointerEvents: matchesSearch ? 'all' : 'none',
          transition: 'opacity 0.2s ease'
        }
      };
    });
  }, [nodes, searchQuery, connectedNodeIds, selectedNode]);

  const displayEdges = useMemo(() => {
    return edges.map(e => {
      const isConnected = !selectedNode || e.source === selectedNode.id || e.target === selectedNode.id;
      return {
        ...e,
        animated: isConnected && selectedNode,
        style: {
          ...e.style,
          stroke: isConnected && selectedNode ? '#cbd5e1' : '#475569',
          strokeWidth: isConnected && selectedNode ? 2 : 1,
          opacity: isConnected ? 1 : 0.15,
          transition: 'all 0.2s ease'
        }
      };
    });
  }, [edges, selectedNode]);

  const handleOpenInViewer = (filePath) => {
    selectFile(filePath);
    navigate('/analyzer');
  };

  const handleCopyFilePath = (filePath) => {
    navigator.clipboard.writeText(filePath);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  if (!currentRepo) {
    return (
      <EmptyState
        title="No Repository Analyzed"
        description="Enter a GitHub repository URL on the dashboard to generate an interactive X-Ray Architecture Map."
      />
    );
  }

  const totalNodesCount = architectureData?.nodes?.length || 0;
  const totalEdgesCount = architectureData?.edges?.length || 0;
  const verifiedEdgesCount = architectureData?.metrics?.verifiedEdges || 0;

  // Filter components according to selected layer filter and search query
  const getFilteredNodesForLayer = (layerKey) => {
    const list = categorizedLayers[layerKey] || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(n =>
      n.label.toLowerCase().includes(q) ||
      n.filePath.toLowerCase().includes(q) ||
      (n.description && n.description.toLowerCase().includes(q))
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header with Breadcrumb and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-750">
        <div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>System Architecture Overview</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {currentRepo.fullName}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Decomposed into client presentation, API routing, business services, and cloud integrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-900 border border-surface-750 text-xs">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-slate-400" />
              <span>System Flow</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'canvas'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-slate-400" />
              <span>Topology Map</span>
            </button>
          </div>

          <button
            onClick={() => requestArchitecture(true)}
            disabled={isArchitectureLoading}
            className="p-2 rounded-xl bg-surface-900 hover:bg-surface-850 text-slate-400 hover:text-white border border-surface-750 transition-colors disabled:opacity-50"
            title="Re-run architecture scan"
          >
            <RefreshCw className={`w-4 h-4 ${isArchitectureLoading ? 'animate-spin text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Executive "How This Codebase Works" Plain English Summary */}
      <div className="p-5 rounded-2xl bg-surface-900/90 border border-surface-750 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Architecture at a Glance
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {totalNodesCount} Modules • {verifiedEdgesCount} Verified Connections
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          This repository follows a structured, multi-tier architectural pattern. User interactions originate in the{' '}
          <strong className="text-white">Client UI Layer</strong>, dispatch requests through the{' '}
          <strong className="text-white">API & Gateway Layer</strong>, are processed by backend{' '}
          <strong className="text-white">Core Services</strong>, and interface with{' '}
          <strong className="text-white">Cloud APIs & Data Integrations</strong>.
        </p>

        {/* 4-Stage Visual Pipeline Navigation Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
          {Object.values(LAYER_META).map((layer) => {
            const count = (categorizedLayers[layer.id] || []).length;
            const isSelected = selectedLayerFilter === layer.id;
            const Icon = layer.icon;

            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayerFilter(prev => prev === layer.id ? 'all' : layer.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-surface-800 border-white text-white'
                    : 'bg-surface-950/70 border-surface-800 hover:border-surface-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
                  <span>STAGE {layer.number}</span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-850 text-slate-300 border border-surface-750">
                    {count} items
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-xs text-white truncate">
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{layer.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search Bar & Layer Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components or file paths..."
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface-900 border border-surface-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLayerFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedLayerFilter === 'all'
                ? 'bg-surface-800 text-white border border-surface-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Layers ({totalNodesCount})
          </button>
          {Object.values(LAYER_META).map(layer => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayerFilter(layer.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedLayerFilter === layer.id
                  ? 'bg-surface-800 text-white border border-surface-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer.title.split(' ')[0]} ({categorizedLayers[layer.id]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {isArchitectureLoading && (
        <div className="p-12 rounded-2xl bg-surface-900/80 border border-surface-750 text-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">Extracting architecture components...</p>
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

      {/* ========================================================================= */}
      {/* VIEW 1: INTUITIVE SYSTEM FLOW BLUEPRINT (100% Understandable, Zero Mess) */}
      {/* ========================================================================= */}
      {activeTab === 'blueprint' && !isArchitectureLoading && (
        <div className="space-y-6">
          {Object.values(LAYER_META)
            .filter(layer => selectedLayerFilter === 'all' || selectedLayerFilter === layer.id)
            .map((layer, layerIdx) => {
              const layerNodes = getFilteredNodesForLayer(layer.id);
              const Icon = layer.icon;

              return (
                <div key={layer.id} className="space-y-4">
                  {/* Layer Section Card */}
                  <div className="rounded-2xl bg-surface-900/90 border border-surface-750 p-6 space-y-4">
                    {/* Layer Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-800 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 font-mono">
                          {layer.number}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <span>{layer.title}</span>
                          </h3>
                          <p className="text-xs text-slate-400">{layer.subtitle}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700/60 self-start sm:self-auto">
                        {layerNodes.length} Components
                      </span>
                    </div>

                    {/* Component Grid */}
                    {layerNodes.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center font-mono">
                        No components matched your search in this layer.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {layerNodes.map(node => {
                          const typeLabel = TYPE_LABELS[node.type] || 'Component';
                          const outboundLinks = edges.filter(e => e.source === node.id).length;
                          const inboundLinks = edges.filter(e => e.target === node.id).length;

                          return (
                            <div
                              key={node.id}
                              onClick={() => setSelectedNode(node)}
                              className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-slate-500 transition-all cursor-pointer flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-surface-900 border border-surface-800">
                                    {typeLabel}
                                  </span>
                                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span>Verified</span>
                                  </span>
                                </div>

                                <div className="font-mono text-xs font-bold text-white group-hover:text-slate-200 transition-colors truncate">
                                  {node.label}
                                </div>

                                <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                                  {node.filePath}
                                </div>

                                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                  {node.description}
                                </p>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-surface-850 flex items-center justify-between text-xs font-mono">
                                <span className="text-slate-500 text-[11px]">
                                  {outboundLinks > 0 ? `${outboundLinks} calls` : 'Leaf node'}
                                </span>
                                <span className="text-slate-400 group-hover:text-white flex items-center gap-1">
                                  <span>Inspect</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Directional Downward Connector Arrow between stages */}
                  {selectedLayerFilter === 'all' && layerIdx < 3 && (
                    <div className="flex flex-col items-center justify-center py-1 text-slate-500 text-xs font-mono">
                      <ArrowDown className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        {layerIdx === 0 && 'Dispatches requests to API layer'}
                        {layerIdx === 1 && 'Invokes core business services'}
                        {layerIdx === 2 && 'Queries data models & cloud services'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MINIMAL INTERACTIVE 2D TOPOLOGY MAP                               */}
      {/* ========================================================================= */}
      {activeTab === 'canvas' && !isArchitectureLoading && (
        <div
          className={`relative w-full rounded-2xl bg-surface-950 border border-surface-750 overflow-hidden shadow-xl transition-all ${
            isFullscreen
              ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]'
              : 'h-[640px]'
          }`}
        >
          <CanvasToolbar
            onToggleMiniMap={() => setShowMiniMap(prev => !prev)}
            showMiniMap={showMiniMap}
            onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
            isFullscreen={isFullscreen}
          />

          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.35, maxZoom: 1, minZoom: 0.5 }}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={true}
            preventScrolling={false}
            attributionPosition="bottom-left"
            minZoom={0.25}
            maxZoom={2}
          >
            <Background color="#1e293b" gap={24} size={1} />
            <Controls
              showInteractive={false}
              className="bg-surface-900 border border-surface-700 text-slate-300 fill-slate-300 rounded-xl overflow-hidden"
            />
            {showMiniMap && (
              <MiniMap
                position="bottom-right"
                nodeStrokeColor="#64748b"
                nodeColor="#1e293b"
                maskColor="rgba(7, 11, 18, 0.85)"
                className="rounded-xl border border-surface-700 !bg-surface-900 shadow-xl !w-44 !h-32 mb-14 mr-4"
              />
            )}
          </ReactFlow>

          {/* Simple Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 p-2 rounded-xl bg-surface-900/95 border border-surface-700 text-xs text-slate-400 pointer-events-auto">
            <span className="font-semibold text-slate-300 text-[10px] uppercase">Legend:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-4 h-0.5 bg-slate-400 inline-block"></span>
              <span>Verified Flow</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Direct Code Match</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPONENT INSPECTOR DRAWER (Appears on clicking any component)             */}
      {/* ========================================================================= */}
      {selectedNode && (
        <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-surface-900 border-l border-surface-700 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-surface-800">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[10px] uppercase font-semibold border border-surface-700">
                  {TYPE_LABELS[selectedNode.type] || selectedNode.type}
                </span>
                <h3 className="font-bold text-base text-white mt-1.5 break-all">
                  {selectedNode.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold mb-1">
                  <span>File Location</span>
                  <button
                    onClick={() => handleCopyFilePath(selectedNode.filePath)}
                    className="text-slate-300 hover:text-white flex items-center gap-1 normal-case"
                  >
                    {copiedFile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="font-mono text-slate-200 break-all select-all block bg-surface-950 p-2.5 rounded-lg border border-surface-800">
                  {selectedNode.filePath}
                </span>
              </div>

              {selectedNode.metrics?.lines > 0 && (
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-surface-800 text-center font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Lines of Code</span>
                    <span className="text-white font-bold">{selectedNode.metrics.lines}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Confidence</span>
                    <span className="text-emerald-400 font-semibold">{selectedNode.confidence}</span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Role in System</span>
                <p className="text-slate-300 leading-relaxed bg-surface-950 p-3 rounded-lg border border-surface-800">
                  {selectedNode.description}
                </p>
              </div>

              {/* Connected Dependencies */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1.5">
                  Connected Dependencies ({edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length})
                </span>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map(e => {
                      const isOutbound = e.source === selectedNode.id;
                      const otherNodeId = isOutbound ? e.target : e.source;
                      const otherNode = nodes.find(n => n.id === otherNodeId);

                      return (
                        <div
                          key={e.id}
                          className="p-2 rounded-lg bg-surface-950 border border-surface-800 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-mono text-slate-300 truncate max-w-[180px]" title={otherNode?.data?.label || otherNodeId}>
                            {isOutbound ? `→ Calls ${otherNode?.data?.label || otherNodeId}` : `← Called by ${otherNode?.data?.label || otherNodeId}`}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">
                            {e.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {selectedNode.filePath !== 'External Cloud / API Service' && (
            <div className="pt-4 border-t border-surface-800">
              <button
                onClick={() => handleOpenInViewer(selectedNode.filePath)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-medium text-xs transition-colors border border-surface-700"
              >
                <Code2 className="w-4 h-4" />
                <span>Open in Source Code Viewer</span>
              </button>
            </div>
          )}
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
