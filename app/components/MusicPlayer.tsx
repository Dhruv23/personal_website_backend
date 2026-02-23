'use client';

import { useConfig } from '../contexts/ConfigContext';
import { useMusic } from '../contexts/MusicContext';
import { useLanyard } from '../hooks/useLanyard';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Volume1, RefreshCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const VolumeControl = () => {
    const { config, updateConfig } = useConfig();
    const { music } = config;

    const toggleMute = () => {
        updateConfig({ music: { ...music, volume: music.volume === 0 ? 0.5 : 0 } });
    };

    const Icon = music.volume === 0 ? VolumeX : music.volume < 0.5 ? Volume1 : Volume2;

    return (
        <button
            onClick={toggleMute}
            className="fixed top-4 left-4 z-50 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-white group"
        >
            <Icon size={20} className="group-hover:text-pink-500 transition-colors" />
        </button>
    );
};

export const MusicPlayer = () => {
    const { config } = useConfig();
    const { music, user } = config;
    const { isPlaying, setIsPlaying } = useMusic();
    const lanyard = useLanyard(user.discordId);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [syncSpotify, setSyncSpotify] = useState(false);
    const [spotifyProgress, setSpotifyProgress] = useState(0);

    const isSpotifyActive = !!lanyard?.spotify;

    // Determine metadata
    const songTitle = (syncSpotify && isSpotifyActive) ? lanyard?.spotify?.song : (music.songTitle || 'Neon Nights');
    const artist = (syncSpotify && isSpotifyActive) ? lanyard?.spotify?.artist : 'Faded';
    const albumArt = (syncSpotify && isSpotifyActive) ? lanyard?.spotify?.album_art_url : (music.albumIconUrl || undefined);

    useEffect(() => {
        if (syncSpotify && isSpotifyActive) {
            // Pause local audio if synced to Spotify
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        } else {
            // Local playback logic
            if (!audioRef.current) {
                audioRef.current = new Audio(music.url);
                audioRef.current.loop = true;
            } else if (audioRef.current.src !== music.url) {
                audioRef.current.src = music.url;
            }

            const audio = audioRef.current;
            audio.volume = music.volume;

            const updateTime = () => setCurrentTime(audio.currentTime);
            const updateDuration = () => setDuration(audio.duration);
            const onEnded = () => setIsPlaying(false);

            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', updateDuration);
            audio.addEventListener('ended', onEnded);

            if (music.autoplay && !syncSpotify && !isPlaying) {
                audio.play().then(() => setIsPlaying(true)).catch(() => { });
            }

            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', updateDuration);
                audio.removeEventListener('ended', onEnded);
                // Don't pause on unmount necessarily unless we want to stop music on navigate away? Usually yes.
                audio.pause();
            };
        }
    }, [music.url, syncSpotify, isSpotifyActive, music.autoplay, music.volume, setIsPlaying]); // Removed music.autoplay to prevent aggressive restart if user paused manually? No, autoplay is a setting.

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = music.volume;
        }
    }, [music.volume]);

    // Spotify Progress Tracker
    useEffect(() => {
        if (!syncSpotify || !lanyard?.spotify) return;

        const interval = setInterval(() => {
            const start = lanyard.spotify?.timestamps.start || 0;
            const end = lanyard.spotify?.timestamps.end || 1;
            const now = Date.now();
            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
            setSpotifyProgress(progress);
        }, 1000);

        return () => clearInterval(interval);
    }, [syncSpotify, lanyard?.spotify]);


    const togglePlay = () => {
        if (syncSpotify && isSpotifyActive) return;

        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setIsPlaying(true);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current && !syncSpotify) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    if (!music.enabled) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl flex items-center gap-4 shadow-2xl"
        >
            {/* Album Art */}
            <div className="w-12 h-12 shrink-0 rounded-md bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center overflow-hidden relative">
                {albumArt ? (
                    <img src={albumArt} alt="Album Art" className={cn("w-full h-full object-cover", isPlaying && "animate-pulse")} />
                ) : (
                    <div className={cn("w-3 h-3 rounded-full bg-black/50", isPlaying && "animate-ping")} />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                    <div className="truncate pr-2 max-w-[70%]">
                        <p className="text-sm font-bold text-white truncate">{songTitle}</p>
                        <p className="text-xs text-gray-400 truncate">{artist}</p>
                    </div>
                    {/* Spotify Sync Button */}
                    <button
                        onClick={() => setSyncSpotify(!syncSpotify)}
                        className={cn(
                            "p-1.5 rounded-full transition-colors",
                            syncSpotify && isSpotifyActive ? "bg-green-500 text-black" : "bg-white/10 text-gray-400 hover:text-white"
                        )}
                        title="Sync with Spotify"
                    >
                        <RefreshCcw size={12} className={cn(syncSpotify && isSpotifyActive && "animate-spin")} />
                    </button>
                </div>

                {/* Scrubber (only for local) */}
                {!syncSpotify && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                        />
                        <span className="text-[10px] text-gray-400 w-6 tabular-nums">{formatTime(duration)}</span>
                    </div>
                )}
                {syncSpotify && isSpotifyActive && (
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${spotifyProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Controls (only for local) */}
            {!syncSpotify && (
                <div className="flex items-center gap-1 text-white">
                    <button className="p-1 hover:text-pink-500 transition-colors"><SkipBack size={16} /></button>
                    <button onClick={togglePlay} className="p-1 hover:text-pink-500 transition-colors">
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </button>
                    <button className="p-1 hover:text-pink-500 transition-colors"><SkipForward size={16} /></button>
                </div>
            )}
        </motion.div>
    );
};
