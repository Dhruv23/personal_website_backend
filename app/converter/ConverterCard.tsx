'use client';

import { useConfig } from '../contexts/ConfigContext';
import { useLanyard } from '../hooks/useLanyard';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { FaDiscord, FaGithub, FaYoutube, FaSpotify, FaTiktok, FaTwitter, FaTwitch } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { useState } from 'react';
import Tilt from 'react-parallax-tilt';
import { ArrowDownToLine, Headphones, Video } from 'lucide-react';

export const ConverterCard = () => {
    const { config } = useConfig();
    const { user, theme, socials } = config;
    const lanyardData = useLanyard(user.discordId);

    const [url, setUrl] = useState('');
    const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3');
    const [status, setStatus] = useState('Ready to Convert');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'github': return <FaGithub className="w-5 h-5" />;
            case 'youtube': return <FaYoutube className="w-5 h-5" />;
            case 'twitter': return <FaTwitter className="w-5 h-5" />;
            case 'discord': return <FaDiscord className="w-5 h-5" />;
            case 'spotify': return <FaSpotify className="w-5 h-5" />;
            case 'tiktok': return <FaTiktok className="w-5 h-5" />;
            case 'twitch': return <FaTwitch className="w-5 h-5" />;
            default: return <FaGithub className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'idle': return 'bg-yellow-500';
            case 'dnd': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const statusColor = lanyardData ? getStatusColor(lanyardData.discord_status) : 'bg-gray-500';

    const handleConvert = () => {
        if (!url) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setError(null);
        setIsProcessing(true);
        setStatus('Processing...');

        // Since it's a stream, we can just trigger a download by navigating to the API route,
        // or fetching and saving a blob. Navigating is simpler for streams meant for download.
        // However, we want to handle errors gracefully, so we might try to fetch first.

        const apiUrl = `/api/convert?url=${encodeURIComponent(url)}&format=${format}`;

        fetch(apiUrl).then(async response => {
            if (!response.ok) {
                let errorMsg = 'Download failed';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch {
                    // Ignore json parsing error
                }
                throw new Error(errorMsg);
            }

            // If successful, create a link and click it to download
            setStatus('Downloading...');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            // Extract filename from Content-Disposition if possible
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `download.${format}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match && match[1]) filename = match[1];
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            setStatus('Ready to Convert');
            setIsProcessing(false);
            setUrl(''); // Optional: clear after download
        }).catch(err => {
            setError(err.message || 'An error occurred during conversion');
            setStatus('Ready to Convert');
            setIsProcessing(false);
        });
    };

    const cardContent = (
        <div
            className={cn(
                "relative z-10 w-full p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md",
                theme.effects.glow && "shadow-[0_0_50px_-12px_rgba(217,70,239,0.5)] border-pink-500/20"
            )}
            style={{
                backgroundColor: `rgba(15, 15, 15, ${theme.profileOpacity / 100})`,
            }}
        >
            {/* Header Avatar */}
            <div className="flex flex-col items-center relative z-10">
                <div className="relative group">
                    <img
                        src={(user.useDiscordAvatar && lanyardData?.discord_user?.avatar)
                             ? `https://cdn.discordapp.com/avatars/${lanyardData.discord_user.id}/${lanyardData.discord_user.avatar}.png?size=256`
                             : user.avatarUrl}
                        alt="Avatar"
                        className={cn(
                            "relative z-10 w-24 h-24 rounded-full border-4 border-white/10 shadow-lg object-cover transition-transform duration-300 group-hover:scale-105",
                            theme.effects.glow && "shadow-[0_0_30px_-5px_rgba(217,70,239,0.6)]"
                        )}
                    />
                    {/* Avatar Decoration */}
                    {user.showDiscordDecoration && (
                        <img
                            src="https://cdn.discordapp.com/avatar-decoration-presets/a_62e8c50b3f9422e669ec20dd000e85c9.png"
                            alt="Decoration"
                            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none pointer-events-none z-20"
                        />
                    )}
                    <div className={cn(
                        "absolute bottom-[5%] right-[5%] w-5 h-5 rounded-full border-2 border-[#0f172a] z-30",
                        statusColor
                    )} />
                </div>

                {/* Username */}
                <h1 className={cn(
                    "mt-4 text-2xl font-bold text-white tracking-wide flex flex-col items-center",
                    theme.effects.animatedTitle && "animate-pulse"
                )}
                style={{ textShadow: theme.effects.glow ? `0 0 20px ${theme.colors.primary}` : 'none' }}
                >
                    {lanyardData?.discord_user?.username || user.username}
                    <span className="text-pink-500 text-sm tracking-widest mt-1">CONVERTER</span>
                </h1>

                {/* Location */}
                <div className="mt-2 flex items-center text-xs text-gray-400">
                    <FiMapPin className="mr-1" />
                    {user.location}
                </div>
            </div>

            {/* Converter UI */}
            <div className="mt-8 flex flex-col gap-4 relative z-10">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter YouTube URL (e.g., youtube.com/watch?v=...)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
                    disabled={isProcessing}
                />

                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                    <button
                        onClick={() => setFormat('mp3')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                            format === 'mp3'
                                ? "bg-pink-500/20 text-pink-500 border border-pink-500/30"
                                : "text-gray-400 hover:text-white"
                        )}
                        disabled={isProcessing}
                    >
                        <Headphones className="w-4 h-4" />
                        MP3 (Audio)
                    </button>
                    <button
                        onClick={() => setFormat('mp4')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all",
                            format === 'mp4'
                                ? "bg-pink-500/20 text-pink-500 border border-pink-500/30"
                                : "text-gray-400 hover:text-white"
                        )}
                        disabled={isProcessing}
                    >
                        <Video className="w-4 h-4" />
                        MP4 (Video)
                    </button>
                </div>

                <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(217,70,239,0.5)]"
                >
                    <ArrowDownToLine className="w-5 h-5" />
                    {isProcessing ? 'PROCESSING...' : 'CONVERT & DOWNLOAD'}
                </button>

                <div className="flex flex-col items-center mt-2">
                    <p className={cn(
                        "text-xs font-mono tracking-wider",
                        error ? "text-red-400" : (isProcessing ? "text-pink-400 animate-pulse" : "text-gray-400")
                    )}>
                        {error || status}
                    </p>
                    {isProcessing && (
                        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Social Links Footer */}
            <div className="mt-8 flex justify-center gap-4 flex-wrap relative z-10 pt-4 border-t border-white/5">
                {socials.map((social, idx) => (
                    <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            "p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110",
                             theme.effects.glow && "hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        )}
                        style={{ color: theme.colors.icon }}
                    >
                        {getSocialIcon(social.platform)}
                    </a>
                ))}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md perspective-1000"
        >
            {theme.effects.tilt ? (
                <Tilt
                    tiltMaxAngleX={5}
                    tiltMaxAngleY={5}
                    glareEnable={true}
                    glareMaxOpacity={0.15}
                    scale={1.02}
                    transitionSpeed={2000}
                    perspective={1000}
                    className="w-full"
                >
                    {cardContent}
                </Tilt>
            ) : (
                cardContent
            )}
        </motion.div>
    );
};
