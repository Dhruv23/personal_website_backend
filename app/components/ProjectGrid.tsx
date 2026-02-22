'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Star, GitFork, Github } from 'lucide-react';
import { GitHubRepo } from '../types/config';

export const ProjectGrid = ({ repos }: { repos: GitHubRepo[] }) => {
    return (
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
    );
};
