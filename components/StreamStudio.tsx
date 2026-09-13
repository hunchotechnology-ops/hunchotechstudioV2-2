'use client';

import { useState, useRef } from 'react';
import { useFalRealtime } from '@/lib/useFalRealtime';
import TopNav from '@/components/TopNav';
import VideoPanel from '@/components/VideoPanel';

const STYLE_PRESETS = [
  { label: 'Beach', prompt: 'Change the background to a sunlit tropical beach' },
  { label: 'Anime', prompt: 'Transform the video into an anime style with vibrant colors' },
  { label: 'Cyberpunk', prompt: 'Apply a cyberpunk aesthetic with neon lights and futuristic elements' },
  { label: 'Noir', prompt: 'Convert to film noir black and white style with dramatic shadows' },
  { label: 'Marble', prompt: 'Transform everything to look like a classical marble sculpture' },
  { label: 'Winter', prompt: 'Change the scene to a snowy winter landscape' },
];

const NAV_ITEMS = ['Stream', 'Gallery', 'Presets', 'Dashboard', 'Settings', 'History', 'Monitor', 'Guide', 'Feedback'];

export default function StreamStudio() {
  const { state, error, elapsed, startSession, stopSession, sendPrompt, flipCamera, localVideoRef, remoteVideoRef } =
    useFalRealtime();

  const [prompt, setPrompt] = useState('Change the background to a sunlit tropical beach');
  const [selectedStyle, setSelectedStyle] = useState<string | null>('Beach');
  const [showReferenceUpload, setShowReferenceUpload] = useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleClick = (label: string) => {
    setSelectedStyle(label);
    const preset = STYLE_PRESETS.find((s) => s.label === label);
    if (preset) setPrompt(preset.prompt);
  };

  const handleApplyEdit = () => {
    if (prompt) sendPrompt(prompt, referenceImageUrl ?? undefined);
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReferenceImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const statusText: Record<typeof state, string> = {
    idle: 'Idle',
    connecting: 'Connecting…',
    streaming: 'Live',
    error: 'Error',
  };

  const statusColor: Record<typeof state, string> = {
    idle: 'bg-zinc-500',
    connecting: 'bg-yellow-500',
    streaming: 'bg-green-500',
    error: 'bg-red-500',
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav items={NAV_ITEMS} activeItem="Stream" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Stream Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-lg">
              ✨
            </div>
            <div>
              <h1 className="text-lg font-semibold">Stream Diffusion</h1>
              <p className="text-sm text-text-secondary">Realtime AI video editing · Lucy 2.5</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
            <span
              className={`w-2 h-2 rounded-full ${statusColor[state]} ${state === 'streaming' ? 'animate-pulse' : ''}`}
            />
            <span className="text-sm text-text-secondary">{statusText[state]}</span>
          </div>
        </div>

        {/* Prompt Input + Style Chips */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Change the background to a sunlit tropical beach"
              className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-sm resize-none focus:outline-none focus:border-accent transition-colors"
              rows={2}
            />
            <button
              onClick={handleApplyEdit}
              disabled={state !== 'streaming'}
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              Apply Edit
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowReferenceUpload(!showReferenceUpload)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                showReferenceUpload || referenceImageUrl
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-transparent border-border text-text-secondary hover:border-text-secondary'
              }`}
            >
              📷 Reference image
            </button>
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleStyleClick(preset.label)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedStyle === preset.label
                    ? 'bg-accent border-accent text-white'
                    : 'bg-transparent border-border text-text-secondary hover:border-text-secondary'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {showReferenceUpload && (
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReferenceUpload}
                className="text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-accent file:text-white file:cursor-pointer"
              />
              {referenceImageUrl && <span className="text-sm text-green-400">✓ Reference image loaded</span>}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        {/* Video Display */}
        <div className="flex gap-4">
          <VideoPanel
            title="Edited by Huncho Tech"
            status={state === 'streaming' ? formatTime(elapsed) : '--:--'}
            videoRef={remoteVideoRef}
            placeholder="Edited stream appears here"
            icon="✨"
            className="flex-1"
            aspectClass="aspect-video"
            showPlaceholder={state !== 'streaming'}
          />

          <VideoPanel
            title="Webcam"
            status={state === 'idle' ? 'offline' : state === 'streaming' ? 'live' : '…'}
            videoRef={localVideoRef}
            placeholder="Camera preview"
            icon="📷"
            className="w-64 shrink-0"
            aspectClass="aspect-square"
            showPlaceholder={state === 'idle' || state === 'error'}
          />
        </div>

        {/* Session Controls */}
        <div className="flex gap-3 justify-center">
          {state === 'idle' || state === 'error' ? (
            <button
              onClick={startSession}
              className="px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Start session
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-medium transition-colors"
            >
              Stop session
            </button>
          )}
          <button
            onClick={flipCamera}
            disabled={state !== 'streaming' && state !== 'connecting'}
            className="px-6 py-3 rounded-xl border border-border text-text-secondary hover:border-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Flip camera
          </button>
        </div>

        {/* Info text */}
        <p className="text-xs text-text-secondary text-center max-w-2xl mx-auto leading-relaxed">
          Frames stream peer-to-peer over WebRTC between your browser and the model via fal.ai. Realtime inference on
          decart/lucy-2-5 costs about $0.04 per second of live generation. Use a reference image to swap in a character,
          garment, or style while the session is live.
        </p>
      </main>
    </div>
  );
}
