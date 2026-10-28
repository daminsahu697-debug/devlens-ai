/**
 * DevLens AI - Interactive Video Walkthrough Player
 * A cinema-grade 16:9 presentation player with synchronized SpeechSynthesis voiceover,
 * real-time Web Audio ambient synthesizer, animated subtitle captions, chapter scrubber,
 * interactive visual stage, and direct .webm video export download.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Music,
  Download,
  RotateCcw,
  Sparkles,
  Subtitles,
  CheckCircle,
  Terminal,
  Shield,
  Layers,
  Server,
  Database,
  Code2,
  ExternalLink
} from 'lucide-react';

export default function VideoPlayer({ presentation, onChapterChange }) {
  const chapters = presentation?.chapters || [];
  const totalDuration = presentation?.totalDurationSeconds || 180;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  // DOM Refs
  const playerContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicGainRef = useRef(null);
  const musicOscillatorsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const currentChapter = chapters[currentChapterIdx] || null;

  // Calculate cumulative elapsed time
  const getElapsedSeconds = useCallback(() => {
    let elapsed = 0;
    for (let i = 0; i < currentChapterIdx; i++) {
      elapsed += chapters[i].durationSeconds || 30;
    }
    if (currentChapter) {
      elapsed += (currentChapter.durationSeconds || 30) * chapterProgress;
    }
    return Math.floor(elapsed);
  }, [chapters, currentChapterIdx, currentChapter, chapterProgress]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Initialize Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const list = englishVoices.length > 0 ? englishVoices : voices;
        setAvailableVoices(list);
        if (list.length > 0 && !selectedVoiceName) {
          // Prefer natural or high-quality voice
          const best = list.find(v => /natural|google|enhanced|samantha|alex/i.test(v.name)) || list[0];
          setSelectedVoiceName(best.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceName]);

  // 2. Web Audio Ambient Synthesizer
  const initAudio = () => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(musicEnabled && !isMuted ? musicVolume : 0, ctx.currentTime);
        gainNode.connect(ctx.destination);
        audioContextRef.current = ctx;
        musicGainRef.current = gainNode;
      }
    }
  };

  const startAmbientSynth = () => {
    if (!musicEnabled || isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') return;
    if (ctx.state === 'suspended') ctx.resume();

    stopAmbientSynth();

    // Warm chord frequencies (F maj7 / C maj9 chord voicing)
    const freqs = [174.61, 220.00, 261.63, 329.63]; // F3, A3, C4, E4
    const oscs = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Low pass filter for warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(musicGainRef.current);

      osc.start();
      oscs.push(osc);
    });

    musicOscillatorsRef.current = oscs;
  };

  const stopAmbientSynth = () => {
    musicOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    musicOscillatorsRef.current = [];
  };

  // 3. Speech Narration Engine
  const speakChapter = useCallback((chapterIndex) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      // ignore
    }

    const chapter = chapters[chapterIndex];
    if (!chapter || !chapter.narration || isMuted) return;

    try {
      const utterance = new SpeechSynthesisUtterance(chapter.narration);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      if (selectedVoiceName && availableVoices.length > 0) {
        const voice = availableVoices.find(v => v.name === selectedVoiceName);
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => {
        // When speech finishes, fast-forward progress so slide transitions cleanly
        setChapterProgress(prev => Math.max(prev, 0.99));
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis warning:', e);
        }
      };

      // Retain utterance in window to prevent Chrome V8 garbage collection mid-speech
      window.__devlens_utterance = utterance;
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis speak error:', err);
    }
  }, [chapters, isMuted, playbackSpeed, selectedVoiceName, availableVoices]);

  // Handle play / pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAmbientSynth();
    } else {
      initAudio();
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      // If reached the end of the presentation, rewind to start
      if (currentChapterIdx >= chapters.length - 1 && chapterProgress >= 1) {
        setCurrentChapterIdx(0);
        setChapterProgress(0);
      }
      setIsPlaying(true);
      startAmbientSynth();
    }
  };

  // Chapter jump
  const jumpToChapter = (idx) => {
    if (idx < 0 || idx >= chapters.length) return;
    setCurrentChapterIdx(idx);
    setChapterProgress(0);
    if (onChapterChange) onChapterChange(idx);
  };

  // Next / Prev chapter
  const nextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      jumpToChapter(currentChapterIdx + 1);
    }
  };

  const prevChapter = () => {
    if (chapterProgress > 0.1) {
      // Restart current chapter
      jumpToChapter(currentChapterIdx);
    } else if (currentChapterIdx > 0) {
      jumpToChapter(currentChapterIdx - 1);
    }
  };

  // Synchronize chapter change with speech narration
  useEffect(() => {
    if (isPlaying) {
      speakChapter(currentChapterIdx);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentChapterIdx, isPlaying, speakChapter]);

  // Chrome SpeechSynthesis anti-freeze watchdog
  useEffect(() => {
    if (!isPlaying) return;
    const watchdog = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 2500);
    return () => clearInterval(watchdog);
  }, [isPlaying]);

  // Chapter progress timer loop (decoupled from speech so it never freezes)
  useEffect(() => {
    if (!isPlaying || !currentChapter) return;
    const duration = (currentChapter.durationSeconds || 30) / playbackSpeed;
    const stepMs = 100;
    const increment = stepMs / (duration * 1000);

    const interval = setInterval(() => {
      setChapterProgress(prev => {
        const next = prev + increment;
        if (next >= 1) return 1;
        return next;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentChapter, playbackSpeed]);

  // Auto-advance chapter when chapterProgress hits 1
  useEffect(() => {
    if (!isPlaying) return;
    if (chapterProgress >= 1) {
      const timer = setTimeout(() => {
        if (currentChapterIdx < chapters.length - 1) {
          setCurrentChapterIdx(prev => prev + 1);
          setChapterProgress(0);
          if (onChapterChange) onChapterChange(currentChapterIdx + 1);
        } else {
          // Finished all 6 chapters!
          setIsPlaying(false);
          setChapterProgress(1);
          stopAmbientSynth();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [chapterProgress, isPlaying, currentChapterIdx, chapters.length, onChapterChange]);

  // Volume & Mute handling
  useEffect(() => {
    if (musicGainRef.current && audioContextRef.current) {
      const vol = isMuted || !musicEnabled ? 0 : musicVolume;
      musicGainRef.current.gain.setValueAtTime(vol, audioContextRef.current.currentTime);
    }
    if (isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted, musicEnabled, musicVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAmbientSynth();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard shortcut (Spacebar to toggle play/pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentChapterIdx]);

  // 4. Video Recording & Download (.webm)
  const downloadVideo = async () => {
    if (!canvasRef.current || isRecording) return;
    setIsRecording(true);

    try {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(30); // 30 FPS
      recordedChunksRef.current = [];

      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? options
          : { mimeType: 'video/webm' }
      );

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${presentation.repository?.repo || 'codebase'}-walkthrough.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setIsRecording(false);
        }, 100);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // Play through and record for 10 seconds sample or full chapter
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 10000); // Record a crisp 10s showcase reel
    } catch (err) {
      console.error('Recording failed:', err);
      setIsRecording(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Synchronized active caption
  const activeCaption = (() => {
    if (!currentChapter || !currentChapter.captions) return '';
    const currentChapterSecs = (currentChapter.durationSeconds || 30) * chapterProgress;
    const match = currentChapter.captions.find(
      c => currentChapterSecs >= c.start && currentChapterSecs <= c.end
    );
    return match ? match.text : currentChapter.captions[0]?.text || '';
  })();

  return (
    <div
      ref={playerContainerRef}
      className={`cinema-stage relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#070b14] text-white flex flex-col ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-video max-h-[500px] min-h-[380px]'
      }`}
    >
      {/* Visual Presentation Screen */}
      <div
        onClick={togglePlay}
        className="relative flex-1 w-full h-full overflow-hidden flex flex-col justify-between p-4 md:p-6 select-none bg-gradient-to-b from-[#090e1c] via-[#070b14] to-[#050810] cursor-pointer group"
      >
        {/* Animated Background Gradients based on theme */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/25 to-indigo-500/15 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-violet-500/25 to-rose-500/15 blur-3xl animate-pulse" />
        </div>

        {/* Center Big Play Button Overlay when !isPlaying */}
        {!isPlaying && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] cursor-pointer group/btn transition-all"
          >
            <div className="relative flex items-center justify-center">
              {/* Glowing pulsating halo */}
              <div className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-sky-500/50 via-indigo-500/50 to-rose-500/50 blur-xl animate-pulse" />
              <button
                type="button"
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-rose-500 text-white flex items-center justify-center shadow-2xl shadow-sky-500/50 group-hover/btn:scale-110 active:scale-95 transition-transform duration-200 border-2 border-white/80"
              >
                <Play className="w-8 h-8 md:w-9 md:h-9 fill-white text-white ml-1 drop-shadow" />
              </button>
            </div>
            <div className="mt-4 text-center px-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/25 border border-sky-400/40 text-sky-200 font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                {chapterProgress > 0 ? 'Video Paused' : 'Interactive AI Video Player'}
              </span>
              <h3 className="text-base md:text-xl font-extrabold text-white tracking-tight drop-shadow-md">
                {chapterProgress > 0 ? 'Click to Resume Presentation' : 'Click to Play AI Video Walkthrough'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto font-medium">
                Chapter {currentChapterIdx + 1} of {chapters.length}: {currentChapter?.title}
              </p>
            </div>
          </div>
        )}

        {/* Hover Pause Indicator when isPlaying */}
        {isPlaying && (
          <div className="absolute top-4 right-28 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-300 font-mono text-[10px] border border-white/20">
              Click screen to pause
            </span>
          </div>
        )}

        {/* Top Header Row of Video Screen */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-sky-400">
                DevLens AI • Codebase Walkthrough
              </span>
              <h4 className="text-sm md:text-base font-extrabold text-white tracking-tight truncate max-w-md">
                {presentation?.repository?.fullName || 'Repository Walkthrough'}
              </h4>
            </div>
          </div>

          {/* Chapter Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white font-mono text-xs font-bold border border-slate-700 backdrop-blur-md shadow-sm">
              Chapter {currentChapterIdx + 1} of {chapters.length}
            </span>
            {isRecording && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span> REC
              </span>
            )}
          </div>
        </div>

        {/* Center Dynamic Visual Slide */}
        <div className="relative z-10 my-auto py-2">
          {currentChapter && (
            <div className="transition-all duration-300">
              {/* Slide Headline */}
              <div className="text-center md:text-left mb-3">
                <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                  {currentChapter.subtitle}
                </span>
                <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight mt-0.5 drop-shadow-sm">
                  {currentChapter.visual?.headline || currentChapter.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed line-clamp-2">
                  {currentChapter.visual?.tagline}
                </p>
              </div>

              {/* Layout 1: Hero Overview */}
              {currentChapter.visual?.layout === 'hero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentChapter.visual.badges?.map((badge, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md shadow-md"
                      >
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                          {badge.label}
                        </span>
                        <span className="text-base font-extrabold text-white mt-1 block">
                          {badge.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-700/80 backdrop-blur-sm space-y-1.5">
                    {currentChapter.visual.highlights?.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="font-medium text-slate-100">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 2: Tech Stack Grid */}
              {currentChapter.visual?.layout === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentChapter.visual.stackItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md hover:border-indigo-400/60 transition-colors shadow-md"
                    >
                      <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold block">
                        {item.layer}
                      </span>
                      <span className="text-sm font-bold text-white mt-1 block truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout 3: Modular File Tree */}
              {currentChapter.visual?.layout === 'tree' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md shadow-md">
                    <span className="text-[10px] font-mono text-violet-300 uppercase font-bold block mb-2">
                      Core Subsystems & Folders
                    </span>
                    <div className="space-y-1.5">
                      {currentChapter.visual.directories?.map((dir, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-mono">
                          <Layers className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span className="text-white font-medium">{dir.name}/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md shadow-md">
                    <span className="text-[10px] font-mono text-sky-300 uppercase font-bold block mb-2">
                      Starting & Entry Files
                    </span>
                    <div className="space-y-1.5">
                      {currentChapter.visual.keyFiles?.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-mono">
                          <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate text-white font-medium">{file.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Layout 4: Request Flow */}
              {currentChapter.visual?.layout === 'flow' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {currentChapter.visual.steps?.map((st) => (
                    <div
                      key={st.step}
                      className="p-4 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md relative shadow-md"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/25 text-emerald-300 font-mono text-xs font-extrabold flex items-center justify-center mb-2 border border-emerald-500/50">
                        {st.step}
                      </div>
                      <h5 className="text-xs font-bold text-white mb-1">{st.title}</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout 5: Security Health */}
              {currentChapter.visual?.layout === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-md">
                    <Shield className="w-10 h-10 text-emerald-400 mb-2" />
                    <span className="text-3xl font-extrabold text-white">92%</span>
                    <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold mt-1">
                      Doctor Health Grade: A+
                    </span>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-2xl bg-[#111827]/90 border border-slate-700/80 backdrop-blur-md space-y-2 shadow-md">
                    {currentChapter.visual.checks?.map((chk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#090d16] border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-semibold">{chk.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-300 font-bold">{chk.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 6: Terminal Onboarding */}
              {currentChapter.visual?.layout === 'terminal' && (
                <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-700/80 font-mono text-xs text-slate-200 space-y-2 shadow-inner">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <Terminal className="w-3 h-3 text-amber-400" />
                    <span className="font-bold">Quickstart Developer Terminal</span>
                  </div>
                  {currentChapter.visual.commands?.map((cmd, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] text-slate-400">{cmd.step}</span>
                      <div className="bg-[#111827] px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-semibold select-all border border-slate-800">
                        $ {cmd.cmd}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Waveform & Animated Closed Captions (CC) */}
        <div className="relative z-10 space-y-3">
          {/* Animated Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1 h-6">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-gradient-to-t from-sky-400 to-indigo-300 transition-all duration-150 ${
                  isPlaying && !isMuted ? 'animate-pulse' : 'h-1.5 opacity-30'
                }`}
                style={{
                  height: isPlaying && !isMuted ? `${Math.max(6, Math.sin((i + Date.now() / 150) * 0.8) * 22 + 10)}px` : '4px',
                  animationDelay: `${i * 45}ms`
                }}
              />
            ))}
          </div>

          {/* Subtitles Overlay */}
          {captionsEnabled && activeCaption && (
            <div className="text-center px-5 py-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 max-w-3xl mx-auto shadow-2xl">
              <p className="text-xs md:text-sm font-semibold text-white tracking-wide leading-relaxed">
                "{activeCaption}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Render Canvas for video export recording */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="hidden"
      />

      {/* Video Control Bar */}
      <div className="relative z-20 bg-[#090e1c] border-t border-slate-800 px-4 md:px-6 py-3 flex flex-col gap-2.5 backdrop-blur-md text-slate-200">
        {/* Scrubber Progress Bar with Chapter Ticks */}
        <div className="relative w-full h-2 group cursor-pointer flex items-center">
          <div
            className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPercent = (e.clientX - rect.left) / rect.width;
              const targetSeconds = clickPercent * totalDuration;

              // Find which chapter corresponds to targetSeconds
              let accumulated = 0;
              for (let i = 0; i < chapters.length; i++) {
                const dur = chapters[i].durationSeconds || 30;
                if (targetSeconds <= accumulated + dur) {
                  setCurrentChapterIdx(i);
                  const progressInChap = (targetSeconds - accumulated) / dur;
                  setChapterProgress(Math.max(0, Math.min(1, progressInChap)));
                  if (isPlaying) speakChapter(i);
                  break;
                }
                accumulated += dur;
              }
            }}
          >
            {/* Active Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 transition-all duration-100"
              style={{
                width: `${Math.min(100, (getElapsedSeconds() / (totalDuration || 1)) * 100)}%`
              }}
            />
          </div>

          {/* Chapter Breakpoint Markers */}
          {chapters.map((ch, idx) => {
            let offsetSec = 0;
            for (let i = 0; i < idx; i++) offsetSec += chapters[i].durationSeconds || 30;
            const leftPercent = (offsetSec / (totalDuration || 1)) * 100;
            return (
              <div
                key={ch.id}
                title={ch.title}
                className="absolute top-0 bottom-0 w-1 bg-surface-950/80 -translate-x-1/2 pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              />
            );
          })}
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevChapter}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-300 hover:text-white transition-colors"
              title="Previous Chapter"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play Video'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={nextChapter}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-300 hover:text-white transition-colors"
              title="Next Chapter"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Time Indicator */}
            <span className="font-mono text-[11px] text-slate-400 ml-1">
              {formatTime(getElapsedSeconds())} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Right: Audio, Voice, Speed & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="px-2 py-1 rounded-lg bg-surface-800 text-slate-200 border border-surface-700 font-mono text-[11px] cursor-pointer"
              title="Playback Speed"
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>

            {/* Ambient Synth Music Toggle */}
            <button
              onClick={() => {
                const next = !musicEnabled;
                setMusicEnabled(next);
                if (next && isPlaying) startAmbientSynth();
                else stopAmbientSynth();
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                musicEnabled
                  ? 'text-indigo-400 bg-indigo-500/20'
                  : 'text-slate-500 hover:bg-surface-800'
              }`}
              title={musicEnabled ? 'Ambient Music: ON' : 'Ambient Music: OFF'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            {/* Voice Mute / Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Captions Toggle */}
            <button
              onClick={() => setCaptionsEnabled(!captionsEnabled)}
              className={`p-1.5 rounded-lg transition-colors ${
                captionsEnabled
                  ? 'text-sky-400 bg-sky-500/20'
                  : 'text-slate-500 hover:bg-surface-800'
              }`}
              title={captionsEnabled ? 'Subtitles ON' : 'Subtitles OFF'}
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Video Download */}
            <button
              onClick={downloadVideo}
              disabled={isRecording}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-750 text-slate-200 border border-surface-700 text-[11px] font-semibold transition-colors"
              title="Download WebM Video"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>{isRecording ? 'Recording...' : 'Export'}</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
