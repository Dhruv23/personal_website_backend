'use client';

import { useConfig } from '../contexts/ConfigContext';
import { Background } from '../components/Background';
import { VolumeControl, MusicPlayer } from '../components/MusicPlayer';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowLeft, Star, GitFork, Github } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
}

export default function Projects() {
  const { config } = useConfig();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const githubLink = config.socials.find(s => s.platform.toLowerCase() === 'github');
        const username = githubLink ? githubLink.url.split('/').pop() : 'adhrin';

        if (!username) {
            setLoading(false);
            return;
        }

        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`);
        if (!res.ok) throw new Error('Failed to fetch repos');
        const data = await res.json();

        if (Array.isArray(data)) {
            setRepos(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [config.socials]);

  return (
    <main className="relative min-h-screen w-full flex flex-col p-8 overflow-x-hidden">
      <Background />
      <VolumeControl />

      <div className="z-10 w-full max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-white/50 hover:text-pink-500 mb-12 transition-all hover:-translate-x-1 duration-300">
            <ArrowLeft className="mr-2" /> Back to Profile
        </Link>

        <h1 className="text-5xl font-bold text-white mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Projects
        </h1>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {repos.map((repo, idx) => (
                    <motion.a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:bg-white/5 transition-all hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.3)] overflow-hidden flex flex-col h-48"
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <ExternalLink size={20} className="text-pink-500" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Github size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors truncate">{repo.name}</h3>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">{repo.description || "No description provided."}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-4 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors"><Star size={14} className="text-yellow-500/80" /> {repo.stargazers_count}</span>
                                <span className="flex items-center gap-1 hover:text-blue-400 transition-colors"><GitFork size={14} className="text-blue-500/80" /> {repo.forks_count}</span>
                            </div>
                            {repo.language && (
                                <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[10px] uppercase tracking-wider font-bold">
                                    {repo.language}
                                </span>
                            )}
                        </div>
                    </motion.a>
                ))}
            </div>
        )}
      </div>

      <MusicPlayer />
    </main>
  );
}
