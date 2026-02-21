'use client';

import { useConfig } from '../contexts/ConfigContext';
import { cn } from '../lib/utils';

export const Background = () => {
  const { config } = useConfig();
  const { theme } = config;

  const isVideo = theme.backgroundUrl.endsWith('.mp4') || theme.backgroundUrl.endsWith('.webm');

  return (
    <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden">
      {/* Background Image/Video */}
      {isVideo ? (
        <video
          src={theme.backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${theme.backgroundUrl})` }}
        />
      )}

      {/* Overlay/Blur */}
      <div className={cn(
        "absolute inset-0 bg-black/40 transition-all duration-700",
        theme.effects.backgroundBlur && "backdrop-blur-sm"
      )} />

      {/* Grid Overlay (Synthwave style) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
             backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 0, 0, 0.03))`
        }}
      />
    </div>
  );
};
