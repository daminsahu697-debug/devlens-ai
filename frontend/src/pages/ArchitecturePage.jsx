/**
 * DevLens AI - Feature 1: Interactive Architecture Map (X-Ray View)
 * Renders an interactive React Flow topology map with custom dark theme nodes,
 * balanced multi-column grid layout, confidence metrics, and a component directory.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
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
  List,
  Network
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';

// Node classification styling and icons
const TYPE_CONFIG = {
  frontend: {
    border: 'border-sky-500/60',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: Code2,
    label: 'Frontend'
  },
  page: {
    border: 'border-blue-500/60',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Code2,
    label: 'Page'
  },
  route: {
    border: 'border-indigo-500/60',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: Layers,
    label: 'API Route'
  },
  service: {
    border: 'border-violet-500/60',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: Layers,
    label: 'Service'
  },
  database: {
    border: 'border-emerald-500/60',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: Database,
    label: 'Database'
  },
  external: {
    border: 'border-amber-500/60',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Cloud,
    label: 'External API'
  },
  auth: {
    border: 'border-rose-500/60',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: ShieldCheck,
    label: 'Auth'
  },
  config: {
    border: 'border-slate-500/60',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    icon: FileCode,
    label: 'Config'
  },
  test: {
    border: 'border-teal-500/60',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
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
      className={`px-4 py-3 rounded-2xl bg-surface-900 border transition-all duration-200 shadow-xl min-w-[220px] max-w-[260px] cursor-pointer ${
        selected
          ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
          : `${typeCfg.border} hover:border-indigo-400`
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-surface-900"
      />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${typeCfg.badge}`}>
          <IconComponent className="w-3 h-3" />
          <span>{typeCfg.label}</span>
        </span>
        {data.confidence && (
          <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
            data.confidence === 'VERIFIED'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-indigo-300 bg-indigo-500/10'
          }`}>
            {data.confidence === 'VERIFIED' ? 'VERIFIED' : 'INFERRED'}
          </span>
        )}
      </div>

      <div className="font-mono text-xs font-bold text-white truncate" title={data.label}>
        {data.label}
      </div>

      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={data.filePath}>
        {data.filePath}
      </div>

      {data.metrics?.lines > 0 && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-surface-800 font-mono">
          <span>{data.metrics.lines} lines</span>
          <span className="text-indigo-400 font-semibold hover:underline">Inspect →</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-surface-900"
      />
    </div>
  );
}

// Register custom node types with React Flow
const nodeTypes = {
  archNode: ArchitectureNode
};

export default function ArchitecturePage() {
  const {
    currentRepo,
    architectureData,
    isArchitectureLoading,
    architectureError,
    requestArchitecture,
    selectFile
  } = useRepository();

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);

  // Auto-request architecture on mount if repo active and not yet loaded
  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Compute Balanced 2D Grid Layout Positions
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];

    const nodesList = architectureData.nodes;

    // Divide nodes into 4 clear architectural tiers
    const tierGroups = {
      layer0: [], // Frontend / Pages
      layer1: [], // Routes / Controllers / Auth
      layer2: [], // Services / Core Logic
      layer3: []  // Database / External / Config / Tests
    };

    nodesList.forEach(node => {
      const t = node.type;
      if (t === 'frontend' || t === 'page') tierGroups.layer0.push(node);
      else if (t === 'route' || t === 'auth') tierGroups.layer1.push(node);
      else if (t === 'service') tierGroups.layer2.push(node);
      else tierGroups.layer3.push(node);
    });

    const layers = [
      tierGroups.layer0,
      tierGroups.layer1,
      tierGroups.layer2,
      tierGroups.layer3
    ];

    const result = [];
    const X_SPACING = 270;
    const Y_ROW_SPACING = 120;
    const LAYER_GAP = 60;

    let currentY = 50;

    layers.forEach(layerNodes => {
      if (layerNodes.length === 0) return;

      // Wrap layer into rows of at most 3-4 columns
      const COLS = Math.min(layerNodes.length, 3);
      const layerWidth = (COLS - 1) * X_SPACING;
      const startX = Math.max(50, 450 - (layerWidth / 2));

      layerNodes.forEach((node, idx) => {
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

      const rowCount = Math.ceil(layerNodes.length / COLS);
      currentY += (rowCount * Y_ROW_SPACING) + LAYER_GAP;
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
          color: isVerified ? '#6366f1' : (isLow ? '#f59e0b' : '#818cf8')
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
          fill: '#0f172a',
          fillOpacity: 0.9
        },
        data: edge
      };
    });
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when data loads
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Node Click Inspector
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.data);
  }, []);

  // Filter nodes based on category & search query
  const filteredNodes = useMemo(() => {
    return nodes.map(n => {
      const matchesSearch = !searchQuery ||
        n.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.filePath?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'ALL' ||
        (selectedFilter === 'FRONTEND' && (n.data.type === 'frontend' || n.data.type === 'page')) ||
        (selectedFilter === 'BACKEND' && (n.data.type === 'route' || n.data.type === 'service' || n.data.type === 'auth')) ||
        (selectedFilter === 'DATABASE' && n.data.type === 'database') ||
        (selectedFilter === 'EXTERNAL' && n.data.type === 'external') ||
        (selectedFilter === 'TESTS' && n.data.type === 'test');

      const isVisible = matchesSearch && matchesFilter;

      return {
        ...n,
        style: {
          ...n.style,
          opacity: isVisible ? 1 : 0.2,
          pointerEvents: isVisible ? 'all' : 'none'
        }
      };
    });
  }, [nodes, searchQuery, selectedFilter]);

  // Filtered Component List (for Directory view)
  const filteredComponentList = useMemo(() => {
    if (!architectureData?.nodes) return [];
    return architectureData.nodes.filter(n => {
      const matchesSearch = !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.filePath.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = selectedFilter === 'ALL' ||
        (selectedFilter === 'FRONTEND' && (n.type === 'frontend' || n.type === 'page')) ||
        (selectedFilter === 'BACKEND' && (n.type === 'route' || n.type === 'service' || n.type === 'auth')) ||
        (selectedFilter === 'DATABASE' && n.type === 'database') ||
        (selectedFilter === 'EXTERNAL' && n.type === 'external') ||
        (selectedFilter === 'TESTS' && n.type === 'test');

      return matchesSearch && matchesFilter;
    });
  }, [architectureData, searchQuery, selectedFilter]);

  // Handle "Open in Code Viewer"
  const handleOpenInViewer = (filePath) => {
    selectFile(filePath);
    navigate('/analyzer');
  };

  if (!currentRepo) {
    return (
      <EmptyState
        title="No Repository Analyzed"
        description="Enter a GitHub repository URL on the dashboard to generate an interactive X-Ray Architecture Map."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Layers className="w-4 h-4" />
            <span>Interactive Architecture Map</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
              X-Ray View
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            {currentRepo.fullName} Architecture Topology
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified static imports, API routes, and ORM schemas with confidence scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle: Canvas vs Directory List */}
          <div className="flex items-center p-1 rounded-xl bg-surface-950 border border-surface-700/80 text-xs">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'canvas'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Canvas Topology</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Component List ({architectureData?.nodes?.length || 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components or files..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-950 border border-surface-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-surface-950 border border-surface-700/80 text-xs">
            {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'EXTERNAL'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedFilter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => requestArchitecture(true)}
            disabled={isArchitectureLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-medium border border-surface-700 transition-colors disabled:opacity-50"
            title="Re-run architecture scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isArchitectureLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main View: Canvas Topology vs Component Directory */}
      {viewMode === 'canvas' ? (
        <div className="relative h-[680px] w-full rounded-2xl bg-surface-950 border border-surface-700/80 overflow-hidden shadow-2xl">
          {isArchitectureLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/80 backdrop-blur-sm z-20">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-200">Analyzing imports, API routes, and ORM models...</p>
              <p className="text-xs text-slate-500 mt-1">Extracting architectural topology and confidence tiers</p>
            </div>
          ) : architectureError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
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

          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
            attributionPosition="bottom-left"
            minZoom={0.4}
            maxZoom={2}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-surface-900 border border-surface-700 text-slate-300 fill-slate-300" />
            <MiniMap
              nodeStrokeColor="#6366f1"
              nodeColor="#1e1b4b"
              maskColor="rgba(7, 11, 18, 0.85)"
              className="rounded-xl border border-surface-700 !bg-surface-900"
            />
          </ReactFlow>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 p-3.5 rounded-xl bg-surface-900/90 border border-surface-700/80 backdrop-blur-md shadow-lg text-xs space-y-2 pointer-events-auto">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Relationship Confidence
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-indigo-500 inline-block"></span>
              <span className="text-slate-300 font-mono text-[11px]">VERIFIED (Direct Import / Exact Route)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 border-t border-dashed border-indigo-400 inline-block"></span>
              <span className="text-slate-400 font-mono text-[11px]">INFERRED (Controller / Model Flow)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 border-t border-dotted border-amber-400 inline-block"></span>
              <span className="text-amber-400/90 font-mono text-[11px]">LOW CONFIDENCE (Probabilistic)</span>
            </div>
          </div>

          {/* Node Details Drawer */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-84 max-w-sm p-5 rounded-2xl bg-surface-900/95 border border-surface-700/80 backdrop-blur-md shadow-2xl z-30 animate-in fade-in slide-in-from-right-4">
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
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Source File Path</span>
                  <span className="font-mono text-indigo-300 break-all select-all">{selectedNode.filePath}</span>
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
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Role & Description</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedNode.description}</p>
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
        /* Component Directory Table View */
        <div className="rounded-2xl bg-surface-900/80 border border-surface-700/80 backdrop-blur-md overflow-hidden shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">
              Component Directory ({filteredComponentList.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click any component to inspect and open in source viewer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredComponentList.map(node => {
              const typeCfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.service;
              const IconComponent = typeCfg.icon;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="p-4 rounded-xl bg-surface-950 border border-surface-800 hover:border-indigo-500/60 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${typeCfg.badge}`}>
                        <IconComponent className="w-3 h-3" />
                        <span>{typeCfg.label}</span>
                      </span>
                      {node.metrics?.lines > 0 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {node.metrics.lines} lines
                        </span>
                      )}
                    </div>

                    <h4 className="font-mono text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {node.label}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {node.filePath}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-surface-850 flex items-center justify-between text-xs text-indigo-400">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">{node.confidence}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInViewer(node.filePath);
                      }}
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
