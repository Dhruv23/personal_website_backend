'use client';

import { useConfig } from '../contexts/ConfigContext';
import { useLanyard } from '../hooks/useLanyard';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Volume1 } from 'lucide-react';
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
    const lanyard = useLanyard(user.discordId);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const isSpotifyPlaying = lanyard?.spotify;

    useEffect(() => {
        if (isSpotifyPlaying && isPlaying) {
            audioRef.current?.pause();
            setTimeout(() => setIsPlaying(false), 0);
        }
    }, [isSpotifyPlaying, isPlaying]);

    useEffect(() => {
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

        if (music.autoplay && !isSpotifyPlaying) {
             audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', onEnded);
            audio.pause();
        };
    }, [music.url]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = music.volume;
        }
    }, [music.volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
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
            <div className="w-12 h-12 shrink-0 rounded-md bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                <div className={cn("w-3 h-3 rounded-full bg-black/50", isPlaying && "animate-ping")} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                     <div className="truncate pr-2">
                        <p className="text-sm font-bold text-white truncate">Neon Nights</p>
                        <p className="text-xs text-gray-400 truncate">Retro Wave</p>
                     </div>
                </div>

                {/* Scrubber */}
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
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 text-white">
                <button className="p-1 hover:text-pink-500 transition-colors"><SkipBack size={16} /></button>
                <button onClick={togglePlay} className="p-1 hover:text-pink-500 transition-colors">
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                <button className="p-1 hover:text-pink-500 transition-colors"><SkipForward size={16} /></button>
            </div>
        </motion.div>
    );
};
