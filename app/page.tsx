'use client';

import { Background } from './components/Background';
import { ProfileCard } from './components/ProfileCard';
import { MusicPlayer, VolumeControl } from './components/MusicPlayer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <Background />
      <VolumeControl />

      <ProfileCard />

      <div className="absolute top-4 right-4 z-40">
        <Link
            href="/projects"
            className="text-sm font-bold text-white transition-all hover:text-pink-500 uppercase tracking-widest border border-white/10 px-6 py-2 rounded-full backdrop-blur-md bg-black/20 hover:bg-white/10 shadow-lg hover:shadow-pink-500/20"
        >
            Projects
        </Link>
      </div>

      <MusicPlayer />
    </main>
  );
}
