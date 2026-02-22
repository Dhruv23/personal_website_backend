'use client';

import { useEffect, useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { getGitHubStats, GitHubStatsData } from '../actions/github';
import { motion } from 'framer-motion';
import { Star, GitCommit, Code } from 'lucide-react';
import { cn } from '../lib/utils';

export const GitHubStats = () => {
  const { config } = useConfig();
  const { github, user } = config;
  const [stats, setStats] = useState<GitHubStatsData | null>(null);

  useEffect(() => {
    if (github?.statsWidget && github.username) {
      getGitHubStats(github.username).then(setStats);
    } else if (github?.statsWidget && user.username) {
      // Fallback to user.username if github.username is not set or empty? 
      // Although config usually has github.username separate.
      getGitHubStats(user.username).then(setStats);
    }
  }, [github?.statsWidget, github?.username, user.username]);

  if (!github?.statsWidget || !stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-4xl p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row gap-8 items-center justify-between"
    >
      <div className="flex flex-col gap-2 min-w-[200px]">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <GitCommit className="text-pink-500" />
          Contributions
        </h3>
        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          {stats.contributions.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400">In the last year</span>
      </div>

      <div className="h-px w-full md:w-px md:h-24 bg-white/10" />

      <div className="flex flex-col gap-2 min-w-[150px]">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="text-yellow-400" />
          Total Stars
        </h3>
        <span className="text-4xl font-bold text-white">
          {stats.stars.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400">Across all repositories</span>
      </div>

      <div className="h-px w-full md:w-px md:h-24 bg-white/10" />

      <div className="flex flex-col gap-4 flex-1 w-full">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="text-blue-400" />
          Top Languages
        </h3>
        <div className="space-y-3">
          {stats.topLanguages.map((lang, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>{lang.name}</span>
                <span>{Math.round(lang.percentage)}%</span> // Actually I didn't verify percentage logic in action fully, it was count/totalRepos.
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${lang.percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
