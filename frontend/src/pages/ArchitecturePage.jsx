/**
 * DevLens AI - Feature 1: Interactive Architecture Map (X-Ray View)
 * Renders an interactive React Flow diagram of repository components,
 * showing verified vs inferred relationships, filters, search, and a node inspector.
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
  MarkerType
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
  Maximize2
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Custom Node Colors and Icons
const TYPE_CONFIG = {
  frontend: { color: 'border-sky-500/80 bg-sky-950/70 text-sky-300', icon: Code2, label: 'Frontend' },
  page: { color: 'border-blue-500/80 bg-blue-950/70 text-blue-300', icon: Code2, label: 'Page' },
  route: { color: 'border-indigo-500/80 bg-indigo-950/70 text-indigo-300', icon: Layers, label: 'API Route' },
  service: { color: 'border-violet-500/80 bg-violet-950/70 text-violet-300', icon: Layers, label: 'Service' },
  database: { color: 'border-emerald-500/80 bg-emerald-950/70 text-emerald-300', icon: Database, label: 'Database' },
  external: { color: 'border-amber-500/80 bg-amber-950/70 text-amber-300', icon: Cloud, label: 'External API' },
  auth: { color: 'border-rose-500/80 bg-rose-950/70 text-rose-300', icon: ShieldCheck, label: 'Auth' },
  config: { color: 'border-slate-500/80 bg-slate-900/80 text-slate-300', icon: FileCode, label: 'Config' },
  test: { color: 'border-teal-500/80 bg-teal-950/70 text-teal-300', icon: CheckCircle2, label: 'Test' }
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);

  // Auto-request architecture on mount if repo active and not yet loaded
  useEffect(() => {
    if (currentRepo && !architectureData && !isArchitectureLoading && !architectureError) {
      requestArchitecture();
    }
  }, [currentRepo, architectureData, isArchitectureLoading, architectureError]);

  // Compute Layout Positions for React Flow Nodes
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes) return [];

    const nodesList = architectureData.nodes;
    // Organize nodes into 4 horizontal tiers: Config/External (top), Frontend (upper), Backend/Routes (middle), Services/DB (bottom)
    const tierGroups = {
      external: [],
      config: [],
      frontend: [],
      page: [],
      route: [],
      service: [],
      auth: [],
      database: [],
      test: []
    };

    nodesList.forEach(n => {
      if (tierGroups[n.type]) {
        tierGroups[n.type].push(n);
      } else {
        tierGroups.service.push(n);
      }
    });

    const orderedTiers = [
      [...tierGroups.frontend, ...tierGroups.page],
      [...tierGroups.route, ...tierGroups.auth],
      [...tierGroups.service, ...tierGroups.database],
      [...tierGroups.external, ...tierGroups.config, ...tierGroups.test]
    ];

    const result = [];
    const X_SPACING = 240;
    const Y_SPACING = 150;

    orderedTiers.forEach((tier, tierIdx) => {
      const tierWidth = (tier.length - 1) * X_SPACING;
      const startX = -tierWidth / 2;

      tier.forEach((node, nodeIdx) => {
        const typeCfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.service;
        const IconComponent = typeCfg.icon;

        result.push({
          id: node.id,
          position: {
            x: startX + (nodeIdx * X_SPACING) + 400,
            y: (tierIdx * Y_SPACING) + 80
          },
          data: {
            ...node,
            label: (
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="truncate font-mono text-xs">{node.label}</span>
              </div>
            )
          },
          className: `px-3.5 py-2.5 rounded-xl border shadow-lg cursor-pointer transition-all hover:scale-105 ${typeCfg.color}`
        });
      });
    });

    return result;
  }, [architectureData]);

  // Compute React Flow Edges
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
          fill: '#94a3b8',
          fontSize: 10,
          fontFamily: 'monospace'
        },
        labelBgStyle: {
          fill: '#0f172a',
          fillOpacity: 0.85
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
        n.data.label?.props?.children?.[1]?.props?.children?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components or files..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-950 border border-surface-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-surface-950 border border-surface-700/80 text-xs">
            {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'EXTERNAL', 'TESTS'].map((f) => (
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

      {/* Main Canvas Area */}
      <div className="relative h-[650px] w-full rounded-2xl bg-surface-950 border border-surface-700/80 overflow-hidden shadow-2xl">
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={2}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-surface-900 border border-surface-700 text-slate-300 fill-slate-300" />
          <MiniMap
            nodeStrokeColor="#6366f1"
            nodeColor="#1e1b4b"
            maskColor="rgba(15, 23, 42, 0.8)"
            className="rounded-xl border border-surface-700 bg-surface-950"
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
    </div>
  );
}
