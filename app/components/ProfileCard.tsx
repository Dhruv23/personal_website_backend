'use client';

import { useConfig } from '../contexts/ConfigContext';
import { useLanyard } from '../hooks/useLanyard';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { FaDiscord, FaGithub, FaYoutube, FaSpotify, FaTiktok, FaTwitter, FaTwitch } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

const Typewriter = ({ texts }: { texts: string[] }) => {
  const [displayText, setDisplayText] = useState('');
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout2 = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout2);
  }, []);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    let index = 0;
    let subIndex = 0;
    let reverse = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
        if (index >= texts.length) index = 0;

        const currentText = texts[index] || '';

        if (!reverse) {
            subIndex++;
            setDisplayText(currentText.substring(0, subIndex));

            if (subIndex > currentText.length) {
                reverse = true;
                timeout = setTimeout(type, 1000);
                return;
            }
        } else {
            subIndex--;
            setDisplayText(currentText.substring(0, subIndex));

            if (subIndex === 0) {
                reverse = false;
                index = (index + 1) % texts.length;
                timeout = setTimeout(type, 150);
                return;
            }
        }

        const speed = reverse ? 75 : 150;
        timeout = setTimeout(type, speed);
    };

    timeout = setTimeout(type, 150);

    return () => clearTimeout(timeout);
  }, [texts]);

  if (!texts || texts.length === 0) return null;

  return (
    <span>
      {`${displayText}${blink ? "|" : " "}`}
    </span>
  );
};

export const ProfileCard = () => {
    const { config } = useConfig();
    const { user, theme, socials } = config;
    const lanyardData = useLanyard(user.discordId);

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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "relative z-10 w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden",
                theme.effects.glow && "shadow-[0_0_50px_-12px_rgba(217,70,239,0.5)] border-pink-500/20"
            )}
            style={{
                backgroundColor: `rgba(15, 15, 15, ${theme.profileOpacity / 100})`,
            }}
        >
            {/* Header Avatar */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <img
                        src={(user.useDiscordAvatar && lanyardData?.discord_user?.avatar)
                             ? `https://cdn.discordapp.com/avatars/${lanyardData.discord_user.id}/${lanyardData.discord_user.avatar}.png?size=256`
                             : user.avatarUrl}
                        alt="Avatar"
                        className={cn(
                            "w-32 h-32 rounded-full border-4 border-white/10 shadow-lg object-cover transition-transform duration-300 group-hover:scale-105",
                            theme.effects.glow && "shadow-[0_0_30px_-5px_rgba(217,70,239,0.6)]"
                        )}
                    />
                    <div className={cn(
                        "absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-[#0f172a]",
                        statusColor
                    )} />
                </div>

                {/* Username */}
                <h1 className={cn(
                    "mt-4 text-3xl font-bold text-white tracking-wide",
                    theme.effects.animatedTitle && "animate-pulse"
                )}
                style={{ textShadow: theme.effects.glow ? `0 0 20px ${theme.colors.primary}` : 'none' }}
                >
                    {lanyardData?.discord_user?.username || user.username}
                </h1>

                {/* Typewriter Description */}
                <div className="mt-2 text-sm text-gray-300 font-mono h-6 text-center">
                    <Typewriter texts={user.description} />
                </div>

                {/* Location */}
                <div className="mt-2 flex items-center text-xs text-gray-400">
                    <FiMapPin className="mr-1" />
                    {user.location}
                </div>
            </div>

            {/* Discord Status / Activity */}
            {lanyardData && lanyardData.activities && lanyardData.activities.filter(a => a.type !== 4).length > 0 && (
                 <div className="mt-6 p-3 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
                     {lanyardData.activities.find(a => a.type !== 4)?.assets?.large_image ? (
                        <img
                            src={
                                lanyardData.activities.find(a => a.type !== 4)?.assets?.large_image?.startsWith('mp:')
                                ? lanyardData.activities.find(a => a.type !== 4)?.assets?.large_image?.replace('mp:', 'https://media.discordapp.net/')
                                : `https://cdn.discordapp.com/app-assets/${lanyardData.activities.find(a => a.type !== 4)?.id}/${lanyardData.activities.find(a => a.type !== 4)?.assets?.large_image}.png`
                            }
                            alt="Activity"
                            className="w-12 h-12 rounded-md object-cover"
                        />
                     ) : (
                        <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                            <FaDiscord className="text-2xl text-white/50" />
                        </div>
                     )}
                     <div className="flex-1 overflow-hidden min-w-0">
                        <p className="text-xs font-bold text-white truncate">{lanyardData.activities.find(a => a.type !== 4)?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{lanyardData.activities.find(a => a.type !== 4)?.state}</p>
                        <p className="text-xs text-gray-500 truncate">{lanyardData.activities.find(a => a.type !== 4)?.details}</p>
                     </div>
                 </div>
            )}

            {/* Social Links */}
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                {socials.map((social, idx) => (
                    <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            "p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110",
                             theme.effects.glow && "hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        )}
                        style={{ color: theme.colors.icon }}
                    >
                        {getSocialIcon(social.platform)}
                    </a>
                ))}
            </div>

            {/* Footer / Views */}
            <div className="absolute bottom-3 left-4 flex items-center text-[10px] text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                <span>1,337 Views</span>
            </div>
        </motion.div>
    );
};
