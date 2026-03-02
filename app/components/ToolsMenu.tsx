'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Youtube } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { cn } from '../lib/utils';

export function ToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { config } = useConfig();
  const { theme } = config;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-6 left-6 z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 shadow-lg backdrop-blur-md transition-all duration-300",
          "hover:bg-white/10 hover:border-white/20",
          isOpen && "bg-white/10 border-white/20",
          theme.effects.glow && "hover:shadow-[0_0_15px_-3px_rgba(217,70,239,0.3)]"
        )}
        style={{
          backgroundColor: `rgba(15, 15, 15, ${theme.profileOpacity / 100})`,
          color: theme.colors.primary,
        }}
      >
        <Terminal className="w-4 h-4" />
        <span className="text-sm font-semibold tracking-wide text-white">Tools</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute top-full left-0 mt-2 w-56 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden",
              theme.effects.glow && "shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)] border-pink-500/20"
            )}
            style={{
              backgroundColor: `rgba(15, 15, 15, ${theme.profileOpacity / 100})`,
            }}
          >
            <div className="p-2">
              <Link
                href="/converter"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-white/10 group"
              >
                <div
                  className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors"
                  style={{ color: theme.colors.primary }}
                >
                  <Youtube className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white group-hover:text-pink-400 transition-colors">
                    YouTube Converter
                  </span>
                  <span className="text-xs text-gray-400">
                    MP3 / MP4 Downloader
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
