/**
 * DevLens AI - Feature 1: Interactive Architecture Map (X-Ray View)
 * High-polish professional engineering dashboard with 2D visual topology,
 * natural page scrolling without trapping, dynamic category counts,
 * connection focus highlighting, and an executive Layered Architecture Flow.
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
  Filter,
  RefreshCw,
  ExternalLink,
  Code2,
  Database,
  Cloud,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Network,
  Split,
  MapPin,
  ArrowRight,
  Info,
  Copy,
  Check,
  MousePointer,
  Compass,
  Sparkles,
  Cpu,
  Boxes
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';

// Styling configuration for architecture categories
const TYPE_CONFIG = {
  frontend: {
    border: 'border-sky-500/50 hover:border-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400',
    icon: Code2,
    label: 'UI Component'
  },
  page: {
    border: 'border-blue-500/50 hover:border-blue-400',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    icon: Code2,
    label: 'App Entry'
  },
  route: {
    border: 'border-indigo-500/50 hover:border-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    icon: Layers,
    label: 'API Route'
  },
  service: {
    border: 'border-violet-500/50 hover:border-violet-400',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    dot: 'bg-violet-400',
    icon: Cpu,
    label: 'Service Logic'
  },
  database: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    icon: Database,
    label: 'Database'
  },
  external: {
    border: 'border-amber-500/50 hover:border-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    icon: Cloud,
    label: 'Cloud / API'
  },
  auth: {
    border: 'border-rose-500/50 hover:border-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    icon: ShieldCheck,
    label: 'Auth'
  },
  config: {
    border: 'border-slate-500/50 hover:border-slate-400',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
    icon: FileCode,
    label: 'Config'
  },
  test: {
    border: 'border-teal-500/50 hover:border-teal-400',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    dot: 'bg-teal-400',
    icon: CheckCircle2,
    label: 'Test'
  }
};

/**
 * Custom Dark Architecture Node for React Flow
 */
function ArchitectureNode({ data, selected }) {
  const typeCfg = TYPE_CONFIG[data.type] || TYPE_CONFIG.service;
  const IconComponent = typeCfg.icon;

  return (
    <div
      className={`group relative px-4 py-3.5 rounded-2xl bg-surface-900/95 border backdrop-blur-md transition-all duration-200 shadow-xl min-w-[240px] max-w-[270px] cursor-pointer ${
        selected
          ? 'border-indigo-400 ring-2 ring-indigo-500/60 scale-105 shadow-2xl shadow-indigo-500/25'
          : `${typeCfg.border} hover:shadow-indigo-500/10`
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-surface-950 !-top-1.5"
      />

      {/* Node Header Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${typeCfg.badge}`}>
          <IconComponent className="w-3 h-3" />
          <span>{typeCfg.label}</span>
        </span>

        {data.confidence && (
          <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            data.confidence === 'VERIFIED'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20'
          }`}>
            <span className={`w-1 h-1 rounded-full ${data.confidence === 'VERIFIED' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
            <span>{data.confidence === 'VERIFIED' ? 'VERIFIED' : 'INFERRED'}</span>
          </span>
        )}
      </div>

      {/* Component Title */}
      <div className="font-mono text-xs font-bold text-white truncate" title={data.label}>
        {data.label}
      </div>

      {/* File Path */}
      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={data.filePath}>
        {data.filePath}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-surface-800/80 font-mono">
        <span>{data.metrics?.lines > 0 ? `${data.metrics.lines} lines` : 'External'}</span>
        <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
          <span>Inspect</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-surface-950 !-bottom-1.5"
      />
    </div>
  );
}

const nodeTypes = {
  archNode: ArchitectureNode
};

/**
 * Floating Canvas Action Toolbar (Fit View, Zoom, MiniMap Toggle, Fullscreen)
 */
