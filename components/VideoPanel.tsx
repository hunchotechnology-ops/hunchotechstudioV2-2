'use client';

import { forwardRef } from 'react';

type VideoPanelProps = {
  title: string;
  status: string;
  placeholder: string;
  icon: string;
  className?: string;
  aspectClass?: string;
  showPlaceholder?: boolean;
};

const VideoPanel = forwardRef<HTMLVideoElement, VideoPanelProps>(
  function VideoPanel({ title, status, placeholder, icon, className, aspectClass, showPlaceholder = true }, ref) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{title}</span>
          <span className="text-sm text-text-secondary">{status}</span>
        </div>
        <div className={`relative ${aspectClass} rounded-xl bg-surface border border-border overflow-hidden`}>
          <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {showPlaceholder && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary/50 pointer-events-none">
              <span className="text-3xl mb-2">{icon}</span>
              <span className="text-sm">{placeholder}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default VideoPanel;
