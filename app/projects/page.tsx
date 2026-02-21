import { Background } from '../components/Background';
import { VolumeControl, MusicPlayer } from '../components/MusicPlayer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectGrid } from '../components/ProjectGrid';
import { Repo } from '../types/repo';

async function getRepos(): Promise<Repo[]> {
  const res = await fetch('https://api.github.com/users/Dhruv23/repos?per_page=100', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!res.ok) {
    // Return empty array or handle error
    console.error('Failed to fetch repos');
    return [];
  }

  const data: Repo[] = await res.json();

  // Filter out forks and sort by updated_at (newest first)
  const filtered = data
    .filter(repo => !repo.fork)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return filtered;
}

export default async function Projects() {
  const repos = await getRepos();

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

        <ProjectGrid repos={repos} />
      </div>

      <MusicPlayer />
    </main>
  );
}