function CanvasToolbar({ onToggleMiniMap, showMiniMap, onToggleFullscreen, isFullscreen }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-surface-900/95 border border-surface-700/80 shadow-2xl backdrop-blur-md">
      <button
        onClick={() => fitView({ padding: 0.45, duration: 400 })}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
        title="Fit all components on screen"
      >
        <Maximize className="w-3.5 h-3.5" />
        <span>Fit to Screen</span>
      </button>

      <div className="w-[1px] h-4 bg-surface-700" />

      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surface-800 transition-colors"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surface-800 transition-colors"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-surface-700" />

      <button
        onClick={onToggleMiniMap}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          showMiniMap ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
        }`}
        title="Toggle MiniMap"
      >
        <span>MiniMap</span>
      </button>

      <button
        onClick={onToggleFullscreen}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surface-800 transition-colors"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-400" /> : <Maximize2 className="w-4 h-4" />}
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

  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'layers'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // Auto-request architecture on mount if repo is active
  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Compute Generous 2D Grid Layout Positions with ample margin
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];

    const nodesList = architectureData.nodes;

    // Categorize into clear architectural tiers
    const tierGroups = {
      presentation: [], // UI Components & Pages
      logic: [],        // Routes, Controllers, Auth, Services, Scripts
      infrastructure: [] // Databases, Cloud APIs, Configs, Tests
    };

    nodesList.forEach(node => {
      const t = node.type;
      if (t === 'frontend' || t === 'page') {
        tierGroups.presentation.push(node);
      } else if (t === 'route' || t === 'auth' || t === 'service') {
        tierGroups.logic.push(node);
      } else {
        tierGroups.infrastructure.push(node);
      }
    });

    const tiers = [
      { name: 'Presentation Layer', nodes: tierGroups.presentation },
      { name: 'Application Logic Layer', nodes: tierGroups.logic },
      { name: 'Infrastructure & Data Layer', nodes: tierGroups.infrastructure }
    ];

    const result = [];
    const X_SPACING = 300;
    const Y_ROW_SPACING = 170;
    const TIER_MARGIN = 120;

    let currentY = 120; // Generous top margin so top nodes are never cut off

    tiers.forEach(tier => {
      if (tier.nodes.length === 0) return;

      const COLS = Math.min(tier.nodes.length, 3); // Max 3 items per row for balanced horizontal width
      const tierWidth = (COLS - 1) * X_SPACING;
      const startX = Math.max(100, 520 - (tierWidth / 2));

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
            layerName: tier.name
          }
        });
      });

      const rowCount = Math.ceil(tier.nodes.length / COLS);
      currentY += (rowCount * Y_ROW_SPACING) + TIER_MARGIN;
    });

    return result;
  }, [architectureData]);

  // Compute React Flow Edges with verified/inferred styling
  const initialEdges = useMemo(() => {
    if (!architectureData?.edges) return [];

    return architectureData.edges.map(edge => {
      const isVerified = edge.confidence === 'VERIFIED';
      const isLow = edge.confidence === 'LOW CONFIDENCE';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: isVerified,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isVerified ? '#6366f1' : (isLow ? '#f59e0b' : '#818cf8'),
          width: 16,
          height: 16
        },
        style: {
          stroke: isVerified ? '#6366f1' : (isLow ? '#f59e0b' : '#818cf8'),
          strokeWidth: isVerified ? 2 : 1.5,
          strokeDasharray: isVerified ? undefined : (isLow ? '3,3' : '5,5')
        },
        labelStyle: {
          fill: '#cbd5e1',
          fontSize: 10,
          fontFamily: 'monospace'
        },
        labelBgStyle: {
          fill: '#070b12',
          fillOpacity: 0.95
        },
        data: edge
      };
    });
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when data updates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Automatically fit all nodes on screen with 45% padding when nodes load or tab switches to canvas
  useEffect(() => {
    if (nodes.length > 0 && activeTab === 'canvas') {
      const timer = setTimeout(() => {
        fitView({ padding: 0.45, duration: 400 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, activeTab, fitView]);

  // Click Node Inspector
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.data);
  }, []);

  // Background click deselects node
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Set of connected node IDs when a node is selected (for focus highlighting)
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return null;
    const ids = new Set([selectedNode.id]);
    edges.forEach(e => {
      if (e.source === selectedNode.id) ids.add(e.target);
      if (e.target === selectedNode.id) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, edges]);

  // Dynamic counts for category filter pills
  const categoryCounts = useMemo(() => {
    if (!architectureData?.nodes) {
      return { ALL: 0, FRONTEND: 0, BACKEND: 0, DATABASE: 0, EXTERNAL: 0 };
    }
    const list = architectureData.nodes;
    return {
      ALL: list.length,
      FRONTEND: list.filter(n => n.type === 'frontend' || n.type === 'page').length,
      BACKEND: list.filter(n => n.type === 'route' || n.type === 'service' || n.type === 'auth').length,
      DATABASE: list.filter(n => n.type === 'database').length,
      EXTERNAL: list.filter(n => n.type === 'external' || n.type === 'config' || n.type === 'test').length
    };
  }, [architectureData]);

  // Filter & Focus Highlighted Nodes
  const displayNodes = useMemo(() => {
    return nodes.map(n => {
      const matchesSearch = !searchQuery ||
        n.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.filePath?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'ALL' ||
        (selectedFilter === 'FRONTEND' && (n.data.type === 'frontend' || n.data.type === 'page')) ||
        (selectedFilter === 'BACKEND' && (n.data.type === 'route' || n.data.type === 'service' || n.data.type === 'auth')) ||
        (selectedFilter === 'DATABASE' && n.data.type === 'database') ||
        (selectedFilter === 'EXTERNAL' && (n.data.type === 'external' || n.data.type === 'config' || n.data.type === 'test'));

      const isVisible = matchesSearch && matchesFilter;
      const isConnected = !connectedNodeIds || connectedNodeIds.has(n.id);

      return {
        ...n,
        selected: selectedNode?.id === n.id,
        style: {
          ...n.style,
          opacity: isVisible ? (isConnected ? 1 : 0.2) : 0.1,
          pointerEvents: isVisible ? 'all' : 'none',
          transition: 'opacity 0.25s ease'
        }
      };
    });
  }, [nodes, searchQuery, selectedFilter, connectedNodeIds, selectedNode]);

  // Edge Highlighting when a node is selected
  const displayEdges = useMemo(() => {
    return edges.map(e => {
      const isConnected = !selectedNode || e.source === selectedNode.id || e.target === selectedNode.id;
      return {
        ...e,
        animated: isConnected && selectedNode ? true : e.animated,
        style: {
          ...e.style,
          opacity: isConnected ? 1 : 0.12,
          strokeWidth: isConnected && selectedNode ? 2.5 : (e.style?.strokeWidth || 1.5),
          transition: 'opacity 0.25s ease'
        }
      };
    });
  }, [edges, selectedNode]);

  // Handle "Open in Code Viewer"
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

  const verifiedCount = architectureData?.metrics?.verifiedEdges || 0;
  const inferredCount = architectureData?.metrics?.inferredEdges || 0;
  const totalNodesCount = architectureData?.nodes?.length || 0;
  const totalEdgesCount = architectureData?.edges?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Executive Architecture Header & View Mode Switcher */}
      <div className="p-6 rounded-2xl bg-surface-900/90 border border-surface-700/80 backdrop-blur-md shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Layers className="w-4 h-4" />
              <span>Interactive Architecture Map</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                X-Ray View
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {currentRepo.fullName} Topology & Data Flow
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explore component relationships verified from direct imports, API endpoints, and cloud service declarations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Prominent View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-surface-950 border border-surface-750 text-xs shadow-inner">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'canvas'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Interactive Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'layers'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Layered Breakdown</span>
              </button>
            </div>

            {/* Refresh / Re-scan button */}
            <button
              onClick={() => requestArchitecture(true)}
              disabled={isArchitectureLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 text-xs font-medium border border-surface-700 transition-colors disabled:opacity-50"
              title="Re-run architecture scan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isArchitectureLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Re-scan</span>
            </button>
          </div>
        </div>

        {/* 2. Executive Architecture KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Components</span>
              <span className="font-mono text-base font-bold text-white">{totalNodesCount} Modules</span>
              <span className="text-[10px] text-slate-500 block truncate">Discovered in tree</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Verified Links</span>
              <span className="font-mono text-base font-bold text-emerald-400">{verifiedCount} Direct Imports</span>
              <span className="text-[10px] text-emerald-400/80 block truncate">100% Static Proof</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Inferred Flows</span>
              <span className="font-mono text-base font-bold text-indigo-300">{inferredCount} Logical Flows</span>
              <span className="text-[10px] text-indigo-400/80 block truncate">AI architecture pattern</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-950/70 border border-surface-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Total Connections</span>
              <span className="font-mono text-base font-bold text-amber-400">{totalEdgesCount} Relationships</span>
              <span className="text-[10px] text-slate-500 block truncate">Across entire stack</span>
            </div>
          </div>
        </div>

        {/* 3. Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-surface-800/60">
          {/* Category Filter Pills with Item Counts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-semibold text-[11px] mr-1">Layer:</span>
            {[
              { id: 'ALL', label: 'All', count: categoryCounts.ALL },
              { id: 'FRONTEND', label: 'UI & Pages', count: categoryCounts.FRONTEND },
              { id: 'BACKEND', label: 'Logic & Services', count: categoryCounts.BACKEND },
              { id: 'DATABASE', label: 'Database', count: categoryCounts.DATABASE },
              { id: 'EXTERNAL', label: 'External & Config', count: categoryCounts.EXTERNAL },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface-950 border border-surface-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedFilter === f.id ? 'bg-indigo-700 text-white' : 'bg-surface-850 text-slate-400'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter components by name or path..."
              className="pl-8 pr-8 py-1.5 rounded-xl bg-surface-950 border border-surface-750 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Navigation Tip Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-950/25 border border-indigo-500/20 text-xs text-indigo-300">
        <div className="flex items-center gap-2.5">
          <MousePointer className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Interactive Map Tips:</strong> Click any component to highlight its dependencies • Mouse wheel scrolls page naturally • Drag background to pan.
          </span>
        </div>
        <button
          onClick={() => fitView({ padding: 0.45, duration: 300 })}
          className="hidden sm:inline-flex items-center gap-1 font-semibold text-indigo-400 hover:underline shrink-0"
        >
          <span>Fit Screen</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* VIEW 1: Interactive Canvas Mode */}
      {activeTab === 'canvas' ? (
        <div
          className={`relative w-full rounded-2xl bg-surface-950 border border-surface-700/80 overflow-hidden shadow-2xl transition-all ${
            isFullscreen
              ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]'
              : 'h-[720px]'
          }`}
        >
          {isArchitectureLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/80 backdrop-blur-sm z-30">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-200">Extracting architectural topology and connections...</p>
              <p className="text-xs text-slate-500 mt-1">Parsing imports, routes, and ORM references</p>
            </div>
          ) : architectureError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30">
              <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
              <p className="text-sm font-semibold text-rose-300">{architectureError}</p>
              <button
                onClick={() => requestArchitecture(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
              >
                Retry Architecture Scan
              </button>
            </div>
          ) : null}

          {/* Floating Canvas Controls Toolbar */}
          <CanvasToolbar
            onToggleMiniMap={() => setShowMiniMap(prev => !prev)}
            showMiniMap={showMiniMap}
            onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
            isFullscreen={isFullscreen}
          />

          {/* React Flow Canvas */}
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.45, maxZoom: 1, minZoom: 0.5 }}
            panOnScroll={false} // Mouse wheel scrolls the page smoothly without cursor trapping!
            zoomOnScroll={false} // Prevents accidental scroll wheel zooming!
            zoomOnPinch={true}
            preventScrolling={false} // Page scrolls naturally when cursor is over canvas
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
                nodeStrokeColor="#6366f1"
                nodeColor="#1e1b4b"
                maskColor="rgba(7, 11, 18, 0.85)"
                className="rounded-xl border border-surface-700 !bg-surface-900 shadow-2xl !w-44 !h-32 mb-14 mr-4"
              />
            )}
          </ReactFlow>

          {/* Compact Legend Bar (Bottom Left) */}
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-surface-900/95 border border-surface-700/80 backdrop-blur-md shadow-lg text-xs pointer-events-auto">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-indigo-500 inline-block"></span>
              <span className="text-slate-200 font-mono text-[11px]">VERIFIED (Direct Import)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t border-dashed border-indigo-400 inline-block"></span>
              <span className="text-slate-400 font-mono text-[11px]">INFERRED (Flow)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t border-dotted border-amber-400 inline-block"></span>
              <span className="text-amber-400/90 font-mono text-[11px]">LOW CONFIDENCE</span>
            </div>
          </div>

          {/* Node Details Inspector Drawer */}
          {selectedNode && (
            <div className="absolute top-16 right-4 w-96 max-w-sm p-5 rounded-2xl bg-surface-900/95 border border-surface-700/80 backdrop-blur-md shadow-2xl z-30 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold">
                    {selectedNode.type}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1 break-all">
                    {selectedNode.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
                  title="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-semibold mb-0.5">
                    <span>Source File Path</span>
                    <button
                      onClick={() => handleCopyFilePath(selectedNode.filePath)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 normal-case"
                    >
                      {copiedFile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="font-mono text-indigo-300 break-all select-all block bg-surface-950 p-2.5 rounded-lg border border-surface-800">
                    {selectedNode.filePath}
                  </span>
                </div>

                {selectedNode.metrics?.lines > 0 && (
                  <div className="flex items-center gap-4 py-2 border-y border-surface-700/60">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-semibold">Lines of Code</span>
                      <span className="font-mono text-slate-200 font-bold">{selectedNode.metrics.lines}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-semibold">Confidence</span>
                      <span className="font-mono text-emerald-400 font-semibold">{selectedNode.confidence}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-semibold">Layer</span>
                      <span className="font-mono text-slate-300">{selectedNode.layerName || 'Application'}</span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Role & Purpose</span>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-surface-950/60 p-2.5 rounded-lg border border-surface-800">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Connected Relationships List for Selected Node */}
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                    Connected Dependencies ({edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map(e => {
                        const isOutbound = e.source === selectedNode.id;
                        const otherNodeId = isOutbound ? e.target : e.source;
                        const otherNode = nodes.find(n => n.id === otherNodeId);

                        return (
                          <div
                            key={e.id}
                            className="p-2 rounded-lg bg-surface-950 border border-surface-800/80 text-[11px] flex items-center justify-between"
                          >
                            <span className="font-mono text-slate-300 truncate max-w-[170px]" title={otherNode?.data?.label || otherNodeId}>
                              {isOutbound ? `→ ${otherNode?.data?.label || otherNodeId}` : `← ${otherNode?.data?.label || otherNodeId}`}
                            </span>
                            <span className="font-mono text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              {e.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {selectedNode.filePath !== 'External Cloud / API Service' && (
                  <button
                    onClick={() => handleOpenInViewer(selectedNode.filePath)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/30"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open in Code Viewer</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Layered Architecture Flow Explainer (100% Readable & Simple) */
        <div className="space-y-6">
          {/* Architectural Overview Explainer */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-white">How DevLens Analyzes Your Architecture</h4>
              <p className="mt-1 text-slate-300 leading-relaxed">
                DevLens parses import trees, routing tables, and API declarations across the repository. Below is your system decomposed into clean functional tiers. You can inspect any file or trace exact data flows between layers.
              </p>
            </div>
          </div>

          {/* Presentation Layer */}
          <div className="p-6 rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">1. Presentation & UI Layer</h3>
                  <p className="text-xs text-slate-400">User interface components, pages, and client views</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-surface-950 font-mono text-[11px] text-slate-400 border border-surface-800">
                {architectureData?.nodes?.filter(n => n.type === 'frontend' || n.type === 'page').length || 0} Components
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {architectureData?.nodes
                ?.filter(n => n.type === 'frontend' || n.type === 'page')
                .map(node => (
                  <div
                    key={node.id}
                    className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white truncate max-w-[170px]" title={node.label}>
                          {node.label}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {node.confidence}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                        {node.filePath}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-surface-850 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-500">{node.metrics?.lines} lines</span>
                      <button
                        onClick={() => handleOpenInViewer(node.filePath)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
                      >
                        <span>Inspect Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Logic & Services Layer */}
          <div className="p-6 rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">2. Application Logic & Services Layer</h3>
                  <p className="text-xs text-slate-400">API endpoints, controllers, business services, and processing scripts</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-surface-950 font-mono text-[11px] text-slate-400 border border-surface-800">
                {architectureData?.nodes?.filter(n => n.type === 'route' || n.type === 'service' || n.type === 'auth').length || 0} Modules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {architectureData?.nodes
                ?.filter(n => n.type === 'route' || n.type === 'service' || n.type === 'auth')
                .map(node => (
                  <div
                    key={node.id}
                    className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white truncate max-w-[170px]" title={node.label}>
                          {node.label}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          {node.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                        {node.filePath}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-surface-850 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-500">{node.metrics?.lines} lines</span>
                      <button
                        onClick={() => handleOpenInViewer(node.filePath)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
                      >
                        <span>Inspect Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Infrastructure & Data Layer */}
          <div className="p-6 rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">3. Infrastructure, Database & Integrations</h3>
                  <p className="text-xs text-slate-400">Database schemas, external cloud APIs, configurations, and test suites</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-surface-950 font-mono text-[11px] text-slate-400 border border-surface-800">
                {architectureData?.nodes?.filter(n => n.type === 'database' || n.type === 'external' || n.type === 'config' || n.type === 'test').length || 0} Targets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {architectureData?.nodes
                ?.filter(n => n.type === 'database' || n.type === 'external' || n.type === 'config' || n.type === 'test')
                .map(node => (
                  <div
                    key={node.id}
                    className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white truncate max-w-[170px]" title={node.label}>
                          {node.label}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {node.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                        {node.filePath}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-surface-850 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-500">{node.metrics?.lines || 0} lines</span>
                      {node.filePath !== 'External Cloud / API Service' ? (
                        <button
                          onClick={() => handleOpenInViewer(node.filePath)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
                        >
                          <span>Inspect Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Cloud Service</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Architecture Relationships & Data Flow Matrix */}
          {architectureData?.edges && architectureData.edges.length > 0 && (
            <div className="p-6 rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span>Verified Architectural Connections & Evidence</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How components communicate and pass data across the system
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-surface-950 font-mono text-[11px] text-indigo-300 border border-surface-800">
                  {architectureData.edges.length} Relationships
                </span>
              </div>

              <div className="space-y-2">
                {architectureData.edges.map(edge => {
                  const sourceNode = architectureData.nodes.find(n => n.id === edge.source);
                  const targetNode = architectureData.nodes.find(n => n.id === edge.target);

                  return (
                    <div
                      key={edge.id}
                      className="p-3 rounded-xl bg-surface-950 border border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-mono flex-wrap">
                        <span className="text-white font-bold">{sourceNode?.label || edge.source}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">
                          {edge.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-indigo-400 font-bold">{targetNode?.label || edge.target}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 italic truncate max-w-sm">
                          {edge.evidence}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          edge.confidence === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {edge.confidence}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
