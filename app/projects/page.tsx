import { getConfig } from '../actions/config';
import { Background } from '../components/Background';
import { VolumeControl, MusicPlayer } from '../components/MusicPlayer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectGrid } from '../components/ProjectGrid';

export default async function Projects() {
  const config = await getConfig();
  const repos = config.github?.repos
    ? config.github.repos
        .filter(r => !r.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

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
