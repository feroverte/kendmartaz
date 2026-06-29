"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { RotateCcw, RotateCw, Volume2, VolumeX, Play, Pause, Maximize, Minimize } from "lucide-react";

function fmt(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimer = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = true;
  }, [src]);

  const show = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => {
        if (!seeking) setShowControls(false);
      }, 2500);
    }
  }, [playing, seeking]);

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    show();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
    show();
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
    show();
  };

  const skip = (secs, e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + secs);
    show();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || seeking) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !videoRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * duration;
    setCurrentTime(videoRef.current.currentTime);
    show();
  };

  const handleProgressMouseDown = (e) => {
    e.stopPropagation();
    setSeeking(true);
    const onMove = (ev) => {
      if (!progressRef.current || !videoRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = ratio * duration;
      setCurrentTime(videoRef.current.currentTime);
    };
    const onUp = () => {
      setSeeking(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      show();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    handleProgressClick(e);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!src) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto group rounded-2xl overflow-hidden shadow-lg border border-emerald-950/10 bg-black"
      onMouseMove={show}
      onMouseLeave={() => { if (playing && !seeking) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-contain cursor-pointer"
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Click-to-play overlay */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 text-emerald-900 ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 hover:h-2 transition-all group/progress"
          onMouseDown={handleProgressMouseDown}
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-green-400 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => skip(-5, e)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-semibold backdrop-blur-sm transition-colors"
              title="Rewind 5 seconds"
            >
              <RotateCcw className="w-3 h-3" />
              5
            </button>
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={(e) => skip(5, e)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-semibold backdrop-blur-sm transition-colors"
              title="Forward 5 seconds"
            >
              5
              <RotateCw className="w-3 h-3" />
            </button>
            <span className="text-white/80 text-[11px] font-mono tabular-nums ml-1">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
