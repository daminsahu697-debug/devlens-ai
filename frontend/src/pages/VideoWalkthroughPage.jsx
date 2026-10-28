/**
 * DevLens AI - Video Walkthrough Page
 * Displays the complete AI-generated audiovisual video explainer of the repository,
 * easy-to-understand narration modes, interactive color palette selector,
 * interactive chapter scrubber, spoken transcript, and slide deck inspector.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Sparkles,
  Layers,
  Shield,
  Terminal,
  FileText,
  Copy,
  Check,
  RefreshCw,
  PlayCircle,
  ExternalLink,
  Clock,
  Volume2,
  Share2,
  Code2,
  CheckCircle2,
  ListOrdered,
  Palette,
  Sliders,
  BookOpen,
  Zap
} from 'lucide-react';
import { useRepository } from '../context/RepositoryContext';
import VideoPlayer from '../components/VideoPlayer';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const COLOR_PALETTES = [
  { id: 'sky', label: 'Ocean Sky', bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  { id: 'emerald', label: 'Emerald Mint', bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'violet', label: 'Electric Violet', bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  { id: 'rose', label: 'Sunset Rose', bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  { id: 'amber', label: 'Solar Amber', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400' },
];

export default function VideoWalkthroughPage() {
  const {
    currentRepo,
    videoData,
    isVideoLoading,
    videoError,
    requestVideoScript,
    analyze,
    accentColor,
    setAccentColor
  } = useRepository();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' | 'transcript' | 'slides'
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [selectedNarrationMode, setSelectedNarrationMode] = useState('simple'); // 'simple' | 'technical' | 'quick'

  // Auto-fetch video presentation when repository is active and not yet loaded
  useEffect(() => {
    if (currentRepo && !videoData && !isVideoLoading && !videoError) {
      requestVideoScript(false, selectedNarrationMode).catch(() => {});
    }
  }, [currentRepo, videoData, isVideoLoading, videoError, selectedNarrationMode]);

  // Handle switching narration tone
  const handleModeChange = (mode) => {
    setSelectedNarrationMode(mode);
    requestVideoScript(true, mode).catch(() => {});
  };

  // Copy full spoken script
  const handleCopyTranscript = () => {
    if (!videoData?.chapters) return;
    const fullText = videoData.chapters
      .map(ch => `[Chapter ${ch.chapterNumber}: ${ch.title}]\n${ch.narration}\n`)
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // 1. If No Repository is loaded
  if (!currentRepo) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-200 dark:border-rose-800">
              NEW FEATURE
            </span>
            <span className="text-xs text-slate-500 font-mono">Audio-Visual Explainer Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Video Walkthrough & Repository Explainer
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Generate an automated video presentation with voice narration explaining any repository's architecture and setup in plain, easy-to-understand language.
          </p>
        </div>

        <EmptyState
          onSelectSample={(url) => {
            analyze(url).then(() => {
              navigate('/video');
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-surface-900 border border-surface-750 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Video className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              AI VIDEO EXPLAINER
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Target: <strong className="text-slate-800 dark:text-slate-200">{currentRepo.fullName}</strong>
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Repository Video Summary & Explainer
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            An easy-to-understand, 6-chapter audio-visual presentation with synchronized voiceover explaining what this project does, how it works, and how you can run it.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto">
          <button
            onClick={() => requestVideoScript(true, selectedNarrationMode)}
            disabled={isVideoLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-750 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isVideoLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Video</span>
          </button>
        </div>
      </div>

      {/* Control Strip: Language Tone & Color Palette Bar */}
      <div className="bg-surface-900 border border-surface-750 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Language & Explanation Style */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold mr-1">
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>Language Style:</span>
          </div>
          {[
            { id: 'simple', label: 'Simple & Clear (Beginner)', icon: Sparkles },
            { id: 'technical', label: 'Technical Deep Dive', icon: Layers },
            { id: 'quick', label: 'Quick 60s Summary', icon: Zap },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedNarrationMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-surface-800 hover:bg-surface-750 border border-surface-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Color Palette Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold mr-1">
            <Palette className="w-4 h-4 text-sky-500" />
            <span>Color Palette:</span>
          </div>
          {COLOR_PALETTES.map((p) => {
            const isSelected = accentColor === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setAccentColor(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-surface-800 text-slate-900 dark:text-white font-bold border-slate-400 dark:border-slate-500 shadow-sm ring-1 ring-slate-400/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-surface-800 border-surface-750'
                }`}
                title={`Select ${p.label} theme`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${p.bg}`} />
                <span>{p.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {videoError && (
        <ErrorMessage
          title="Video Script Generation Failed"
          message={videoError}
          code="VIDEO_GENERATION_ERROR"
          onRetry={() => requestVideoScript(true, selectedNarrationMode)}
        />
      )}

      {/* Loading Skeleton */}
      {isVideoLoading && !videoData && (
        <div className="space-y-4">
          <div className="w-full aspect-video rounded-3xl bg-surface-900 border border-surface-750 animate-pulse flex flex-col items-center justify-center p-8 text-center shadow-md">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Synthesizing Plain-English Video Presentation...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Drafting friendly narration chapters, organizing verified tech stack cards, and preparing audio playback.
            </p>
          </div>
        </div>
      )}

      {/* Video Presentation Section */}
      {videoData && (
        <div className="space-y-8">
          {/* Main Cinema Player */}
          <VideoPlayer
            presentation={videoData}
            onChapterChange={(idx) => setActiveChapterIndex(idx)}
          />

          {/* Quick Specs Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-900 border border-surface-750 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Duration</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ~{Math.round(videoData.totalDurationSeconds / 60)} Minutes ({videoData.totalDurationSeconds}s)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-900 border border-surface-750 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Chapters</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {videoData.totalChapters} In-Depth Sections
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-900 border border-surface-750 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Audio Narration</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Spoken English (TTS)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-900 border border-surface-750 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Video Stage</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  1080p 16:9 Canvas
                </span>
              </div>
            </div>
          </div>

          {/* Deep Exploration Tabs */}
          <div className="bg-surface-900 border border-surface-750 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-surface-750 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'chapters'
                      ? 'bg-rose-50 dark:bg-surface-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-surface-700 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Video Chapters ({videoData.chapters.length})
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'transcript'
                      ? 'bg-rose-50 dark:bg-surface-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-surface-700 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Full Narration Script
                </button>

                <button
                  onClick={() => setActiveTab('slides')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'slides'
                      ? 'bg-rose-50 dark:bg-surface-800 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-surface-700 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Slide Deck Viewer
                </button>
              </div>

              {activeTab === 'transcript' && (
                <button
                  onClick={handleCopyTranscript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-surface-800 border border-surface-750 transition-colors shadow-sm"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Full Transcript</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* TAB 1: CHAPTERS LIST */}
            {activeTab === 'chapters' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoData.chapters.map((ch, idx) => {
                    const isSelected = activeChapterIndex === idx;
                    return (
                      <div
                        key={ch.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-rose-50/50 dark:bg-surface-850 border-rose-300 dark:border-rose-700 shadow-md ring-1 ring-rose-400/20'
                            : 'bg-white dark:bg-surface-950 border-slate-200 dark:border-surface-750 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-surface-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-surface-700">
                            Chapter {ch.chapterNumber} • {ch.durationSeconds}s
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase animate-pulse">
                              Active in Player
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                          {ch.subtitle}
                        </p>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-surface-750 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic mb-3">
                          "{ch.narration.slice(0, 150)}..."
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-surface-750/60 text-[10px] font-mono text-slate-500">
                          <span>Visual Layout: {ch.visual?.layout?.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: FULL NARRATION SCRIPT */}
            {activeTab === 'transcript' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>
                    This script is written in clean, plain English and narrated aloud by the browser voice engine during playback.
                  </span>
                </div>

                <div className="space-y-6 divide-y divide-surface-750">
                  {videoData.chapters.map((ch) => (
                    <div key={ch.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                          [{ch.title}]
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({ch.durationSeconds} seconds)
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed pl-3 border-l-2 border-rose-400 dark:border-rose-600">
                        {ch.narration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SLIDE DECK INSPECTOR */}
            {activeTab === 'slides' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videoData.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-6 rounded-3xl bg-white dark:bg-surface-950 border border-slate-200 dark:border-surface-700 shadow-md space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-surface-800">
                        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase">
                          Slide #{ch.chapterNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {ch.visual?.layout} layout
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {ch.visual?.headline || ch.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {ch.visual?.tagline}
                        </p>
                      </div>

                      {ch.visual?.badges && (
                        <div className="grid grid-cols-2 gap-2">
                          {ch.visual.badges.map((b, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-surface-800">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">{b.label}</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">{b.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ch.visual?.stackItems && (
                        <div className="grid grid-cols-2 gap-2">
                          {ch.visual.stackItems.map((s, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-surface-800">
                              <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold block">{s.layer}</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5 truncate">{s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ch.visual?.steps && (
                        <div className="space-y-1.5">
                          {ch.visual.steps.map((st) => (
                            <div key={st.step} className="p-2 rounded-xl bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-surface-800 flex items-center gap-2 text-xs text-slate-900 dark:text-white">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                {st.step}
                              </span>
                              <span className="font-semibold">{st.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ch.visual?.commands && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
                          {ch.visual.commands.map((c, i) => (
                            <div key={i}>$ {c.cmd}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
